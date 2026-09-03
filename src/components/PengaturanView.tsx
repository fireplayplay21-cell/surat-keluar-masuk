import React, { useState, useEffect } from 'react';
import { SchoolProfile, SuratMasuk, SuratKeluar, DataPengguna, MasterKlasifikasi, MasterKelas } from '../types';
import { LOGO_URL } from './Sidebar';
import {
  getDriveAuthStatus,
  connectGoogleDrive,
  disconnectGoogleDrive,
  DriveAuthStatus,
} from '../services/googleDrive';
import {
  FIRESTORE_DATABASE_ID,
  COLLECTIONS,
  forceSyncAllCollectionsToFirestore,
  repairDatabaseNoUrut,
  FirestoreSyncSummary,
} from '../services/firebase';

interface PengaturanViewProps {
  profile: SchoolProfile;
  onSaveProfile: (profile: SchoolProfile) => void;
  suratMasukList?: SuratMasuk[];
  suratKeluarList?: SuratKeluar[];
  penggunaList?: DataPengguna[];
  klasifikasiList?: MasterKlasifikasi[];
  kelasList?: MasterKelas[];
  totalSuratMasuk?: number;
  totalSuratKeluar?: number;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  profile,
  onSaveProfile,
  suratMasukList = [],
  suratKeluarList = [],
  penggunaList = [],
  klasifikasiList = [],
  kelasList = [],
  totalSuratMasuk = 0,
  totalSuratKeluar = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'profil' | 'database'>('profil');
  const [formData, setFormData] = useState<SchoolProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);
  const [driveStatus, setDriveStatus] = useState<DriveAuthStatus>({
    isConnected: false,
    userEmail: null,
    userName: null,
    expiresAt: null,
  });
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);
  const [driveMsg, setDriveMsg] = useState<string | null>(null);

  // Firestore Sync State
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);
  const [syncSummary, setSyncSummary] = useState<FirestoreSyncSummary | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairResult, setRepairResult] = useState<{ repairedSuratMasuk: number; repairedSuratKeluar: number } | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string>('surat_masuk');

  useEffect(() => {
    setDriveStatus(getDriveAuthStatus());
  }, []);

  const handleChange = (field: keyof SchoolProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleConnectDrive = async () => {
    try {
      setIsConnectingDrive(true);
      setDriveMsg(null);
      await connectGoogleDrive();
      const status = getDriveAuthStatus();
      setDriveStatus(status);
      setDriveMsg('Akun Google Drive berhasil terhubung!');
    } catch (err: any) {
      setDriveMsg(`Gagal menghubungkan Google Drive: ${err?.message || 'Izin dibatalkan'}`);
    } finally {
      setIsConnectingDrive(false);
    }
  };

  const handleDisconnectDrive = () => {
    if (window.confirm('Putuskan koneksi Google Drive pada peramban ini?')) {
      disconnectGoogleDrive();
      setDriveStatus(getDriveAuthStatus());
      setDriveMsg('Koneksi Google Drive telah diputuskan.');
    }
  };

  const handleSyncFirestore = async () => {
    try {
      setIsSyncingFirestore(true);
      setSyncError(null);
      const res = await forceSyncAllCollectionsToFirestore(
        suratMasukList,
        suratKeluarList,
        penggunaList,
        klasifikasiList,
        formData,
        kelasList
      );
      setSyncSummary(res);
      setTimeout(() => setSyncSummary(null), 6000);
    } catch (err: any) {
      console.error('Manual Firestore Sync Error:', err);
      setSyncError(err?.message || 'Gagal menyinkronkan data ke Firestore');
    } finally {
      setIsSyncingFirestore(false);
    }
  };

  const handleRepairDatabase = async () => {
    try {
      setIsRepairing(true);
      setSyncError(null);
      const res = await repairDatabaseNoUrut();
      setRepairResult(res);
      setTimeout(() => setRepairResult(null), 6000);
    } catch (err: any) {
      console.error('Repair Database Error:', err);
      setSyncError(err?.message || 'Gagal memperbaiki database');
    } finally {
      setIsRepairing(false);
    }
  };

  const collectionDefinitions = [
    {
      id: COLLECTIONS.SURAT_MASUK,
      name: 'surat_masuk',
      title: 'Koleksi Surat Masuk',
      docIdPattern: '{id} (contoh: sm-001)',
      count: suratMasukList.length || totalSuratMasuk,
      icon: 'inbox',
      color: 'text-[#006a61] bg-[#86f2e4]/20 border-[#006a61]/30',
      description: 'Menyimpan berkas surat dinas masuk, disposisi kepala sekolah, dan pindaian Google Drive.',
      fields: [
        { name: 'id', type: 'string', desc: 'ID unik dokumen' },
        { name: 'noUrut', type: 'string (contoh: 001, 002)', desc: 'Nomor urut sequential surat masuk' },
        { name: 'noAgenda', type: 'string', desc: 'Kompatibilitas nomor agenda / urut' },
        { name: 'noSurat', type: 'string', desc: 'Nomor resmi surat dari pengirim' },
        { name: 'tglSurat', type: 'string (YYYY-MM-DD)', desc: 'Tanggal terbit surat' },
        { name: 'tglDiterima', type: 'string (YYYY-MM-DD)', desc: 'Tanggal surat diterima di sekolah' },
        { name: 'pengirim', type: 'string', desc: 'Instansi / pihak pengirim' },
        { name: 'perihal', type: 'string', desc: 'Subjek / perihal surat' },
        { name: 'sifat', type: 'enum (biasa | penting | rahasia | segera)', desc: 'Tingkat urgensi surat' },
        { name: 'status', type: 'enum (menunggu_disposisi | sudah_disposisi | selesai)', desc: 'Status tindak lanjut' },
        { name: 'disposisi', type: 'object (instruksi, diteruskanKepada, catatan, dll)', desc: 'Lembar disposisi kedinasan' },
        { name: 'driveFileId', type: 'string (opsional)', desc: 'ID file PDF/Foto di Google Drive' },
        { name: 'driveWebViewLink', type: 'string (opsional)', desc: 'Tautan pratinjau Google Drive' },
      ],
    },
    {
      id: COLLECTIONS.SURAT_KELUAR,
      name: 'surat_keluar',
      title: 'Koleksi Surat Keluar',
      docIdPattern: '{id} (contoh: sk-001)',
      count: suratKeluarList.length || totalSuratKeluar,
      icon: 'outbox',
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      description: 'Menyimpan arsip surat keluar resmi yang diterbitkan sekolah kepada pihak eksternal.',
      fields: [
        { name: 'id', type: 'string', desc: 'ID unik dokumen surat keluar' },
        { name: 'noUrut', type: 'string (contoh: 001, 002)', desc: 'Nomor urut sequential surat keluar' },
        { name: 'noAgenda', type: 'string', desc: 'Kompatibilitas nomor agenda / urut' },
        { name: 'noSurat', type: 'string', desc: 'Nomor surat resmi lengkap' },
        { name: 'tglSurat', type: 'string (YYYY-MM-DD)', desc: 'Tanggal surat diterbitkan' },
        { name: 'tujuan', type: 'string', desc: 'Penerima / tujuan surat' },
        { name: 'perihal', type: 'string', desc: 'Perihal surat keluar' },
        { name: 'penandatangan', type: 'string', desc: 'Pejabat penandatangan (Kepala Sekolah)' },
        { name: 'sifat', type: 'enum (biasa | penting | rahasia | segera)', desc: 'Tingkat urgensi surat' },
        { name: 'kodeKlasifikasi', type: 'string', desc: 'Kode klasifikasi arsip surat' },
        { name: 'status', type: 'enum (draft | disetujui | terkirim)', desc: 'Status distribusi surat' },
      ],
    },
    {
      id: COLLECTIONS.PENGGUNA,
      name: 'pengguna',
      title: 'Koleksi Data Pengguna & GTK',
      docIdPattern: '{id} (contoh: usr-1, usr-2)',
      count: penggunaList.length,
      icon: 'groups',
      color: 'text-purple-700 bg-purple-50 border-purple-200',
      description: 'Data akun pengguna, peran hak akses (Kepala Sekolah, Tata Usaha, Guru), NIP, dan jabatan.',
      fields: [
        { name: 'id', type: 'string', desc: 'ID identitas pengguna' },
        { name: 'nama', type: 'string', desc: 'Nama lengkap beserta gelar' },
        { name: 'nip', type: 'string', desc: 'Nomor Induk Pegawai' },
        { name: 'email', type: 'string', desc: 'Alamat email dinas/pribadi' },
        { name: 'role', type: 'enum (admin | kepala_sekolah | guru)', desc: 'Hak akses dalam sistem' },
        { name: 'jabatan', type: 'string', desc: 'Jabatan struktural / fungsional' },
        { name: 'status', type: 'enum (aktif | nonaktif)', desc: 'Status kepegawaian' },
      ],
    },
    {
      id: COLLECTIONS.MASTER_KLASIFIKASI,
      name: 'master_klasifikasi',
      title: 'Koleksi Master Kode Klasifikasi',
      docIdPattern: '{id} (contoh: k-01)',
      count: klasifikasiList.length,
      icon: 'category',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      description: 'Daftar kode klasifikasi persuratan dinas pendidikan (misal: 421.1 Kurikulum, 421.2 Kesiswaan).',
      fields: [
        { name: 'id', type: 'string', desc: 'ID unik master klasifikasi' },
        { name: 'kode', type: 'string', desc: 'Kode angka klasifikasi surat dinas' },
        { name: 'nama', type: 'string', desc: 'Nama kategori klasifikasi' },
        { name: 'deskripsi', type: 'string', desc: 'Penjelasan rincian peruntukan' },
      ],
    },
    {
      id: COLLECTIONS.KELAS,
      name: 'kelas',
      title: 'Koleksi Database Kelas & Rombel',
      docIdPattern: '{id} (contoh: kls-1a, kls-2b)',
      count: kelasList.length,
      icon: 'school',
      color: 'text-teal-700 bg-teal-50 border-teal-200',
      description: 'Menyimpan master data rombel/kelas, wali kelas, NIP, ruangan, jumlah peserta didik, dan fase kurikulum.',
      fields: [
        { name: 'id', type: 'string', desc: 'ID unik dokumen kelas' },
        { name: 'namaKelas', type: 'string', desc: 'Nama rombongan belajar (contoh: Kelas 1A)' },
        { name: 'tingkat', type: 'number (1-6)', desc: 'Tingkat kelas sekolah dasar' },
        { name: 'waliKelas', type: 'string', desc: 'Nama guru wali kelas bertugas' },
        { name: 'nipWaliKelas', type: 'string (opsional)', desc: 'NIP guru wali kelas' },
        { name: 'tahunAjaran', type: 'string', desc: 'Tahun pelajaran (contoh: 2023/2024)' },
        { name: 'jumlahSiswa', type: 'number', desc: 'Total peserta didik rombel' },
        { name: 'jumlahLakiLaki', type: 'number (opsional)', desc: 'Jumlah peserta didik laki-laki' },
        { name: 'jumlahPerempuan', type: 'number (opsional)', desc: 'Jumlah peserta didik perempuan' },
        { name: 'ruangan', type: 'string', desc: 'Lokasi ruang gedung kelas' },
        { name: 'faseKurikulum', type: 'string (Fase A | B | C)', desc: 'Fase Kurikulum Merdeka' },
      ],
    },
    {
      id: COLLECTIONS.SCHOOL_PROFILE,
      name: 'school_profile',
      title: 'Koleksi Profil Sekolah',
      docIdPattern: 'main_profile (Dokumen Tunggal)',
      count: 1,
      icon: 'domain',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      description: 'Menyimpan identitas lembaga, kepala sekolah, NPSN, kontak, dan pola format penomoran agenda.',
      fields: [
        { name: 'namaSekolah', type: 'string', desc: 'Nama satuan pendidikan (UPTD SPF SDN Mawas)' },
        { name: 'npsn', type: 'string', desc: 'Nomor Pokok Sekolah Nasional' },
        { name: 'kepalaSekolah', type: 'string', desc: 'Nama Kepala Sekolah (Ampena, S., S.Pd)' },
        { name: 'nipKepalaSekolah', type: 'string', desc: 'NIP Kepala Sekolah' },
        { name: 'alamat', type: 'string', desc: 'Alamat lengkap satuan pendidikan' },
        { name: 'kota & provinsi', type: 'string', desc: 'Wilayah dinas pendidikan' },
        { name: 'telepon & email', type: 'string', desc: 'Kontak resmi sekolah' },
        { name: 'formatNoAgendaMasuk', type: 'string', desc: 'Format penomoran agenda masuk' },
        { name: 'formatNoAgendaKeluar', type: 'string', desc: 'Format penomoran agenda keluar' },
      ],
    },
  ];

  const currentColDef = collectionDefinitions.find((c) => c.name === selectedCollection) || collectionDefinitions[0];

  return (
    <div className="flex-1 p-3 sm:p-4 md:p-8 max-w-[1400px] mx-auto w-full flex flex-col gap-4 sm:gap-6">
      {/* Top Header & Sub-Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#eceef0] pb-4">
        <div>
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006a61]">settings</span>
            Pengaturan & Struktur Database
          </h2>
          <p className="text-xs text-[#45464d] mt-0.5">
            Kelola profil satuan pendidikan, integrasi cloud, dan struktur koleksi data di Firebase Firestore.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#f7f9fb] p-1 border border-[#c6c6cd] rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profil')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'profil'
                ? 'bg-[#006a61] text-white shadow-2xs'
                : 'text-[#45464d] hover:text-black hover:bg-white/80'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">school</span>
            Profil Sekolah
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'database'
                ? 'bg-[#006a61] text-white shadow-2xs'
                : 'text-[#45464d] hover:text-black hover:bg-white/80'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">database</span>
            Struktur Koleksi Firestore
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">
              5
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'profil' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Column (2 cols) */}
          <div className="lg:col-span-2 bg-white border border-[#c6c6cd] rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#eceef0] mb-5">
              <div>
                <h3 className="text-base font-bold text-black flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006a61]">school</span>
                  Profil Satuan Pendidikan & Pengaturan Sistem
                </h3>
                <p className="text-xs text-[#45464d] mt-0.5">
                  Data ini digunakan secara otomatis pada Kop Surat, Lembar Disposisi, dan Laporan Agenda.
                </p>
              </div>
              {isSaved && (
                <span className="text-xs bg-[#86f2e4] text-[#006f66] px-3 py-1 rounded-full font-bold animate-in fade-in flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  Tersimpan ke Cloud!
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Nama Satuan Pendidikan</label>
                  <input
                    type="text"
                    required
                    value={formData.namaSekolah}
                    onChange={(e) => handleChange('namaSekolah', e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-sm input-focus-glow font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">NPSN (Nomor Pokok Sekolah)</label>
                  <input
                    type="text"
                    required
                    value={formData.npsn}
                    onChange={(e) => handleChange('npsn', e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-sm input-focus-glow font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#45464d] mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.alamat}
                  onChange={(e) => handleChange('alamat', e.target.value)}
                  className="w-full border border-[#c6c6cd] rounded-lg p-2 text-sm input-focus-glow"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Kecamatan</label>
                  <input
                    type="text"
                    value={formData.kecamatan}
                    onChange={(e) => handleChange('kecamatan', e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-sm input-focus-glow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Kota / Kabupaten</label>
                  <input
                    type="text"
                    value={formData.kota}
                    onChange={(e) => handleChange('kota', e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-sm input-focus-glow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={formData.provinsi}
                    onChange={(e) => handleChange('provinsi', e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-sm input-focus-glow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Telepon Sekolah</label>
                  <input
                    type="text"
                    value={formData.telepon}
                    onChange={(e) => handleChange('telepon', e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-sm input-focus-glow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-sm input-focus-glow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Website</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-sm input-focus-glow"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#eceef0] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Nama Kepala Sekolah</label>
                  <input
                    type="text"
                    required
                    value={formData.kepalaSekolah}
                    onChange={(e) => handleChange('kepalaSekolah', e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-sm input-focus-glow font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    value={formData.nipKepalaSekolah}
                    onChange={(e) => handleChange('nipKepalaSekolah', e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-sm input-focus-glow font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#eceef0] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Format Penomoran Surat Masuk</label>
                  <input
                    type="text"
                    value={formData.formatNoAgendaMasuk}
                    onChange={(e) => handleChange('formatNoAgendaMasuk', e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-sm input-focus-glow font-mono text-xs"
                  />
                  <span className="text-[11px] text-[#76777d]">Placeholder: {'{NOMOR}'}, {'{BULAN_ROMAWI}'}, {'{TAHUN}'}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">Format Penomoran Surat Keluar</label>
                  <input
                    type="text"
                    value={formData.formatNoAgendaKeluar}
                    onChange={(e) => handleChange('formatNoAgendaKeluar', e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded-lg p-2 text-sm input-focus-glow font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#eceef0]">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#006a61] text-white rounded-lg text-xs font-bold hover:bg-[#006a61]/90 focus-ring-teal cursor-pointer shadow-xs"
                >
                  Simpan Profil Sekolah
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Cloud Integrations & Kop Preview */}
          <div className="space-y-5">
            {/* Cloud Storage & Integrations Card */}
            <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#45464d] mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#006a61]">cloud_sync</span>
                Koneksi Firebase & Google Drive
              </h4>

              {driveMsg && (
                <div className="bg-[#86f2e4]/30 border border-[#006a61]/30 p-2.5 rounded-lg text-xs text-[#005049] mb-3 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] mt-0.5">info</span>
                  <span>{driveMsg}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                {/* Firebase Firestore Status */}
                <div className="p-3 bg-[#f7f9fb] border border-[#c6c6cd] rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-[20px]">local_fire_department</span>
                      <span className="font-bold text-black text-xs">Firebase Firestore</span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Aktif & Terhubung
                    </span>
                  </div>
                  <p className="text-[11px] text-[#45464d]">
                    Database ID: <span className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-[#c6c6cd]">{FIRESTORE_DATABASE_ID.slice(0, 22)}...</span>
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-[#76777d]">
                    <span>Surat Masuk: <strong>{totalSuratMasuk}</strong></span>
                    <span>•</span>
                    <span>Surat Keluar: <strong>{totalSuratKeluar}</strong></span>
                  </div>
                </div>

                {/* Google Drive Status */}
                <div className="p-3 bg-[#f7f9fb] border border-[#c6c6cd] rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#4285F4] text-[20px]">cloud_upload</span>
                      <span className="font-bold text-black text-xs">Google Drive Storage</span>
                    </div>
                    {driveStatus.isConnected ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Terhubung
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        Belum Terhubung
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#45464d] mb-2">
                    {driveStatus.isConnected
                      ? `Menyimpan scan PDF & foto ke folder 'Arsip Tata Usaha ${formData.namaSekolah}' akun ${driveStatus.userEmail || 'Google'}.`
                      : 'Hubungkan akun Google Drive untuk menyimpan berkas scan PDF & foto surat masuk secara permanen.'}
                  </p>

                  <div className="flex gap-2">
                    {driveStatus.isConnected ? (
                      <button
                        type="button"
                        onClick={handleDisconnectDrive}
                        className="w-full bg-white border border-[#c6c6cd] hover:border-red-300 text-red-600 font-bold py-1.5 rounded-lg text-xs cursor-pointer hover:bg-red-50 transition-colors"
                      >
                        Putuskan Google Drive
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConnectDrive}
                        disabled={isConnectingDrive}
                        className="w-full bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                      >
                        {isConnectingDrive ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span className="material-symbols-outlined text-[16px]">link</span>
                        )}
                        <span>Hubungkan Google Drive</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview Kop Surat */}
            <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#45464d] mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-[#006a61]">preview</span>
                Pratinjau Kop Surat Resmi
              </h4>

              <div className="border border-[#c6c6cd]/80 rounded-lg p-3.5 bg-white shadow-2xs font-serif text-center">
                <div className="flex items-center justify-center gap-2 pb-2 border-b-2 border-black">
                  <img
                    src={LOGO_URL}
                    alt="Logo"
                    className="w-10 h-10 object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-tight text-black leading-tight">
                      PEMERINTAH DAERAH PROVINSI {formData.provinsi.toUpperCase()}
                    </h5>
                    <h6 className="text-[9.5px] font-semibold text-black uppercase leading-tight">
                      DINAS PENDIDIKAN KOTA {formData.kota.toUpperCase()}
                    </h6>
                    <h4 className="text-xs font-extrabold uppercase text-black leading-tight">
                      {formData.namaSekolah.toUpperCase()}
                    </h4>
                    <p className="text-[8.5px] text-[#45464d] font-sans">
                      {formData.alamat}, Kec. {formData.kecamatan}, {formData.kota}
                    </p>
                    <p className="text-[8.5px] text-[#45464d] font-sans">
                      Telp: {formData.telepon} | Email: {formData.email} | NPSN: {formData.npsn}
                    </p>
                  </div>
                </div>
                <div className="h-0.5 bg-black mt-0.5 mb-2" />
                <div className="py-1 text-[10px] text-[#76777d] italic font-sans">
                  [ Kop surat disinkronkan ke seluruh dokumen resmi ]
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Database & Firestore Collection Structure View */
        <div className="space-y-6">
          {/* Header Action & Sync Alert */}
          <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-amber-600 text-[22px]">local_fire_department</span>
                <h3 className="text-base font-bold text-black">Arsitektur & Koleksi Database Firestore</h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Real-time Sync Active
                </span>
              </div>
              <p className="text-xs text-[#45464d]">
                Struktur database terstandarisasi ke dalam 5 koleksi Firestore dengan aturan validasi skema dan sinkronisasi real-time.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleRepairDatabase}
                disabled={isRepairing}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                title="Normalisasi field nomor urut (001, 002, ...) pada semua dokumen database"
              >
                {isRepairing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">build</span>
                )}
                <span>Perbaiki Nomor Urut Database</span>
              </button>

              <button
                type="button"
                onClick={handleSyncFirestore}
                disabled={isSyncingFirestore}
                className="px-4 py-2 bg-[#006a61] hover:bg-[#006a61]/90 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
              >
                {isSyncingFirestore ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">sync</span>
                )}
                <span>Sinkronkan Seluruh Koleksi</span>
              </button>
            </div>
          </div>

          {repairResult && (
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl text-xs text-amber-900 flex items-start gap-3 animate-in fade-in">
              <span className="material-symbols-outlined text-amber-600 text-[20px] mt-0.5">verified</span>
              <div>
                <h5 className="font-bold mb-1">Database Nomor Urut Berhasil Diperbaiki!</h5>
                <p>
                  Telah dinormalisasi <strong>{repairResult.repairedSuratMasuk}</strong> surat masuk dan{' '}
                  <strong>{repairResult.repairedSuratKeluar}</strong> surat keluar dengan nomor urut sequential (001, 002, dst.).
                </p>
              </div>
            </div>
          )}

          {syncSummary && (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-xs text-emerald-900 flex items-start gap-3 animate-in fade-in">
              <span className="material-symbols-outlined text-emerald-600 text-[20px] mt-0.5">check_circle</span>
              <div className="flex-1">
                <h5 className="font-bold mb-1">Koleksi Firestore Berhasil Dirapihkan & Disinkronkan! (Pukul {syncSummary.syncedAt})</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mt-2">
                  <div className="bg-white/80 p-2 rounded border border-emerald-200">
                    <span className="text-gray-500 block">surat_masuk</span>
                    <strong className="text-emerald-700">{syncSummary.suratMasukCount} dokumen</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded border border-emerald-200">
                    <span className="text-gray-500 block">surat_keluar</span>
                    <strong className="text-emerald-700">{syncSummary.suratKeluarCount} dokumen</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded border border-emerald-200">
                    <span className="text-gray-500 block">pengguna</span>
                    <strong className="text-emerald-700">{syncSummary.penggunaCount} akun</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded border border-emerald-200">
                    <span className="text-gray-500 block">master_klasifikasi</span>
                    <strong className="text-emerald-700">{syncSummary.klasifikasiCount} kode</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {syncError && (
            <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{syncError}</span>
            </div>
          )}

          {/* Collection Grid & Schema Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Collection List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#45464d] mb-1">
                Daftar Koleksi Firestore (5 Koleksi Utama)
              </h4>

              {collectionDefinitions.map((col) => {
                const isSelected = selectedCollection === col.name;
                return (
                  <div
                    key={col.id}
                    onClick={() => setSelectedCollection(col.name)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#006a61] shadow-xs ring-1 ring-[#006a61]'
                        : 'bg-white border-[#c6c6cd] hover:border-[#006a61]/60 hover:bg-[#f7f9fb]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg border text-[18px] material-symbols-outlined ${col.color}`}>
                          {col.icon}
                        </span>
                        <div>
                          <div className="font-mono text-xs font-bold text-black">{col.name}</div>
                          <div className="text-[11px] text-[#76777d]">{col.title}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-[#eceef0] text-black font-extrabold text-[11px] px-2 py-0.5 rounded-full">
                          {col.count} Dokumen
                        </span>
                      </div>
                    </div>

                    <p className="text-[11.5px] text-[#45464d] line-clamp-2 mt-1">
                      {col.description}
                    </p>

                    <div className="mt-2 pt-2 border-t border-[#eceef0] flex items-center justify-between text-[10px] font-mono text-[#76777d]">
                      <span>ID Format: {col.docIdPattern}</span>
                      <span className="text-[#006a61] font-sans font-bold flex items-center gap-0.5">
                        Lihat Skema <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Selected Collection Schema & Detail (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#eceef0]">
                <div className="flex items-center gap-2">
                  <span className={`p-2 rounded-lg border text-[20px] material-symbols-outlined ${currentColDef.color}`}>
                    {currentColDef.icon}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-black font-mono">
                      collection('{currentColDef.name}')
                    </h3>
                    <p className="text-xs text-[#45464d]">{currentColDef.description}</p>
                  </div>
                </div>
                <span className="bg-[#86f2e4]/30 text-[#006f66] text-xs font-bold px-2.5 py-1 rounded-full">
                  {currentColDef.count} Data Terdaftar
                </span>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#45464d] mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#006a61]">data_object</span>
                  Struktur Skema Field Dokumen
                </h5>

                <div className="border border-[#c6c6cd] rounded-lg overflow-x-auto text-xs">
                  <table className="w-full text-left min-w-[480px]">
                    <thead className="bg-[#f7f9fb] border-b border-[#c6c6cd] text-[11px] font-bold text-[#45464d]">
                      <tr>
                        <th className="p-2.5">Nama Field</th>
                        <th className="p-2.5">Tipe Data</th>
                        <th className="p-2.5">Keterangan / Peruntukan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eceef0]">
                      {currentColDef.fields.map((f, idx) => (
                        <tr key={idx} className="hover:bg-[#f7f9fb]/60">
                          <td className="p-2.5 font-mono font-bold text-black text-[11.5px]">{f.name}</td>
                          <td className="p-2.5 font-mono text-[10.5px] text-[#006a61]">{f.type}</td>
                          <td className="p-2.5 text-[#45464d] text-[11px]">{f.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Firestore Security Rules Info */}
              <div className="p-3.5 bg-[#f7f9fb] border border-[#c6c6cd] rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-black text-xs">
                  <span className="material-symbols-outlined text-[#006a61] text-[16px]">verified_user</span>
                  Keamanan & Akses Firestore
                </div>
                <p className="text-[11px] text-[#45464d]">
                  Aturan keamanan terpasang dengan izin baca dan tulis terpusat pada path:
                </p>
                <code className="block bg-white border border-[#c6c6cd] p-2 rounded font-mono text-[11px] text-black">
                  match /{currentColDef.name}/{'{documentId}'} &#123; allow read, write: if true; &#125;
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
