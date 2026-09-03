import { AppUser, RolePermissions, UserRole, DataPengguna } from '../types';
import { INITIAL_PENGGUNA } from './initialData';

export const ROLE_DEFINITIONS: Record<
  UserRole,
  {
    label: string;
    description: string;
    badgeColor: string;
    icon: string;
    permissions: RolePermissions;
  }
> = {
  admin: {
    label: 'Administrator Tata Usaha',
    description:
      'Pengelola operasional penuh persuratan, registrasi nomor agenda surat masuk/keluar, pengelolaan master data, data guru & pegawai, serta konfigurasi profil sekolah.',
    badgeColor: 'bg-[#006a61] text-white',
    icon: 'admin_panel_settings',
    permissions: {
      canCreateSurat: true,
      canCreateSuratKeluar: true,
      canEditSurat: true,
      canDeleteSurat: true,
      canDisposisi: true,
      canManagePengguna: true,
      canManageMasterData: true,
      canManagePengaturan: true,
      canCetakLaporan: true,
      canApproveSuratKeluar: true,
      canTindakLanjutDisposisi: true,
      viewScope: 'all',
    },
  },
  kepala_sekolah: {
    label: 'Kepala Sekolah',
    description:
      'Pemegang kebijakan & pengesahan persuratan. Berwenang memberikan lembar instruksi/disposisi resmi surat masuk, menyetujui draf surat keluar, dan memantau rekapitulasi laporan agenda.',
    badgeColor: 'bg-[#86f2e4] text-[#006f66] border border-[#006a61]/30 font-extrabold',
    icon: 'workspace_premium',
    permissions: {
      canCreateSurat: true,
      canCreateSuratKeluar: true,
      canEditSurat: true,
      canDeleteSurat: false,
      canDisposisi: true,
      canManagePengguna: false,
      canManageMasterData: false,
      canManagePengaturan: false,
      canCetakLaporan: true,
      canApproveSuratKeluar: true,
      canTindakLanjutDisposisi: true,
      viewScope: 'all',
    },
  },
  guru: {
    label: 'Guru & Tenaga Pendidik (GTK)',
    description:
      'Melihat surat dinas & disposisi, mengisi tindak lanjut, serta berwenang membuat & menerbitkan nomor surat keluar resmi atas nama guru/wali kelas terkait.',
    badgeColor: 'bg-[#b7c8e1] text-[#38485d] font-bold',
    icon: 'school',
    permissions: {
      canCreateSurat: false,
      canCreateSuratKeluar: true,
      canEditSurat: true,
      canDeleteSurat: false,
      canDisposisi: false,
      canManagePengguna: false,
      canManageMasterData: false,
      canManagePengaturan: false,
      canCetakLaporan: false,
      canApproveSuratKeluar: false,
      canTindakLanjutDisposisi: true,
      viewScope: 'assigned_and_public',
    },
  },
};

/**
 * Generate photo initials from full name
 */
