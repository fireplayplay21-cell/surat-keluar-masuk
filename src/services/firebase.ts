import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import {
  SuratMasuk,
  SuratKeluar,
  DataPengguna,
  MasterKlasifikasi,
  MasterKelas,
  KelasDiampu,
  MasterTahunAjaran,
  SchoolProfile,
} from '../types';

// Named database id from AI Studio environment or config
export const FIRESTORE_DATABASE_ID =
  (firebaseConfigJson as any).firestoreDatabaseId ||
  'ai-studio-suratkeluarmasuk-5e1c3a02-c6fd-4fb6-9fad-a644657ba5fa';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Attempt anonymous sign-in for zero-friction access
signInAnonymously(auth).catch((err) => {
  console.warn('Firebase anonymous auth notice:', err?.message || err);
});

// Initialize Firestore with custom database ID or default
export const db =
  FIRESTORE_DATABASE_ID && FIRESTORE_DATABASE_ID !== '(default)'
    ? getFirestore(app, FIRESTORE_DATABASE_ID)
    : getFirestore(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return new Error(JSON.stringify(errInfo));
}

// Firestore Collection Names
export const COLLECTIONS = {
  SURAT_MASUK: 'surat_masuk',
  SURAT_KELUAR: 'surat_keluar',
  PENGGUNA: 'pengguna',
  MASTER_KLASIFIKASI: 'master_klasifikasi',
  KELAS: 'kelas',
  KELAS_DIAMPU: 'kelas_diampu',
  TAHUN_AJARAN: 'tahun_ajaran',
  SCHOOL_PROFILE: 'school_profile',
} as const;

// Helper to sanitize Firestore documents (removing undefined values)
function sanitizeDoc<T extends Record<string, any>>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    const val = data[key];
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        clean[key] = sanitizeDoc(val);
      } else {
        clean[key] = val;
      }
    }
  });
  return clean;
}

