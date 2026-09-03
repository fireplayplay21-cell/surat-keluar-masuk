export type SifatSurat = 'biasa' | 'penting' | 'segera' | 'rahasia';

export type StatusSuratMasuk = 'belum' | 'diproses' | 'selesai';

export type StatusSuratKeluar = 'draft' | 'disetujui' | 'terkirim';

export interface GoogleDriveAttachment {
  fileId: string;
  fileName: string;
  mimeType: string;
  fileSize?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  directDownloadLink?: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

export interface SuratMasuk {
  id: string;
  noUrut: string;
  noAgenda?: string; // Fallback kompatibilitas arsip terdahulu
  tglTerima: string; // YYYY-MM-DD
  tglTerimaFormatted: string; // e.g. 12 Okt 2023
  noAsal: string;
  tglAsal: string; // YYYY-MM-DD
  tglAsalFormatted: string; // e.g. 10 Okt 2023
  pengirim: string;
  perihal: string;
  sifat: SifatSurat;
  status: StatusSuratMasuk;
  ringkasan?: string;
  kodeKlasifikasi?: string;
  fileLampiran?: string;
  fileSize?: string;
  // Google Drive Integration
  driveAttachment?: GoogleDriveAttachment;
  driveFileId?: string;
  driveWebViewLink?: string;
  driveThumbnailLink?: string;
  driveFileName?: string;
  disposisi?: {
    tglDisposisi: string;
    diteruskanKepada: string[];
    instruksi: string[];
    catatanKepalaSekolah: string;
    catatanTindakLanjut?: string;
  };
}

export interface SuratKeluar {
  id: string;
  noUrut: string;
  noAgenda?: string; // Fallback kompatibilitas arsip terdahulu
  noSurat: string;
  tglSurat: string;
  tglSuratFormatted: string;
  tujuan: string;
  perihal: string;
  sifat: SifatSurat;
  status: StatusSuratKeluar;
  penandatangan: string;
  pembuatSurat?: string; // Nama Guru / Pegawai yang membuat / menerbitkan surat
  nipPembuat?: string;
  jabatanPembuat?: string;
  kodeKlasifikasi?: string;
  ringkasan?: string;
  fileLampiran?: string;
  // Google Drive Integration
  driveAttachment?: GoogleDriveAttachment;
  driveFileId?: string;
  driveWebViewLink?: string;
  driveFileName?: string;
}

export interface MasterKlasifikasi {
  id: string;
  kode: string;
  nama: string;
  keterangan: string;
}

export interface MasterInstansi {
  id: string;
  nama: string;
  alamat: string;
  telepon: string;
  kategori: string;
}

export interface MasterPejabat {
  id: string;
  nama: string;
  jabatan: string;
  nip: string;
}

export interface MasterKelas {
  id: string;
  namaKelas: string; // contoh: "Kelas 1A", "Kelas 2B", "Kelas 6A"
  tingkat: number; // 1, 2, 3, 4, 5, 6
  waliKelas: string; // Nama guru wali kelas
  nipWaliKelas?: string; // NIP guru wali kelas
  tahunAjaran: string; // contoh: "2023/2024"
  jumlahSiswa: number; // total siswa rombel
  jumlahLakiLaki?: number;
  jumlahPerempuan?: number;
  ruangan: string; // contoh: "Ruang R.101 (Lt. 1)"
  faseKurikulum?: 'Fase A' | 'Fase B' | 'Fase C'; // Kurikulum Merdeka
  keterangan?: string;
}

export interface KelasDiampu {
  id: string;
  guruId: string; // ID pegawai dari tabel data pengguna
  namaGuru: string;
  nipGuru: string;
  mataPelajaran: string; // Contoh: "Tematik / Guru Kelas", "Pendidikan Agama Islam (PAI)", "PJOK", "Bahasa Inggris", "Matematika", "SBdP", "IPAS"
  kelasId: string; // ID rombel master kelas (misal: "kls-1a")
  namaKelas: string; // Contoh: "Kelas 1A"
  tingkat: number; // 1 - 6
  tahunAjaran: string; // "2023/2024" atau "2024/2025"
  semester: 'Ganjil' | 'Genap' | 'Sepanjang Tahun';
  jumlahJamPerMinggu: number; // Beban JP per minggu (misal: 24, 4, 3, 2 JP)
  hariJadwal?: string; // Hari dan jam mengajar, misal: "Senin 07:30 - 09:30"
  ruangan?: string; // Ruang kelas atau lokasi belajar
  status: 'Aktif' | 'Nonaktif';
  keterangan?: string;
}

export interface DataPengguna {
  id: string;
  nama: string;
  nip: string;
  kelas: string;
  kelasDiampu?: string[]; // Daftar nama rombel yang diampu, misal: ["Kelas 1A", "Kelas 1B"]
  mataPelajaranUtama?: string; // Misal: "PJOK", "PAI", "Guru Kelas"
  totalJamMengajar?: number; // Total jam tatap muka per minggu (JP)
  jabatan: string;
  statusKepegawaian: 'PNS' | 'PPPK' | 'GTT/Honorer' | 'PTY';
  jenisKelamin: 'L' | 'P';
  telepon: string;
  email?: string;
  statusAktif: boolean;
  role?: UserRole;
  username?: string;
  password?: string;
}

export interface SchoolProfile {
  namaSekolah: string;
  npsn: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  website: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  formatNoUrutMasuk?: string;
  formatNoUrutKeluar?: string;
  formatNoAgendaMasuk?: string;
  formatNoAgendaKeluar?: string;
}

export type TabType =
  | 'dashboard'
  | 'surat-masuk'
  | 'surat-keluar'
  | 'data-pengguna'
  | 'master-data'
  | 'pengaturan';

export type UserRole = 'admin' | 'kepala_sekolah' | 'guru';

export interface RolePermissions {
  canCreateSurat: boolean; // Pendaftaran Surat Masuk
  canCreateSuratKeluar: boolean; // Pembuatan & Penerbitan Nomor Surat Keluar
  canEditSurat: boolean;
  canDeleteSurat: boolean;
  canDisposisi: boolean;
  canManagePengguna: boolean;
  canManageMasterData: boolean;
  canManagePengaturan: boolean;
  canCetakLaporan: boolean;
  canApproveSuratKeluar: boolean;
  canTindakLanjutDisposisi: boolean;
  viewScope: 'all' | 'assigned_and_public';
}

export interface AppUser {
  id: string;
  username: string;
  password?: string;
  nama: string;
  nip: string;
  role: UserRole;
  roleLabel: string;
  jabatan: string;
  kelas?: string;
  kelasDiampu?: string[];
  mataPelajaranUtama?: string;
  email: string;
  telepon: string;
  fotoInitials: string;
  statusKepegawaian: 'PNS' | 'PPPK' | 'GTT/Honorer' | 'PTY';
  permissions: RolePermissions;
}

