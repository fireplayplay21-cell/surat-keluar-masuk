/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import {
  TabType,
  SuratMasuk,
  SuratKeluar,
  MasterKlasifikasi,
  MasterInstansi,
  MasterPejabat,
  MasterKelas,
  KelasDiampu,
  SchoolProfile,
  StatusSuratMasuk,
  DataPengguna,
  AppUser,
} from './types';
import {
  INITIAL_SURAT_MASUK,
  INITIAL_SURAT_KELUAR,
  INITIAL_KLASIFIKASI,
  INITIAL_INSTANSI,
  INITIAL_PEJABAT,
  INITIAL_KELAS,
  INITIAL_KELAS_DIAMPU,
  INITIAL_SCHOOL_PROFILE,
  INITIAL_PENGGUNA,
} from './data/initialData';
import { INITIAL_AUTH_USERS, syncAuthUsersWithPegawai, getFotoInitials } from './data/authUsers';
import {
  db,
  COLLECTIONS,
  saveSuratMasukToFirestore,
  deleteSuratMasukFromFirestore,
  saveSuratKeluarToFirestore,
  deleteSuratKeluarFromFirestore,
  savePenggunaToFirestore,
  deletePenggunaFromFirestore,
  saveKlasifikasiToFirestore,
  saveKelasToFirestore,
  deleteKelasFromFirestore,
  saveKelasDiampuToFirestore,
  deleteKelasDiampuFromFirestore,
  saveSchoolProfileToFirestore,
  seedInitialDataIfEmpty,
} from './services/firebase';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SuratMasukView } from './components/SuratMasukView';
import { SuratKeluarView } from './components/SuratKeluarView';
import { DataPenggunaView } from './components/DataPenggunaView';
import { DashboardView } from './components/DashboardView';
import { MasterDataView } from './components/MasterDataView';
import { PengaturanView } from './components/PengaturanView';
import { LoginPage } from './components/LoginPage';
import { ModalRoleMatrix } from './components/ModalRoleMatrix';
import { ModalSuratMasuk } from './components/ModalSuratMasuk';
import { ModalSuratKeluar } from './components/ModalSuratKeluar';
import { ModalDisposisi } from './components/ModalDisposisi';
import { ModalDetailSurat } from './components/ModalDetailSurat';
import { ModalCetakLaporan } from './components/ModalCetakLaporan';
import { ModalHelp } from './components/ModalHelp';
import { ModalDataPengguna } from './components/ModalDataPengguna';
import { ModalDetailPengguna } from './components/ModalDetailPengguna';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('sdn01_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authUsers, setAuthUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('sdn01_auth_users');
    return saved ? JSON.parse(saved) : INITIAL_AUTH_USERS;
  });

  const [isRoleMatrixOpen, setIsRoleMatrixOpen] = useState(false);

  // Main state with initial fallback
  const [suratMasukList, setSuratMasukList] = useState<SuratMasuk[]>(() => {
    const saved = localStorage.getItem('sdn01_surat_masuk');
    return saved ? JSON.parse(saved) : INITIAL_SURAT_MASUK;
  });

  const [suratKeluarList, setSuratKeluarList] = useState<SuratKeluar[]>(() => {
    const saved = localStorage.getItem('sdn01_surat_keluar');
    return saved ? JSON.parse(saved) : INITIAL_SURAT_KELUAR;
  });

  const [klasifikasiList, setKlasifikasiList] = useState<MasterKlasifikasi[]>(() => {
    const saved = localStorage.getItem('sdn01_klasifikasi');
    return saved ? JSON.parse(saved) : INITIAL_KLASIFIKASI;
  });

  const [instansiList, setInstansiList] = useState<MasterInstansi[]>(() => {
    const saved = localStorage.getItem('sdn01_instansi');
    return saved ? JSON.parse(saved) : INITIAL_INSTANSI;
  });

  const [pejabatList, setPejabatList] = useState<MasterPejabat[]>(() => {
    const saved = localStorage.getItem('sdn01_pejabat');
    return saved ? JSON.parse(saved) : INITIAL_PEJABAT;
  });

  const [penggunaList, setPenggunaList] = useState<DataPengguna[]>(() => {
    const saved = localStorage.getItem('sdn01_pengguna');
    return saved ? JSON.parse(saved) : INITIAL_PENGGUNA;
  });

  const [kelasList, setKelasList] = useState<MasterKelas[]>(() => {
    const saved = localStorage.getItem('sdn01_kelas');
    return saved ? JSON.parse(saved) : INITIAL_KELAS;
  });

  const [kelasDiampuList, setKelasDiampuList] = useState<KelasDiampu[]>(() => {
    const saved = localStorage.getItem('sdn01_kelas_diampu');
    return saved ? JSON.parse(saved) : INITIAL_KELAS_DIAMPU;
  });

  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem('sdn01_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.namaSekolah === 'SDN 01 Harapan' || parsed.kepalaSekolah === 'Drs. H. Mulyadi, M.Pd.') {
        return {
          ...parsed,
          namaSekolah: 'UPTD SPF SDN Mawas',
          kepalaSekolah: 'Ampena, S., S.Pd',
        };
      }
      return parsed;
    }
    return INITIAL_SCHOOL_PROFILE;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sdn01_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sdn01_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sdn01_auth_users', JSON.stringify(authUsers));
  }, [authUsers]);

  // Synchronize login users and current logged-in user with the employee (pegawai) database
  useEffect(() => {
    if (penggunaList && penggunaList.length > 0) {
      const synced = syncAuthUsersWithPegawai(penggunaList, authUsers);
      setAuthUsers(synced);

      // If a user is currently logged in, sync their details (nama, role, nip, etc.)
      if (currentUser) {
        const cleanUserNip = currentUser.nip ? currentUser.nip.replace(/\s+/g, '') : '';
        const matchingSynced = synced.find(
          (u) =>
            u.id === currentUser.id ||
            (cleanUserNip && cleanUserNip !== '-' && u.nip.replace(/\s+/g, '') === cleanUserNip) ||
            u.username.toLowerCase() === currentUser.username.toLowerCase() ||
            u.email.toLowerCase() === currentUser.email.toLowerCase() ||
            u.nama.toLowerCase() === currentUser.nama.toLowerCase()
        );

        if (matchingSynced) {
          if (
            matchingSynced.nama !== currentUser.nama ||
            matchingSynced.nip !== currentUser.nip ||
            matchingSynced.jabatan !== currentUser.jabatan ||
            matchingSynced.kelas !== currentUser.kelas ||
            matchingSynced.role !== currentUser.role ||
            matchingSynced.roleLabel !== currentUser.roleLabel ||
            matchingSynced.email !== currentUser.email ||
            matchingSynced.telepon !== currentUser.telepon ||
            matchingSynced.statusKepegawaian !== currentUser.statusKepegawaian
          ) {
            setCurrentUser(matchingSynced);
          }
        }
      }
    }
  }, [penggunaList]);

  // Local storage caching
  useEffect(() => {
    localStorage.setItem('sdn01_surat_masuk', JSON.stringify(suratMasukList));
  }, [suratMasukList]);

  useEffect(() => {
    localStorage.setItem('sdn01_surat_keluar', JSON.stringify(suratKeluarList));
  }, [suratKeluarList]);

  useEffect(() => {
    localStorage.setItem('sdn01_klasifikasi', JSON.stringify(klasifikasiList));
  }, [klasifikasiList]);

  useEffect(() => {
    localStorage.setItem('sdn01_instansi', JSON.stringify(instansiList));
  }, [instansiList]);

  useEffect(() => {
    localStorage.setItem('sdn01_pejabat', JSON.stringify(pejabatList));
  }, [pejabatList]);

  useEffect(() => {
    localStorage.setItem('sdn01_pengguna', JSON.stringify(penggunaList));
  }, [penggunaList]);

  useEffect(() => {
    localStorage.setItem('sdn01_kelas', JSON.stringify(kelasList));
  }, [kelasList]);

  useEffect(() => {
    localStorage.setItem('sdn01_kelas_diampu', JSON.stringify(kelasDiampuList));
  }, [kelasDiampuList]);

  useEffect(() => {
    localStorage.setItem('sdn01_profile', JSON.stringify(schoolProfile));
  }, [schoolProfile]);

  // -------------------------------------------------------------
  // REALTIME FIREBASE FIRESTORE SUBSCRIPTIONS & SYNC
  // -------------------------------------------------------------
  useEffect(() => {
    // Attempt auto-seeding initial dummy data if Firestore is empty
    seedInitialDataIfEmpty(
      INITIAL_SURAT_MASUK,
      INITIAL_SURAT_KELUAR,
      INITIAL_PENGGUNA,
      INITIAL_KLASIFIKASI,
      INITIAL_SCHOOL_PROFILE,
      INITIAL_KELAS,
      INITIAL_KELAS_DIAMPU
    ).catch((e) => {
      console.warn('Seeding check:', e);
    });

    // 1. Subscribe to Surat Masuk
    const unsubSuratMasuk = onSnapshot(
      collection(db, COLLECTIONS.SURAT_MASUK),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: SuratMasuk[] = [];
          snapshot.forEach((doc) => {
            list.push({ ...doc.data(), id: doc.id } as SuratMasuk);
          });
          // Sort by creation or date desc
          list.sort((a, b) => b.tglTerima.localeCompare(a.tglTerima));
          setSuratMasukList(list);
        }
      },
      (error) => {
        console.warn('Firestore surat_masuk listener notice:', error.message);
      }
    );

    // 2. Subscribe to Surat Keluar
    const unsubSuratKeluar = onSnapshot(
      collection(db, COLLECTIONS.SURAT_KELUAR),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: SuratKeluar[] = [];
          snapshot.forEach((doc) => {
            list.push({ ...doc.data(), id: doc.id } as SuratKeluar);
          });
          list.sort((a, b) => b.tglSurat.localeCompare(a.tglSurat));
          setSuratKeluarList(list);
        }
      },
      (error) => {
        console.warn('Firestore surat_keluar listener notice:', error.message);
      }
    );

    // 3. Subscribe to Pengguna / GTK
    const unsubPengguna = onSnapshot(
      collection(db, COLLECTIONS.PENGGUNA),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: DataPengguna[] = [];
          snapshot.forEach((doc) => {
            list.push({ ...doc.data(), id: doc.id } as DataPengguna);
          });
          setPenggunaList(list);
        }
      },
      (error) => {
        console.warn('Firestore pengguna listener notice:', error.message);
      }
    );

    // 4. Subscribe to Master Klasifikasi
    const unsubKlasifikasi = onSnapshot(
      collection(db, COLLECTIONS.MASTER_KLASIFIKASI),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: MasterKlasifikasi[] = [];
          snapshot.forEach((doc) => {
            list.push({ ...doc.data(), id: doc.id } as MasterKlasifikasi);
          });
          setKlasifikasiList(list);
        }
      },
      (error) => {
        console.warn('Firestore klasifikasi listener notice:', error.message);
      }
    );

    // 5. Subscribe to School Profile
    const unsubProfile = onSnapshot(
      doc(db, COLLECTIONS.SCHOOL_PROFILE, 'main_profile'),
      (docSnap) => {
        if (docSnap.exists()) {
          const profileData = docSnap.data() as SchoolProfile;
          if (
            profileData.namaSekolah === 'SDN 01 Harapan' ||
            profileData.kepalaSekolah === 'Drs. H. Mulyadi, M.Pd.'
          ) {
            const updated = {
              ...profileData,
              namaSekolah: 'UPTD SPF SDN Mawas',
              kepalaSekolah: 'Ampena, S., S.Pd',
            };
            setSchoolProfile(updated);
          } else {
            setSchoolProfile(profileData);
          }
        }
      },
      (error) => {
        console.warn('Firestore school_profile listener notice:', error.message);
      }
    );

    // 6. Subscribe to Kelas
    const unsubKelas = onSnapshot(
      collection(db, COLLECTIONS.KELAS),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: MasterKelas[] = [];
          snapshot.forEach((doc) => {
            list.push({ ...doc.data(), id: doc.id } as MasterKelas);
          });
          setKelasList(list);
        }
      },
      (error) => {
        console.warn('Firestore kelas listener notice:', error.message);
      }
    );

    // 7. Subscribe to Kelas Diampu
    const unsubKelasDiampu = onSnapshot(
      collection(db, COLLECTIONS.KELAS_DIAMPU),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: KelasDiampu[] = [];
          snapshot.forEach((doc) => {
            list.push({ ...doc.data(), id: doc.id } as KelasDiampu);
          });
          setKelasDiampuList(list);
        }
      },
      (error) => {
        console.warn('Firestore kelas_diampu listener notice:', error.message);
      }
    );

    return () => {
      unsubSuratMasuk();
      unsubSuratKeluar();
      unsubPengguna();
      unsubKlasifikasi();
      unsubProfile();
      unsubKelas();
      unsubKelasDiampu();
    };
  }, []);

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('surat-masuk');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sistem_tu_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sistem_tu_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Modals state
  const [isModalSuratMasukOpen, setIsModalSuratMasukOpen] = useState(false);
  const [editingSuratMasuk, setEditingSuratMasuk] = useState<SuratMasuk | null>(null);

  const [isModalSuratKeluarOpen, setIsModalSuratKeluarOpen] = useState(false);
  const [editingSuratKeluar, setEditingSuratKeluar] = useState<SuratKeluar | null>(null);

  const [isModalDisposisiOpen, setIsModalDisposisiOpen] = useState(false);
  const [disposisiSurat, setDisposisiSurat] = useState<SuratMasuk | null>(null);

  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [detailSurat, setDetailSurat] = useState<SuratMasuk | null>(null);

  const [isModalCetakLaporanOpen, setIsModalCetakLaporanOpen] = useState(false);
  const [isModalHelpOpen, setIsModalHelpOpen] = useState(false);

  const [isModalDataPenggunaOpen, setIsModalDataPenggunaOpen] = useState(false);
  const [editingPengguna, setEditingPengguna] = useState<DataPengguna | null>(null);
  const [isModalDetailPenggunaOpen, setIsModalDetailPenggunaOpen] = useState(false);
  const [detailPengguna, setDetailPengguna] = useState<DataPengguna | null>(null);

  // Next sequential number (nomor urut) calculations
  const nextSuratMasukNoUrut = useMemo(() => {
    let max = 0;
    suratMasukList.forEach((item) => {
      const num = parseInt(item.noUrut || item.noAgenda || '0', 10);
      if (!isNaN(num) && num > max) max = num;
    });
    return String(max + 1).padStart(3, '0');
  }, [suratMasukList]);

  const nextSuratKeluarNoUrut = useMemo(() => {
    let max = 0;
    suratKeluarList.forEach((item) => {
      let num = parseInt(item.noUrut || item.noAgenda || '0', 10);
      if (isNaN(num) || num === 0) {
        const match = item.noSurat?.match(/^[^/]+\/(\d+)\//);
        if (match) {
          num = parseInt(match[1], 10);
        }
      }
      if (!isNaN(num) && num > max) max = num;
    });
    if (max === 0 || max < 162) return '163';
    return String(max + 1);
  }, [suratKeluarList]);

  const nextSuratMasukAgenda = nextSuratMasukNoUrut;
  const nextSuratKeluarAgenda = nextSuratKeluarNoUrut;

  const pendingSuratMasuk = useMemo(() => {
    return suratMasukList.filter((s) => s.status === 'belum');
  }, [suratMasukList]);

  // -------------------------------------------------------------
  // SURAT MASUK HANDLERS
  // -------------------------------------------------------------
  const handleSaveSuratMasuk = async (data: Omit<SuratMasuk, 'id'>, editId?: string) => {
    const targetId = editId || `sm-${Date.now()}`;
    const fullItem: SuratMasuk = {
      ...data,
      id: targetId,
    };

    // Optimistic UI update
    if (editId) {
      setSuratMasukList((prev) =>
        prev.map((item) => (item.id === editId ? fullItem : item))
      );
    } else {
      setSuratMasukList((prev) => [fullItem, ...prev]);
    }

    // Persist to Firebase Firestore
    try {
      await saveSuratMasukToFirestore(fullItem);
    } catch (err) {
      console.warn('Saved locally, Firestore sync pending:', err);
    }
  };

  const handleDeleteSuratMasuk = async (id: string) => {
    setSuratMasukList((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteSuratMasukFromFirestore(id);
    } catch (err) {
      console.warn('Deleted locally, Firestore sync pending:', err);
    }
  };

  const handleOpenDisposisi = (surat: SuratMasuk) => {
    setDisposisiSurat(surat);
    setIsModalDisposisiOpen(true);
  };

  const handleSaveDisposisi = async (suratId: string, disposisiData: NonNullable<SuratMasuk['disposisi']>) => {
    let updatedSurat: SuratMasuk | null = null;

    setSuratMasukList((prev) =>
      prev.map((item) => {
        if (item.id === suratId) {
          updatedSurat = {
            ...item,
            disposisi: disposisiData,
            status: item.status === 'belum' ? 'diproses' : item.status,
          };
          return updatedSurat;
        }
        return item;
      })
    );

    if (updatedSurat) {
      try {
        await saveSuratMasukToFirestore(updatedSurat);
      } catch (err) {
        console.warn('Disposisi saved locally, Firestore sync pending:', err);
      }
    }
  };

  const handleUpdateStatusSuratMasuk = async (suratId: string, status: StatusSuratMasuk) => {
    let updated: SuratMasuk | null = null;
    setSuratMasukList((prev) =>
      prev.map((item) => {
        if (item.id === suratId) {
          updated = { ...item, status };
          return updated;
        }
        return item;
      })
    );
    if (detailSurat && detailSurat.id === suratId) {
      setDetailSurat((prev) => (prev ? { ...prev, status } : null));
    }
    if (updated) {
      try {
        await saveSuratMasukToFirestore(updated);
      } catch (err) {
        console.warn('Status updated locally:', err);
      }
    }
  };

  // -------------------------------------------------------------
  // SURAT KELUAR HANDLERS
  // -------------------------------------------------------------
  const handleSaveSuratKeluar = async (data: Omit<SuratKeluar, 'id'>, editId?: string) => {
    const targetId = editId || `sk-${Date.now()}`;
    const fullItem: SuratKeluar = {
      ...data,
      id: targetId,
    };

    if (editId) {
      setSuratKeluarList((prev) =>
        prev.map((item) => (item.id === editId ? fullItem : item))
      );
    } else {
      setSuratKeluarList((prev) => [fullItem, ...prev]);
    }

    try {
      await saveSuratKeluarToFirestore(fullItem);
    } catch (err) {
      console.warn('Saved locally, Firestore sync pending:', err);
    }
  };

  const handleDeleteSuratKeluar = async (id: string) => {
    setSuratKeluarList((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteSuratKeluarFromFirestore(id);
    } catch (err) {
      console.warn('Deleted locally:', err);
    }
  };

  const handlePrintSuratKeluar = (surat: SuratKeluar) => {
    alert(`Mencetak lembar salinan Surat Keluar No: ${surat.noSurat}`);
    window.print();
  };

  const handleApproveSuratKeluar = async (surat: SuratKeluar) => {
    const approved: SuratKeluar = { ...surat, status: 'disetujui' };
    setSuratKeluarList((prev) =>
      prev.map((item) => (item.id === surat.id ? approved : item))
    );
    try {
      await saveSuratKeluarToFirestore(approved);
    } catch (err) {
      console.warn('Approved locally:', err);
    }
  };

  // -------------------------------------------------------------
  // MASTER DATA HANDLERS
  // -------------------------------------------------------------
  const handleAddKlasifikasi = async (item: Omit<MasterKlasifikasi, 'id'>) => {
    const fullItem: MasterKlasifikasi = { ...item, id: `kl-${Date.now()}` };
    setKlasifikasiList((prev) => [...prev, fullItem]);
    try {
      await saveKlasifikasiToFirestore(fullItem);
    } catch (err) {
      console.warn('Saved klasifikasi locally:', err);
    }
  };

  const handleDeleteKlasifikasi = (id: string) => {
    setKlasifikasiList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddInstansi = (item: Omit<MasterInstansi, 'id'>) => {
    setInstansiList((prev) => [...prev, { ...item, id: `ins-${Date.now()}` }]);
  };

  const handleDeleteInstansi = (id: string) => {
    setInstansiList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddPejabat = (item: Omit<MasterPejabat, 'id'>) => {
    setPejabatList((prev) => [...prev, { ...item, id: `pj-${Date.now()}` }]);
  };

  const handleDeletePejabat = (id: string) => {
    setPejabatList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddKelas = async (item: Omit<MasterKelas, 'id'>) => {
    const fullItem: MasterKelas = { ...item, id: `kls-${Date.now()}` };
    setKelasList((prev) => [...prev, fullItem]);
    try {
      await saveKelasToFirestore(fullItem);
    } catch (err) {
      console.warn('Saved kelas locally:', err);
    }
  };

  const handleUpdateKelas = async (id: string, item: Partial<MasterKelas>) => {
    setKelasList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, ...item } : k))
    );
    const existing = kelasList.find((k) => k.id === id);
    if (existing) {
      const fullItem: MasterKelas = { ...existing, ...item };
      try {
        await saveKelasToFirestore(fullItem);
      } catch (err) {
        console.warn('Updated kelas locally:', err);
      }
    }
  };

  const handleDeleteKelas = async (id: string) => {
    setKelasList((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteKelasFromFirestore(id);
    } catch (err) {
      console.warn('Deleted kelas locally:', err);
    }
  };

  const handleAddKelasDiampu = async (item: Omit<KelasDiampu, 'id'>) => {
    const fullItem: KelasDiampu = { ...item, id: `kd-${Date.now()}` };
    setKelasDiampuList((prev) => [fullItem, ...prev]);
    try {
      await saveKelasDiampuToFirestore(fullItem);
    } catch (err) {
      console.warn('Saved kelas diampu locally:', err);
    }
  };

  const handleUpdateKelasDiampu = async (id: string, item: Partial<KelasDiampu>) => {
    setKelasDiampuList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, ...item } : k))
    );
    const existing = kelasDiampuList.find((k) => k.id === id);
    if (existing) {
      const fullItem: KelasDiampu = { ...existing, ...item };
      try {
        await saveKelasDiampuToFirestore(fullItem);
      } catch (err) {
        console.warn('Updated kelas diampu locally:', err);
      }
    }
  };

  const handleDeleteKelasDiampu = async (id: string) => {
    setKelasDiampuList((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteKelasDiampuFromFirestore(id);
    } catch (err) {
      console.warn('Deleted kelas diampu locally:', err);
    }
  };

  // -------------------------------------------------------------
  // DATA PENGGUNA HANDLERS
  // -------------------------------------------------------------
  const handleSavePengguna = async (data: Omit<DataPengguna, 'id'>, editId?: string) => {
    const targetId = editId || `usr-${Date.now()}`;
    const fullItem: DataPengguna = { ...data, id: targetId };

    if (editId) {
      setPenggunaList((prev) =>
        prev.map((item) => (item.id === editId ? fullItem : item))
      );
    } else {
      setPenggunaList((prev) => [fullItem, ...prev]);
    }

    // Immediately sync current logged in user if their employee record was edited
    if (
      currentUser &&
      (currentUser.id === targetId ||
        (currentUser.nip && currentUser.nip !== '-' && currentUser.nip === fullItem.nip))
    ) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              nama: fullItem.nama,
              nip: fullItem.nip,
              jabatan: fullItem.jabatan,
              kelas: fullItem.kelas,
              telepon: fullItem.telepon,
              email: fullItem.email || prev.email,
              statusKepegawaian: fullItem.statusKepegawaian,
              fotoInitials: getFotoInitials(fullItem.nama),
            }
          : null
      );
    }

    try {
      await savePenggunaToFirestore(fullItem);
    } catch (err) {
      console.warn('Saved user locally:', err);
    }
  };

  const handleDeletePengguna = async (id: string) => {
    setPenggunaList((prev) => prev.filter((item) => item.id !== id));
    try {
      await deletePenggunaFromFirestore(id);
    } catch (err) {
      console.warn('Deleted user locally:', err);
    }
  };

  const handleSaveProfile = async (profile: SchoolProfile) => {
    setSchoolProfile(profile);
    try {
      await saveSchoolProfileToFirestore(profile);
    } catch (err) {
      console.warn('Profile saved locally:', err);
    }
  };

  const handleAddNewGlobal = () => {
    if (activeTab === 'surat-keluar') {
      setEditingSuratKeluar(null);
      setIsModalSuratKeluarOpen(true);
    } else if (activeTab === 'data-pengguna') {
      setEditingPengguna(null);
      setIsModalDataPenggunaOpen(true);
    } else if (activeTab === 'master-data') {
      setActiveTab('master-data');
    } else {
      setEditingSuratMasuk(null);
      setIsModalSuratMasukOpen(true);
    }
  };

  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(u) => setCurrentUser(u)}
        usersList={authUsers}
        schoolName={schoolProfile.namaSekolah}
      />
    );
  }

  return (
    <div className="bg-[#f7f9fb] min-h-screen text-[#191c1e] antialiased flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCetakLaporan={() => setIsModalCetakLaporanOpen(true)}
        pendingSuratMasukCount={pendingSuratMasuk.length}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        onOpenRoleMatrix={() => setIsRoleMatrixOpen(true)}
        schoolName={schoolProfile.namaSekolah}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
      />

      {/* Main Content Area with dynamic margin based on sidebar collapse */}
      <main
        className={`flex-1 flex flex-col min-h-screen bg-[#f7f9fb] w-full transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Sticky Header */}
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddNew={handleAddNewGlobal}
          onOpenHelp={() => setIsModalHelpOpen(true)}
          onSelectSurat={(surat) => {
            setDetailSurat(surat);
            setIsModalDetailOpen(true);
          }}
          pendingLetters={pendingSuratMasuk}
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
          currentUser={currentUser}
          onLogout={() => setCurrentUser(null)}
          onOpenRoleMatrix={() => setIsRoleMatrixOpen(true)}
          isSidebarCollapsed={sidebarCollapsed}
          onToggleSidebarCollapse={handleToggleSidebarCollapse}
        />

        {/* View Switcher */}
        {activeTab === 'dashboard' && (
          <DashboardView
            suratMasukList={suratMasukList}
            suratKeluarList={suratKeluarList}
            setActiveTab={setActiveTab}
            onOpenSuratMasukDetail={(surat) => {
              setDetailSurat(surat);
              setIsModalDetailOpen(true);
            }}
            onAddNewSuratMasuk={() => {
              setEditingSuratMasuk(null);
              setIsModalSuratMasukOpen(true);
            }}
            onAddNewSuratKeluar={() => {
              setEditingSuratKeluar(null);
              setIsModalSuratKeluarOpen(true);
            }}
            currentUser={currentUser}
            onOpenRoleMatrix={() => setIsRoleMatrixOpen(true)}
          />
        )}

        {activeTab === 'surat-masuk' && (
          <SuratMasukView
            suratList={suratMasukList}
            searchQuery={searchQuery}
            currentUser={currentUser}
            onAddNew={() => {
              setEditingSuratMasuk(null);
              setIsModalSuratMasukOpen(true);
            }}
            onViewDetail={(surat) => {
              setDetailSurat(surat);
              setIsModalDetailOpen(true);
            }}
            onEdit={(surat) => {
              setEditingSuratMasuk(surat);
              setIsModalSuratMasukOpen(true);
            }}
            onOpenDisposisi={handleOpenDisposisi}
            onDelete={handleDeleteSuratMasuk}
          />
        )}

        {activeTab === 'surat-keluar' && (
          <SuratKeluarView
            suratList={suratKeluarList}
            searchQuery={searchQuery}
            currentUser={currentUser}
            onAddNew={() => {
              setEditingSuratKeluar(null);
              setIsModalSuratKeluarOpen(true);
            }}
            onEdit={(surat) => {
              setEditingSuratKeluar(surat);
              setIsModalSuratKeluarOpen(true);
            }}
            onDelete={handleDeleteSuratKeluar}
            onPrintSurat={handlePrintSuratKeluar}
            onApproveSurat={handleApproveSuratKeluar}
          />
        )}

        {activeTab === 'data-pengguna' && (
          <DataPenggunaView
            penggunaList={penggunaList}
            kelasDiampuList={kelasDiampuList}
            searchQuery={searchQuery}
            currentUser={currentUser}
            schoolName={schoolProfile.namaSekolah}
            onAddNew={() => {
              setEditingPengguna(null);
              setIsModalDataPenggunaOpen(true);
            }}
            onViewDetail={(pengguna) => {
              setDetailPengguna(pengguna);
              setIsModalDetailPenggunaOpen(true);
            }}
            onEdit={(pengguna) => {
              setEditingPengguna(pengguna);
              setIsModalDataPenggunaOpen(true);
            }}
            onDelete={handleDeletePengguna}
          />
        )}

        {activeTab === 'master-data' && (
          <MasterDataView
            klasifikasiList={klasifikasiList}
            instansiList={instansiList}
            pejabatList={pejabatList}
            kelasList={kelasList}
            kelasDiampuList={kelasDiampuList}
            guruList={penggunaList}
            schoolProfile={schoolProfile}
            onAddKlasifikasi={handleAddKlasifikasi}
            onDeleteKlasifikasi={handleDeleteKlasifikasi}
            onAddInstansi={handleAddInstansi}
            onDeleteInstansi={handleDeleteInstansi}
            onAddPejabat={handleAddPejabat}
            onDeletePejabat={handleDeletePejabat}
            onAddKelas={handleAddKelas}
            onUpdateKelas={handleUpdateKelas}
            onDeleteKelas={handleDeleteKelas}
            onAddKelasDiampu={handleAddKelasDiampu}
            onUpdateKelasDiampu={handleUpdateKelasDiampu}
            onDeleteKelasDiampu={handleDeleteKelasDiampu}
          />
        )}

        {activeTab === 'pengaturan' && (
          <PengaturanView
            profile={schoolProfile}
            onSaveProfile={handleSaveProfile}
            suratMasukList={suratMasukList}
            suratKeluarList={suratKeluarList}
            penggunaList={penggunaList}
            klasifikasiList={klasifikasiList}
            kelasList={kelasList}
            kelasDiampuList={kelasDiampuList}
            totalSuratMasuk={suratMasukList.length}
            totalSuratKeluar={suratKeluarList.length}
          />
        )}
      </main>

      {/* Modals */}
      <ModalSuratMasuk
        isOpen={isModalSuratMasukOpen}
        onClose={() => {
          setIsModalSuratMasukOpen(false);
          setEditingSuratMasuk(null);
        }}
        onSave={handleSaveSuratMasuk}
        editItem={editingSuratMasuk}
        klasifikasiList={klasifikasiList}
        instansiList={instansiList}
        nextNoUrut={nextSuratMasukNoUrut}
        nextAgendaNumber={nextSuratMasukAgenda}
        currentUser={currentUser}
      />

      <ModalSuratKeluar
        isOpen={isModalSuratKeluarOpen}
        onClose={() => {
          setIsModalSuratKeluarOpen(false);
          setEditingSuratKeluar(null);
        }}
        onSave={handleSaveSuratKeluar}
        editItem={editingSuratKeluar}
        klasifikasiList={klasifikasiList}
        schoolProfile={schoolProfile}
        nextNoUrut={nextSuratKeluarNoUrut}
        nextAgendaNumber={nextSuratKeluarAgenda}
        currentUser={currentUser}
        penggunaList={penggunaList}
      />

      <ModalDataPengguna
        isOpen={isModalDataPenggunaOpen}
        onClose={() => {
          setIsModalDataPenggunaOpen(false);
          setEditingPengguna(null);
        }}
        onSave={handleSavePengguna}
        editItem={editingPengguna}
        kelasList={kelasList}
      />

      <ModalDetailPengguna
        isOpen={isModalDetailPenggunaOpen}
        onClose={() => {
          setIsModalDetailPenggunaOpen(false);
          setDetailPengguna(null);
        }}
        pengguna={detailPengguna}
        kelasDiampuList={kelasDiampuList}
        schoolName={schoolProfile.namaSekolah}
        onEdit={(pengguna) => {
          setDetailPengguna(null);
          setIsModalDetailPenggunaOpen(false);
          setEditingPengguna(pengguna);
          setIsModalDataPenggunaOpen(true);
        }}
      />

      <ModalDisposisi
        isOpen={isModalDisposisiOpen}
        onClose={() => {
          setIsModalDisposisiOpen(false);
          setDisposisiSurat(null);
        }}
        surat={disposisiSurat}
        pejabatList={pejabatList}
        schoolProfile={schoolProfile}
        onSaveDisposisi={handleSaveDisposisi}
        currentUser={currentUser}
      />

      <ModalDetailSurat
        isOpen={isModalDetailOpen}
        onClose={() => {
          setIsModalDetailOpen(false);
          setDetailSurat(null);
        }}
        surat={detailSurat}
        onOpenDisposisi={handleOpenDisposisi}
        onUpdateStatus={handleUpdateStatusSuratMasuk}
      />

      <ModalCetakLaporan
        isOpen={isModalCetakLaporanOpen}
        onClose={() => setIsModalCetakLaporanOpen(false)}
        suratMasukList={suratMasukList}
        suratKeluarList={suratKeluarList}
        schoolProfile={schoolProfile}
      />

      <ModalHelp
        isOpen={isModalHelpOpen}
        onClose={() => setIsModalHelpOpen(false)}
      />

      <ModalRoleMatrix
        isOpen={isRoleMatrixOpen}
        onClose={() => setIsRoleMatrixOpen(false)}
        schoolName={schoolProfile.namaSekolah}
      />
    </div>
  );
}