// -------------------------------------------------------------
// SURAT MASUK CRUD
// -------------------------------------------------------------
export async function saveSuratMasukToFirestore(surat: SuratMasuk): Promise<void> {
  const path = `${COLLECTIONS.SURAT_MASUK}/${surat.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.SURAT_MASUK, surat.id);
    const noUrut = surat.noUrut || surat.noAgenda || '001';
    const cleaned = sanitizeDoc({
      ...surat,
      noUrut,
      noAgenda: noUrut, // tetap simpan untuk kompatibilitas data lama
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    throw handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSuratMasukFromFirestore(suratId: string): Promise<void> {
  const path = `${COLLECTIONS.SURAT_MASUK}/${suratId}`;
  try {
    const docRef = doc(db, COLLECTIONS.SURAT_MASUK, suratId);
    await deleteDoc(docRef);
  } catch (error) {
    throw handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// SURAT KELUAR CRUD
// -------------------------------------------------------------
export async function saveSuratKeluarToFirestore(surat: SuratKeluar): Promise<void> {
  const path = `${COLLECTIONS.SURAT_KELUAR}/${surat.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.SURAT_KELUAR, surat.id);
    const noUrut = surat.noUrut || surat.noAgenda || '001';
    const cleaned = sanitizeDoc({
      ...surat,
      noUrut,
      noAgenda: noUrut, // tetap simpan untuk kompatibilitas data lama
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    throw handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSuratKeluarFromFirestore(suratId: string): Promise<void> {
  const path = `${COLLECTIONS.SURAT_KELUAR}/${suratId}`;
  try {
    const docRef = doc(db, COLLECTIONS.SURAT_KELUAR, suratId);
    await deleteDoc(docRef);
  } catch (error) {
    throw handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// DATA PENGGUNA CRUD
// -------------------------------------------------------------
export async function savePenggunaToFirestore(pengguna: DataPengguna): Promise<void> {
  const path = `${COLLECTIONS.PENGGUNA}/${pengguna.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.PENGGUNA, pengguna.id);
    await setDoc(docRef, sanitizeDoc(pengguna), { merge: true });
  } catch (error) {
    throw handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePenggunaFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTIONS.PENGGUNA}/${id}`;
  try {
    const docRef = doc(db, COLLECTIONS.PENGGUNA, id);
    await deleteDoc(docRef);
  } catch (error) {
    throw handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// MASTER DATA & PROFIL SEKOLAH
// -------------------------------------------------------------
export async function saveSchoolProfileToFirestore(profile: SchoolProfile): Promise<void> {
  const path = `${COLLECTIONS.SCHOOL_PROFILE}/main_profile`;
  try {
    const docRef = doc(db, COLLECTIONS.SCHOOL_PROFILE, 'main_profile');
    await setDoc(docRef, sanitizeDoc(profile), { merge: true });
  } catch (error) {
    throw handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveKlasifikasiToFirestore(item: MasterKlasifikasi): Promise<void> {
  const path = `${COLLECTIONS.MASTER_KLASIFIKASI}/${item.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.MASTER_KLASIFIKASI, item.id);
    await setDoc(docRef, sanitizeDoc(item), { merge: true });
  } catch (error) {
    throw handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteKlasifikasiFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTIONS.MASTER_KLASIFIKASI}/${id}`;
  try {
    const docRef = doc(db, COLLECTIONS.MASTER_KLASIFIKASI, id);
    await deleteDoc(docRef);
  } catch (error) {
    throw handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// DATABASE KELAS & ROMBEL CRUD
// -------------------------------------------------------------
export async function saveKelasToFirestore(item: MasterKelas): Promise<void> {
  const path = `${COLLECTIONS.KELAS}/${item.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.KELAS, item.id);
    await setDoc(docRef, sanitizeDoc(item), { merge: true });
  } catch (error) {
    throw handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteKelasFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTIONS.KELAS}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.KELAS, id));
  } catch (error) {
    throw handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// DATABASE KELAS YANG DIAMPU (PEMBAGIAN TUGAS MENGAJAR) CRUD
// -------------------------------------------------------------
export async function saveKelasDiampuToFirestore(item: KelasDiampu): Promise<void> {
  const path = `${COLLECTIONS.KELAS_DIAMPU}/${item.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.KELAS_DIAMPU, item.id);
    await setDoc(docRef, sanitizeDoc(item), { merge: true });
  } catch (error) {
    throw handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteKelasDiampuFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTIONS.KELAS_DIAMPU}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.KELAS_DIAMPU, id));
  } catch (error) {
    throw handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// DATABASE TAHUN AJARAN CRUD
// -------------------------------------------------------------
export async function saveTahunAjaranToFirestore(item: MasterTahunAjaran): Promise<void> {
  const path = `${COLLECTIONS.TAHUN_AJARAN}/${item.id}`;
  try {
    const docRef = doc(db, COLLECTIONS.TAHUN_AJARAN, item.id);
    await setDoc(docRef, sanitizeDoc(item), { merge: true });
  } catch (error) {
    throw handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function setActiveTahunAjaranInFirestore(
  allTahunAjaran: MasterTahunAjaran[],
  activeId: string
): Promise<void> {
  try {
    const batch = writeBatch(db);
    allTahunAjaran.forEach((ta) => {
      const isAktif = ta.id === activeId;
      batch.set(
        doc(db, COLLECTIONS.TAHUN_AJARAN, ta.id),
        sanitizeDoc({ ...ta, isAktif }),
        { merge: true }
      );
    });
    await batch.commit();
  } catch (error) {
    throw handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.TAHUN_AJARAN);
  }
}

export async function deleteTahunAjaranFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTIONS.TAHUN_AJARAN}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.TAHUN_AJARAN, id));
  } catch (error) {
    throw handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// INITIAL SEEDING HELPER
// -------------------------------------------------------------
export async function seedInitialDataIfEmpty(
  initialSuratMasuk: SuratMasuk[],
  initialSuratKeluar: SuratKeluar[],
  initialPengguna: DataPengguna[],
  initialKlasifikasi: MasterKlasifikasi[],
  initialProfile: SchoolProfile,
  initialKelas?: MasterKelas[],
  initialKelasDiampu?: KelasDiampu[],
  initialTahunAjaran?: MasterTahunAjaran[]
): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.SURAT_MASUK));
    if (!snap.empty) {
      // Check if kelas collection is empty and needs initial seeding
      if (initialKelas && initialKelas.length > 0) {
        const kelasSnap = await getDocs(collection(db, COLLECTIONS.KELAS));
        if (kelasSnap.empty) {
          const batch = writeBatch(db);
          initialKelas.forEach((kls) => {
            batch.set(doc(db, COLLECTIONS.KELAS, kls.id), sanitizeDoc(kls));
          });
          await batch.commit();
          console.log('Seeding initial kelas data to Firestore completed.');
        }
      }
      // Check if kelas_diampu collection is empty and needs initial seeding
      if (initialKelasDiampu && initialKelasDiampu.length > 0) {
        const diampuSnap = await getDocs(collection(db, COLLECTIONS.KELAS_DIAMPU));
        if (diampuSnap.empty) {
          const batch = writeBatch(db);
          initialKelasDiampu.forEach((kd) => {
            batch.set(doc(db, COLLECTIONS.KELAS_DIAMPU, kd.id), sanitizeDoc(kd));
          });
          await batch.commit();
          console.log('Seeding initial kelas_diampu data to Firestore completed.');
        }
      }
      // Check if tahun_ajaran collection is empty and needs initial seeding
      if (initialTahunAjaran && initialTahunAjaran.length > 0) {
        const taSnap = await getDocs(collection(db, COLLECTIONS.TAHUN_AJARAN));
        if (taSnap.empty) {
          const batch = writeBatch(db);
          initialTahunAjaran.forEach((ta) => {
            batch.set(doc(db, COLLECTIONS.TAHUN_AJARAN, ta.id), sanitizeDoc(ta));
          });
          await batch.commit();
          console.log('Seeding initial tahun_ajaran data to Firestore completed.');
        }
      }
      return false; // already has main data
    }

    console.log('Seeding initial school administrative data into Firestore...');
    const batch = writeBatch(db);

    initialSuratMasuk.forEach((sm) => {
      batch.set(doc(db, COLLECTIONS.SURAT_MASUK, sm.id), sanitizeDoc(sm));
    });
    initialSuratKeluar.forEach((sk) => {
      batch.set(doc(db, COLLECTIONS.SURAT_KELUAR, sk.id), sanitizeDoc(sk));
    });
    initialPengguna.forEach((p) => {
      batch.set(doc(db, COLLECTIONS.PENGGUNA, p.id), sanitizeDoc(p));
    });
    initialKlasifikasi.forEach((k) => {
      batch.set(doc(db, COLLECTIONS.MASTER_KLASIFIKASI, k.id), sanitizeDoc(k));
    });
    if (initialKelas && initialKelas.length > 0) {
      initialKelas.forEach((kls) => {
        batch.set(doc(db, COLLECTIONS.KELAS, kls.id), sanitizeDoc(kls));
      });
    }
    if (initialKelasDiampu && initialKelasDiampu.length > 0) {
      initialKelasDiampu.forEach((kd) => {
        batch.set(doc(db, COLLECTIONS.KELAS_DIAMPU, kd.id), sanitizeDoc(kd));
      });
    }
    if (initialTahunAjaran && initialTahunAjaran.length > 0) {
      initialTahunAjaran.forEach((ta) => {
        batch.set(doc(db, COLLECTIONS.TAHUN_AJARAN, ta.id), sanitizeDoc(ta));
      });
    }
    batch.set(doc(db, COLLECTIONS.SCHOOL_PROFILE, 'main_profile'), sanitizeDoc(initialProfile));

    await batch.commit();
    console.log('Seeding initial Firestore data completed successfully.');
    return true;
  } catch (e) {
    console.warn('Could not auto-seed Firestore (possibly offline or permission):', e);
    return false;
  }
}

// -------------------------------------------------------------
// FORCE SYNC & STRUCTURE ALL COLLECTIONS HELPER
// -------------------------------------------------------------
export interface FirestoreSyncSummary {
  suratMasukCount: number;
  suratKeluarCount: number;
  penggunaCount: number;
  klasifikasiCount: number;
  kelasCount: number;
  kelasDiampuCount: number;
  tahunAjaranCount: number;
  schoolProfileSynced: boolean;
  syncedAt: string;
}

export async function forceSyncAllCollectionsToFirestore(
  suratMasukList: SuratMasuk[],
  suratKeluarList: SuratKeluar[],
  penggunaList: DataPengguna[],
  klasifikasiList: MasterKlasifikasi[],
  schoolProfile: SchoolProfile,
  kelasList?: MasterKelas[],
  kelasDiampuList?: KelasDiampu[],
  tahunAjaranList?: MasterTahunAjaran[]
): Promise<FirestoreSyncSummary> {
  const batch = writeBatch(db);

  suratMasukList.forEach((sm) => {
    const noUrut = sm.noUrut || sm.noAgenda || '001';
    batch.set(
      doc(db, COLLECTIONS.SURAT_MASUK, sm.id),
      sanitizeDoc({ ...sm, noUrut, noAgenda: noUrut }),
      { merge: true }
    );
  });

  suratKeluarList.forEach((sk) => {
    const noUrut = sk.noUrut || sk.noAgenda || '001';
    batch.set(
      doc(db, COLLECTIONS.SURAT_KELUAR, sk.id),
      sanitizeDoc({ ...sk, noUrut, noAgenda: noUrut }),
      { merge: true }
    );
  });

  penggunaList.forEach((p) => {
    batch.set(doc(db, COLLECTIONS.PENGGUNA, p.id), sanitizeDoc(p), { merge: true });
  });

  klasifikasiList.forEach((k) => {
    batch.set(doc(db, COLLECTIONS.MASTER_KLASIFIKASI, k.id), sanitizeDoc(k), { merge: true });
  });

  if (kelasList && kelasList.length > 0) {
    kelasList.forEach((kls) => {
      batch.set(doc(db, COLLECTIONS.KELAS, kls.id), sanitizeDoc(kls), { merge: true });
    });
  }

  if (kelasDiampuList && kelasDiampuList.length > 0) {
    kelasDiampuList.forEach((kd) => {
      batch.set(doc(db, COLLECTIONS.KELAS_DIAMPU, kd.id), sanitizeDoc(kd), { merge: true });
    });
  }

  if (tahunAjaranList && tahunAjaranList.length > 0) {
    tahunAjaranList.forEach((ta) => {
      batch.set(doc(db, COLLECTIONS.TAHUN_AJARAN, ta.id), sanitizeDoc(ta), { merge: true });
    });
  }

  batch.set(doc(db, COLLECTIONS.SCHOOL_PROFILE, 'main_profile'), sanitizeDoc(schoolProfile), { merge: true });

  await batch.commit();

  return {
    suratMasukCount: suratMasukList.length,
    suratKeluarCount: suratKeluarList.length,
    penggunaCount: penggunaList.length,
    klasifikasiCount: klasifikasiList.length,
    kelasCount: kelasList?.length || 0,
    kelasDiampuCount: kelasDiampuList?.length || 0,
    tahunAjaranCount: tahunAjaranList?.length || 0,
    schoolProfileSynced: true,
    syncedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

// -------------------------------------------------------------
// REPAIR & MIGRATE DATABASE (NO AGENDA -> NO URUT)
// -------------------------------------------------------------
export interface DatabaseRepairResult {
  repairedMasuk: number;
  repairedKeluar: number;
  totalRepaired: number;
  message: string;
}

export async function repairDatabaseNoUrut(): Promise<DatabaseRepairResult> {
  let repairedMasuk = 0;
  let repairedKeluar = 0;

  try {
    const batch = writeBatch(db);
    let hasUpdates = false;

    // 1. Scan and normalize surat_masuk
    const masukSnap = await getDocs(collection(db, COLLECTIONS.SURAT_MASUK));
    masukSnap.forEach((d) => {
      const data = d.data();
      const resolvedNoUrut = data.noUrut || data.noAgenda || '001';
      if (!data.noUrut || data.noAgenda !== resolvedNoUrut) {
        batch.update(d.ref, {
          noUrut: resolvedNoUrut,
          noAgenda: resolvedNoUrut,
          updatedAt: new Date().toISOString(),
        });
        repairedMasuk++;
        hasUpdates = true;
      }
    });

    // 2. Scan and normalize surat_keluar
    const keluarSnap = await getDocs(collection(db, COLLECTIONS.SURAT_KELUAR));
    keluarSnap.forEach((d) => {
      const data = d.data();
      const resolvedNoUrut = data.noUrut || data.noAgenda || '001';
      if (!data.noUrut || data.noAgenda !== resolvedNoUrut) {
        batch.update(d.ref, {
          noUrut: resolvedNoUrut,
          noAgenda: resolvedNoUrut,
          updatedAt: new Date().toISOString(),
        });
        repairedKeluar++;
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      await batch.commit();
    }

    return {
      repairedMasuk,
      repairedKeluar,
      totalRepaired: repairedMasuk + repairedKeluar,
      message: `Database berhasil diperbaiki. ${repairedMasuk} surat masuk dan ${repairedKeluar} surat keluar telah diperbarui dengan nomor urut.`,
    };
  } catch (error) {
    console.error('Error repairing database structure:', error);
    throw error;
  }
}

