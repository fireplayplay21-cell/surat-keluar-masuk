import React, { useState, useMemo } from 'react';
import { DataPengguna, AppUser } from '../types';
import { ResponsiveTableWrapper } from './ResponsiveTableWrapper';

interface DataPenggunaViewProps {
  penggunaList: DataPengguna[];
  searchQuery: string;
  onAddNew: () => void;
  onViewDetail: (pengguna: DataPengguna) => void;
  onEdit: (pengguna: DataPengguna) => void;
  onDelete: (id: string) => void;
  currentUser?: AppUser | null;
}

export const DataPenggunaView: React.FC<DataPenggunaViewProps> = ({
  penggunaList,
  searchQuery,
  onAddNew,
  onViewDetail,
  onEdit,
  onDelete,
  currentUser,
}) => {
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterKategori, setFilterKategori] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState('');

  const isAdmin = !currentUser || currentUser.role === 'admin';

  const activeSearch = searchQuery || localSearch;

  // Filtered list
  const filteredList = useMemo(() => {
    return penggunaList.filter((item) => {
      // Search
      if (activeSearch.trim()) {
        const query = activeSearch.toLowerCase();
        const matchNama = item.nama.toLowerCase().includes(query);
        const matchNip = item.nip.toLowerCase().includes(query);
        const matchKelas = item.kelas.toLowerCase().includes(query);
        const matchJabatan = item.jabatan.toLowerCase().includes(query);
        const matchEmail = item.email ? item.email.toLowerCase().includes(query) : false;
        if (!matchNama && !matchNip && !matchKelas && !matchJabatan && !matchEmail) {
          return false;
        }
      }

      // Filter Kelas
      if (filterKelas !== 'all') {
        if (filterKelas === 'non-kelas') {
          if (item.kelas !== '-') return false;
        } else if (!item.kelas.toLowerCase().includes(filterKelas.toLowerCase())) {
          return false;
        }
      }

      // Filter Status Kepegawaian
      if (filterStatus !== 'all' && item.statusKepegawaian !== filterStatus) {
        return false;
      }

      // Filter Kategori Jabatan
      if (filterKategori !== 'all') {
        const j = item.jabatan.toLowerCase();
        if (filterKategori === 'guru-kelas' && !j.includes('guru kelas')) return false;
        if (
          filterKategori === 'guru-mapel' &&
          !(j.includes('pai') || j.includes('pjok') || j.includes('inggris') || j.includes('agama') || j.includes('olahraga'))
        )
          return false;
        if (
          filterKategori === 'tendik' &&
          !(
            j.includes('kepala sekolah') ||
            j.includes('tata usaha') ||
            j.includes('bendahara') ||
            j.includes('dapodik') ||
            j.includes('perpustakaan') ||
            j.includes('penjaga')
          )
        )
          return false;
      }

      return true;
    });
  }, [penggunaList, activeSearch, filterKelas, filterStatus, filterKategori]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = penggunaList.length;
    const guruKelas = penggunaList.filter((p) => p.jabatan.toLowerCase().includes('guru kelas')).length;
    const guruMapel = penggunaList.filter(
      (p) =>
        p.jabatan.toLowerCase().includes('pai') ||
        p.jabatan.toLowerCase().includes('pjok') ||
        p.jabatan.toLowerCase().includes('inggris') ||
        p.jabatan.toLowerCase().includes('agama') ||
        p.jabatan.toLowerCase().includes('olahraga')
    ).length;
    const tendik = total - guruKelas - guruMapel;
    const pnsCount = penggunaList.filter((p) => p.statusKepegawaian === 'PNS').length;
    const pppkCount = penggunaList.filter((p) => p.statusKepegawaian === 'PPPK').length;

    return { total, guruKelas, guruMapel, tendik, pnsCount, pppkCount };
  }, [penggunaList]);

  const handleExportCSV = () => {
    const headers = ['No', 'Nama Guru', 'NIP', 'Kelas', 'Jabatan', 'Status Kepegawaian', 'No Telepon', 'Email'];
    const rows = filteredList.map((item, idx) => [
      idx + 1,
      `"${item.nama}"`,
      `"${item.nip}"`,
      `"${item.kelas}"`,
      `"${item.jabatan}"`,
      `"${item.statusKepegawaian}"`,
      `"${item.telepon}"`,
      `"${item.email || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Pengguna_Guru_SDN01_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    <div className="p-6 max-w-[1400px] mx-auto w-full space-y-6">
      {/* Top Banner / Heading & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-[#c6c6cd]/50 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006a61] text-2xl">
              school
            </span>
            <h1 className="text-xl font-extrabold text-black tracking-tight">
              Data Pengguna, Guru & Tenaga Kependidikan
            </h1>
          </div>
          <p className="text-xs text-[#45464d] mt-1">
            Daftar seluruh pendidik, pembagian kelas diampu, serta jabatan struktural di SDN 01 Harapan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none border border-[#c6c6cd] bg-white text-black px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[#f2f4f6] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            title="Unduh format spreadsheet CSV"
          >
            <span className="material-symbols-outlined text-[17px] text-[#006a61]">
              download
            </span>
            <span>Ekspor CSV</span>
          </button>

          {isAdmin ? (
            <button
              id="btn-tambah-pengguna"
              onClick={onAddNew}
              className="flex-1 sm:flex-none bg-[#006a61] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#006a61]/90 transition-all flex items-center justify-center gap-1.5 focus-ring-teal cursor-pointer shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Tambah Guru / Pengguna</span>
            </button>
          ) : (
            <span className="text-xs text-[#006a61] font-bold bg-[#86f2e4]/30 px-3 py-1.5 rounded-lg border border-[#006a61]/20 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">contact_page</span>
              <span>Direktori Guru</span>
            </span>
          )}
        </div>
      </div>

      {/* Quick Statistics KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Pengguna */}
        <div className="bg-white p-4 rounded-xl border border-[#c6c6cd]/50 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#45464d]">Total GTK & Pengguna</span>
            <div className="w-8 h-8 rounded-lg bg-[#86f2e4]/30 flex items-center justify-center text-[#006f66]">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div className="text-2xl font-black text-black mt-2">{stats.total}</div>
          <p className="text-[11px] text-[#76777d] mt-0.5">
            {stats.pnsCount} PNS • {stats.pppkCount} PPPK
          </p>
        </div>

        {/* Guru Kelas */}
        <div className="bg-white p-4 rounded-xl border border-[#c6c6cd]/50 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#45464d]">Wali / Guru Kelas</span>
            <div className="w-8 h-8 rounded-lg bg-[#b7c8e1]/30 flex items-center justify-center text-[#38485d]">
              <span className="material-symbols-outlined text-[18px]">class</span>
            </div>
          </div>
          <div className="text-2xl font-black text-black mt-2">{stats.guruKelas}</div>
          <p className="text-[11px] text-[#76777d] mt-0.5">Tingkat Kelas 1 s.d. 6</p>
        </div>

        {/* Guru Mata Pelajaran */}
        <div className="bg-white p-4 rounded-xl border border-[#c6c6cd]/50 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#45464d]">Guru Mata Pelajaran</span>
            <div className="w-8 h-8 rounded-lg bg-[#86f2e4]/30 flex items-center justify-center text-[#006f66]">
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
            </div>
          </div>
          <div className="text-2xl font-black text-black mt-2">{stats.guruMapel}</div>
          <p className="text-[11px] text-[#76777d] mt-0.5">PAI, PJOK, B.Inggris</p>
        </div>

        {/* Tenaga Kependidikan */}
        <div className="bg-white p-4 rounded-xl border border-[#c6c6cd]/50 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#45464d]">Tendik & Manajemen</span>
            <div className="w-8 h-8 rounded-lg bg-[#e6e8ea] flex items-center justify-center text-[#191c1e]">
              <span className="material-symbols-outlined text-[18px]">badge</span>
            </div>
          </div>
          <div className="text-2xl font-black text-black mt-2">{stats.tendik}</div>
          <p className="text-[11px] text-[#76777d] mt-0.5">Kepsek, TU, IT, BOS</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#c6c6cd]/50 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#76777d] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Cari berdasarkan Nama Guru, NIP, Kelas, atau Jabatan..."
              className="w-full pl-9 pr-8 py-2 border border-[#c6c6cd] rounded-lg text-xs input-focus-glow bg-white"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-2.5 top-2.5 text-[#76777d] hover:text-black text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Kelas */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#45464d] font-bold whitespace-nowrap">Kelas:</span>
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="border border-[#c6c6cd] rounded-lg p-1.5 text-xs bg-white input-focus-glow font-medium"
              >
                <option value="all">Semua Kelas</option>
                <option value="Kelas 1">Kelas 1</option>
                <option value="Kelas 2">Kelas 2</option>
                <option value="Kelas 3">Kelas 3</option>
                <option value="Kelas 4">Kelas 4</option>
                <option value="Kelas 5">Kelas 5</option>
                <option value="Kelas 6">Kelas 6</option>
                <option value="non-kelas">Non-Wali Kelas (-)</option>
              </select>
            </div>

            {/* Filter Kategori Jabatan */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#45464d] font-bold whitespace-nowrap">Jabatan:</span>
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="border border-[#c6c6cd] rounded-lg p-1.5 text-xs bg-white input-focus-glow font-medium"
              >
                <option value="all">Semua Jabatan</option>
                <option value="guru-kelas">Wali / Guru Kelas</option>
                <option value="guru-mapel">Guru Mata Pelajaran</option>
                <option value="tendik">Staf Tata Usaha / Tendik</option>
              </select>
            </div>

            {/* Filter Kepegawaian */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#45464d] font-bold whitespace-nowrap">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-[#c6c6cd] rounded-lg p-1.5 text-xs bg-white input-focus-glow font-medium"
              >
                <option value="all">Semua Status</option>
                <option value="PNS">PNS</option>
                <option value="PPPK">PPPK</option>
                <option value="GTT/Honorer">GTT / Honorer</option>
                <option value="PTY">PTY</option>
              </select>
            </div>

            {/* Reset Filter Button if active */}
            {(filterKelas !== 'all' || filterStatus !== 'all' || filterKategori !== 'all' || localSearch) && (
              <button
                onClick={() => {
                  setFilterKelas('all');
                  setFilterStatus('all');
                  setFilterKategori('all');
                  setLocalSearch('');
                }}
                className="text-xs text-[#ba1a1a] hover:underline font-bold px-2 py-1"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-[#c6c6cd]/50 shadow-xs overflow-hidden">
        <ResponsiveTableWrapper id="data-pengguna-table-scroll" minWidth="min-w-[950px]">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header */}
            <thead className="bg-[#f7f9fb] border-b border-[#c6c6cd]/60 text-[#45464d] uppercase font-bold tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Guru / GTK</th>
                <th className="py-3.5 px-4">Kelas Diampu</th>
                <th className="py-3.5 px-4">Jabatan</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Kontak / Email</th>
                <th className="py-3.5 px-4 text-center">Keaktifan</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#eceef0]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#76777d]">
                    <div className="flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-[#c6c6cd] mb-2">
                        person_off
                      </span>
                      <p className="font-semibold text-black">
                        Tidak ada data guru atau pengguna yang sesuai filter.
                      </p>
                      <p className="text-xs text-[#76777d] mt-1">
                        Coba sesuaikan kata kunci pencarian atau reset filter di atas.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((item, index) => {
                  const isWaliKelas = item.kelas && item.kelas !== '-';
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#f7f9fb]/80 transition-colors group cursor-default"
                    >
                      {/* No */}
                      <td className="py-3.5 px-4 text-center font-medium text-[#76777d]">
                        {index + 1}
                      </td>

                      {/* Nama Guru with Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#86f2e4]/40 text-[#006f66] font-bold text-xs flex items-center justify-center shrink-0 border border-[#006a61]/20">
                            {getInitials(item.nama)}
                          </div>
                          <div>
                            <div className="font-bold text-black text-[13px] hover:text-[#006a61] cursor-pointer" onClick={() => onViewDetail(item)}>
                              {item.nama}
                            </div>
                            <div className="text-[11px] text-[#76777d] flex items-center gap-1.5 mt-0.5">
                              <span>NIP: {item.nip}</span>
                              <span>•</span>
                              <span>{item.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kelas */}
                      <td className="py-3.5 px-4">
                        {isWaliKelas ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#86f2e4]/30 text-[#006f66] border border-[#006a61]/15">
                            <span className="material-symbols-outlined text-[13px]">
                              door_front
                            </span>
                            {item.kelas}
                          </span>
                        ) : (
                          <span className="text-[#76777d] italic font-medium px-2">
                            -
                          </span>
                        )}
                      </td>

                      {/* Jabatan */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-black">
                          {item.jabatan}
                        </div>
                      </td>

                      {/* Status Kepegawaian */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            item.statusKepegawaian === 'PNS'
                              ? 'bg-[#006a61] text-white'
                              : item.statusKepegawaian === 'PPPK'
                              ? 'bg-[#b7c8e1] text-[#38485d]'
                              : 'bg-[#e6e8ea] text-[#191c1e]'
                          }`}
                        >
                          {item.statusKepegawaian}
                        </span>
                      </td>

                      {/* Kontak / Email */}
                      <td className="py-3.5 px-4">
                        <div className="text-black font-medium">{item.telepon}</div>
                        {item.email && (
                          <div className="text-[11px] text-[#76777d] truncate max-w-[180px]">
                            {item.email}
                          </div>
                        )}
                      </td>

                      {/* Keaktifan */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            item.statusAktif
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.statusAktif ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          {item.statusAktif ? 'Aktif' : 'Cuti'}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewDetail(item)}
                            className="p-1.5 text-[#45464d] hover:text-[#006a61] hover:bg-[#86f2e4]/30 rounded-md transition-colors cursor-pointer"
                            title="Lihat Detail Profil"
                          >
                            <span className="material-symbols-outlined text-[17px]">
                              visibility
                            </span>
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                onClick={() => onEdit(item)}
                                className="p-1.5 text-[#45464d] hover:text-black hover:bg-[#e6e8ea] rounded-md transition-colors cursor-pointer"
                                title="Edit Data Guru"
                              >
                                <span className="material-symbols-outlined text-[17px]">
                                  edit
                                </span>
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`Hapus data ${item.nama}?`)) {
                                    onDelete(item.id);
                                  }
                                }}
                                className="p-1.5 text-[#76777d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-md transition-colors cursor-pointer"
                                title="Hapus Data"
                              >
                                <span className="material-symbols-outlined text-[17px]">
                                  delete
                                </span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </ResponsiveTableWrapper>

        {/* Table Footer Summary */}
        <div className="p-4 border-t border-[#c6c6cd]/50 bg-[#f7f9fb] flex flex-col sm:flex-row justify-between items-center text-xs text-[#45464d] gap-2">
          <div>
            Menampilkan <strong>{filteredList.length}</strong> dari{' '}
            <strong>{penggunaList.length}</strong> data guru & tenaga kependidikan
          </div>
          <div className="text-[11px] text-[#76777d]">
            Sistem Tata Usaha SDN 01 Harapan • Tahun Ajaran 2023/2024
          </div>
        </div>
      </div>
    </div>
  );
};
