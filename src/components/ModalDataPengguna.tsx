import React, { useState, useEffect } from 'react';
import { DataPengguna, MasterKelas, UserRole } from '../types';
import { determineUserRole } from '../data/authUsers';

interface ModalDataPenggunaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<DataPengguna, 'id'>, editId?: string) => void;
  editItem?: DataPengguna | null;
  kelasList?: MasterKelas[];
}

const KELAS_OPTIONS = [
  'Kelas 1A',
  'Kelas 1B',
  'Kelas 2A',
  'Kelas 2B',
  'Kelas 3A',
  'Kelas 3B',
  'Kelas 4A',
  'Kelas 4B',
  'Kelas 5A',
  'Kelas 5B',
  'Kelas 6A',
  'Kelas 6B',
  'Semua Kelas',
  '-',
];

const JABATAN_SUGGESTIONS = [
  'Guru Kelas 1A',
  'Guru Kelas 1B',
  'Guru Kelas 2A',
  'Guru Kelas 2B',
  'Guru Kelas 3A',
  'Guru Kelas 3B',
  'Guru Kelas 4A',
  'Guru Kelas 4B',
  'Guru Kelas 5A',
  'Guru Kelas 5B',
  'Guru Kelas 6A',
  'Guru Kelas 6B',
  'Guru Pendidikan Agama Islam (PAI)',
  'Guru PJOK & Olahraga',
  'Guru Bahasa Inggris',
  'Guru Seni Budaya & Prakarya',
  'Kepala Sekolah',
  'Wakil Kepala Urusan Kurikulum',
  'Wakil Kepala Urusan Kesiswaan',
  'Kepala Urusan Tata Usaha',
  'Bendahara BOS & Keuangan',
  'Operator Dapodik & IT',
  'Tenaga Perpustakaan',
  'Penjaga Sekolah / Kebersihan',
];

