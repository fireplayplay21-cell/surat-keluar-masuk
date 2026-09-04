import React, { useState, useMemo } from 'react';
import { SuratKeluar, SifatSurat, StatusSuratKeluar, AppUser } from '../types';
import { ResponsiveTableWrapper } from './ResponsiveTableWrapper';

interface SuratKeluarViewProps {
  suratList: SuratKeluar[];
  searchQuery: string;
  onAddNew: () => void;
  onEdit: (surat: SuratKeluar) => void;
  onDelete: (id: string) => void;
  onPrintSurat: (surat: SuratKeluar) => void;
  onApproveSurat?: (surat: SuratKeluar) => void;
  currentUser?: AppUser | null;
}

export const SuratKeluarView: React.FC<SuratKeluarViewProps> = ({
  suratList,
  searchQuery,
  onAddNew,
  onEdit,
  onDelete,
  onPrintSurat,
  onApproveSurat,
  currentUser,
}) => {
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSifat, setFilterSifat] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const isKepsek = currentUser?.role === 'kepala_sekolah';

  const canCreate =
    currentUser?.permissions.canCreateSuratKeluar || currentUser?.permissions.canCreateSurat;

  const filteredData = useMemo(() => {
    return suratList.filter((item) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchUrut = (item.noUrut || item.noAgenda || '').toLowerCase().includes(query);
        const matchNoSurat = item.noSurat.toLowerCase().includes(query);
        const matchTujuan = item.tujuan.toLowerCase().includes(query);
        const matchPerihal = item.perihal.toLowerCase().includes(query);
        const matchPembuat = item.pembuatSurat ? item.pembuatSurat.toLowerCase().includes(query) : false;
        if (!matchUrut && !matchNoSurat && !matchTujuan && !matchPerihal && !matchPembuat) {
          return false;
        }
      }

      if (filterStartDate && item.tglSurat < filterStartDate) return false;
      if (filterEndDate && item.tglSurat > filterEndDate) return false;
      if (filterStatus && item.status !== filterStatus) return false;
      if (filterSifat && item.sifat !== filterSifat) return false;

      return true;
    });
  }, [suratList, searchQuery, filterStartDate, filterEndDate, filterStatus, filterSifat]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const renderStatusBadge = (status: StatusSuratKeluar) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#e6e8ea] text-[#191c1e]">
            Draft
          </span>
        );
      case 'disetujui':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#b7c8e1] text-[#38485d]">
            Disetujui Kepsek
          </span>
        );
      case 'terkirim':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#86f2e4] text-[#006f66]">
            Terkirim
          </span>
        );
    }
  };

  const renderSifatBadge = (sifat: SifatSurat) => {
    switch (sifat) {
      case 'penting':
      case 'segera':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#ffdad6] text-[#93000a]">
            {sifat.toUpperCase()}
          </span>
        );
      case 'rahasia':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f3e8ff] text-[#6b21a8] border border-[#d8b4fe]">
            RAHASIA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#e0e3e5] text-[#45464d] border border-[#c6c6cd]">
            BIASA
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-4 md:p-10 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
      {/* Filter Bar */}
      <div className="bg-white border border-[#c6c6cd] rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center flex-wrap">
          {/* Date Range */}
          <div className="flex items-center gap-2 w-full sm:w-auto bg-white">
            <span className="material-symbols-outlined text-[#45464d] text-[20px]">
              calendar_today
            </span>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => {
                setFilterStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-[#c6c6cd] rounded bg-white text-[13.5px] px-2.5 py-1.5 input-focus-glow w-full sm:w-auto text-[#191c1e]"
              title="Tanggal Surat Awal"
            />
            <span className="text-[#45464d] text-sm">-</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => {
                setFilterEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-[#c6c6cd] rounded bg-white text-[13.5px] px-2.5 py-1.5 input-focus-glow w-full sm:w-auto text-[#191c1e]"
              title="Tanggal Surat Akhir"
            />
          </div>

          {/* Sifat Filter */}
          <div className="relative w-full sm:w-auto min-w-[140px]">
            <select
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
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none w-full border border-[#c6c6cd] rounded bg-white text-[13.5px] pl-3 pr-8 py-1.5 input-focus-glow text-[#191c1e] cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="disetujui">Disetujui Kepsek</option>
              <option value="terkirim">Terkirim</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#76777d] text-[20px]">
              arrow_drop_down
            </span>
          </div>
        </div>

        {/* Add Button */}
        {canCreate && (
          <button
            onClick={onAddNew}
            className="w-full md:w-auto bg-[#006a61] hover:bg-[#006a61]/90 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 focus-ring-teal shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>+ Surat Keluar Baru</span>
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs flex-1 flex flex-col">
        <ResponsiveTableWrapper id="surat-keluar-table-scroll" minWidth="min-w-[1150px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f2f4f6] border-b border-[#c6c6cd] sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                  NO. URUT
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                  NO. SURAT RESMI
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                  TGL SURAT
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                  PEMBUAT / PENERBIT
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                  TUJUAN / PENERIMA
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                  PERIHAL
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                  SIFAT
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider">
                  STATUS
                </th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#45464d] uppercase tracking-wider text-center">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c6c6cd]/50 text-[13.5px]">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#76777d]">
                    <span className="material-symbols-outlined text-4xl block mb-2 text-[#c6c6cd]">
                      send
                    </span>
                    <p className="font-medium text-sm">Tidak ada data surat keluar yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                currentItems.map((item, idx) => {
                  const isAuthorCurrent =
                    currentUser &&
                    item.pembuatSurat &&
                    item.pembuatSurat.toLowerCase().includes(currentUser.nama.toLowerCase());

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#f7f9fb] transition-colors ${
                        idx % 2 === 1 ? 'bg-[#f7f9fb]/40' : 'bg-white'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-[#006a61] whitespace-nowrap">
                        <span className="bg-[#86f2e4]/30 px-2 py-0.5 rounded text-xs font-bold">
                          {item.noUrut || item.noAgenda}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-black">
                        {item.noSurat}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#191c1e]">
                        {item.tglSuratFormatted}
                      </td>
                      {/* Pembuat / Penerbit Guru */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#006a61] text-[16px] shrink-0">
                            person_pin
                          </span>
                          <span className="font-semibold text-xs text-black">
                            {item.pembuatSurat || 'Admin Tata Usaha'}
                          </span>
                          {isAuthorCurrent && (
                            <span className="bg-[#86f2e4] text-[#005049] font-black text-[9.5px] px-1.5 py-0.2 rounded-full whitespace-nowrap">
                              Anda
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-black">
                        {item.tujuan}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-[#191c1e]" title={item.perihal}>
                        <div className="font-medium text-black line-clamp-2">{item.perihal}</div>
                        {(item.driveAttachment || item.driveFileId || item.driveWebViewLink) && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-flex items-center gap-1 bg-[#4285F4]/10 text-[#1a73e8] text-[10px] font-bold px-1.5 py-0.2 rounded">
                              <span className="material-symbols-outlined text-[13px]">cloud_done</span>
                              Salinan Drive
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
                                <span>Buka File</span>
                                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                              </a>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">{renderSifatBadge(item.sifat)}</td>
                      <td className="py-3.5 px-4">{renderStatusBadge(item.status)}</td>
                      <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Cetak */}
                        <button
                          onClick={() => onPrintSurat(item)}
                          className="p-1.5 text-[#45464d] hover:text-[#006a61] hover:bg-[#e6e8ea] rounded-lg focus-ring-teal transition-colors cursor-pointer"
                          title="Cetak Salinan Surat Keluar"
                        >
                          <span className="material-symbols-outlined text-[19px]">print</span>
                        </button>

                        {/* Kepsek Quick Approval */}
                        {isKepsek && item.status === 'draft' && onApproveSurat && (
                          <button
                            onClick={() => onApproveSurat(item)}
                            className="px-2.5 py-1 bg-[#86f2e4] text-[#005049] hover:bg-[#86f2e4]/80 rounded-lg text-xs font-bold focus-ring-teal transition-colors cursor-pointer flex items-center gap-1"
                            title="Setujui dan Sahkan Surat Keluar"
                          >
                            <span className="material-symbols-outlined text-[15px]">done_all</span>
                            <span>Setujui</span>
                          </button>
                        )}

                        {/* Edit */}
                        {currentUser?.permissions.canEditSurat && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-[#45464d] hover:text-[#006a61] hover:bg-[#e6e8ea] rounded-lg focus-ring-teal transition-colors cursor-pointer"
                            title="Edit Surat Keluar"
                          >
                            <span className="material-symbols-outlined text-[19px]">edit</span>
                          </button>
                        )}

                        {/* Delete */}
                        {currentUser?.permissions.canDeleteSurat && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus surat keluar "${item.noSurat}"?`)) {
                                onDelete(item.id);
                              }
                            }}
                            className="p-1.5 text-[#45464d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded-lg focus-ring-teal transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <span className="material-symbols-outlined text-[19px]">delete</span>
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

        {/* Pagination */}
        <div className="bg-white border-t border-[#c6c6cd] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto">
          <div className="text-[13.5px] text-[#45464d]">
            Menampilkan {filteredData.length > 0 ? startIndex + 1 : 0} hingga{' '}
            {Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} data
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 border border-[#c6c6cd] rounded text-[#45464d] hover:bg-[#f2f4f6] disabled:opacity-40 focus-ring-teal cursor-pointer disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 border rounded text-[13.5px] font-medium focus-ring-teal cursor-pointer transition-colors ${
                  pageNum === currentPage
                    ? 'border-[#006a61] bg-[#86f2e4] text-[#006f66] font-bold'
                    : 'border-[#c6c6cd] text-[#191c1e] hover:bg-[#f2f4f6]'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 border border-[#c6c6cd] rounded text-[#45464d] hover:bg-[#f2f4f6] disabled:opacity-40 focus-ring-teal cursor-pointer disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
