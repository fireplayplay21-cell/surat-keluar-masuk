import firebaseConfigJson from '../../firebase-applet-config.json';
import { GoogleDriveAttachment } from '../types';

export const GOOGLE_DRIVE_CLIENT_ID =
  firebaseConfigJson.oAuthClientId ||
  '101565605150-pdhb49s1jgv1e17q4g5b722e5arbmfd4.apps.googleusercontent.com';

export const GOOGLE_DRIVE_SCOPES =
  'https://www.googleapis.com/auth/drive.file';

const TOKEN_STORAGE_KEY = 'gdrive_access_token';
const TOKEN_EXPIRY_KEY = 'gdrive_token_expiry';
const USER_EMAIL_KEY = 'gdrive_user_email';
const USER_NAME_KEY = 'gdrive_user_name';

export interface DriveAuthStatus {
  isConnected: boolean;
  userEmail: string | null;
  userName: string | null;
  expiresAt: number | null;
}

let tokenClientInstance: any = null;

// Get stored access token if still valid
export function getStoredAccessToken(): string | null {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!token || !expiry) return null;

  if (Date.now() > parseInt(expiry, 10)) {
    // Token expired
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    return null;
  }
  return token;
}

export function getDriveAuthStatus(): DriveAuthStatus {
  const token = getStoredAccessToken();
  const email = localStorage.getItem(USER_EMAIL_KEY);
  const name = localStorage.getItem(USER_NAME_KEY);
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  const expiresAt = expiryStr ? parseInt(expiryStr, 10) : null;

  return {
    isConnected: !!token,
    userEmail: email,
    userName: name,
    expiresAt,
  };
}

export function disconnectGoogleDrive(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(USER_NAME_KEY);
}

// Ensure Google Identity Services script is available
async function ensureGoogleIdentityServices(): Promise<any> {
  if (typeof window === 'undefined') return null;
  const existingGoogle = (window as any).google;
  if (existingGoogle?.accounts?.oauth2) return existingGoogle;

  return new Promise((resolve) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const g = (window as any).google;
      if (g?.accounts?.oauth2) {
        clearInterval(interval);
        resolve(g);
      } else if (attempts > 30) {
        clearInterval(interval);
        resolve(null);
      }
    }, 100);
  });
}

// Request Access Token from Google
export async function connectGoogleDrive(): Promise<string> {
  const google = await ensureGoogleIdentityServices();
  if (!google?.accounts?.oauth2) {
    throw new Error(
      'Google Identity Services belum termuat. Periksa koneksi internet atau coba beberapa saat lagi.'
    );
  }

  return new Promise((resolve, reject) => {
    try {
      tokenClientInstance = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_DRIVE_CLIENT_ID,
        scope: GOOGLE_DRIVE_SCOPES,
        callback: async (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            const token = tokenResponse.access_token;
            const expiresIn = tokenResponse.expires_in || 3599;
            const expiryTime = Date.now() + (parseInt(expiresIn, 10) - 60) * 1000;

            localStorage.setItem(TOKEN_STORAGE_KEY, token);
            localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

            // Fetch user profile via Drive About API (works directly with drive.file scope)
            try {
              const aboutRes = await fetch(
                'https://www.googleapis.com/drive/v3/about?fields=user',
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (aboutRes.ok) {
                const aboutData = await aboutRes.json();
                if (aboutData.user?.emailAddress) {
                  localStorage.setItem(USER_EMAIL_KEY, aboutData.user.emailAddress);
                }
                if (aboutData.user?.displayName) {
                  localStorage.setItem(USER_NAME_KEY, aboutData.user.displayName);
                }
              } else {
                // Fallback to OAuth2 userinfo
                const userInfoRes = await fetch(
                  'https://www.googleapis.com/oauth2/v3/userinfo',
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                if (userInfoRes.ok) {
                  const userInfo = await userInfoRes.json();
                  if (userInfo.email) localStorage.setItem(USER_EMAIL_KEY, userInfo.email);
                  if (userInfo.name) localStorage.setItem(USER_NAME_KEY, userInfo.name);
                }
              }
            } catch (e) {
              console.warn('Could not fetch user profile info:', e);
            }

            resolve(token);
          } else if (tokenResponse?.error) {
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
          } else {
            reject(new Error('Gagal mendapatkan token akses Google Drive.'));
          }
        },
        error_callback: (err: any) => {
          reject(new Error(err?.message || 'Izin Google Drive dibatalkan oleh pengguna.'));
        },
      });

      // Prompt the consent popup
      tokenClientInstance.requestAccessToken({ prompt: 'consent' });
    } catch (err: any) {
      reject(err);
    }
  });
}

