import React, { useState, useMemo } from 'react';
import { KelasDiampu, MasterKelas, DataPengguna, SchoolProfile } from '../types';
import { ResponsiveTableWrapper } from './ResponsiveTableWrapper';

interface KelasDiampuTabProps {
  kelasDiampuList: KelasDiampu[];
  kelasList: MasterKelas[];
  guruList: DataPengguna[];
  schoolProfile?: SchoolProfile;
  onAddKelasDiampu?: (item: Omit<KelasDiampu, 'id'>) => void;
  onUpdateKelasDiampu?: (id: string, item: Partial<KelasDiampu>) => void;
  onDeleteKelasDiampu?: (id: string) => void;
}

export const KelasDiampuTab: React.FC<KelasDiampuTabProps> = ({
  kelasDiampuList = [],
  kelasList = [],
  guruList = [],
  schoolProfile,
  onAddKelasDiampu,
  onUpdateKelasDiampu,
  onDeleteKelasDiampu,
}) => {
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTingkat, setFilterTingkat] = useState<number | 'semua'>('semua');
  const [filterGuru, setFilterGuru] = useState<string>('semua');
  const [filterMapel, setFilterMapel] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<string>('semua');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Form states
  const [formGuruId, setFormGuruId] = useState('');
  const [formNamaGuru, setFormNamaGuru] = useState('');
  const [formNipGuru, setFormNipGuru] = useState('');
  const [formMataPelajaran, setFormMataPelajaran] = useState('Tematik (Guru Kelas)');
  const [formKelasId, setFormKelasId] = useState('');
  const [formNamaKelas, setFormNamaKelas] = useState('Kelas 1A');
  const [formTingkat, setFormTingkat] = useState<number>(1);
  const [formTahunAjaran, setFormTahunAjaran] = useState('2023/2024');
  const [formSemester, setFormSemester] = useState<'Ganjil' | 'Genap' | 'Ganjil & Genap'>('Ganjil & Genap');
  const [formJumlahJam, setFormJumlahJam] = useState<number>(24);
  const [formHariJadwal, setFormHariJadwal] = useState('Senin - Kamis (07:15 - 12:15)');
  const [formRuangan, setFormRuangan] = useState('Ruang 101');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [formKeterangan, setFormKeterangan] = useState('');

  // Extract unique mapel list
  const uniqueMapels = useMemo(() => {
    const set = new Set<string>();
    kelasDiampuList.forEach((kd) => {
      if (kd.mataPelajaran) set.add(kd.mataPelajaran);
    });
    return Array.from(set).sort();
  }, [kelasDiampuList]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalPenugasan = kelasDiampuList.length;
    const totalJam = kelasDiampuList.reduce((acc, curr) => acc + (Number(curr.jumlahJamPerMinggu) || 0), 0);
    const guruSet = new Set<string>();
    kelasDiampuList.forEach((kd) => {
      if (kd.namaGuru) guruSet.add(kd.namaGuru);
    });
    const totalGuru = guruSet.size;
    const avgJam = totalGuru > 0 ? (totalJam / totalGuru).toFixed(1) : '0';

    return {
      totalPenugasan,
      totalJam,
      totalGuru,
      avgJam,
    };
  }, [kelasDiampuList]);

  // Filtered list
  const filteredList = useMemo(() => {
    return kelasDiampuList.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        item.namaGuru.toLowerCase().includes(q) ||
        item.mataPelajaran.toLowerCase().includes(q) ||
        item.namaKelas.toLowerCase().includes(q) ||
        (item.nipGuru && item.nipGuru.includes(q)) ||
        (item.ruangan && item.ruangan.toLowerCase().includes(q));

      const matchTingkat = filterTingkat === 'semua' || item.tingkat === filterTingkat;
      const matchGuru = filterGuru === 'semua' || item.namaGuru === filterGuru;
      const matchMapel = filterMapel === 'semua' || item.mataPelajaran === filterMapel;
      const matchStatus = filterStatus === 'semua' || item.status === filterStatus;

      return matchSearch && matchTingkat && matchGuru && matchMapel && matchStatus;
    });
  }, [kelasDiampuList, searchTerm, filterTingkat, filterGuru, filterMapel, filterStatus]);

  // Handle open add modal
  const handleOpenAdd = () => {
    setEditingId(null);
    if (guruList.length > 0) {
      const firstGuru = guruList[0];
      setFormGuruId(firstGuru.id);
      setFormNamaGuru(firstGuru.nama);
      setFormNipGuru(firstGuru.nip || '-');
      setFormMataPelajaran(firstGuru.mataPelajaranUtama || 'Tematik (Guru Kelas)');
      setFormJumlahJam(firstGuru.totalJamMengajar || 24);
    } else {
      setFormGuruId('');
      setFormNamaGuru('');
      setFormNipGuru('');
      setFormMataPelajaran('Tematik (Guru Kelas)');
      setFormJumlahJam(24);
    }

    if (kelasList.length > 0) {
      const firstKelas = kelasList[0];
      setFormKelasId(firstKelas.id);
      setFormNamaKelas(firstKelas.namaKelas);
      setFormTingkat(firstKelas.tingkat);
      setFormRuangan(firstKelas.ruangan || 'Ruang Kelas');
    } else {
      setFormKelasId('');
      setFormNamaKelas('Kelas 1A');
      setFormTingkat(1);
      setFormRuangan('Ruang Kelas');
    }

    setFormTahunAjaran('2023/2024');
    setFormSemester('Ganjil & Genap');
    setFormHariJadwal('Senin - Kamis (07:15 - 12:15)');
    setFormStatus('Aktif');
    setFormKeterangan('');
    setShowModal(true);
  };

  // Handle open edit modal
  const handleEdit = (item: KelasDiampu) => {
    setEditingId(item.id);
    setFormGuruId(item.guruId || '');
    setFormNamaGuru(item.namaGuru);
    setFormNipGuru(item.nipGuru || '');
    setFormMataPelajaran(item.mataPelajaran);
    setFormKelasId(item.kelasId || '');
    setFormNamaKelas(item.namaKelas);
    setFormTingkat(item.tingkat || 1);
    setFormTahunAjaran(item.tahunAjaran);
    setFormSemester((item.semester as any) || 'Ganjil & Genap');
    setFormJumlahJam(item.jumlahJamPerMinggu);
    setFormHariJadwal(item.hariJadwal || '');
    setFormRuangan(item.ruangan || '');
    setFormStatus(item.status);
    setFormKeterangan(item.keterangan || '');
    setShowModal(true);
  };

  // Handle change selected Guru
  const handleSelectGuru = (nama: string) => {
    const found = guruList.find((g) => g.nama === nama);
    if (found) {
      setFormGuruId(found.id);
      setFormNamaGuru(found.nama);
      setFormNipGuru(found.nip || '-');
      if (found.mataPelajaranUtama) {
        setFormMataPelajaran(found.mataPelajaranUtama);
      }
      if (found.totalJamMengajar) {
        setFormJumlahJam(found.totalJamMengajar);
      }
    } else {
      setFormNamaGuru(nama);
    }
  };

  // Handle change selected Kelas
  const handleSelectKelas = (namaKelasVal: string) => {
    const found = kelasList.find((k) => k.namaKelas === namaKelasVal);
    if (found) {
      setFormKelasId(found.id);
      setFormNamaKelas(found.namaKelas);
      setFormTingkat(found.tingkat);
      if (found.ruangan) {
        setFormRuangan(found.ruangan);
      }
    } else {
      setFormNamaKelas(namaKelasVal);
    }
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaGuru.trim() || !formNamaKelas.trim() || !formMataPelajaran.trim()) {
      alert('Mohon lengkapi Nama Guru, Mata Pelajaran, dan Kelas yang diampu.');
      return;
    }

    const payload: Omit<KelasDiampu, 'id'> = {
      guruId: formGuruId || undefined,
      namaGuru: formNamaGuru.trim(),
      nipGuru: formNipGuru.trim() || '-',
      mataPelajaran: formMataPelajaran.trim(),
      kelasId: formKelasId || undefined,
      namaKelas: formNamaKelas.trim(),
      tingkat: Number(formTingkat) || 1,
      tahunAjaran: formTahunAjaran.trim() || '2023/2024',
      semester: formSemester,
      jumlahJamPerMinggu: Number(formJumlahJam) || 0,
      hariJadwal: formHariJadwal.trim() || undefined,
      ruangan: formRuangan.trim() || undefined,
      status: formStatus,
      keterangan: formKeterangan.trim() || undefined,
    };

    if (editingId) {
      onUpdateKelasDiampu?.(editingId, payload);
    } else {
      onAddKelasDiampu?.(payload);
    }

    setShowModal(false);
    setEditingId(null);
  };

  // Helper badge for Mata Pelajaran
  const getMapelBadge = (mapel: string) => {
    const m = mapel.toLowerCase();
    if (m.includes('tematik') || m.includes('guru kelas')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (m.includes('pai') || m.includes('agama')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    if (m.includes('pjok') || m.includes('olahraga')) {
      return 'bg-cyan-50 text-cyan-800 border-cyan-200';
    }
    if (m.includes('inggris')) {
      return 'bg-purple-50 text-purple-800 border-purple-200';
    }
    if (m.includes('matematika') || m.includes('ipas')) {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    }
    return 'bg-gray-50 text-gray-800 border-gray-200';
  };

  // Helper avatar initials
  const getInitials = (name: string) => {
    return name
      .replace(/^(Drs\.|Dr\.|H\.|Hj\.|Ustadz)\s+/gi, '')
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#c6c6cd]/60 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-[#86f2e4]/30 text-[#006a61] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">assignment_ind</span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#45464d] uppercase tracking-wide">
              Total Penugasan
            </div>
            <div className="text-xl font-extrabold text-black">
              {stats.totalPenugasan} <span className="text-xs font-medium text-[#76777d]">tugas</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#c6c6cd]/60 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200/50">
            <span className="material-symbols-outlined text-2xl">schedule</span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#45464d] uppercase tracking-wide">
              Beban Jam Mengajar
            </div>
            <div className="text-xl font-extrabold text-black">
              {stats.totalJam} <span className="text-xs font-medium text-[#76777d]">JP/minggu</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#c6c6cd]/60 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/50">
            <span className="material-symbols-outlined text-2xl">group</span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#45464d] uppercase tracking-wide">
              Guru Pengampu
            </div>
            <div className="text-xl font-extrabold text-black">
              {stats.totalGuru} <span className="text-xs font-medium text-[#76777d]">guru aktif</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#c6c6cd]/60 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200/50">
            <span className="material-symbols-outlined text-2xl">avg_pace</span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#45464d] uppercase tracking-wide">
              Rerata Beban JP
            </div>
            <div className="text-xl font-extrabold text-black">
              {stats.avgJam} <span className="text-xs font-medium text-[#76777d]">JP / guru</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTER & ACTION BAR */}
      <div className="bg-white border border-[#c6c6cd]/60 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari guru pengampu, NIP, mapel, kelas, atau ruangan..."
            className="w-full pl-9 pr-3 py-2 border border-[#c6c6cd] rounded-lg text-xs input-focus-glow"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Tingkat */}
          <select
            value={filterTingkat}
            onChange={(e) => setFilterTingkat(e.target.value === 'semua' ? 'semua' : Number(e.target.value))}
            className="border border-[#c6c6cd] rounded-lg px-2.5 py-2 text-xs bg-white text-[#45464d] focus-ring-teal cursor-pointer"
          >
            <option value="semua">Semua Tingkat</option>
            <option value={1}>Kelas 1</option>
            <option value={2}>Kelas 2</option>
            <option value={3}>Kelas 3</option>
            <option value={4}>Kelas 4</option>
            <option value={5}>Kelas 5</option>
            <option value={6}>Kelas 6</option>
          </select>

          {/* Filter Mata Pelajaran */}
          <select
            value={filterMapel}
            onChange={(e) => setFilterMapel(e.target.value)}
            className="border border-[#c6c6cd] rounded-lg px-2.5 py-2 text-xs bg-white text-[#45464d] focus-ring-teal cursor-pointer max-w-[140px] truncate"
          >
            <option value="semua">Semua Mapel</option>
            {uniqueMapels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-[#c6c6cd] rounded-lg px-2.5 py-2 text-xs bg-white text-[#45464d] focus-ring-teal cursor-pointer"
          >
            <option value="semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>

          {/* Print SK Button */}
          <button
            id="btn-print-sk-mengajar"
            onClick={() => setShowPrintModal(true)}
            className="px-3 py-2 border border-[#006a61] text-[#006a61] bg-[#86f2e4]/20 hover:bg-[#86f2e4]/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            title="Cetak Rekapitulasi Pembagian Tugas Mengajar"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            Cetak SK Tugas
          </button>

          {/* Add Button */}
          <button
            id="btn-tambah-penugasan"
            onClick={handleOpenAdd}
            className="bg-[#006a61] text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[#006a61]/90 flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Tambah Penugasan
          </button>
        </div>
      </div>

      {/* 3. MAIN TABLE DATA */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl shadow-xs overflow-hidden">
        <ResponsiveTableWrapper id="table-kelas-diampu-wrapper" minWidth="min-w-[1000px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f2f4f6] border-b border-[#c6c6cd]">
              <tr>
                <th className="py-3.5 px-4 text-xs font-bold text-[#45464d] uppercase text-center w-12">No</th>
                <th className="py-3.5 px-4 text-xs font-bold text-[#45464d] uppercase">Guru Pengampu</th>
                <th className="py-3.5 px-4 text-xs font-bold text-[#45464d] uppercase">Mata Pelajaran</th>
                <th className="py-3.5 px-4 text-xs font-bold text-[#45464d] uppercase text-center">Kelas / Rombel</th>
                <th className="py-3.5 px-4 text-xs font-bold text-[#45464d] uppercase text-center">Beban Jam</th>
                <th className="py-3.5 px-4 text-xs font-bold text-[#45464d] uppercase">Jadwal & Ruangan</th>
                <th className="py-3.5 px-4 text-xs font-bold text-[#45464d] uppercase text-center">Tahun / Smt</th>
                <th className="py-3.5 px-4 text-xs font-bold text-[#45464d] uppercase text-center w-24">Status</th>
                <th className="py-3.5 px-4 text-xs font-bold text-[#45464d] uppercase text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c6c6cd]/40 text-sm">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#76777d]">
                    <div className="flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-[#c6c6cd] mb-2">
                        auto_stories
                      </span>
                      <p className="font-semibold text-black">
                        Tidak ada data penugasan kelas yang diampu ditemukan.
                      </p>
                      <p className="text-xs text-[#76777d] mt-1">
                        Coba sesuaikan kata kunci pencarian atau klik &quot;Tambah Penugasan&quot;.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[#f7f9fb] transition-colors">
                    {/* No */}
                    <td className="py-3.5 px-4 text-center font-medium text-[#76777d] text-xs">
                      {idx + 1}
                    </td>

                    {/* Guru */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#86f2e4]/40 text-[#006f66] font-bold text-xs flex items-center justify-center shrink-0 border border-[#006a61]/20">
                          {getInitials(item.namaGuru)}
                        </div>
                        <div>
                          <div className="font-bold text-black text-xs sm:text-sm">
                            {item.namaGuru}
                          </div>
                          <div className="text-[11px] text-[#76777d] font-mono">
                            NIP: {item.nipGuru || '-'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Mata Pelajaran */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${getMapelBadge(
                          item.mataPelajaran
                        )}`}
                      >
                        <span className="material-symbols-outlined text-[14px]">book</span>
                        {item.mataPelajaran}
                      </span>
                    </td>

                    {/* Kelas */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#006a61] text-white shadow-xs">
                        <span className="material-symbols-outlined text-[13px]">door_front</span>
                        {item.namaKelas}
                      </span>
                      <div className="text-[10px] text-[#76777d] mt-0.5 font-medium">
                        Tingkat {item.tingkat}
                      </div>
                    </td>

                    {/* Beban Jam */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 font-extrabold text-[#006f66] bg-[#86f2e4]/30 px-2.5 py-0.5 rounded-full text-xs border border-[#006a61]/20">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        {item.jumlahJamPerMinggu} JP
                      </div>
                      <div className="text-[10px] text-[#76777d] mt-0.5 font-medium">per minggu</div>
                    </td>

                    {/* Jadwal & Ruangan */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-black flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-teal-700">calendar_today</span>
                        {item.hariJadwal || 'Sesuai Jadwal Rombel'}
                      </div>
                      <div className="text-[11px] text-[#76777d] flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px] text-gray-500">meeting_room</span>
                        {item.ruangan || 'Ruang Kelas'}
                      </div>
                    </td>

                    {/* Tahun / Semester */}
                    <td className="py-3.5 px-4 text-center text-xs">
                      <div className="font-semibold text-black">{item.tahunAjaran}</div>
                      <div className="text-[10.5px] text-[#76777d]">{item.semester || 'Ganjil'}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'Aktif' ? 'bg-emerald-600' : 'bg-gray-400'
                          }`}
                        />
                        {item.status}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          id={`btn-edit-diampu-${item.id}`}
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-[#006a61] hover:bg-[#86f2e4]/30 rounded transition-colors cursor-pointer"
                          title="Edit Penugasan"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          id={`btn-delete-diampu-${item.id}`}
                          onClick={() => {
                            if (
                              confirm(
                                `Hapus penugasan mengajar ${item.namaGuru} di ${item.namaKelas} (${item.mataPelajaran})?`
                              )
                            ) {
                              onDeleteKelasDiampu?.(item.id);
                            }
                          }}
                          className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded transition-colors cursor-pointer"
                          title="Hapus Penugasan"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ResponsiveTableWrapper>
      </div>

      {/* 4. MODAL TAMBAH / EDIT KELAS DIAMPU */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-[#c6c6cd] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-[#eceef0] flex justify-between items-center bg-[#f7f9fb]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006a61] text-xl">assignment_ind</span>
                <h3 className="font-bold text-sm text-black">
                  {editingId ? 'Edit Penugasan Kelas yang Diampu' : 'Tambah Penugasan Kelas yang Diampu'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-black text-sm p-1 rounded hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
              {/* Guru Pengampu */}
              <div>
                <label className="block text-xs font-bold text-[#45464d] mb-1">
                  Pilih Guru Pengampu <span className="text-red-500">*</span>
                </label>
                {guruList.length > 0 && (
                  <select
                    value={formNamaGuru}
                    onChange={(e) => handleSelectGuru(e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded p-2 text-xs bg-white text-black font-semibold mb-1.5 focus-ring-teal"
                  >
                    <option value="" disabled>-- Pilih GTK / Guru dari Database --</option>
                    {guruList.map((g) => (
                      <option key={g.id} value={g.nama}>
                        {g.nama} {g.nip && g.nip !== '-' ? `(NIP: ${g.nip})` : ''} - {g.jabatan}
                      </option>
                    ))}
                  </select>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={formNamaGuru}
                    onChange={(e) => setFormNamaGuru(e.target.value)}
                    placeholder="Nama Lengkap & Gelar..."
                    className="w-full border border-[#c6c6cd] rounded p-2 text-xs input-focus-glow font-medium"
                  />
                  <input
                    type="text"
                    value={formNipGuru}
                    onChange={(e) => setFormNipGuru(e.target.value)}
                    placeholder="NIP / NUPTK..."
                    className="w-full border border-[#c6c6cd] rounded p-2 text-xs input-focus-glow font-mono"
                  />
                </div>
              </div>

              {/* Kelas & Tingkat */}
              <div>
                <label className="block text-xs font-bold text-[#45464d] mb-1">
                  Kelas / Rombel yang Diampu <span className="text-red-500">*</span>
                </label>
                {kelasList.length > 0 && (
                  <select
                    value={formNamaKelas}
                    onChange={(e) => handleSelectKelas(e.target.value)}
                    className="w-full border border-[#c6c6cd] rounded p-2 text-xs bg-white text-black font-semibold mb-1.5 focus-ring-teal"
                  >
                    <option value="" disabled>-- Pilih dari Master Kelas --</option>
                    {kelasList.map((k) => (
                      <option key={k.id} value={k.namaKelas}>
                        {k.namaKelas} (Tingkat {k.tingkat}) - {k.ruangan}
                      </option>
                    ))}
                  </select>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      required
                      value={formNamaKelas}
                      onChange={(e) => setFormNamaKelas(e.target.value)}
                      placeholder="contoh: Kelas 1A"
                      className="w-full border border-[#c6c6cd] rounded p-2 text-xs input-focus-glow font-bold"
                    />
                  </div>
                  <div>
                    <select
                      value={formTingkat}
                      onChange={(e) => setFormTingkat(Number(e.target.value))}
                      className="w-full border border-[#c6c6cd] rounded p-2 text-xs bg-white focus-ring-teal"
                    >
                      <option value={1}>Tingkat 1</option>
                      <option value={2}>Tingkat 2</option>
                      <option value={3}>Tingkat 3</option>
                      <option value={4}>Tingkat 4</option>
                      <option value={5}>Tingkat 5</option>
                      <option value={6}>Tingkat 6</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Mata Pelajaran */}
              <div>
                <label className="block text-xs font-bold text-[#45464d] mb-1">
                  Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formMataPelajaran}
                  onChange={(e) => setFormMataPelajaran(e.target.value)}
                  placeholder="contoh: Tematik (Guru Kelas), PJOK, PAI..."
                  className="w-full border border-[#c6c6cd] rounded p-2 text-xs input-focus-glow font-bold mb-1.5"
                />
                <div className="flex flex-wrap gap-1">
                  {[
                    'Tematik (Guru Kelas)',
                    'Pendidikan Agama Islam',
                    'PJOK',
                    'Bahasa Inggris',
                    'Matematika',
                    'IPAS',
                    'Pendidikan Pancasila',
                  ].map((mp) => (
                    <button
                      type="button"
                      key={mp}
                      onClick={() => setFormMataPelajaran(mp)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        formMataPelajaran === mp
                          ? 'bg-[#006a61] text-white border-[#006a61]'
                          : 'bg-[#f2f4f6] text-[#45464d] border-[#c6c6cd] hover:bg-gray-200'
                      }`}
                    >
                      {mp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Beban Jam Pelajaran (JP) & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">
                    Beban Jam (JP / Minggu) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={48}
                    required
                    value={formJumlahJam}
                    onChange={(e) => setFormJumlahJam(Number(e.target.value))}
                    className="w-full border border-[#c6c6cd] rounded p-2 text-xs input-focus-glow font-bold"
                  />
                  <div className="flex gap-1 mt-1">
                    {[24, 18, 12, 4, 3].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setFormJumlahJam(val)}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          formJumlahJam === val
                            ? 'bg-teal-700 text-white border-teal-700'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {val} JP
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">
                    Status Penugasan
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full border border-[#c6c6cd] rounded p-2 text-xs bg-white focus-ring-teal font-semibold"
                  >
                    <option value="Aktif">Aktif Mengajar</option>
                    <option value="Nonaktif">Nonaktif / Cuti</option>
                  </select>
                </div>
              </div>

              {/* Tahun Ajaran & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">
                    Tahun Ajaran
                  </label>
                  <input
                    type="text"
                    value={formTahunAjaran}
                    onChange={(e) => setFormTahunAjaran(e.target.value)}
                    placeholder="2023/2024"
                    className="w-full border border-[#c6c6cd] rounded p-2 text-xs input-focus-glow font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">
                    Semester
                  </label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value as any)}
                    className="w-full border border-[#c6c6cd] rounded p-2 text-xs bg-white focus-ring-teal"
                  >
                    <option value="Ganjil & Genap">Ganjil & Genap (Sepanjang Tahun)</option>
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </select>
                </div>
              </div>

              {/* Jadwal & Ruangan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">
                    Hari & Waktu Jadwal
                  </label>
                  <input
                    type="text"
                    value={formHariJadwal}
                    onChange={(e) => setFormHariJadwal(e.target.value)}
                    placeholder="Senin - Kamis (07:15 - 12:15)"
                    className="w-full border border-[#c6c6cd] rounded p-2 text-xs input-focus-glow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#45464d] mb-1">
                    Ruangan / Lokasi
                  </label>
                  <input
                    type="text"
                    value={formRuangan}
                    onChange={(e) => setFormRuangan(e.target.value)}
                    placeholder="Ruang 101 / Lapangan"
                    className="w-full border border-[#c6c6cd] rounded p-2 text-xs input-focus-glow"
                  />
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-bold text-[#45464d] mb-1">
                  Catatan / Keterangan Penugasan
                </label>
                <textarea
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  rows={2}
                  placeholder="Catatan tambahan e.g. Koordinator Kurikulum Merdeka..."
                  className="w-full border border-[#c6c6cd] rounded p-2 text-xs input-focus-glow"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#eceef0]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#c6c6cd] rounded text-xs font-semibold hover:bg-[#f2f4f6] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#006a61] text-white rounded text-xs font-bold hover:bg-[#006a61]/90 cursor-pointer shadow-xs"
                >
                  {editingId ? 'Simpan Perubahan' : 'Tambahkan Penugasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL CETAK SK PEMBAGIAN TUGAS MENGAJAR */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 print:hidden">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-700">print</span>
                <h3 className="font-bold text-sm text-black">
                  Pratinjau Cetak SK Beban Mengajar Guru (Kelas yang Diampu)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-[#006a61] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#006a61]/90 flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Cetak Sekarang
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-gray-500 hover:text-black text-sm p-1 rounded"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div className="p-8 overflow-y-auto bg-white text-black print:p-0">
              {/* Kop Surat */}
              <div className="text-center border-b-2 border-black pb-3 mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  PEMERINTAH KOTA MAKASSAR · DINAS PENDIDIKAN
                </h4>
                <h2 className="text-base font-extrabold uppercase tracking-wide">
                  {schoolProfile?.namaSekolah || 'UPTD SPF SDN MAWAS'}
                </h2>
                <p className="text-[11px] text-gray-700">
                  {schoolProfile?.alamat || 'Jl. Mawas No. 1, Mamajang, Kota Makassar'} · NPSN:{' '}
                  {schoolProfile?.npsn || '40307399'}
                </p>
              </div>

              {/* Title */}
              <div className="text-center mb-5">
                <h3 className="text-sm font-bold uppercase underline">
                  LAMPIRAN KEPUTUSAN KEPALA SEKOLAH
                </h3>
                <p className="text-xs font-semibold text-gray-800">
                  TENTANG PEMBAGIAN TUGAS GURU DALAM KEGIATAN PROSES BELAJAR MENGAJAR (PBM)
                </p>
                <p className="text-[11px] text-gray-600">
                  Tahun Ajaran 2023/2024 · Semester Ganjil & Genap
                </p>
              </div>

              {/* Table */}
              <table className="w-full text-xs border-collapse border border-black mb-6">
                <thead>
                  <tr className="bg-gray-100 font-bold text-center border-b border-black">
                    <th className="border border-black p-2 w-8">No</th>
                    <th className="border border-black p-2 text-left">Nama Guru / NIP</th>
                    <th className="border border-black p-2 text-left">Mata Pelajaran</th>
                    <th className="border border-black p-2 w-20">Kelas</th>
                    <th className="border border-black p-2 w-16">Beban JP</th>
                    <th className="border border-black p-2 text-left">Hari / Waktu</th>
                    <th className="border border-black p-2">Ruangan</th>
                  </tr>
                </thead>
                <tbody>
                  {kelasDiampuList.map((item, idx) => (
                    <tr key={item.id} className="border-b border-black">
                      <td className="border border-black p-2 text-center">{idx + 1}</td>
                      <td className="border border-black p-2">
                        <div className="font-bold">{item.namaGuru}</div>
                        <div className="text-[10px] text-gray-600">NIP: {item.nipGuru || '-'}</div>
                      </td>
                      <td className="border border-black p-2 font-medium">{item.mataPelajaran}</td>
                      <td className="border border-black p-2 text-center font-bold">{item.namaKelas}</td>
                      <td className="border border-black p-2 text-center font-bold">
                        {item.jumlahJamPerMinggu} JP
                      </td>
                      <td className="border border-black p-2">{item.hariJadwal || '-'}</td>
                      <td className="border border-black p-2 text-center">{item.ruangan || '-'}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold border-t-2 border-black">
                    <td colSpan={4} className="border border-black p-2 text-right">
                      TOTAL BEBAN JAM MENGAJAR KESELURUHAN:
                    </td>
                    <td className="border border-black p-2 text-center">
                      {stats.totalJam} JP
                    </td>
                    <td colSpan={2} className="border border-black p-2 text-xs text-gray-600">
                      {stats.totalGuru} Guru Pengampu
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signature */}
              <div className="flex justify-end mt-8">
                <div className="text-center w-64">
                  <p className="text-xs">Makassar, 17 Juli 2023</p>
                  <p className="text-xs font-semibold">Kepala Sekolah,</p>
                  <div className="h-16"></div>
                  <p className="text-xs font-bold underline">
                    {schoolProfile?.kepalaSekolah || 'Ampena, S., S.Pd'}
                  </p>
                  <p className="text-[11px] text-gray-700">
                    NIP. {schoolProfile?.nipKepalaSekolah || '19680512 199307 1 001'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
