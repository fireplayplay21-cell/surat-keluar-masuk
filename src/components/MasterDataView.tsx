import React, { useState, useMemo } from 'react';
import { MasterKlasifikasi, MasterInstansi, MasterPejabat, MasterKelas, DataPengguna } from '../types';
import { ResponsiveTableWrapper } from './ResponsiveTableWrapper';

interface MasterDataViewProps {
  klasifikasiList?: MasterKlasifikasi[];
  instansiList?: MasterInstansi[];
  pejabatList?: MasterPejabat[];
  kelasList?: MasterKelas[];
  guruList?: DataPengguna[];
  onAddKlasifikasi?: (item: Omit<MasterKlasifikasi, 'id'>) => void;
  onDeleteKlasifikasi?: (id: string) => void;
  onAddInstansi?: (item: Omit<MasterInstansi, 'id'>) => void;
  onDeleteInstansi?: (id: string) => void;
  onAddPejabat?: (item: Omit<MasterPejabat, 'id'>) => void;
  onDeletePejabat?: (id: string) => void;
  onAddKelas?: (item: Omit<MasterKelas, 'id'>) => void;
  onUpdateKelas?: (id: string, item: Partial<MasterKelas>) => void;
  onDeleteKelas?: (id: string) => void;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  klasifikasiList = [],
  instansiList = [],
  pejabatList = [],
  kelasList = [],
  guruList = [],
  onAddKlasifikasi,
  onDeleteKlasifikasi,
  onAddInstansi,
  onDeleteInstansi,
  onAddPejabat,
  onDeletePejabat,
  onAddKelas,
  onUpdateKelas,
  onDeleteKelas,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'kelas' | 'klasifikasi' | 'instansi' | 'pejabat'>('kelas');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingKelasId, setEditingKelasId] = useState<string | null>(null);

  // Search & Filters for Kelas
  const [searchKelas, setSearchKelas] = useState('');
  const [filterTingkat, setFilterTingkat] = useState<number | 'semua'>('semua');

  // Form states for Klasifikasi
  const [kodeKlasifikasi, setKodeKlasifikasi] = useState('');
  const [namaKlasifikasi, setNamaKlasifikasi] = useState('');
  const [ketKlasifikasi, setKetKlasifikasi] = useState('');

  // Form states for Instansi
  const [namaInstansi, setNamaInstansi] = useState('');
  const [alamatInstansi, setAlamatInstansi] = useState('');
  const [telpInstansi, setTelpInstansi] = useState('');
  const [kategoriInstansi, setKategoriInstansi] = useState('Kedinasan');

  // Form states for Pejabat
  const [namaPejabat, setNamaPejabat] = useState('');
  const [jabatanPejabat, setJabatanPejabat] = useState('');
  const [nipPejabat, setNipPejabat] = useState('');

  // Form states for Kelas
  const [namaKelas, setNamaKelas] = useState('');
  const [tingkatKelas, setTingkatKelas] = useState<number>(1);
  const [waliKelas, setWaliKelas] = useState('');
  const [nipWaliKelas, setNipWaliKelas] = useState('');
  const [tahunAjaran, setTahunAjaran] = useState('2023/2024');
  const [jumlahSiswa, setJumlahSiswa] = useState<number>(28);
  const [jumlahLakiLaki, setJumlahLakiLaki] = useState<number>(14);
  const [jumlahPerempuan, setJumlahPerempuan] = useState<number>(14);
  const [ruanganKelas, setRuanganKelas] = useState('');
  const [faseKurikulum, setFaseKurikulum] = useState<'Fase A' | 'Fase B' | 'Fase C'>('Fase A');
  const [keteranganKelas, setKeteranganKelas] = useState('');

  // Summary Metrics for Kelas
  const totalSiswa = useMemo(() => {
    return (kelasList || []).reduce((acc, k) => acc + (Number(k.jumlahSiswa) || 0), 0);
  }, [kelasList]);

  const totalLakiLaki = useMemo(() => {
    return (kelasList || []).reduce((acc, k) => acc + (Number(k.jumlahLakiLaki) || 0), 0);
  }, [kelasList]);

  const totalPerempuan = useMemo(() => {
    return (kelasList || []).reduce((acc, k) => acc + (Number(k.jumlahPerempuan) || 0), 0);
  }, [kelasList]);

  const waliTerisiCount = useMemo(() => {
    return (kelasList || []).filter((k) => k.waliKelas && k.waliKelas.trim() !== '' && k.waliKelas !== '-').length;
  }, [kelasList]);

  // Filtered Kelas List
  const filteredKelasList = useMemo(() => {
    return (kelasList || []).filter((k) => {
      const matchSearch =
        k.namaKelas.toLowerCase().includes(searchKelas.toLowerCase()) ||
        k.waliKelas.toLowerCase().includes(searchKelas.toLowerCase()) ||
        k.ruangan.toLowerCase().includes(searchKelas.toLowerCase()) ||
        (k.nipWaliKelas && k.nipWaliKelas.includes(searchKelas));
      const matchTingkat = filterTingkat === 'semua' || k.tingkat === filterTingkat;
      return matchSearch && matchTingkat;
    });
  }, [kelasList, searchKelas, filterTingkat]);

  // Handle open add modal
  const handleOpenAdd = () => {
    setEditingKelasId(null);
    if (activeSubTab === 'kelas') {
      setNamaKelas('');
      setTingkatKelas(1);
      setWaliKelas('');
      setNipWaliKelas('');
      setTahunAjaran('2023/2024');
      setJumlahSiswa(28);
      setJumlahLakiLaki(14);
      setJumlahPerempuan(14);
      setRuanganKelas('');
      setFaseKurikulum('Fase A');
      setKeteranganKelas('');
    }
    setShowAddModal(true);
  };

  // Handle open edit modal for Kelas
  const handleEditKelas = (item: MasterKelas) => {
    setEditingKelasId(item.id);
    setNamaKelas(item.namaKelas);
    setTingkatKelas(item.tingkat);
    setWaliKelas(item.waliKelas);
    setNipWaliKelas(item.nipWaliKelas || '');
    setTahunAjaran(item.tahunAjaran);
    setJumlahSiswa(item.jumlahSiswa);
    setJumlahLakiLaki(item.jumlahLakiLaki || 0);
    setJumlahPerempuan(item.jumlahPerempuan || 0);
    setRuanganKelas(item.ruangan);
    setFaseKurikulum(item.faseKurikulum || (item.tingkat <= 2 ? 'Fase A' : item.tingkat <= 4 ? 'Fase B' : 'Fase C'));
    setKeteranganKelas(item.keterangan || '');
    setShowAddModal(true);
  };

  // Auto adjust fase when tingkat changes
  const handleTingkatChange = (val: number) => {
    setTingkatKelas(val);
    if (val <= 2) {
      setFaseKurikulum('Fase A');
    } else if (val <= 4) {
      setFaseKurikulum('Fase B');
    } else {
      setFaseKurikulum('Fase C');
    }
  };

  // Auto sync total students when L / P change
  const handleLakiChange = (val: number) => {
    setJumlahLakiLaki(val);
    setJumlahSiswa(val + jumlahPerempuan);
  };

  const handlePerempuanChange = (val: number) => {
    setJumlahPerempuan(val);
    setJumlahSiswa(jumlahLakiLaki + val);
  };

  // Handle select teacher from guruList
  const handleSelectWaliGuru = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedNama = e.target.value;
    setWaliKelas(selectedNama);
    const foundGuru = guruList.find((g) => g.nama === selectedNama);
    if (foundGuru && foundGuru.nip) {
      setNipWaliKelas(foundGuru.nip);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeSubTab === 'kelas') {
      if (!namaKelas.trim()) return;
      const payload: Omit<MasterKelas, 'id'> = {
        namaKelas: namaKelas.trim(),
        tingkat: Number(tingkatKelas),
        waliKelas: waliKelas.trim() || '-',
        nipWaliKelas: nipWaliKelas.trim(),
        tahunAjaran: tahunAjaran.trim(),
        jumlahSiswa: Number(jumlahSiswa) || 0,
        jumlahLakiLaki: Number(jumlahLakiLaki) || 0,
        jumlahPerempuan: Number(jumlahPerempuan) || 0,
        ruangan: ruanganKelas.trim() || '-',
        faseKurikulum,
        keterangan: keteranganKelas.trim(),
      };

      if (editingKelasId) {
        onUpdateKelas?.(editingKelasId, payload);
      } else {
        onAddKelas?.(payload);
      }
      setShowAddModal(false);
      setEditingKelasId(null);
      return;
    }

    if (activeSubTab === 'klasifikasi') {
      if (!kodeKlasifikasi || !namaKlasifikasi) return;
      onAddKlasifikasi?.({ kode: kodeKlasifikasi, nama: namaKlasifikasi, keterangan: ketKlasifikasi });
      setKodeKlasifikasi('');
      setNamaKlasifikasi('');
      setKetKlasifikasi('');
    } else if (activeSubTab === 'instansi') {
      if (!namaInstansi) return;
      onAddInstansi?.({ nama: namaInstansi, alamat: alamatInstansi, telepon: telpInstansi, kategori: kategoriInstansi });
      setNamaInstansi('');
      setAlamatInstansi('');
      setTelpInstansi('');
    } else if (activeSubTab === 'pejabat') {
      if (!namaPejabat || !jabatanPejabat) return;
      onAddPejabat?.({ nama: namaPejabat, jabatan: jabatanPejabat, nip: nipPejabat });
      setNamaPejabat('');
      setJabatanPejabat('');
      setNipPejabat('');
    }

    setShowAddModal(false);
  };

  const getTingkatBadgeColor = (tingkat: number) => {
    switch (tingkat) {
      case 1:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 2:
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 3:
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 4:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 5:
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 6:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
      {/* Top Banner & Subtab Navigation Bar */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl p-3 sm:p-4 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
          <div className="flex bg-[#f2f4f6] p-1 rounded-lg gap-1 overflow-x-auto">
            <button
              id="subtab-kelas"
              onClick={() => setActiveSubTab('kelas')}
              className={`px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === 'kelas'
                  ? 'bg-white text-[#006f66] shadow-xs'
                  : 'text-[#45464d] hover:text-black'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">school</span>
              Database Kelas ({kelasList.length})
            </button>
            <button
              id="subtab-klasifikasi"
              onClick={() => setActiveSubTab('klasifikasi')}
              className={`px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === 'klasifikasi'
                  ? 'bg-white text-[#006f66] shadow-xs'
                  : 'text-[#45464d] hover:text-black'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">category</span>
              Kode Klasifikasi ({klasifikasiList.length})
            </button>
            <button
              id="subtab-instansi"
              onClick={() => setActiveSubTab('instansi')}
              className={`px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === 'instansi'
                  ? 'bg-white text-[#006f66] shadow-xs'
                  : 'text-[#45464d] hover:text-black'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
              Daftar Instansi ({instansiList.length})
            </button>
            <button
              id="subtab-pejabat"
              onClick={() => setActiveSubTab('pejabat')}
              className={`px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === 'pejabat'
                  ? 'bg-white text-[#006f66] shadow-xs'
                  : 'text-[#45464d] hover:text-black'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">badge</span>
              Staf & Pejabat ({pejabatList.length})
            </button>
          </div>

          <button
            id="btn-add-master-data"
            onClick={handleOpenAdd}
            className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black/85 flex items-center justify-center gap-1.5 focus-ring-teal cursor-pointer shadow-xs whitespace-nowrap self-end sm:self-auto"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            {activeSubTab === 'kelas'
              ? 'Tambah Kelas / Rombel'
              : activeSubTab === 'klasifikasi'
              ? 'Tambah Klasifikasi'
              : activeSubTab === 'instansi'
              ? 'Tambah Instansi'
              : 'Tambah Pejabat'}
          </button>
        </div>

        {/* Subtab Description */}
        <p className="text-xs text-[#76777d]">
          {activeSubTab === 'kelas'
            ? 'Kelola master database kelas & rombongan belajar (rombel), data wali kelas, nomor ruangan, dan sebaran peserta didik sekolah.'
            : activeSubTab === 'klasifikasi'
            ? 'Daftar kode klasifikasi arsip surat kedinasan pendidikan untuk klasifikasi surat masuk & keluar.'
            : activeSubTab === 'instansi'
            ? 'Basis data mitra, instansi kedinasan, kelurahan, dan lembaga luar penerima atau pengirim surat.'
            : 'Daftar pejabat internal dan penandatangan surat dinas sekolah.'}
        </p>
      </div>

      {/* SPECIAL OVERVIEW STATS FOR KELAS */}
      {activeSubTab === 'kelas' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white border border-[#c6c6cd] rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#45464d] mb-1">
              <span className="material-symbols-outlined text-[18px] text-[#006a61]">meeting_room</span>
              Total Rombel
            </div>
            <div className="text-2xl font-black text-black">
              {kelasList.length} <span className="text-xs font-semibold text-[#76777d]">Kelas</span>
            </div>
            <div className="text-[11px] text-[#76777d] mt-1">Tingkat 1 s/d 6</div>
          </div>

          <div className="bg-white border border-[#c6c6cd] rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#45464d] mb-1">
              <span className="material-symbols-outlined text-[18px] text-blue-600">groups</span>
              Total Siswa
            </div>
            <div className="text-2xl font-black text-black">
              {totalSiswa} <span className="text-xs font-semibold text-[#76777d]">Siswa</span>
            </div>
            <div className="text-[11px] text-[#76777d] mt-1">
              {totalLakiLaki} Laki-laki · {totalPerempuan} Perempuan
            </div>
          </div>

          <div className="bg-white border border-[#c6c6cd] rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#45464d] mb-1">
              <span className="material-symbols-outlined text-[18px] text-purple-600">calculate</span>
              Rata-rata / Kelas
            </div>
            <div className="text-2xl font-black text-black">
              {kelasList.length > 0 ? (totalSiswa / kelasList.length).toFixed(1) : '0'}{' '}
              <span className="text-xs font-semibold text-[#76777d]">Siswa/Rombel</span>
            </div>
            <div className="text-[11px] text-[#76777d] mt-1">Standar SPM Kemdikbud</div>
          </div>

          <div className="bg-white border border-[#c6c6cd] rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#45464d] mb-1">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">person_check</span>
              Wali Kelas Terisi
            </div>
            <div className="text-2xl font-black text-black">
              {waliTerisiCount} / {kelasList.length}{' '}
              <span className="text-xs font-semibold text-emerald-700">
                ({kelasList.length > 0 ? Math.round((waliTerisiCount / kelasList.length) * 100) : 0}%)
              </span>
            </div>
            <div className="text-[11px] text-[#76777d] mt-1">Status Penugasan Guru</div>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH BAR FOR KELAS */}
      {activeSubTab === 'kelas' && (
        <div className="bg-white border border-[#c6c6cd] rounded-xl p-3 shadow-xs flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#76777d]">
              search
            </span>
            <input
              id="input-search-kelas"
              type="text"
              value={searchKelas}
              onChange={(e) => setSearchKelas(e.target.value)}
              placeholder="Cari nama kelas, wali kelas, ruangan, NIP..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#c6c6cd] input-focus-glow"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#45464d] whitespace-nowrap">Filter Tingkat:</span>
            <select
              id="select-filter-tingkat"
              value={filterTingkat}
              onChange={(e) => {
                const val = e.target.value;
                setFilterTingkat(val === 'semua' ? 'semua' : Number(val));
              }}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-[#c6c6cd] bg-white font-medium cursor-pointer"
            >
              <option value="semua">Semua Tingkat (1 - 6)</option>
              <option value="1">Kelas 1</option>
              <option value="2">Kelas 2</option>
              <option value="3">Kelas 3</option>
              <option value="4">Kelas 4</option>
              <option value="5">Kelas 5</option>
              <option value="6">Kelas 6</option>
            </select>
          </div>
        </div>
      )}

      {/* MAIN TABLE WRAPPER */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
        <ResponsiveTableWrapper id="master-data-table-scroll" minWidth="min-w-[760px]">
          {/* 1. TABLE KELAS */}
          {activeSubTab === 'kelas' && (
            <table id="table-database-kelas" className="w-full text-left border-collapse">
              <thead className="bg-[#f2f4f6] border-b border-[#c6c6cd]">
                <tr>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase w-14 text-center">No</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase">Nama Rombel / Kelas</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase">Kurikulum / Fase</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase">Wali Kelas & NIP</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase">Ruangan</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase text-center">Jumlah Siswa</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase">Tahun Ajaran</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6cd]/50 text-sm">
                {filteredKelasList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#76777d] text-sm">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[36px] text-gray-400">school</span>
                        <p className="font-semibold text-gray-600">Tidak ada data kelas yang sesuai</p>
                        <p className="text-xs text-gray-500">
                          Silakan tambah kelas baru atau ubah kata kunci pencarian.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredKelasList.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-[#f7f9fb] transition-colors">
                      <td className="py-3.5 px-4 text-center text-xs font-bold text-[#76777d]">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getTingkatBadgeColor(
                              item.tingkat
                            )}`}
                          >
                            Tingkat {item.tingkat}
                          </span>
                          <span className="font-bold text-black text-sm">{item.namaKelas}</span>
                        </div>
                        {item.keterangan && (
                          <div className="text-[11px] text-[#76777d] mt-0.5 line-clamp-1">
                            {item.keterangan}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-[#006f66] border border-teal-200">
                          {item.faseKurikulum || (item.tingkat <= 2 ? 'Fase A' : item.tingkat <= 4 ? 'Fase B' : 'Fase C')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-black text-xs sm:text-sm flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-[#006a61]">person</span>
                          {item.waliKelas || '-'}
                        </div>
                        {item.nipWaliKelas && (
                          <div className="text-[11px] font-mono text-[#76777d] mt-0.5">
                            NIP: {item.nipWaliKelas}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#45464d]">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-gray-500">room</span>
                          {item.ruangan || '-'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold text-black text-sm">{item.jumlahSiswa} Siswa</div>
                        {(item.jumlahLakiLaki !== undefined || item.jumlahPerempuan !== undefined) && (
                          <div className="text-[10.5px] text-[#76777d] font-medium">
                            {item.jumlahLakiLaki ?? 0} L · {item.jumlahPerempuan ?? 0} P
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-[#45464d]">
                        {item.tahunAjaran}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            id={`btn-edit-kelas-${item.id}`}
                            onClick={() => handleEditKelas(item)}
                            className="p-1.5 text-[#006a61] hover:bg-[#86f2e4]/30 rounded transition-colors cursor-pointer"
                            title="Edit Data Kelas"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            id={`btn-delete-kelas-${item.id}`}
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus ${item.namaKelas}?`)) {
                                onDeleteKelas?.(item.id);
                              }
                            }}
                            className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded transition-colors cursor-pointer"
                            title="Hapus Kelas"
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
          )}

          {/* 2. TABLE KLASIFIKASI */}
          {activeSubTab === 'klasifikasi' && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f2f4f6] border-b border-[#c6c6cd]">
                <tr>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase w-28">Kode</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase">Nama Klasifikasi</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase">Keterangan</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6cd]/50 text-sm">
                {klasifikasiList.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f7f9fb]">
                    <td className="py-3.5 px-4 font-bold text-[#006a61]">{item.kode}</td>
                    <td className="py-3.5 px-4 font-semibold text-black">{item.nama}</td>
                    <td className="py-3.5 px-4 text-[#45464d] text-xs">{item.keterangan}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus klasifikasi ${item.kode}?`)) {
                            onDeleteKlasifikasi?.(item.id);
                          }
                        }}
                        className="p-1 text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded cursor-pointer"
                        title="Hapus"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 3. TABLE INSTANSI */}
          {activeSubTab === 'instansi' && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f2f4f6] border-b border-[#c6c6cd]">
                <tr>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase">Nama Instansi</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase">Kategori</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase">Alamat</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase">Kontak Telepon</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6cd]/50 text-sm">
                {instansiList.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f7f9fb]">
                    <td className="py-3.5 px-4 font-bold text-black">{item.nama}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs bg-[#f2f4f6] px-2 py-0.5 rounded font-medium text-[#45464d]">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#45464d] text-xs">{item.alamat}</td>
                    <td className="py-3.5 px-4 text-black text-xs font-medium">{item.telepon}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus instansi ${item.nama}?`)) {
                            onDeleteInstansi?.(item.id);
                          }
                        }}
                        className="p-1 text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded cursor-pointer"
                        title="Hapus"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 4. TABLE PEJABAT */}
          {activeSubTab === 'pejabat' && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f2f4f6] border-b border-[#c6c6cd]">
                <tr>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase">Nama Pejabat / Staf</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase">Jabatan</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase">NIP</th>
                  <th className="py-3 px-4 text-xs font-bold text-[#45464d] uppercase text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6cd]/50 text-sm">
                {pejabatList.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f7f9fb]">
                    <td className="py-3.5 px-4 font-bold text-black">{item.nama}</td>
                    <td className="py-3.5 px-4 text-[#006a61] font-semibold text-xs">{item.jabatan}</td>
                    <td className="py-3.5 px-4 text-[#45464d] font-mono text-xs">{item.nip}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus pejabat ${item.nama}?`)) {
                            onDeletePejabat?.(item.id);
                          }
                        }}
                        className="p-1 text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded cursor-pointer"
                        title="Hapus"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ResponsiveTableWrapper>
      </div>

      {/* ADD / EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#eceef0] mb-4">
              <h3 className="font-bold text-black text-base">
                {activeSubTab === 'kelas'
                  ? editingKelasId
                    ? 'Edit Data Kelas / Rombel'
                    : 'Tambah Kelas / Rombel Baru'
                  : activeSubTab === 'klasifikasi'
                  ? 'Tambah Kode Klasifikasi'
                  : activeSubTab === 'instansi'
                  ? 'Tambah Instansi / Mitra'
                  : 'Tambah Staf / Pejabat'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingKelasId(null);
                }}
                className="text-[#76777d] hover:text-black font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {/* FORM KELAS */}
              {activeSubTab === 'kelas' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#45464d] mb-1">
                        Nama Kelas / Rombel <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="form-kelas-nama"
                        type="text"
                        required
                        value={namaKelas}
                        onChange={(e) => setNamaKelas(e.target.value)}
                        placeholder="contoh: Kelas 1A"
                        className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#45464d] mb-1">
                        Tingkat Kelas <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="form-kelas-tingkat"
                        value={tingkatKelas}
                        onChange={(e) => handleTingkatChange(Number(e.target.value))}
                        className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow bg-white"
                      >
                        <option value={1}>Kelas 1 (Fase A)</option>
                        <option value={2}>Kelas 2 (Fase A)</option>
                        <option value={3}>Kelas 3 (Fase B)</option>
                        <option value={4}>Kelas 4 (Fase B)</option>
                        <option value={5}>Kelas 5 (Fase C)</option>
                        <option value={6}>Kelas 6 (Fase C)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#45464d] mb-1">
                        Fase Kurikulum
                      </label>
                      <select
                        value={faseKurikulum}
                        onChange={(e) => setFaseKurikulum(e.target.value as any)}
                        className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow bg-white"
                      >
                        <option value="Fase A">Fase A (Kelas 1 - 2)</option>
                        <option value="Fase B">Fase B (Kelas 3 - 4)</option>
                        <option value="Fase C">Fase C (Kelas 5 - 6)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#45464d] mb-1">
                        Tahun Ajaran <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={tahunAjaran}
                        onChange={(e) => setTahunAjaran(e.target.value)}
                        placeholder="2023/2024"
                        className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow"
                      />
                    </div>
                  </div>

                  {/* Wali Kelas Selection */}
                  <div>
                    <label className="block text-xs font-bold text-[#45464d] mb-1">
                      Wali Kelas
                    </label>
                    <div className="flex flex-col gap-1.5">
                      {guruList.length > 0 && (
                        <select
                          onChange={handleSelectWaliGuru}
                          className="w-full border border-[#c6c6cd] rounded p-2 text-xs bg-white text-[#45464d]"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            -- Pilih dari Daftar GTK / Guru --
                          </option>
                          {guruList.map((g) => (
                            <option key={g.id} value={g.nama}>
                              {g.nama} ({g.jabatan})
                            </option>
                          ))}
                        </select>
                      )}
                      <input
                        type="text"
                        value={waliKelas}
                        onChange={(e) => setWaliKelas(e.target.value)}
                        placeholder="Ketik nama wali kelas beserta gelar..."
                        className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#45464d] mb-1">
                        NIP Wali Kelas
                      </label>
                      <input
                        type="text"
                        value={nipWaliKelas}
                        onChange={(e) => setNipWaliKelas(e.target.value)}
                        placeholder="1980xxxx xxxx xx x xxx"
                        className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#45464d] mb-1">
                        Ruangan / Lokasi Gedung
                      </label>
                      <input
                        type="text"
                        value={ruanganKelas}
                        onChange={(e) => setRuanganKelas(e.target.value)}
                        placeholder="contoh: Ruang 101 (Gedung A Lt. 1)"
                        className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow"
                      />
                    </div>
                  </div>

                  {/* Siswa Stats */}
                  <div className="bg-[#f7f9fb] p-3 rounded-lg border border-[#eceef0]">
                    <div className="text-xs font-bold text-black mb-2">Sebaran Jumlah Siswa</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#45464d] mb-0.5">
                          Laki-Laki (L)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={jumlahLakiLaki}
                          onChange={(e) => handleLakiChange(Number(e.target.value))}
                          className="w-full border border-[#c6c6cd] rounded p-1.5 text-sm input-focus-glow text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#45464d] mb-0.5">
                          Perempuan (P)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={jumlahPerempuan}
                          onChange={(e) => handlePerempuanChange(Number(e.target.value))}
                          className="w-full border border-[#c6c6cd] rounded p-1.5 text-sm input-focus-glow text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#45464d] mb-0.5">
                          Total Siswa
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={jumlahSiswa}
                          onChange={(e) => setJumlahSiswa(Number(e.target.value))}
                          className="w-full border border-[#006a61] bg-[#86f2e4]/15 rounded p-1.5 text-sm font-bold text-[#006a61] text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#45464d] mb-1">
                      Keterangan / Catatan Rombel
                    </label>
                    <textarea
                      value={keteranganKelas}
                      onChange={(e) => setKeteranganKelas(e.target.value)}
                      rows={2}
                      placeholder="contoh: Rombongan belajar reguler Kurikulum Merdeka..."
                      className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow"
                    />
                  </div>
                </>
              )}

              {/* FORM KLASIFIKASI */}
              {activeSubTab === 'klasifikasi' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#45464d] mb-1">Kode Klasifikasi (cth: 421)</label>
                    <input
                      type="text"
                      required
                      value={kodeKlasifikasi}
                      onChange={(e) => setKodeKlasifikasi(e.target.value)}
                      placeholder="e.g. 421"
                      className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#45464d] mb-1">Nama Klasifikasi</label>
                    <input
                      type="text"
                      required
                      value={namaKlasifikasi}
                      onChange={(e) => setNamaKlasifikasi(e.target.value)}
                      placeholder="e.g. Kurikulum & Asesmen"
                      className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#45464d] mb-1">Keterangan</label>
                    <textarea
                      value={ketKlasifikasi}
                      onChange={(e) => setKetKlasifikasi(e.target.value)}
                      rows={2}
                      placeholder="Uraian peruntukan klasifikasi..."
                      className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow"
                    />
                  </div>
                </>
              )}

              {/* FORM INSTANSI */}
              {activeSubTab === 'instansi' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#45464d] mb-1">Nama Instansi</label>
                    <input
                      type="text"
                      required
                      value={namaInstansi}
                      onChange={(e) => setNamaInstansi(e.target.value)}
                      placeholder="e.g. Dinas Pendidikan Kota Makassar"
                      className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#45464d] mb-1">Kategori</label>
                    <select
                      value={kategoriInstansi}
                      onChange={(e) => setKategoriInstansi(e.target.value)}
                      className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow"
                    >
                      <option value="Kedinasan">Kedinasan</option>
                      <option value="Kesehatan">Kesehatan</option>
                      <option value="Organisasi">Organisasi</option>
                      <option value="Pemerintahan">Pemerintahan</option>
                      <option value="Swasta / Mitra">Swasta / Mitra</option>
                      <option value="Internal">Internal Sekolah</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#45464d] mb-1">Alamat</label>
                    <input
                      type="text"
                      value={alamatInstansi}
                      onChange={(e) => setAlamatInstansi(e.target.value)}
                      placeholder="Alamat kantor..."
                      className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#45464d] mb-1">Telepon / HP</label>
                    <input
                      type="text"
                      value={telpInstansi}
                      onChange={(e) => setTelpInstansi(e.target.value)}
                      placeholder="(0411) xxx / 08xx"
                      className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow"
                    />
                  </div>
                </>
              )}

              {/* FORM PEJABAT */}
              {activeSubTab === 'pejabat' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#45464d] mb-1">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      required
                      value={namaPejabat}
                      onChange={(e) => setNamaPejabat(e.target.value)}
                      placeholder="e.g. Siti Rahayu, S.Pd., M.Si."
                      className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#45464d] mb-1">Jabatan</label>
                    <input
                      type="text"
                      required
                      value={jabatanPejabat}
                      onChange={(e) => setJabatanPejabat(e.target.value)}
                      placeholder="e.g. Wakil Kepala Urusan Kurikulum"
                      className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#45464d] mb-1">NIP (Opsional)</label>
                    <input
                      type="text"
                      value={nipPejabat}
                      onChange={(e) => setNipPejabat(e.target.value)}
                      placeholder="1982xxxx xxxx xx x xxx"
                      className="w-full border border-[#c6c6cd] rounded p-2 text-sm input-focus-glow font-mono"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-[#eceef0]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingKelasId(null);
                  }}
                  className="px-4 py-2 border border-[#c6c6cd] rounded text-xs font-semibold hover:bg-[#f2f4f6] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#006a61] text-white rounded text-xs font-bold hover:bg-[#006a61]/90 cursor-pointer shadow-xs"
                >
                  {activeSubTab === 'kelas' && editingKelasId ? 'Perbarui Kelas' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
