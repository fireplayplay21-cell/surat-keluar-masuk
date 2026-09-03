import React, { useState, useEffect } from 'react';
import {
  SuratKeluar,
  SifatSurat,
  StatusSuratKeluar,
  MasterKlasifikasi,
  SchoolProfile,
  AppUser,
  DataPengguna,
} from '../types';

interface ModalSuratKeluarProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<SuratKeluar, 'id'>, editId?: string) => void;
  editItem?: SuratKeluar | null;
  klasifikasiList: MasterKlasifikasi[];
  schoolProfile: SchoolProfile;
  nextNoUrut?: string;
  nextAgendaNumber?: string;
  currentUser?: AppUser | null;
  penggunaList?: DataPengguna[];
}

export const ModalSuratKeluar: React.FC<ModalSuratKeluarProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
  klasifikasiList,
  schoolProfile,
  nextNoUrut,
  nextAgendaNumber,
  currentUser,
  penggunaList = [],
}) => {
  const [noUrut, setNoUrut] = useState('');
  const [noSurat, setNoSurat] = useState('');
  const [tglSurat, setTglSurat] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [perihal, setPerihal] = useState('');
  const [sifat, setSifat] = useState<SifatSurat>('biasa');
  const [status, setStatus] = useState<StatusSuratKeluar>('draft');
  const [penandatangan, setPenandatangan] = useState('');
  const [pembuatSurat, setPembuatSurat] = useState('');
  const [kodeKlasifikasi, setKodeKlasifikasi] = useState('421');
  const [ringkasan, setRingkasan] = useState('');

  const isGuru = currentUser?.role === 'guru';
  const isKepsek = currentUser?.role === 'kepala_sekolah';

  useEffect(() => {
    if (editItem) {
      setNoUrut(editItem.noUrut || editItem.noAgenda || '');
      setNoSurat(editItem.noSurat);
      setTglSurat(editItem.tglSurat);
      setTujuan(editItem.tujuan);
      setPerihal(editItem.perihal);
      setSifat(editItem.sifat);
      setStatus(editItem.status);
      setPenandatangan(editItem.penandatangan);
      setPembuatSurat(
        editItem.pembuatSurat ||
          (currentUser ? `${currentUser.nama} (${currentUser.jabatan || 'Guru'})` : '')
      );
      setKodeKlasifikasi(editItem.kodeKlasifikasi || '421');
      setRingkasan(editItem.ringkasan || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setNoUrut(nextNoUrut || nextAgendaNumber || '001');
      setNoSurat(`421/049/SDN01/${new Date().getFullYear()}`);
      setTglSurat(today);
      setTujuan('');
      setPerihal('');
      setSifat('biasa');
      setStatus('draft');
      setPenandatangan(schoolProfile.kepalaSekolah);

      // Default author is currently logged in teacher / staff
      if (currentUser) {
        const roleDesc =
          currentUser.role === 'guru' && currentUser.kelas && currentUser.kelas !== '-'
            ? `Wali Kelas ${currentUser.kelas}`
            : currentUser.jabatan;
        setPembuatSurat(`${currentUser.nama} (${roleDesc})`);
      } else {
        setPembuatSurat('Budi Santoso, S.AP. (Admin TU)');
      }

      setKodeKlasifikasi('421');
      setRingkasan('');
    }
  }, [editItem, nextNoUrut, nextAgendaNumber, schoolProfile, isOpen, currentUser]);

  if (!isOpen) return null;

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const month = months[parseInt(parts[1], 10) - 1] || parts[1];
    const day = parts[2];
    return `${day} ${month} ${year}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noUrut || !noSurat || !tglSurat || !tujuan || !perihal) {
      alert('Mohon lengkapi seluruh kolom wajib.');
      return;
    }

    onSave(
      {
        noUrut,
        noAgenda: noUrut, // tetap simpan untuk kompatibilitas data lama
        noSurat,
        tglSurat,
        tglSuratFormatted: formatDateIndo(tglSurat),
        tujuan,
        perihal,
        sifat,
        status,
        penandatangan: penandatangan || schoolProfile.kepalaSekolah,
        pembuatSurat: pembuatSurat.trim() || (currentUser?.nama || 'Petugas Tata Usaha'),
        kodeKlasifikasi,
        ringkasan,
      },
      editItem?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 my-8 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#eceef0] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#86f2e4]/40 flex items-center justify-center text-[#006f66] font-bold">
              <span className="material-symbols-outlined text-[20px]">send</span>
            </div>
            <div>
              <h3 className="font-extrabold text-black text-base">
                {editItem ? 'Edit Data Surat Keluar' : 'Terbitkan / Buat Nomor Surat Keluar'}
              </h3>
              <p className="text-[11.5px] text-[#45464d]">
                {isGuru
                  ? 'Pembuatan draf nomor surat keluar oleh dewan guru / wali kelas'
                  : 'Registrasi dan pencatatan nomor agenda surat keluar sekolah'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#76777d] hover:text-black font-bold p-1.5 rounded-lg hover:bg-[#f2f4f6] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Informative Banner for Guru */}
        <div className="bg-[#86f2e4]/15 border border-[#006a61]/25 p-3 rounded-xl mb-4 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#006a61] text-[20px] shrink-0 mt-0.5">
            badge
          </span>
          <div className="text-xs">
            <p className="font-bold text-[#005049]">
              Identitas Pembuat / Penerbit Surat Resmi
            </p>
            <p className="text-[#45464d] text-[11px] mt-0.5 leading-relaxed">
              Nama guru/staf pembuat akan tercatat permanen pada lembar agenda persuratan sekolah.
              {isGuru && ' Surat yang dibuat berstatus Draft untuk disahkan oleh Kepala Sekolah.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm overflow-y-auto pr-1">
          {/* Author / Pembuat Surat (Requested Feature) */}
          <div className="bg-[#f7f9fb] p-3.5 rounded-xl border border-[#c6c6cd]/60">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#006a61] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">person_pin</span>
                Nama Guru / GTK Pembuat & Penerbit Surat <span className="text-red-500">*</span>
              </label>
              {isGuru && (
                <span className="text-[10px] bg-[#86f2e4] text-[#005049] font-black px-2 py-0.5 rounded-full">
                  Akun Anda
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={pembuatSurat}
                onChange={(e) => setPembuatSurat(e.target.value)}
                placeholder="e.g. Siti Rahayu, S.Pd., M.Si. (Wali Kelas 6A)"
                className="w-full border border-[#c6c6cd] rounded-lg p-2.5 text-xs font-bold bg-white text-black input-focus-glow"
              />
              {penggunaList.length > 0 && !isGuru && (
                <select
                  onChange={(e) => {
                    if (e.target.value) setPembuatSurat(e.target.value);
                  }}
                  defaultValue=""
                  className="border border-[#c6c6cd] rounded-lg px-2.5 py-2 text-xs bg-white text-[#45464d] cursor-pointer"
                  title="Pilih dari daftar GTK"
                >
                  <option value="" disabled>
                    Pilih Guru...
                  </option>
                  {penggunaList.map((g) => (
                    <option
                      key={g.id}
                      value={`${g.nama} (${g.kelas && g.kelas !== '-' ? `Wali Kelas ${g.kelas}` : g.jabatan})`}
                    >
                      {g.nama} ({g.kelas && g.kelas !== '-' ? g.kelas : g.jabatan})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <p className="text-[10.5px] text-[#76777d] mt-1">
              Nama ini akan ditampilkan pada buku register surat keluar dan lembar cetak surat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Nomor Urut Surat Keluar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={noUrut}
                onChange={(e) => setNoUrut(e.target.value)}
                placeholder="001"
                className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs font-bold text-[#006a61] input-focus-glow"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Nomor Surat Resmi Sekolah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={noSurat}
                onChange={(e) => setNoSurat(e.target.value)}
                placeholder="421/045/SDN01/2023"
                className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs font-bold text-[#006a61] input-focus-glow"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Tanggal Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tglSurat}
                onChange={(e) => setTglSurat(e.target.value)}
                className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs input-focus-glow"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Tujuan / Penerima <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
                placeholder="e.g. Orang Tua Siswa Kelas 6A / Puskesmas / Dinas"
                className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs input-focus-glow"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#45464d] mb-1">
              Perihal Surat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              placeholder="e.g. Pemberitahuan Kegiatan Study Tour & Field Trip Kelas 6"
              className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs input-focus-glow font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">Klasifikasi</label>
              <select
                value={kodeKlasifikasi}
                onChange={(e) => setKodeKlasifikasi(e.target.value)}
                className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs input-focus-glow"
              >
                {klasifikasiList.map((kl) => (
                  <option key={kl.id} value={kl.kode}>
                    {kl.kode} - {kl.nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">Sifat</label>
              <select
                value={sifat}
                onChange={(e) => setSifat(e.target.value as SifatSurat)}
                className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs input-focus-glow"
              >
                <option value="biasa">Biasa</option>
                <option value="penting">Penting</option>
                <option value="segera">Segera</option>
                <option value="rahasia">Rahasia</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">Status</label>
              <select
                value={status}
                disabled={isGuru}
                onChange={(e) => setStatus(e.target.value as StatusSuratKeluar)}
                className={`w-full border border-[#c6c6cd] rounded-lg p-2 text-xs input-focus-glow ${
                  isGuru ? 'bg-[#f2f4f6] text-[#45464d] cursor-not-allowed' : 'bg-white'
                }`}
              >
                <option value="draft">Draft (Menunggu Kepsek)</option>
                <option value="disetujui">Disetujui Kepsek</option>
                <option value="terkirim">Terkirim</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#45464d] mb-1">
              Penandatangan Resmi
            </label>
            <input
              type="text"
              value={penandatangan}
              onChange={(e) => setPenandatangan(e.target.value)}
              placeholder="e.g. Drs. H. Mulyadi, M.Pd."
              className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs input-focus-glow"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#45464d] mb-1">
              Ringkasan / Catatan Isi Surat
            </label>
            <textarea
              value={ringkasan}
              onChange={(e) => setRingkasan(e.target.value)}
              rows={2}
              placeholder="Uraian ringkas tujuan diterbitkannya surat atau tembusan terkait..."
              className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs input-focus-glow"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#eceef0]">
            <span className="text-[11px] text-[#76777d]">
              {isGuru ? '✍️ Surat tersimpan atas nama Anda' : 'SDN 01 Harapan'}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#c6c6cd] rounded-lg text-xs font-semibold hover:bg-[#f2f4f6] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#006a61] text-white rounded-lg text-xs font-bold hover:bg-[#006a61]/90 focus-ring-teal shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>{editItem ? 'Simpan Perubahan' : 'Terbitkan Surat Keluar'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