export const ModalDataPengguna: React.FC<ModalDataPenggunaProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
  kelasList = [],
}) => {
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [kelas, setKelas] = useState('Kelas 1A');
  const [jabatan, setJabatan] = useState('');

  const classOptions = kelasList.length > 0
    ? Array.from(new Set([...kelasList.map((k) => k.namaKelas), 'Semua Kelas', '-']))
    : KELAS_OPTIONS;
  const [statusKepegawaian, setStatusKepegawaian] = useState<'PNS' | 'PPPK' | 'GTT/Honorer' | 'PTY'>('PNS');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [telepon, setTelepon] = useState('');
  const [email, setEmail] = useState('');
  const [statusAktif, setStatusAktif] = useState(true);
  const [role, setRole] = useState<UserRole>('guru');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');

  useEffect(() => {
    if (editItem) {
      setNama(editItem.nama);
      setNip(editItem.nip || '');
      setKelas(editItem.kelas || '-');
      setJabatan(editItem.jabatan || '');
      setStatusKepegawaian(editItem.statusKepegawaian || 'PNS');
      setJenisKelamin(editItem.jenisKelamin || 'L');
      setTelepon(editItem.telepon || '');
      setEmail(editItem.email || '');
      setStatusAktif(editItem.statusAktif !== false);
      setRole(editItem.role || determineUserRole(editItem.jabatan || ''));
      setUsername(editItem.username || '');
      setPassword(editItem.password || '123');
    } else {
      setNama('');
      setNip('');
      setKelas('Kelas 1A');
      setJabatan('Guru Kelas 1A');
      setStatusKepegawaian('PNS');
      setJenisKelamin('L');
      setTelepon('');
      setEmail('');
      setStatusAktif(true);
      setRole('guru');
      setUsername('');
      setPassword('123');
    }
  }, [editItem, isOpen]);

  // Suggest role automatically when jabatan changes if in add mode
  const handleJabatanChange = (newJabatan: string) => {
    setJabatan(newJabatan);
    if (!editItem) {
      setRole(determineUserRole(newJabatan));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !jabatan.trim()) {
      alert('Mohon lengkapi Nama Guru dan Jabatan.');
      return;
    }

    onSave(
      {
        nama: nama.trim(),
        nip: nip.trim() || '-',
        kelas: kelas.trim() || '-',
        jabatan: jabatan.trim(),
        statusKepegawaian,
        jenisKelamin,
        telepon: telepon.trim() || '-',
        email: email.trim() || undefined,
        statusAktif,
        role,
        username: username.trim() || undefined,
        password: password.trim() || '123',
      },
      editItem?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 my-8 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#eceef0] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#86f2e4] flex items-center justify-center text-[#006f66]">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </div>
            <div>
              <h3 className="font-bold text-black text-base">
                {editItem ? 'Edit Data Guru & Pengguna' : 'Tambah Guru & Pengguna Baru'}
              </h3>
              <p className="text-xs text-[#45464d]">
                Kelola data tenaga pendidik, wali kelas, dan staf kependidikan sekolah.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#76777d] hover:text-black font-bold p-1 rounded-md cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm flex-1 overflow-y-auto pr-1">
          {/* Nama Guru */}
          <div>
            <label className="block text-xs font-bold text-[#45464d] mb-1">
              Nama Guru / Tenaga Pendidik <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="e.g. Siti Rahayu, S.Pd., M.Si."
              className="w-full border border-[#c6c6cd] rounded p-2.5 text-sm font-semibold input-focus-glow"
            />
          </div>

          {/* NIP & Jenis Kelamin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                NIP / NUPTK (Opsional)
              </label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="e.g. 19820315 200801 2 015"
                className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 pt-1.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="jenisKelamin"
                    checked={jenisKelamin === 'L'}
                    onChange={() => setJenisKelamin('L')}
                    className="text-[#006a61] focus:ring-0"
                  />
                  <span className="text-xs font-medium">Laki-laki (L)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="jenisKelamin"
                    checked={jenisKelamin === 'P'}
                    onChange={() => setJenisKelamin('P')}
                    className="text-[#006a61] focus:ring-0"
                  />
                  <span className="text-xs font-medium">Perempuan (P)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Kelas & Jabatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Kelas Diampu / Binaan <span className="text-red-500">*</span>
              </label>
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow bg-white"
              >
                {classOptions.map((k) => (
                  <option key={k} value={k}>
                    {k === '-' ? '- (Bukan Wali Kelas / Staf TU)' : k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Jabatan / Tugas Tambahan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                list="jabatan-list"
                value={jabatan}
                onChange={(e) => handleJabatanChange(e.target.value)}
                placeholder="e.g. Guru Kelas 1A / Guru PJOK"
                className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow font-medium"
              />
              <datalist id="jabatan-list">
                {JABATAN_SUGGESTIONS.map((j) => (
                  <option key={j} value={j} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Status Kepegawaian & Status Aktif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Status Kepegawaian
              </label>
              <select
                value={statusKepegawaian}
                onChange={(e) =>
                  setStatusKepegawaian(
                    e.target.value as 'PNS' | 'PPPK' | 'GTT/Honorer' | 'PTY'
                  )
                }
                className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow bg-white"
              >
                <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                <option value="PPPK">PPPK (Pegawai Pemerintah dg Perjanjian Kerja)</option>
                <option value="GTT/Honorer">GTT / Honorer Sekolah</option>
                <option value="PTY">PTY / Tenaga Yayasan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Status Keaktifan
              </label>
              <select
                value={statusAktif ? 'aktif' : 'nonaktif'}
                onChange={(e) => setStatusAktif(e.target.value === 'aktif')}
                className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow bg-white"
              >
                <option value="aktif">Aktif Bertugas</option>
                <option value="nonaktif">Cuti / Non-Aktif</option>
              </select>
            </div>
          </div>

          {/* Kontak & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                No. Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="e.g. 0812-3456-7890"
                className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Alamat Email (belajar.id / Gmail)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. nama.guru@guru.sd.belajar.id"
                className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow"
              />
            </div>
          </div>

          {/* Pengaturan Akun & Akses Login (Sinkronisasi Otomatis) */}
          <div className="bg-[#86f2e4]/15 border border-[#006a61]/25 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006a61] text-[20px]">
                  manage_accounts
                </span>
                <div>
                  <span className="text-xs font-bold text-[#006f66] block">
                    Sinkronisasi Akun Login Pengguna
                  </span>
                  <span className="text-[10px] text-[#45464d]">
                    Nama dan profil pegawai otomatis terhubung dengan akses login sistem persuratan.
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-[#006a61] text-white px-2 py-0.5 rounded-full font-bold shrink-0">
                Tersinkron Otomatis
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-[#45464d] mb-1">
                  Peran Hak Akses Login
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full border border-[#c6c6cd] rounded p-1.5 text-xs input-focus-glow bg-white font-medium text-black"
                >
                  <option value="admin">Administrator TU</option>
                  <option value="kepala_sekolah">Kepala Sekolah</option>
                  <option value="guru">Guru & Tenaga Pendidik</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#45464d] mb-1">
                  Username Login
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. guru.siti (opsional)"
                  className="w-full border border-[#c6c6cd] rounded p-1.5 text-xs input-focus-glow bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#45464d] mb-1">
                  Kata Sandi (Password)
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Default: 123"
                  className="w-full border border-[#c6c6cd] rounded p-1.5 text-xs input-focus-glow bg-white text-black"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-[#eceef0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#c6c6cd] rounded-lg text-xs font-semibold hover:bg-[#f2f4f6] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#006a61] text-white rounded-lg text-xs font-bold hover:bg-[#006a61]/90 focus-ring-teal cursor-pointer shadow-xs"
            >
              {editItem ? 'Simpan Perubahan' : 'Tambah Guru / Pengguna'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
