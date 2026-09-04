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

export const SATUAN_KERJA = 'UPTD SDN-MAWAS/MMJ';

export const BULAN_ROMAWI_OPTIONS = [
  { value: '1', roman: 'I', name: 'Januari' },
  { value: '2', roman: 'II', name: 'Februari' },
  { value: '3', roman: 'III', name: 'Maret' },
  { value: '4', roman: 'IV', name: 'April' },
  { value: '5', roman: 'V', name: 'Mei' },
  { value: '6', roman: 'VI', name: 'Juni' },
  { value: '7', roman: 'VII', name: 'Juli' },
  { value: '8', roman: 'VIII', name: 'Agustus' },
  { value: '9', roman: 'IX', name: 'September' },
  { value: '10', roman: 'X', name: 'Oktober' },
  { value: '11', roman: 'XI', name: 'November' },
  { value: '12', roman: 'XII', name: 'Desember' },
];

export const TAHUN_OPTIONS = [
  '2023',
  '2024',
  '2025',
  '2026',
  '2027',
  '2028',
  '2029',
  '2030',
];

export const getRomanFromMonth = (monthNum: number): string => {
  const found = BULAN_ROMAWI_OPTIONS.find((m) => parseInt(m.value, 10) === monthNum);
  return found ? found.roman : 'IX';
};

