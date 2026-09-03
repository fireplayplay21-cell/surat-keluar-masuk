import React from 'react';
import { SuratMasuk, StatusSuratMasuk } from '../types';

interface ModalDetailSuratProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratMasuk | null;
  onOpenDisposisi: (surat: SuratMasuk) => void;
  onUpdateStatus: (suratId: string, status: StatusSuratMasuk) => void;
}

export const ModalDetailSurat: React.FC<ModalDetailSuratProps> = ({
  isOpen,
  onClose,
  surat,
  onOpenDisposisi,
  onUpdateStatus,
}) => {
  if (!isOpen || !surat) return null;

  const driveLink = surat.driveAttachment?.webViewLink || surat.driveWebViewLink;
  const isDriveStored = !!(driveLink || surat.driveAttachment || surat.driveFileId);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 my-8 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-[#eceef0] mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#006a61] bg-[#86f2e4]/40 px-2 py-0.5 rounded-md">
                No. Urut: {surat.noUrut || surat.noAgenda}
              </span>
              {isDriveStored && (
                <span className="bg-[#4285F4]/15 text-[#1a73e8] text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">cloud_done</span>
                  Google Drive
                </span>
              )}
            </div>
            <h3 className="font-black text-black text-lg mt-1 leading-snug">{surat.perihal}</h3>
            <p className="text-xs text-[#45464d] mt-0.5">
              Diterima pada {surat.tglTerimaFormatted}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#76777d] hover:text-black font-bold p-1.5 rounded-lg hover:bg-[#f2f4f6] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Details */}
        <div className="space-y-4 text-sm overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#f7f9fb] p-3.5 rounded-xl border border-[#c6c6cd]/50">
            <div>
              <span className="text-[11px] font-bold text-[#45464d] uppercase block">
                No. Asal Surat
              </span>
              <span className="font-bold text-black text-xs">{surat.noAsal}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#45464d] uppercase block">
                Tgl Surat Asal
              </span>
              <span className="font-semibold text-black text-xs">{surat.tglAsalFormatted}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#45464d] uppercase block">
                Sifat Surat
              </span>
              <span className="font-bold uppercase text-black text-xs">[{surat.sifat}]</span>
            </div>
            <div className="col-span-2">
              <span className="text-[11px] font-bold text-[#45464d] uppercase block">
                Instansi Pengirim
              </span>
              <span className="font-bold text-black text-xs">{surat.pengirim}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#45464d] uppercase block">
                Status Saat Ini
              </span>
              <span
                className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${
                  surat.status === 'belum'
                    ? 'bg-[#e6e8ea] text-[#191c1e]'
                    : surat.status === 'diproses'
                    ? 'bg-[#86f2e4] text-[#006f66]'
                    : 'bg-[#b7c8e1] text-[#38485d]'
                }`}
              >
                {surat.status === 'belum'
                  ? 'Belum Diproses'
                  : surat.status === 'diproses'
                  ? 'Diproses'
                  : 'Selesai'}
              </span>
            </div>
          </div>

          {/* Ringkasan */}
          <div>
            <h4 className="font-bold text-xs text-[#45464d] uppercase mb-1">
              Ringkasan & Informasi Isi
            </h4>
            <p className="bg-white border border-[#c6c6cd]/60 p-3 rounded-xl text-xs leading-relaxed text-black">
              {surat.ringkasan || 'Tidak ada catatan ringkasan tambahan.'}
            </p>
          </div>

          {/* Disposisi Info */}
          <div className="border border-[#c6c6cd]/60 p-3.5 rounded-xl bg-[#86f2e4]/10">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-xs text-[#006f66] uppercase flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">assignment</span>
                Status Disposisi Kepala Sekolah
              </h4>
              <button
                onClick={() => onOpenDisposisi(surat)}
                className="text-xs text-[#006a61] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                Buka Lembar Disposisi →
              </button>
            </div>

            {surat.disposisi ? (
              <div className="text-xs space-y-1.5 text-black">
                <p>
                  <strong>Diteruskan Kepada:</strong>{' '}
                  {surat.disposisi.diteruskanKepada?.join(', ') || '-'}
                </p>
                <p>
                  <strong>Instruksi:</strong>{' '}
                  {surat.disposisi.instruksi?.join(', ') || '-'}
                </p>
                {surat.disposisi.catatanKepalaSekolah && (
                  <p className="bg-white p-2.5 rounded-lg border border-[#86f2e4] italic mt-1">
                    "{surat.disposisi.catatanKepalaSekolah}"
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#76777d] italic">
                Surat ini belum dibuatkan lembar disposisi oleh Kepala Sekolah.
              </p>
            )}
          </div>

          {/* File Lampiran & Google Drive Storage */}
          {(surat.fileLampiran || driveLink) && (
            <div className="p-3.5 border border-[#c6c6cd] rounded-xl bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#4285F4]/10 flex items-center justify-center text-[#4285F4]">
                    <span className="material-symbols-outlined text-2xl">
                      {surat.driveAttachment?.mimeType?.includes('image')
                        ? 'image'
                        : 'picture_as_pdf'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-black">
                        {surat.driveAttachment?.fileName ||
                          surat.driveFileName ||
                          surat.fileLampiran}
                      </p>
                      {isDriveStored && (
                        <span className="bg-[#4285F4] text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                          Google Drive
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#76777d]">
                      {surat.driveAttachment?.fileSize || surat.fileSize || 'Dokumen Scan Surat'} •
                      {isDriveStored ? ' Tersimpan di Cloud Drive' : ' Berkas lokal'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {driveLink ? (
                    <a
                      href={driveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs bg-[#006a61] hover:bg-[#006a61]/90 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                      Buka di Drive
                    </a>
                  ) : (
                    <button
                      onClick={() => alert(`Mengunduh berkas: ${surat.fileLampiran}`)}
                      className="text-xs bg-[#f2f4f6] text-black px-3 py-1.5 rounded-lg font-semibold hover:bg-[#e6e8ea] flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">download</span>
                      Unduh File
                    </button>
                  )}
                </div>
              </div>

              {/* In-Modal Drive Preview for Images or PDFs if available */}
              {surat.driveThumbnailLink && (
                <div className="pt-2 border-t border-[#eceef0]">
                  <img
                    src={surat.driveThumbnailLink}
                    alt="Preview scan surat"
                    className="max-h-48 rounded-lg border border-[#c6c6cd] mx-auto object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* Change Status Fast Buttons */}
          <div className="pt-2 border-t border-[#eceef0] flex items-center justify-between">
            <span className="text-xs font-bold text-[#45464d]">Ubah Status Cepat:</span>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateStatus(surat.id, 'belum')}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                  surat.status === 'belum'
                    ? 'bg-[#e6e8ea] text-[#191c1e] ring-2 ring-black'
                    : 'bg-[#f2f4f6] text-[#45464d] hover:bg-[#e6e8ea]'
                }`}
              >
                Belum
              </button>
              <button
                onClick={() => onUpdateStatus(surat.id, 'diproses')}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                  surat.status === 'diproses'
                    ? 'bg-[#86f2e4] text-[#006f66] ring-2 ring-[#006a61]'
                    : 'bg-[#f2f4f6] text-[#45464d] hover:bg-[#e6e8ea]'
                }`}
              >
                Diproses
              </button>
              <button
                onClick={() => onUpdateStatus(surat.id, 'selesai')}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                  surat.status === 'selesai'
                    ? 'bg-[#b7c8e1] text-[#38485d] ring-2 ring-[#38485d]'
                    : 'bg-[#f2f4f6] text-[#45464d] hover:bg-[#e6e8ea]'
                }`}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-[#eceef0] mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-black/85 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
