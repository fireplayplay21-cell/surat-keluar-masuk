import React, { useState, useEffect } from 'react';
import { DocumentAttachment } from '../types';
import { getDocumentBlob, downloadDocument } from '../services/documentStorage';

interface ModalDokumenViewerProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: DocumentAttachment | null | undefined;
  title?: string;
  suratNo?: string;
}

export const ModalDokumenViewer: React.FC<ModalDokumenViewerProps> = ({
  isOpen,
  onClose,
  attachment,
  title,
  suratNo,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!isOpen || !attachment) {
      setBlobUrl(null);
      setError(null);
      setZoom(100);
      setRotation(0);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    setZoom(100);
    setRotation(0);

    // If attachment already has a valid blob/object URL or dataUrl
    if (attachment.url && !attachment.url.startsWith('http://') && !attachment.url.startsWith('https://drive.google.com')) {
      setBlobUrl(attachment.url);
      setLoading(false);
      return;
    }

    if (attachment.dataUrl) {
      setBlobUrl(attachment.dataUrl);
      setLoading(false);
      return;
    }

    // Otherwise fetch from Firestore Cloud
    getDocumentBlob(attachment)
      .then((res) => {
        if (!active) return;
        if (res?.url) {
          setBlobUrl(res.url);
        } else if (attachment.driveWebViewLink) {
          // If no local blob but Google Drive link exists
          setBlobUrl(null);
        } else {
          setError('Dokumen tidak dapat dimuat atau telah dihapus dari cloud.');
        }
      })
      .catch((err) => {
        if (!active) return;
        console.warn('Failed to load document blob:', err);
        setError('Gagal memuat dokumen: ' + (err?.message || 'Kesalahan jaringan'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, attachment]);

  if (!isOpen || !attachment) return null;

  const isImage =
    attachment.mimeType?.startsWith('image/') ||
    attachment.fileName?.match(/\.(jpe?g|png|webp|gif|bmp)$/i);

  const isPdf =
    attachment.mimeType?.includes('pdf') ||
    attachment.fileName?.toLowerCase().endsWith('.pdf');

  const handleDownload = async () => {
    try {
      await downloadDocument(attachment);
    } catch (err: any) {
      alert(err?.message || 'Gagal mengunduh berkas');
    }
  };

  const handlePrint = () => {
    if (!blobUrl) return;
    const printWindow = window.open(blobUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-white border-b border-[#eceef0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isPdf
                  ? 'bg-rose-100 text-rose-700'
                  : isImage
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {isPdf ? 'picture_as_pdf' : isImage ? 'image' : 'description'}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-black text-sm sm:text-base truncate max-w-md">
                  {attachment.fileName || 'Dokumen Persuratan'}
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                  Cloud Sekolah
                </span>
              </div>
              <p className="text-xs text-[#45464d] truncate">
                {suratNo ? `Nomor: ${suratNo} • ` : ''}
                {title ? `${title} • ` : ''}
                Ukuran: {attachment.fileSize || 'Dokumen'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isImage && blobUrl && (
              <div className="hidden sm:flex items-center bg-[#f2f4f6] rounded-lg p-0.5 mr-1 border border-[#c6c6cd]">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(50, z - 25))}
                  className="p-1.5 text-[#45464d] hover:text-black hover:bg-white rounded cursor-pointer"
                  title="Perkecil"
                >
                  <span className="material-symbols-outlined text-[18px]">zoom_out</span>
                </button>
                <span className="text-[11px] font-bold px-1.5 text-[#45464d]">{zoom}%</span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(250, z + 25))}
                  className="p-1.5 text-[#45464d] hover:text-black hover:bg-white rounded cursor-pointer"
                  title="Perbesar"
                >
                  <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 text-[#45464d] hover:text-black hover:bg-white rounded cursor-pointer"
                  title="Putar 90°"
                >
                  <span className="material-symbols-outlined text-[18px]">rotate_right</span>
                </button>
              </div>
            )}

            {blobUrl && (
              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-1 text-xs bg-white border border-[#c6c6cd] hover:bg-[#f2f4f6] text-[#45464d] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                title="Cetak Dokumen"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Cetak</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1 text-xs bg-[#006a61] hover:bg-[#006a61]/90 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer shadow-xs transition-colors"
              title="Unduh Berkas Asli"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Unduh</span>
            </button>

            {attachment.driveWebViewLink && (
              <a
                href={attachment.driveWebViewLink}
                target="_blank"
                rel="noreferrer"
                className="hidden md:flex items-center gap-1 text-xs bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold px-2.5 py-1.5 rounded-lg cursor-pointer shadow-xs transition-colors"
                title="Buka Cadangan di Google Drive"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                <span>Drive</span>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#76777d] hover:text-black hover:bg-[#f2f4f6] rounded-lg cursor-pointer ml-1"
              title="Tutup"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-[#191c1e]/5 relative overflow-auto p-4 flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div className="w-10 h-10 border-3 border-[#006a61] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-[#006a61]">
                Memuat dokumen dari cloud sekolah...
              </p>
              <p className="text-xs text-[#76777d]">
                Tanpa perlu login Google Drive
              </p>
            </div>
          ) : error ? (
            <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md text-center shadow-lg">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl">error_outline</span>
              </div>
              <h4 className="font-bold text-black text-sm mb-1">Gagal Membuka Pratinjau</h4>
              <p className="text-xs text-[#45464d] mb-4">{error}</p>
              {attachment.driveWebViewLink ? (
                <a
                  href={attachment.driveWebViewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  Buka Cadangan di Google Drive
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-[#c6c6cd] rounded-lg text-xs font-semibold hover:bg-[#f2f4f6] cursor-pointer"
                >
                  Tutup
                </button>
              )}
            </div>
          ) : isImage && blobUrl ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              <img
                src={blobUrl}
                alt={attachment.fileName}
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease',
                  maxHeight: '100%',
                  maxWidth: '100%',
                }}
                className="object-contain rounded-lg shadow-md border border-[#c6c6cd]/50 bg-white"
              />
            </div>
          ) : isPdf && blobUrl ? (
            <div className="w-full h-full rounded-xl overflow-hidden bg-white shadow-md border border-[#c6c6cd]">
              <object
                data={blobUrl}
                type="application/pdf"
                className="w-full h-full"
              >
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <span className="material-symbols-outlined text-5xl text-rose-600 mb-2">
                    picture_as_pdf
                  </span>
                  <h4 className="font-bold text-black text-base mb-1">Dokumen PDF Terbuka</h4>
                  <p className="text-xs text-[#45464d] max-w-sm mb-4">
                    Browser Anda tidak mendukung pratinjau PDF langsung. Anda dapat membuka atau mengunduhnya di bawah:
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={blobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-[#006a61] text-white rounded-lg text-xs font-bold hover:bg-[#006a61]/90 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      Buka di Tab Baru
                    </a>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="px-4 py-2 border border-[#c6c6cd] rounded-lg text-xs font-bold hover:bg-[#f2f4f6] flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      Unduh PDF
                    </button>
                  </div>
                </div>
              </object>
            </div>
          ) : blobUrl ? (
            <div className="bg-white border border-[#c6c6cd] rounded-2xl p-8 max-w-md text-center shadow-lg">
              <span className="material-symbols-outlined text-5xl text-[#006a61] mb-2">
                insert_drive_file
              </span>
              <h4 className="font-bold text-black text-base mb-1">{attachment.fileName}</h4>
              <p className="text-xs text-[#45464d] mb-4">
                Dokumen jenis ini siap diunduh dan dibuka dengan aplikasi pendukung.
              </p>
              <button
                type="button"
                onClick={handleDownload}
                className="px-5 py-2.5 bg-[#006a61] text-white rounded-lg text-xs font-bold hover:bg-[#006a61]/90 flex items-center gap-1.5 mx-auto"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Unduh Berkas ({attachment.fileSize || 'Unduh'})
              </button>
            </div>
          ) : attachment.driveWebViewLink ? (
            <div className="w-full h-full rounded-xl overflow-hidden bg-white shadow-md border border-[#c6c6cd]">
              <iframe
                src={attachment.driveWebViewLink.replace('/view?usp=sharing', '/preview')}
                title={attachment.fileName}
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="text-center text-[#76777d] py-12">
              <span className="material-symbols-outlined text-4xl mb-2">drafts</span>
              <p className="text-sm">Dokumen tidak dapat ditampilkan.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-[#f7f9fb] border-t border-[#eceef0] flex items-center justify-between text-[11px] text-[#76777d] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Penyimpanan Cloud Sekolah: <strong>{attachment.fileName}</strong>
            </span>
          </div>
          <div>
            Diunggah: {attachment.uploadedAt ? new Date(attachment.uploadedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Baru saja'}
          </div>
        </div>
      </div>
    </div>
  );
};