export const composeNomorSurat = (
  kode: string,
  urut: string,
  bulanRomawi: string,
  tahun: string
): string => {
  const cKode = (kode || '421').trim();
  const cUrut = (urut || '163').trim();
  const cBulan = (bulanRomawi || 'IX').trim();
  const cTahun = (tahun || '2026').trim();
  return `${cKode}/${cUrut}/${SATUAN_KERJA}/${cBulan}/${cTahun}`;
};

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
  const [noUrut, setNoUrut] = useState('163');
  const [kodeKlasifikasi, setKodeKlasifikasi] = useState('421');
  const [bulanRomawi, setBulanRomawi] = useState('IX');
  const [tahun, setTahun] = useState('2026');
  const [noSurat, setNoSurat] = useState('421/163/UPTD SDN-MAWAS/MMJ/IX/2026');
  const [tglSurat, setTglSurat] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [perihal, setPerihal] = useState('');
  const [sifat, setSifat] = useState<SifatSurat>('biasa');
  const [status, setStatus] = useState<StatusSuratKeluar>('draft');
  const [penandatangan, setPenandatangan] = useState('');
  const [pembuatSurat, setPembuatSurat] = useState('');
  const [ringkasan, setRingkasan] = useState('');

  const isGuru = currentUser?.role === 'guru';

  useEffect(() => {
    if (!isOpen) return;

    if (editItem) {
      const urutVal = editItem.noUrut || editItem.noAgenda || '163';
      setNoUrut(urutVal);
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
      setRingkasan(editItem.ringkasan || '');

      // Parse standard pattern: {kode}/{urut}/UPTD SDN-MAWAS/MMJ/{bulan}/{tahun}
      const matchStd = editItem.noSurat.match(/^([^/]+)\/([^/]+)\/UPTD SDN-MAWAS\/MMJ\/([^/]+)\/(\d{4})$/i);
      if (matchStd) {
        setKodeKlasifikasi(matchStd[1]);
        setNoUrut(matchStd[2]);
        setBulanRomawi(matchStd[3].toUpperCase());
        setTahun(matchStd[4]);
      } else {
        // Parse older pattern or derive from tglSurat
        const matchOld = editItem.noSurat.match(/^([^/]+)\/([^/]+)\/([^/]+)\/(\d{4})$/);
        if (matchOld) {
          setKodeKlasifikasi(matchOld[1]);
          setNoUrut(matchOld[2]);
          setTahun(matchOld[4]);
        } else {
          setKodeKlasifikasi(editItem.kodeKlasifikasi || '421');
        }

        if (editItem.tglSurat) {
          const parts = editItem.tglSurat.split('-');
          if (parts.length === 3) {
            setBulanRomawi(getRomanFromMonth(parseInt(parts[1], 10)));
            setTahun(parts[0]);
          }
        }
      }
    } else {
      // NEW LETTER
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentYearStr = String(now.getFullYear());
      const currentMonthNum = now.getMonth() + 1;
      const currentRoman = getRomanFromMonth(currentMonthNum);

      // Prioritize '421' if available, otherwise first item in list or '421'
      const defaultKode =
        klasifikasiList.find((k) => k.kode === '421')?.kode ||
        (klasifikasiList.length > 0 ? klasifikasiList[0].kode : '421');

      const autoUrut = nextNoUrut || nextAgendaNumber || '163';
      const autoBulan = currentRoman || 'IX';
      const autoTahun = currentYearStr || '2026';

      setKodeKlasifikasi(defaultKode);
      setNoUrut(autoUrut);
      setBulanRomawi(autoBulan);
      setTahun(autoTahun);

      const generated = composeNomorSurat(defaultKode, autoUrut, autoBulan, autoTahun);
      setNoSurat(generated);

      setTglSurat(todayStr);
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

      setRingkasan('');
    }
  }, [editItem, nextNoUrut, nextAgendaNumber, schoolProfile, isOpen, currentUser, klasifikasiList]);

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

  // Handlers for responsive synchronous number generator
  const handleKlasifikasiChange = (newKode: string) => {
    setKodeKlasifikasi(newKode);
    setNoSurat(composeNomorSurat(newKode, noUrut, bulanRomawi, tahun));
  };

  const handleNoUrutChange = (newUrut: string) => {
    setNoUrut(newUrut);
    setNoSurat(composeNomorSurat(kodeKlasifikasi, newUrut, bulanRomawi, tahun));
  };

  const handleBulanChange = (newBulan: string) => {
    setBulanRomawi(newBulan);
    setNoSurat(composeNomorSurat(kodeKlasifikasi, noUrut, newBulan, tahun));
  };

  const handleTahunChange = (newTahun: string) => {
    setTahun(newTahun);
    setNoSurat(composeNomorSurat(kodeKlasifikasi, noUrut, bulanRomawi, newTahun));
  };

  const handleTglSuratChange = (dateVal: string) => {
    setTglSurat(dateVal);
    if (dateVal) {
      const parts = dateVal.split('-');
      if (parts.length === 3) {
        const y = parts[0];
        const m = parseInt(parts[1], 10);
        const rom = getRomanFromMonth(m);
        setBulanRomawi(rom);
        setTahun(y);
        setNoSurat(composeNomorSurat(kodeKlasifikasi, noUrut, rom, y));
      }
    }
  };

  const handleResetToStandard = () => {
    const auto = composeNomorSurat(kodeKlasifikasi, noUrut, bulanRomawi, tahun);
    setNoSurat(auto);
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
        noAgenda: noUrut, // simpan untuk kompatibilitas agenda
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
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 my-8 max-h-[95vh] flex flex-col">
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
          {/* Author / Pembuat Surat */}
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

          {/* GENERATOR FORMAT PENOMORAN SURAT RESMI */}
          <div className="bg-[#f0fdfa] border border-[#006a61]/30 rounded-2xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#006a61]/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#006a61] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[17px]">numbers</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#005049] uppercase tracking-wider">
                    Format Penomoran Surat Resmi Sekolah
                  </h4>
                  <p className="text-[11px] text-[#45464d]">
                    Standar: <span className="font-semibold text-[#006a61]">[Klasifikasi]/[No.Urut]/UPTD SDN-MAWAS/MMJ/[Bulan]/[Tahun]</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetToStandard}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006a61] hover:text-[#005049] bg-white px-3 py-1 rounded-lg border border-[#006a61]/30 hover:bg-[#e6fbf8] shadow-2xs cursor-pointer transition-colors"
                title="Terapkan ulang rumus format standar"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
                Format Ulang Otomatis
              </button>
            </div>

            {/* LIVE PREVIEW HASIL NOMOR SURAT */}
            <div className="bg-white border-2 border-[#006a61] rounded-xl p-3.5 mb-3.5 shadow-xs">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-bold text-[#45464d] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#006a61] text-[15px]">check_circle</span>
                  Hasil Penomoran Surat Keluar Resmi:
                </span>
                <span className="text-[10px] bg-[#86f2e4] text-[#005049] font-black px-2 py-0.5 rounded-full">
                  Otomatis Terintegrasi
                </span>
              </div>
              <input
                type="text"
                required
                value={noSurat}
                onChange={(e) => setNoSurat(e.target.value)}
                placeholder="421/163/UPTD SDN-MAWAS/MMJ/IX/2026"
                className="w-full font-mono font-black text-sm sm:text-base text-[#006a61] bg-transparent border-none outline-none p-0 focus:ring-0 select-all"
                title="Nomor Surat Keluar Resmi (dihasilkan otomatis dari 5 segmen di bawah atau edit manual jika diperlukan)"
              />
              <p className="text-[10.5px] text-[#76777d] mt-1 italic">
                * Contoh format hasil: 421/163/UPTD SDN-MAWAS/MMJ/IX/2026
              </p>
            </div>

            {/* 5 ELEMEN PEMBENTUK NOMOR SURAT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* 1. Klasifikasi Surat */}
              <div className="lg:col-span-1">
                <label className="block text-[11px] font-bold text-[#005049] mb-1 flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-[#006a61] text-white text-[9px] flex items-center justify-center font-bold">1</span>
                  Kode Klasifikasi <span className="text-red-500">*</span>
                </label>
                <select
                  value={kodeKlasifikasi}
                  onChange={(e) => handleKlasifikasiChange(e.target.value)}
                  className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs bg-white font-bold text-black input-focus-glow cursor-pointer"
                  title="Sesuaikan dengan database klasifikasi surat"
                >
                  {klasifikasiList.map((kl) => (
                    <option key={kl.id} value={kl.kode}>
                      {kl.kode} - {kl.nama}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-[#76777d] block mt-0.5">Database Klasifikasi</span>
              </div>

              {/* 2. Nomor Urut Surat */}
              <div>
                <label className="block text-[11px] font-bold text-[#005049] mb-1 flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-[#006a61] text-white text-[9px] flex items-center justify-center font-bold">2</span>
                  Nomor Urut <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={noUrut}
                  onChange={(e) => handleNoUrutChange(e.target.value)}
                  placeholder="163"
                  className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs font-bold text-[#006a61] bg-white input-focus-glow text-center"
                  title="Ambil di nomor urut surat secara otomatis"
                />
                <span className="text-[10px] text-[#76777d] block mt-0.5 text-center">Urutan Otomatis</span>
              </div>

              {/* 3. Satuan Kerja (Baku / Tetap) */}
              <div>
                <label className="block text-[11px] font-bold text-[#005049] mb-1 flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-[#006a61] text-white text-[9px] flex items-center justify-center font-bold">3</span>
                  Satuan Kerja
                </label>
                <input
                  type="text"
                  readOnly
                  value={SATUAN_KERJA}
                  className="w-full border border-[#c6c6cd] rounded-lg p-2 text-[11px] font-bold text-[#45464d] bg-[#f2f4f6] text-center select-none cursor-not-allowed"
                  title="Tetap seperti ini: UPTD SDN-MAWAS/MMJ"
                />
                <span className="text-[10px] text-[#76777d] block mt-0.5 text-center">Tetap (Baku)</span>
              </div>

              {/* 4. Dropdown Bulan (Romawi) */}
              <div>
                <label className="block text-[11px] font-bold text-[#005049] mb-1 flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-[#006a61] text-white text-[9px] flex items-center justify-center font-bold">4</span>
                  Bulan (Romawi) <span className="text-red-500">*</span>
                </label>
                <select
                  value={bulanRomawi}
                  onChange={(e) => handleBulanChange(e.target.value)}
                  className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs bg-white font-bold text-[#006a61] input-focus-glow cursor-pointer"
                  title="Sesuaikan dropdown bulan"
                >
                  {BULAN_ROMAWI_OPTIONS.map((b) => (
                    <option key={b.value} value={b.roman}>
                      {b.roman} - {b.name}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-[#76777d] block mt-0.5">Dropdown Bulan</span>
              </div>

              {/* 5. Dropdown Tahun */}
              <div>
                <label className="block text-[11px] font-bold text-[#005049] mb-1 flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-[#006a61] text-white text-[9px] flex items-center justify-center font-bold">5</span>
                  Tahun Surat <span className="text-red-500">*</span>
                </label>
                <select
                  value={tahun}
                  onChange={(e) => handleTahunChange(e.target.value)}
                  className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs bg-white font-bold text-[#006a61] input-focus-glow cursor-pointer text-center"
                  title="Sediakan dropdown tahun"
                >
                  {TAHUN_OPTIONS.map((th) => (
                    <option key={th} value={th}>
                      {th}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-[#76777d] block mt-0.5 text-center">Dropdown Tahun</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Tanggal Surat Keluar <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tglSurat}
                onChange={(e) => handleTglSuratChange(e.target.value)}
                className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs input-focus-glow"
              />
              <span className="text-[10.5px] text-[#76777d] block mt-0.5">
                Memilih tanggal akan menyelaraskan bulan & tahun otomatis
              </span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">Sifat Surat</label>
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
              <label className="block text-xs font-bold text-[#45464d] mb-1">Status Verifikasi & Registrasi</label>
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
              placeholder="e.g. Ampena, S., S.Pd"
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
              {isGuru ? '✍️ Surat tersimpan atas nama Anda' : (schoolProfile.namaSekolah || 'UPTD SPF SDN Mawas')}
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