// Find or Create App Folder in Google Drive
async function getOrCreateAppFolder(accessToken: string): Promise<string | null> {
  const folderName = 'Arsip Tata Usaha UPTD SPF SDN Mawas';
  try {
    // Search existing folder
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
      )}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // Create folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Folder penyimpanan otomatis hasil scan surat masuk & keluar sekolah UPTD SPF SDN Mawas',
      }),
    });

    if (createRes.ok) {
      const folder = await createRes.json();
      return folder.id;
    }
  } catch (e) {
    console.warn('Could not create dedicated folder on Google Drive, using root:', e);
  }
  return null;
}

// Upload Scan PDF / Photo to Google Drive
export async function uploadFileToGoogleDrive(
  file: File,
  metadata: {
    noSurat?: string;
    noAgenda?: string;
    kategori?: 'surat_masuk' | 'surat_keluar';
    uploaderName?: string;
  }
): Promise<GoogleDriveAttachment> {
  let accessToken = getStoredAccessToken();

  if (!accessToken) {
    // Attempt connecting
    accessToken = await connectGoogleDrive();
  }

  if (!accessToken) {
    throw new Error('Akses Google Drive belum diotorisasi. Silakan hubungkan akun Google Drive Anda.');
  }

  // Determine target folder
  const folderId = await getOrCreateAppFolder(accessToken);

  const cleanFileName = `[${metadata.noAgenda || 'AGENDA'}] ${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  const fileMetadata: Record<string, any> = {
    name: cleanFileName,
    mimeType: file.type || 'application/pdf',
    description: `Scan Dokumen ${metadata.kategori === 'surat_keluar' ? 'Surat Keluar' : 'Surat Masuk'} - No: ${
      metadata.noSurat || '-'
    } Agenda: ${metadata.noAgenda || '-'} | Diunggah oleh: ${metadata.uploaderName || 'Tata Usaha'}`,
  };

  if (folderId) {
    fileMetadata.parents = [folderId];
  }

  // Create multipart boundary
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  // Read file as ArrayBuffer or Base64
  const fileArrayBuffer = await file.arrayBuffer();

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    fileMetadata
  )}`;
  const mediaHeader = `${delimiter}Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;

  // Combine into multipart payload
  const encoder = new TextEncoder();
  const metadataBuffer = encoder.encode(metadataPart);
  const mediaHeaderBuffer = encoder.encode(mediaHeader);
  const closeBuffer = encoder.encode(closeDelimiter);

  const totalLength =
    metadataBuffer.byteLength +
    mediaHeaderBuffer.byteLength +
    fileArrayBuffer.byteLength +
    closeBuffer.byteLength;

  const bodyBuffer = new Uint8Array(totalLength);
  let offset = 0;

  bodyBuffer.set(metadataBuffer, offset);
  offset += metadataBuffer.byteLength;

  bodyBuffer.set(mediaHeaderBuffer, offset);
  offset += mediaHeaderBuffer.byteLength;

  bodyBuffer.set(new Uint8Array(fileArrayBuffer), offset);
  offset += fileArrayBuffer.byteLength;

  bodyBuffer.set(closeBuffer, offset);

  // Send multipart upload request to Google Drive
  const uploadResponse = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,thumbnailLink,size,createdTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: bodyBuffer,
    }
  );

  if (!uploadResponse.ok) {
    const errText = await uploadResponse.text();
    if (uploadResponse.status === 401) {
      // Token expired, clear it
      disconnectGoogleDrive();
      throw new Error('Sesi Google Drive telah berakhir. Silakan klik "Hubungkan Ulang Google Drive".');
    }
    throw new Error(`Gagal mengunggah file ke Google Drive: ${errText}`);
  }

  const driveFile = await uploadResponse.json();

  // Try to set public read permission so links work smoothly in iframe/browser preview
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${driveFile.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });
  } catch (permErr) {
    console.warn('Could not set public read permission for Drive file:', permErr);
  }

  const sizeKb = (file.size / 1024).toFixed(1);
  const sizeFormatted = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${sizeKb} KB`;

  const attachment: GoogleDriveAttachment = {
    fileId: driveFile.id,
    fileName: driveFile.name || file.name,
    mimeType: driveFile.mimeType || file.type || 'application/pdf',
    fileSize: sizeFormatted,
    webViewLink:
      driveFile.webViewLink || `https://drive.google.com/file/d/${driveFile.id}/view?usp=sharing`,
    thumbnailLink: driveFile.thumbnailLink || undefined,
    directDownloadLink:
      driveFile.webContentLink || `https://drive.google.com/uc?export=download&id=${driveFile.id}`,
    uploadedAt: new Date().toISOString(),
    uploadedBy: metadata.uploaderName || localStorage.getItem(USER_NAME_KEY) || 'Tata Usaha',
  };

  return attachment;
}