export function getFotoInitials(nama: string): string {
  if (!nama) return 'U';
  return (
    nama
      .replace(/^(Drs\.|Dr\.|H\.|Hj\.|Ustadz|Ir\.)\s+/gi, '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U'
  );
}

/**
 * Determine user role based on jabatan and explicit role
 */
export function determineUserRole(jabatan: string, explicitRole?: UserRole): UserRole {
  if (explicitRole) return explicitRole;
  const j = (jabatan || '').toLowerCase();
  if (j.includes('kepala sekolah') || j.includes('kepsek')) {
    return 'kepala_sekolah';
  }
  if (
    j.includes('tata usaha') ||
    j.includes('kaur tu') ||
    j.includes('admin') ||
    j.includes('operator dapodik') ||
    j.includes('operator it')
  ) {
    return 'admin';
  }
  return 'guru';
}

/**
 * Determine user friendly role label
 */
export function determineRoleLabel(role: UserRole, jabatan: string, kelas?: string): string {
  if (role === 'kepala_sekolah') return 'Kepala Sekolah';
  if (role === 'admin') {
    if (jabatan.toLowerCase().includes('tata usaha')) return 'Administrator Tata Usaha';
    if (jabatan.toLowerCase().includes('dapodik')) return 'Operator Dapodik / Admin IT';
    return 'Administrator Tata Usaha';
  }
  if (kelas && kelas !== '-' && kelas.toLowerCase() !== 'semua kelas') {
    return `Guru / Wali ${kelas}`;
  }
  return jabatan || 'Guru & Tenaga Pendidik (GTK)';
}

/**
 * Generate a friendly username for an employee
 */
export function generateUsernameForPegawai(
  pegawai: DataPengguna,
  role: UserRole,
  usedUsernames: Set<string>
): string {
  if (pegawai.username && !usedUsernames.has(pegawai.username.toLowerCase())) {
    return pegawai.username.toLowerCase();
  }

  // Priority for known key roles
  if (role === 'kepala_sekolah' && !usedUsernames.has('kepsek')) {
    return 'kepsek';
  }
  if (role === 'admin' && !usedUsernames.has('admin')) {
    return 'admin';
  }

  // Clean email prefix
  if (pegawai.email) {
    const emailPrefix = pegawai.email.split('@')[0].toLowerCase().replace(/[^a-z0-9.]/g, '');
    if (emailPrefix && !usedUsernames.has(emailPrefix)) {
      return emailPrefix;
    }
  }

  // Extract clean first name
  const cleanName = (pegawai.nama || '')
    .replace(/^(Drs\.|Dr\.|H\.|Hj\.|Ustadz|Ir\.)\s+/gi, '')
    .replace(/,.*$/, '')
    .trim()
    .toLowerCase()
    .split(/\s+/)[0]
    .replace(/[^a-z0-9]/g, '');

  const base = role === 'guru' ? `guru.${cleanName || 'user'}` : cleanName || 'user';
  let candidate = base;
  let counter = 2;
  while (usedUsernames.has(candidate)) {
    candidate = `${base}${counter}`;
    counter++;
  }
  return candidate;
}

/**
 * Synchronize authentication accounts with the employee / pegawai database
 * Ensures all login profiles, names, roles, NIP, and contacts strictly reflect the database.
 */
export function syncAuthUsersWithPegawai(
  pegawaiList: DataPengguna[],
  existingAuthUsers: AppUser[] = []
): AppUser[] {
  const existingMap = new Map<string, AppUser>();

  existingAuthUsers.forEach((u) => {
    existingMap.set(u.id, u);
    if (u.nip && u.nip !== '-') existingMap.set(`nip:${u.nip.replace(/\s+/g, '')}`, u);
    if (u.email) existingMap.set(`email:${u.email.toLowerCase()}`, u);
    if (u.username) existingMap.set(`user:${u.username.toLowerCase()}`, u);
  });

  const usedUsernames = new Set<string>();
  const syncedUsers: AppUser[] = [];

  // Synchronize active employees first, then others
  const sortedPegawai = [...pegawaiList].sort((a, b) => {
    // Keep Kepala Sekolah and TU at top
    const aIsKepsek = a.jabatan.toLowerCase().includes('kepala sekolah');
    const bIsKepsek = b.jabatan.toLowerCase().includes('kepala sekolah');
    if (aIsKepsek && !bIsKepsek) return -1;
    if (!aIsKepsek && bIsKepsek) return 1;

    const aIsTU = a.jabatan.toLowerCase().includes('tata usaha') || a.jabatan.toLowerCase().includes('admin');
    const bIsTU = b.jabatan.toLowerCase().includes('tata usaha') || b.jabatan.toLowerCase().includes('admin');
    if (aIsTU && !bIsTU) return -1;
    if (!aIsTU && bIsTU) return 1;

    return a.nama.localeCompare(b.nama);
  });

  sortedPegawai.forEach((pegawai) => {
    // Skip completely inactive if needed, but keeping them allows graceful access control
    const cleanNip = pegawai.nip ? pegawai.nip.replace(/\s+/g, '') : '';
    const cleanEmail = pegawai.email ? pegawai.email.toLowerCase() : '';

    const matchedExisting =
      existingMap.get(pegawai.id) ||
      (cleanNip && cleanNip !== '-' ? existingMap.get(`nip:${cleanNip}`) : undefined) ||
      (cleanEmail ? existingMap.get(`email:${cleanEmail}`) : undefined);

    const role = determineUserRole(pegawai.jabatan, pegawai.role || matchedExisting?.role);
    const roleLabel = determineRoleLabel(role, pegawai.jabatan, pegawai.kelas);

    // Determine username
    let username = pegawai.username || matchedExisting?.username;
    if (!username || usedUsernames.has(username.toLowerCase())) {
      username = generateUsernameForPegawai(pegawai, role, usedUsernames);
    }
    usedUsernames.add(username.toLowerCase());

    const password = pegawai.password || matchedExisting?.password || '123';

    syncedUsers.push({
      id: pegawai.id,
      username,
      password,
      nama: pegawai.nama, // 100% Synchronized with database pegawai!
      nip: pegawai.nip || '-',
      role,
      roleLabel,
      jabatan: pegawai.jabatan || '-',
      kelas: pegawai.kelas || '-',
      kelasDiampu: pegawai.kelasDiampu || (pegawai.kelas && pegawai.kelas !== '-' ? [pegawai.kelas] : []),
      mataPelajaranUtama: pegawai.mataPelajaranUtama,
      email: pegawai.email || '',
      telepon: pegawai.telepon || '-',
      fotoInitials: getFotoInitials(pegawai.nama),
      statusKepegawaian: pegawai.statusKepegawaian || 'PNS',
      permissions: ROLE_DEFINITIONS[role].permissions,
    });
  });

  return syncedUsers;
}

export const INITIAL_AUTH_USERS: AppUser[] = syncAuthUsersWithPegawai(INITIAL_PENGGUNA);

export interface RoleMatrixFeature {
  kategori: string;
  fitur: string;
  admin: boolean | string;
  kepalaSekolah: boolean | string;
  guru: boolean | string;
  keterangan: string;
}

export const ROLE_PERMISSION_MATRIX: RoleMatrixFeature[] = [
  {
    kategori: 'Autentikasi & Profil',
    fitur: 'Login Akun & Dashboard Utama',
    admin: true,
    kepalaSekolah: true,
    guru: true,
    keterangan: 'Semua pengguna memiliki akses beranda sesuai level haknya',
  },
  {
    kategori: 'Surat Masuk',
    fitur: 'Melihat Daftar Surat Masuk',
    admin: 'Semua Surat',
    kepalaSekolah: 'Semua Surat',
    guru: 'Surat Terkait / Disposisi',
    keterangan: 'Guru memprioritaskan surat edaran & disposisi kelas',
  },
  {
    kategori: 'Surat Masuk',
    fitur: 'Registrasi / Tambah Surat Masuk',
    admin: true,
    kepalaSekolah: true,
    guru: false,
    keterangan: 'Petugas TU & Kepala Sekolah mencatat surat yang masuk',
  },
  {
    kategori: 'Surat Masuk',
    fitur: 'Memberikan Lembar Disposisi & Instruksi',
    admin: true,
    kepalaSekolah: 'Wewenang Utama',
    guru: false,
    keterangan: 'Kepala Sekolah memberikan instruksi tindak lanjut',
  },
  {
    kategori: 'Surat Masuk',
    fitur: 'Mengisi Catatan Tindak Lanjut Disposisi',
    admin: true,
    kepalaSekolah: true,
    guru: true,
    keterangan: 'Guru mengisi laporan hasil pelaksanaan instruksi disposisi',
  },
  {
    kategori: 'Surat Masuk & Keluar',
    fitur: 'Hapus Surat & Edit Arsip Agenda',
    admin: true,
    kepalaSekolah: false,
    guru: false,
    keterangan: 'Mencegah penghapusan arsip tidak sengaja',
  },
  {
    kategori: 'Surat Keluar',
    fitur: 'Buat & Terbitkan Nomor Surat Keluar',
    admin: true,
    kepalaSekolah: true,
    guru: 'Draf + Nama Guru',
    keterangan: 'Guru dapat menerbitkan draf nomor surat keluar dengan identitas nama guru pembuat',
  },
  {
    kategori: 'Surat Keluar',
    fitur: 'Persetujuan & Tanda Tangan Surat Keluar',
    admin: false,
    kepalaSekolah: true,
    guru: false,
    keterangan: 'Pengesahan draf surat resmi sekolah oleh Kepala Sekolah',
  },
  {
    kategori: 'Data Pengguna & GTK',
    fitur: 'Melihat Direktori Guru & Kelas',
    admin: true,
    kepalaSekolah: true,
    guru: true,
    keterangan: 'Melihat daftar rekan kerja, kontak, dan pembagian kelas',
  },
  {
    kategori: 'Data Pengguna & GTK',
    fitur: 'Kelola & Tambah Data Guru / Pengguna',
    admin: true,
    kepalaSekolah: false,
    guru: false,
    keterangan: 'Dikelola oleh Administrator Tata Usaha',
  },
  {
    kategori: 'Master Data & Klasifikasi',
    fitur: 'Kelola Kode Klasifikasi & Instansi',
    admin: true,
    kepalaSekolah: false,
    guru: false,
    keterangan: 'Konfigurasi teknis kode klasifikasi dan daftar mitra',
  },
  {
    kategori: 'Laporan & Pengaturan',
    fitur: 'Cetak Lembar Disposisi & Rekap Agenda',
    admin: true,
    kepalaSekolah: true,
    guru: 'Disposisi Terkait',
    keterangan: 'Pencetakan fisik dokumen resmi sekolah',
  },
  {
    kategori: 'Laporan & Pengaturan',
    fitur: 'Pengaturan Profil Sekolah & Kop Surat',
    admin: true,
    kepalaSekolah: false,
    guru: false,
    keterangan: 'Pengaturan nama sekolah, NPSN, logo, dan format nomor surat',
  },
];
