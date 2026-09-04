import React, { useState, useMemo } from 'react';
import { SuratMasuk, SifatSurat, StatusSuratMasuk, AppUser } from '../types';
import { ResponsiveTableWrapper } from './ResponsiveTableWrapper';

interface SuratMasukViewProps {
  suratList: SuratMasuk[];
  searchQuery: string;
  onAddNew: () => void;
  onViewDetail: (surat: SuratMasuk) => void;
  onEdit: (surat: SuratMasuk) => void;
  onOpenDisposisi: (surat: SuratMasuk) => void;
  onDelete: (id: string) => void;
  currentUser?: AppUser | null;
}

export const SuratMasukView: React.FC<SuratMasukViewProps> = ({
  suratList,
  searchQuery,
  onAddNew,
  onViewDetail,
  onEdit,
  onOpenDisposisi,
  onDelete,
  currentUser,
}) => {
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterSifat, setFilterSifat] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [guruTabFilter, setGuruTabFilter] = useState<'semua' | 'saya'>('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const isGuru = currentUser?.role === 'guru';
  const isKepsek = currentUser?.role === 'kepala_sekolah';

  const filteredData = useMemo(() => {
    return suratList.filter((item) => {
      // Guru specific tab filter
      if (isGuru && guruTabFilter === 'saya' && currentUser) {
        if (!item.disposisi) return false;
        const targets = item.disposisi.diteruskanKepada || [];
        const matchName = targets.some((t) => t.toLowerCase().includes(currentUser.nama.toLowerCase()));
        const matchClass = currentUser.kelas && targets.some((t) => t.toLowerCase().includes(currentUser.kelas!.toLowerCase()));
        const matchGeneral = targets.some((t) => t.toLowerCase().includes('guru') || t.toLowerCase().includes('semua'));
        if (!matchName && !matchClass && !matchGeneral) return false;
      }

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchUrut = (item.noUrut || item.noAgenda || '').toLowerCase().includes(query);
        const matchNoAsal = item.noAsal.toLowerCase().includes(query);
        const matchPengirim = item.pengirim.toLowerCase().includes(query);
        const matchPerihal = item.perihal.toLowerCase().includes(query);
        if (!matchUrut && !matchNoAsal && !matchPengirim && !matchPerihal) {
          return false;
        }
      }

      // Date range filter
      if (filterStartDate && item.tglTerima < filterStartDate) return false;
      if (filterEndDate && item.tglTerima > filterEndDate) return false;

      // Sifat filter
      if (filterSifat && item.sifat !== filterSifat) return false;

      // Status filter
      if (filterStatus && item.status !== filterStatus) return false;

      return true;
    });
  }, [suratList, searchQuery, filterStartDate, filterEndDate, filterSifat, filterStatus, isGuru, guruTabFilter, currentUser]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleResetFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterSifat('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  const hasActiveFilters = filterStartDate || filterEndDate || filterSifat || filterStatus || searchQuery;

  const renderSifatBadge = (sifat: SifatSurat) => {
    switch (sifat) {
      case 'penting':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#ffdad6] text-[#93000a]">
            Penting
          </span>
        );
      case 'segera':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#ffdad6] text-[#93000a]">
            Segera
          </span>
        );
      case 'rahasia':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f3e8ff] text-[#6b21a8] border border-[#d8b4fe]">
            Rahasia
          </span>
        );
      case 'biasa':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#e0e3e5] text-[#45464d] border border-[#c6c6cd]">
            Biasa
          </span>
        );
    }
  };

  const renderStatusBadge = (status: StatusSuratMasuk) => {
    switch (status) {
      case 'belum':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#e6e8ea] text-[#191c1e]">
            Belum Diproses
          </span>
        );
      case 'diproses':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#86f2e4] text-[#006f66]">
            Diproses
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#b7c8e1] text-[#38485d]">
            Selesai
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
      {/* If Guru, show segmented tab filter */}
      {isGuru && (
        <div className="flex items-center gap-2 bg-[#e6e8ea]/70 p-1.5 rounded-xl self-start border border-[#c6c6cd]">
          <button
            onClick={() => {
              setGuruTabFilter('semua');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              guruTabFilter === 'semua'
                ? 'bg-white text-black shadow-xs'
                : 'text-[#45464d] hover:text-black'
            }`}
          >
            Semua Surat Masuk ({suratList.length})
          </button>
          <button
            onClick={() => {
              setGuruTabFilter('saya');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              guruTabFilter === 'saya'
                ? 'bg-[#006a61] text-white shadow-xs'
                : 'text-[#45464d] hover:text-[#006a61]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">assignment_ind</span>
            <span>Ditujukan ke Saya / {currentUser?.kelas || 'GTK'}</span>
          </button>
        </div>
      )}

      {/* Filters & Actions Bar */}
      <div
        id="surat-masuk-filter-bar"
        className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-xs"
      >
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center flex-wrap">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto bg-white">
            <span className="material-symbols-outlined text-[#45464d] text-[20px]">
              calendar_today
            </span>
            <input
              id="filter-date-start"
              type="date"
              value={filterStartDate}
              onChange={(e) => {
                setFilterStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-[#c6c6cd] rounded bg-white text-[13.5px] px-2.5 py-1.5 input-focus-glow w-full sm:w-auto text-[#191c1e]"
              title="Tanggal Awal"
            />
            <span className="text-[#45464d] text-sm">-</span>
            <input
              id="filter-date-end"
              type="date"
              value={filterEndDate}
              onChange={(e) => {
                setFilterEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-[#c6c6cd] rounded bg-white text-[13.5px] px-2.5 py-1.5 input-focus-glow w-full sm:w-auto text-[#191c1e]"
              title="Tanggal Akhir"
            />
          </div>

          {/* Sifat Filter */}
          <div className="relative w-full sm:w-auto min-w-[140px]">
            <select
              id="filter-sifat-select"
              value={filterSifat}
              onChange={(e) => {
                setFilterSifat(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none w-full border border-[#c6c6cd] rounded bg-white text-[13.5px] pl-3 pr-8 py-1.5 input-focus-glow text-[#191c1e] cursor-pointer"
            >
              <option value="">Semua Sifat</option>
              <option value="biasa">Biasa</option>
              <option value="penting">Penting</option>
              <option value="segera">Segera</option>
              <option value="rahasia">Rahasia</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#76777d] text-[20px]">
              arrow_drop_down
            </span>
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-auto min-w-[160px]">
            <select
              id="filter-status-select"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none w-full border border-[#c6c6cd] rounded bg-white text-[13.5px] pl-3 pr-8 py-1.5 input-focus-glow text-[#191c1e] cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="belum">Belum Diproses</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#76777d] text-[20px]">
              arrow_drop_down
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#ba1a1a] hover:underline font-semibold flex items-center gap-1 cursor-pointer self-center"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Reset Filter
            </button>
          )}
        </div>

        {/* Action Button */}
        {currentUser?.permissions.canCreateSurat && (
          <button
            id="btn-tambah-surat-masuk"
            onClick={onAddNew}
            className="w-full md:w-auto bg-[#006a61] hover:bg-[#006a61]/90 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 focus-ring-teal shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>+ Surat Masuk Baru</span>
          </button>
        )}
      </div>

      {/* Data Table Card */}
      <div
        id="surat-masuk-table-card"
        className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs flex-1 flex flex-col"
      >
        <ResponsiveTableWrapper id="surat-masuk-table-scroll" minWidth="min-w-[1050px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f2f4f6] border-b border-[#c6c6cd] sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                  NO. URUT
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                  TGL TERIMA
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                  NO. & TGL ASAL
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                  PENGIRIM
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                  PERIHAL
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                  SIFAT
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                  STATUS TINDAK LANJUT
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider text-center">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c6c6cd]/50 text-[13.5px]">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#76777d]">
                    <span className="material-symbols-outlined text-4xl block mb-2 text-[#c6c6cd]">
                      inbox
                    </span>
                    <p className="font-medium text-sm">Tidak ada data surat masuk yang sesuai filter.</p>
                    {hasActiveFilters && (
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 text-xs text-[#006a61] underline font-semibold cursor-pointer"
                      >
                        Bersihkan filter pencarian
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                currentItems.map((item, idx) => {
                  const isAltRow = idx % 2 === 1;
                  const isAssigned = isGuru && currentUser && item.disposisi && (
                    item.disposisi.diteruskanKepada?.some(t => t.toLowerCase().includes(currentUser.nama.toLowerCase())) ||
                    (currentUser.kelas && item.disposisi.diteruskanKepada?.some(t => t.toLowerCase().includes(currentUser.kelas!.toLowerCase()))) ||
                    item.disposisi.diteruskanKepada?.some(t => t.toLowerCase().includes('guru') || t.toLowerCase().includes('semua'))
                  );

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#f7f9fb] transition-colors ${
                        isAssigned ? 'bg-[#86f2e4]/10 border-l-4 border-l-[#006a61]' : isAltRow ? 'bg-[#f7f9fb]/40' : 'bg-white'
                      }`}
                    >
                      {/* No Urut */}
                      <td className="py-3.5 px-4 font-semibold text-black whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#006a61]">{item.noUrut || item.noAgenda}</span>
                          {isAssigned && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#86f2e4] text-[#005049]">
                              Tugas Anda
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tgl Terima */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#191c1e]">
                        {item.tglTerimaFormatted}
                      </td>

                      {/* No & Tgl Asal */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-black">{item.noAsal}</div>
                        <div className="text-[12px] text-[#45464d]">{item.tglAsalFormatted}</div>
                      </td>

                      {/* Pengirim */}
                      <td className="py-3.5 px-4 font-medium text-black">
                        {item.pengirim}
                      </td>

                      {/* Perihal & Drive Attachment Badge */}
                      <td
                        className="py-3.5 px-4 max-w-xs text-[#191c1e]"
                        title={item.perihal}
                      >
                        <div className="font-medium text-black line-clamp-2">{item.perihal}</div>
                        {(item.driveAttachment || item.driveFileId || item.driveWebViewLink) && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-flex items-center gap-1 bg-[#4285F4]/10 text-[#1a73e8] text-[10px] font-bold px-1.5 py-0.2 rounded">
                              <span className="material-symbols-outlined text-[13px]">cloud_done</span>
                              Scan Drive
                            </span>
                            {item.driveWebViewLink && (
                              <a
                                href={item.driveWebViewLink}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[11px] text-[#006a61] hover:underline font-semibold flex items-center gap-0.5"
                                title="Buka berkas di Google Drive"
                              >
                                <span>Lihat Scan</span>
                                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                              </a>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Sifat */}
                      <td className="py-3.5 px-4">
                        {renderSifatBadge(item.sifat)}
                      </td>

                      {/* Status Tindak Lanjut */}
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(item.status)}
                      </td>

                      {/* Aksi */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            id={`btn-view-${item.id}`}
                            onClick={() => onViewDetail(item)}
                            className="p-1 text-[#45464d] hover:text-[#006a61] hover:bg-[#e6e8ea] rounded focus-ring-teal transition-colors cursor-pointer"
                            title="Lihat Detail & Berkas Surat"
                          >
                            <span className="material-symbols-outlined text-[15px]">visibility</span>
                          </button>

                          {/* Disposisi Button */}
                          {isKepsek ? (
                            <button
                              id={`btn-disposisi-${item.id}`}
                              onClick={() => onOpenDisposisi(item)}
                              className="px-2 py-0.5 bg-[#006a61] hover:bg-[#006a61]/90 text-white rounded text-[11px] font-bold focus-ring-teal transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Beri Lembar Arahan / Disposisi"
                            >
                              <span className="material-symbols-outlined text-[13px]">assignment</span>
                              <span>Disposisi</span>
                            </button>
                          ) : isGuru ? (
                            <button
                              id={`btn-disposisi-${item.id}`}
                              onClick={() => onOpenDisposisi(item)}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold focus-ring-teal transition-colors cursor-pointer flex items-center gap-1 ${
                                isAssigned
                                  ? 'bg-[#86f2e4] text-[#005049] hover:bg-[#86f2e4]/80'
                                  : 'bg-[#e6e8ea] text-[#45464d] hover:bg-[#c6c6cd]/50'
                              }`}
                              title="Lihat Arahan Disposisi & Isi Tindak Lanjut"
                            >
                              <span className="material-symbols-outlined text-[13px]">task_alt</span>
                              <span>Tindak Lanjut</span>
                            </button>
                          ) : (
                            <button
                              id={`btn-disposisi-${item.id}`}
                              onClick={() => onOpenDisposisi(item)}
                              className="p-1 text-[#45464d] hover:text-[#006a61] hover:bg-[#e6e8ea] rounded focus-ring-teal transition-colors cursor-pointer"
                              title="Lembar Disposisi Kepala Sekolah"
                            >
                              <span className="material-symbols-outlined text-[15px]">assignment</span>
                            </button>
                          )}

                          {/* Edit Button */}
                          {currentUser?.permissions.canEditSurat && (
                            <button
                              id={`btn-edit-${item.id}`}
                              onClick={() => onEdit(item)}
                              className="p-1 text-[#45464d] hover:text-[#006a61] hover:bg-[#e6e8ea] rounded focus-ring-teal transition-colors cursor-pointer"
                              title="Edit Data Surat"
                            >
                              <span className="material-symbols-outlined text-[15px]">edit</span>
                            </button>
                          )}

                          {/* Delete Button */}
                          {currentUser?.permissions.canDeleteSurat && (
                            <button
                              id={`btn-delete-${item.id}`}
                              onClick={() => {
                                if (window.confirm(`Hapus surat masuk No. Agenda "${item.noAgenda}"?`)) {
                                  onDelete(item.id);
                                }
                              }}
                              className="p-1 text-[#45464d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded focus-ring-teal transition-colors cursor-pointer"
                              title="Hapus Surat"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                            </button>
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

        {/* Pagination Footer */}
        <div
          id="table-pagination-footer"
          className="bg-white border-t border-[#c6c6cd] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto"
        >
          <div className="text-[13.5px] text-[#45464d]">
            Menampilkan {filteredData.length > 0 ? startIndex + 1 : 0} hingga{' '}
            {Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} data
          </div>
          <div className="flex items-center gap-1">
            <button
              id="btn-prev-page"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 border border-[#c6c6cd] rounded text-[#45464d] hover:bg-[#f2f4f6] disabled:opacity-40 focus-ring-teal cursor-pointer disabled:cursor-not-allowed"
              title="Halaman Sebelumnya"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 border rounded text-[13.5px] font-medium focus-ring-teal cursor-pointer transition-colors ${
                    isActive
                      ? 'border-[#006a61] bg-[#86f2e4] text-[#006f66] font-bold'
                      : 'border-[#c6c6cd] text-[#191c1e] hover:bg-[#f2f4f6]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              id="btn-next-page"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 border border-[#c6c6cd] rounded text-[#45464d] hover:bg-[#f2f4f6] disabled:opacity-40 focus-ring-teal cursor-pointer disabled:cursor-not-allowed"
              title="Halaman Selanjutnya"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
