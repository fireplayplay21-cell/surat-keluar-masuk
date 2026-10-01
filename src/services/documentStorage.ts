import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { DocumentAttachment } from '../types';
import {
  getStoredAccessToken,
  uploadFileToGoogleDrive,
} from './googleDrive';

// Firestore collection name for document attachments
export const DOKUMEN_COLLECTION = 'dokumen_lampiran';

// Single document limit safe threshold (around 700KB of base64 text)
const CHUNK_SIZE = 450 * 1024; // 450KB chunks to be safely under Firestore's 1MB limit

// In-memory object URL cache to prevent multiple downloads within session
const objectUrlCache = new Map<string, string>();

/**
 * Optimizes an image (resize and compress JPEG) while keeping text sharp and readable.
 * Drastically reduces upload time and database size for camera phone scans.
 */
async function optimizeImageForDocument(file: File): Promise<{ file: File; dataUrl: string }> {
  return new Promise((resolve) => {
    // If not an image, return original
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({ file, dataUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Max dimension 1600px is optimal for document text readability
      const MAX_DIM = 1600;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        // Convert dataUrl back to a File
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const compressedBlob = new Blob([ab], { type: mimeString });
        const compressedFile = new File(
          [compressedBlob],
          file.name.replace(/\.[^/.]+$/, '') + '.jpg',
          { type: 'image/jpeg' }
        );

        resolve({ file: compressedFile, dataUrl });
      } else {
        // Fallback
        const rawDataUrl = img.src;
        resolve({ file, dataUrl: rawDataUrl });
      }
    };

    img.onerror = () => {
      const fallbackReader = new FileReader();
      fallbackReader.onload = () => {
        resolve({ file, dataUrl: fallbackReader.result as string });
      };
      fallbackReader.readAsDataURL(file);
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Converts a File to Base64 Data URL.
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a document (PDF, Scan Photo, Word, etc.) to the app's Cloud Storage (Firestore)
 * completely independent of Google Drive.
 * If Google Drive is currently connected, it also optionally creates a backup copy on Google Drive.
 */
export async function uploadDocument(
  file: File,
  options: {
    category?: 'surat_masuk' | 'surat_keluar';
    suratNo?: string;
    noSurat?: string;
    noUrut?: string;
    uploaderName?: string;
    backupToGoogleDriveIfConnected?: boolean;
  } = {}
): Promise<DocumentAttachment> {
  const fileId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const resolvedSuratNo = options.suratNo || options.noSurat || '-';

  // 1. Optimize image if it's a photo to keep document text sharp while reducing size
  let processedFile = file;
  let fullDataUrl = '';

  if (file.type.startsWith('image/')) {
    const optimized = await optimizeImageForDocument(file);
    processedFile = optimized.file;
    fullDataUrl = optimized.dataUrl;
  } else {
    fullDataUrl = await fileToDataUrl(file);
  }

  // Format readable file size
  const sizeBytes = processedFile.size;
  const sizeKb = (sizeBytes / 1024).toFixed(1);
  const sizeFormatted =
    sizeBytes > 1024 * 1024
      ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${sizeKb} KB`;

  // 2. Determine chunking: if dataUrl length is small (< 650KB text), store directly in 1 doc
  const isLarge = fullDataUrl.length > CHUNK_SIZE;

  const docRef = doc(db, DOKUMEN_COLLECTION, fileId);

  if (!isLarge) {
    // Store in single document
    await setDoc(docRef, {
      fileId,
      fileName: processedFile.name,
      fileSize: sizeFormatted,
      sizeBytes,
      mimeType: processedFile.type || 'application/octet-stream',
      isChunked: false,
      totalChunks: 1,
      dataUrl: fullDataUrl,
      category: options.category || 'surat_masuk',
      suratNo: resolvedSuratNo,
      noUrut: options.noUrut || '-',
      uploadedBy: options.uploaderName || 'Petugas Tata Usaha',
      uploadedAt: new Date().toISOString(),
    });
  } else {
    // Store chunks in subcollection
    const totalChunks = Math.ceil(fullDataUrl.length / CHUNK_SIZE);
    const batch = writeBatch(db);

    // Master document (without huge dataUrl)
    batch.set(docRef, {
      fileId,
      fileName: processedFile.name,
      fileSize: sizeFormatted,
      sizeBytes,
      mimeType: processedFile.type || 'application/octet-stream',
      isChunked: true,
      totalChunks,
      category: options.category || 'surat_masuk',
      suratNo: resolvedSuratNo,
      noUrut: options.noUrut || '-',
      uploadedBy: options.uploaderName || 'Petugas Tata Usaha',
      uploadedAt: new Date().toISOString(),
    });

    // Write chunks
    for (let i = 0; i < totalChunks; i++) {
      const chunkStr = fullDataUrl.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const chunkDocRef = doc(db, `${DOKUMEN_COLLECTION}/${fileId}/chunks`, String(i).padStart(4, '0'));
      batch.set(chunkDocRef, {
        chunkIndex: i,
        data: chunkStr,
      });
    }

    await batch.commit();
  }

  // Create local object URL for instant zero-latency view
  const blob = dataUrlToBlob(fullDataUrl, processedFile.type);
  const blobUrl = URL.createObjectURL(blob);
  objectUrlCache.set(fileId, blobUrl);

  const attachment: DocumentAttachment = {
    fileId,
    fileName: processedFile.name,
    fileSize: sizeFormatted,
    mimeType: processedFile.type || 'application/octet-stream',
    url: blobUrl,
    dataUrl: !isLarge ? fullDataUrl : undefined,
    isChunked: isLarge,
    totalChunks: isLarge ? Math.ceil(fullDataUrl.length / CHUNK_SIZE) : 1,
    storageType: 'cloud_app',
    uploadedAt: new Date().toISOString(),
    uploadedBy: options.uploaderName || 'Petugas Tata Usaha',
    category: options.category,
    suratNo: resolvedSuratNo,
  };

  // 3. Optional: if Google Drive token is present and backup requested, sync to Google Drive in background
  if (options.backupToGoogleDriveIfConnected !== false) {
    const driveToken = getStoredAccessToken();
    if (driveToken) {
      // Fire-and-forget background backup to Google Drive
      uploadFileToGoogleDrive(processedFile, {
        noSurat: resolvedSuratNo,
        noAgenda: options.noUrut,
        kategori: options.category,
        uploaderName: options.uploaderName,
      })
        .then(async (driveResult) => {
          attachment.driveFileId = driveResult.fileId;
          attachment.driveWebViewLink = driveResult.webViewLink;
          attachment.driveThumbnailLink = driveResult.thumbnailLink;
          attachment.storageType = 'both';

          // Update Firestore doc with drive links
          try {
            await setDoc(
              docRef,
              {
                driveFileId: driveResult.fileId,
                driveWebViewLink: driveResult.webViewLink,
                driveThumbnailLink: driveResult.thumbnailLink,
                storageType: 'both',
              },
              { merge: true }
            );
          } catch (e) {
            console.warn('Could not update drive link in doc:', e);
          }
        })
        .catch((err) => {
          console.warn('Background Google Drive backup notice (safe to ignore):', err?.message);
        });
    }
  }

  return attachment;
}

/**
 * Retrieves the Data URL of a document from Firestore.
 */
export async function getDocumentDataUrl(fileId: string): Promise<string | null> {
  try {
    const docRef = doc(db, DOKUMEN_COLLECTION, fileId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return null;
    }

    const data = snap.data();
    if (!data.isChunked && data.dataUrl) {
      return data.dataUrl;
    }

    // Reconstruct from chunks
    const chunksRef = collection(db, `${DOKUMEN_COLLECTION}/${fileId}/chunks`);
    const q = query(chunksRef, orderBy('chunkIndex', 'asc'));
    const chunkSnaps = await getDocs(q);

    if (chunkSnaps.empty) {
      return null;
    }

    const parts: string[] = [];
    chunkSnaps.forEach((cdoc) => {
      parts.push(cdoc.data().data || '');
    });

    return parts.join('');
  } catch (err) {
    console.error('Error fetching document from cloud:', err);
    return null;
  }
}

/**
 * Retrieves a document as a Blob and Object URL.
 */
export async function getDocumentBlob(
  attachment: DocumentAttachment | { fileId?: string; dataUrl?: string; mimeType?: string }
): Promise<{ blob: Blob; url: string } | null> {
  const fileId = attachment.fileId;

  // Check cache first
  if (fileId && objectUrlCache.has(fileId)) {
    const cachedUrl = objectUrlCache.get(fileId)!;
    return { blob: new Blob([]), url: cachedUrl };
  }

  let dataUrl = (attachment as any).dataUrl;

  if (!dataUrl && fileId) {
    dataUrl = await getDocumentDataUrl(fileId);
  }

  if (!dataUrl) {
    return null;
  }

  const mimeType = (attachment as any).mimeType || 'application/pdf';
  const blob = dataUrlToBlob(dataUrl, mimeType);
  const url = URL.createObjectURL(blob);

  if (fileId) {
    objectUrlCache.set(fileId, url);
  }

  return { blob, url };
}

/**
 * Converts a Base64 data URL to a binary Blob.
 */
export function dataUrlToBlob(dataUrl: string, fallbackMime = 'application/pdf'): Blob {
  try {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : fallbackMime;
    const bstr = atob(arr[1] || arr[0]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.warn('Error converting dataUrl to Blob:', e);
    return new Blob([], { type: fallbackMime });
  }
}

/**
 * Triggers a download of the document file in the browser.
 */
export async function downloadDocument(
  attachment: DocumentAttachment | { fileId?: string; fileName?: string; dataUrl?: string; mimeType?: string },
  customFileName?: string
): Promise<void> {
  const result = await getDocumentBlob(attachment);
  if (!result || !result.url) {
    // If there is a Google Drive webViewLink or direct download, open that
    if ((attachment as any).driveWebViewLink) {
      window.open((attachment as any).driveWebViewLink, '_blank');
      return;
    }
    throw new Error('Berkas tidak ditemukan atau belum tersedia di cloud.');
  }

  const fileName =
    customFileName ||
    attachment.fileName ||
    (attachment as any).driveFileName ||
    'Dokumen_Surat.pdf';

  const link = document.createElement('a');
  link.href = result.url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Deletes a document from the app's cloud database.
 */
export async function deleteDocumentFromCloud(fileId: string): Promise<void> {
  try {
    const docRef = doc(db, DOKUMEN_COLLECTION, fileId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      if (data.isChunked) {
        const chunksRef = collection(db, `${DOKUMEN_COLLECTION}/${fileId}/chunks`);
        const chunkSnaps = await getDocs(chunksRef);
        const batch = writeBatch(db);
        chunkSnaps.forEach((c) => batch.delete(c.ref));
        batch.delete(docRef);
        await batch.commit();
      } else {
        await deleteDoc(docRef);
      }
    }

    if (objectUrlCache.has(fileId)) {
      const u = objectUrlCache.get(fileId)!;
      URL.revokeObjectURL(u);
      objectUrlCache.delete(fileId);
    }
  } catch (err) {
    console.warn('Error deleting document:', err);
  }
}
