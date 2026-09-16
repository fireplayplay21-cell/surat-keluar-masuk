import React, { useState, useMemo } from 'react';
import { MasterTahunAjaran } from '../types';
import { ResponsiveTableWrapper } from './ResponsiveTableWrapper';

interface TahunAjaranTabProps {
  tahunAjaranList: MasterTahunAjaran[];
  activeTahunAjaranId: string;
  onSetActiveTahunAjaran: (id: string) => void;
  onAddTahunAjaran: (item: Omit<MasterTahunAjaran, 'id'>) => void;
  onUpdateTahunAjaran: (id: string, item: Partial<MasterTahunAjaran>) => void;
  onDeleteTahunAjaran: (id: string) => void;
}

export const TahunAjaranTab: React.FC<TahunAjaranTabProps> = ({
  tahunAjaranList,
  activeTahunAjaranId,
  onSetActiveTahunAjaran,
  onAddTahunAjaran,
  onUpdateTahunAjaran,
  onDeleteTahunAjaran,
}) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [tahun, setTahun] = useState('');
  const [semesterAktif, setSemesterAktif] = useState<'Ganjil' | 'Genap' | 'Sepanjang Tahun'>('Ganjil');
  const [isAktif, setIsAktif] = useState(false);
  const [tglMulai, setTglMulai] = useState('');
  const [tglSelesai, setTglSelesai] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const activeItem = useMemo(() => {
    return (
      tahunAjaranList.find((t) => t.id === activeTahunAjaranId || t.isAktif) ||
      tahunAjaranList[0] ||
      null
    );
  }, [tahunAjaranList, activeTahunAjaranId]);

  const filteredList = useMemo(() => {
    return tahunAjaranList.filter((item) => {
      const q = search.toLowerCase();
      return (
        item.tahun.toLowerCase().includes(q) ||
        item.semesterAktif.toLowerCase().includes(q) ||
        (item.keterangan && item.keterangan.toLowerCase().includes(q))
      );
    });
  }, [tahunAjaranList, search]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTahun('');
    setSemesterAktif('Ganjil');
    setIsAktif(tahunAjaranList.length === 0);
    setTglMulai('');
    setTglSelesai('');
    setKeterangan('');
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: MasterTahunAjaran) => {
    setEditingId(item.id);
    setTahun(item.tahun);
    setSemesterAktif(item.semesterAktif);
    setIsAktif(item.isAktif);
    setTglMulai(item.tglMulai || '');
    setTglSelesai(item.tglSelesai || '');
    setKeterangan(item.keterangan || '');
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tahun.trim()) {
      setFormError('Format tahun ajaran wajib diisi (contoh: 2026/2027)');
      return;
    }

    if (editingId) {
      onUpdateTahunAjaran(editingId, {
        tahun: tahun.trim(),
        semesterAktif,
        isAktif,
        tglMulai: tglMulai || undefined,
        tglSelesai: tglSelesai || undefined,
        keterangan: keterangan.trim() || undefined,
      });
      if (isAktif) {
        onSetActiveTahunAjaran(editingId);
      }
    } else {
      onAddTahunAjaran({
        tahun: tahun.trim(),
        semesterAktif,
        isAktif,
        tglMulai: tglMulai || undefined,
        tglSelesai: tglSelesai || undefined,
        keterangan: keterangan.trim() || undefined,
      });
    }

    setShowModal(false);
  };

  const handleDelete = (item: MasterTahunAjaran) => {
    if (item.isAktif || item.id === activeTahunAjaranId) {
      window.alert('Tidak dapat menghapus Tahun Ajaran yang sedang aktif!');
      return;
    }
    if (window.confirm(`Hapus data Tahun Ajaran ${item.tahun} (${item.semesterAktif})?`)) {
      onDeleteTahunAjaran(item.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Academic Year Highlight Card */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">calendar_month</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Tahun Ajaran Aktif Terpilih
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-600 text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Basis Acuan Data
                </span>
              </div>
              <h3 className="text-xl font-black text-black tracking-tight mt-0.5">
                {activeItem ? `${activeItem.tahun} • Semester ${activeItem.semesterAktif}` : 'Belum Dipilih'}
              </h3>
              <p className="text-xs text-[#45464d] mt-0.5">
                {activeItem?.keterangan ||
                  'Seluruh master data rombel kelas, pembagian jam mengajar, dan data administratif mengacu pada basis tahun ajaran ini.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="bg-black text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-black/85 flex items-center gap-1.5 focus-ring-teal cursor-pointer shadow-xs whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[17px]">add</span>
              Tambah Tahun Ajaran
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl p-3 shadow-xs flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#76777d]">
            search
          </span>
          <input
            id="input-search-ta"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tahun ajaran, semester, atau keterangan..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#c6c6cd] input-focus-glow"
          />
        </div>
        <div className="text-xs font-semibold text-[#76777d]">
          Total Database: <span className="font-bold text-black">{tahunAjaranList.length} Periode</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
        <ResponsiveTableWrapper id="table-ta-wrapper" minWidth="min-w-[760px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f2f4f6] border-b border-[#c6c6cd]">
              <tr>
                <th className="py-3 px-4 text-[11px] font-bold text-[#45464d] uppercase tracking-wider w-12 text-center">
                  No
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-[#45464d] uppercase tracking-wider">
                  Tahun Ajaran
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-[#45464d] uppercase tracking-wider">
                  Semester Berjalan
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-[#45464d] uppercase tracking-wider">
                  Rentang Waktu
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-[#45464d] uppercase tracking-wider">
                  Status Sistem
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-[#45464d] uppercase tracking-wider">
                  Keterangan & Kebijakan
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-[#45464d] uppercase tracking-wider text-right w-44">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c6c6cd]/50 text-xs">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#76777d]">
                    <span className="material-symbols-outlined text-[36px] text-[#c6c6cd] block mb-2">
                      event_busy
                    </span>
                    Tidak ada data tahun ajaran yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  const isCurrentActive = item.id === activeTahunAjaranId || item.isAktif;
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#f7f9fb] transition-colors ${
                        isCurrentActive ? 'bg-emerald-50/40 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center text-[#76777d] font-semibold">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-black text-[13px]">{item.tahun}</span>
                          {isCurrentActive && (
                            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                              AKTIF
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            item.semesterAktif === 'Ganjil'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : item.semesterAktif === 'Genap'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}
                        >
                          Semester {item.semesterAktif}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#45464d]">
                        {item.tglMulai && item.tglSelesai ? (
                          <div className="flex items-center gap-1.5 text-[11.5px]">
                            <span className="material-symbols-outlined text-[14px] text-[#76777d]">
                              date_range
                            </span>
                            <span>{item.tglMulai} s/d {item.tglSelesai}</span>
                          </div>
                        ) : (
                          <span className="text-[#76777d] italic text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isCurrentActive ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Acuan Utama
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSetActiveTahunAjaran(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 text-[#45464d] hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer border border-[#c6c6cd]"
                            title="Jadikan sebagai database tahun ajaran aktif"
                          >
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Pilih Sebagai Acuan
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#45464d] max-w-xs truncate">
                        {item.keterangan || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isCurrentActive && (
                            <button
                              type="button"
                              onClick={() => onSetActiveTahunAjaran(item.id)}
                              className="p-1 rounded text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Set Aktif"
                            >
                              <span className="material-symbols-outlined text-[15px]">radio_button_unchecked</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 rounded text-[#006a61] hover:bg-[#86f2e4]/30 transition-colors cursor-pointer"
                            title="Edit Tahun Ajaran"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit</span>
                          </button>
                          <button
                            type="button"
                            disabled={isCurrentActive}
                            onClick={() => handleDelete(item)}
                            className={`p-1 rounded transition-colors ${
                              isCurrentActive
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-[#ba1a1a] hover:bg-red-50 cursor-pointer'
                            }`}
                            title={isCurrentActive ? 'Tahun ajaran aktif tidak dapat dihapus' : 'Hapus Tahun Ajaran'}
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </ResponsiveTableWrapper>
      </div>

      {/* Modal Add / Edit Tahun Ajaran */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in-95 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-[#eceef0] mb-4">
              <h3 className="font-bold text-black text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006a61]">calendar_today</span>
                {editingId ? 'Edit Database Tahun Ajaran' : 'Tambah Database Tahun Ajaran Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-[#76777d] hover:text-black text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#45464d] font-bold mb-1">
                  Format Tahun Ajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 2026/2027 atau 2027/2028"
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c6c6cd] rounded-lg input-focus-glow font-semibold"
                />
                <span className="text-[10.5px] text-[#76777d] mt-0.5 block">
                  Gunakan format standar tahun kalender pendidikan (YYYY/YYYY).
                </span>
              </div>

              <div>
                <label className="block text-[#45464d] font-bold mb-1">Semester Berjalan</label>
                <select
                  value={semesterAktif}
                  onChange={(e) => setSemesterAktif(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#c6c6cd] rounded-lg input-focus-glow bg-white cursor-pointer font-medium"
                >
                  <option value="Ganjil">Semester Ganjil (Juli - Desember)</option>
                  <option value="Genap">Semester Genap (Januari - Juni)</option>
                  <option value="Sepanjang Tahun">Sepanjang Tahun Penuh</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#45464d] font-bold mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={tglMulai}
                    onChange={(e) => setTglMulai(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#c6c6cd] rounded-lg input-focus-glow bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#45464d] font-bold mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={tglSelesai}
                    onChange={(e) => setTglSelesai(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#c6c6cd] rounded-lg input-focus-glow bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#45464d] font-bold mb-1">Keterangan / Kebijakan Kurikulum</label>
                <textarea
                  rows={2}
                  placeholder="Misal: Penerapan Kurikulum Merdeka Mandiri Berbagi atau catatan Dapodik..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c6c6cd] rounded-lg input-focus-glow"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[#c6c6cd] bg-[#f7f9fb] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAktif}
                    onChange={(e) => setIsAktif(e.target.checked)}
                    className="w-4 h-4 text-[#006a61] rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-black block">Jadikan Acuan Tahun Ajaran Aktif</span>
                    <span className="text-[11px] text-[#76777d] block">
                      Data rombel kelas dan administrasi akan langsung menggunakan tahun ajaran ini sebagai basis utama.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#eceef0]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 border border-[#c6c6cd] text-[#45464d] hover:bg-[#f2f4f6] rounded-lg font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-1.5 rounded-lg font-bold hover:bg-black/85 cursor-pointer shadow-xs"
                >
                  {editingId ? 'Simpan Perubahan' : 'Tambah Tahun Ajaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
