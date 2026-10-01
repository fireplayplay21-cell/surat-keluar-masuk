import React, { useState, useEffect } from 'react';
import { DocumentAttachment } from '../types';
import { getDocumentBlob, downloadDocument } from '../services/documentStorage';
import { PdfCanvasViewer } from './PdfCanvasViewer';

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
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [resolvedMime, setResolvedMime] = useState<string>('application/pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!isOpen || !attachment) {
      setBlobUrl(null);
      setDataUrl(null);
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

    // Fetch document data using getDocumentBlob (handles memory, indexedDB, firestore, and verified fallbacks)
    getDocumentBlob({
      ...attachment,
      suratNo: suratNo || (attachment as any).suratNo,
      title: title || (attachment as any).title || attachment.fileName,
    })
      .then((res) => {
        if (!active) return;
        if (res && (res.dataUrl || res.url)) {
          setBlobUrl(res.url);
          setDataUrl(res.dataUrl);
          setResolvedMime(res.mimeType);
        } else if (attachment.driveWebViewLink) {
          // If no local blob but Google Drive link exists
          setBlobUrl(null);
          setDataUrl(null);
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
  }, [isOpen, attachment, suratNo, title]);

  if (!isOpen || !attachment) return null;

  const isImage =
    resolvedMime.startsWith('image/') ||
    dataUrl?.startsWith('data:image/') ||
    attachment.mimeType?.startsWith('image/') ||
    !!attachment.fileName?.match(/\.(jpe?g|jfif|png|webp|gif|bmp)$/i);

  const isPdf =
    !isImage &&
    (resolvedMime.includes('pdf') ||
      dataUrl?.startsWith('data:application/pdf') ||
      attachment.mimeType?.includes('pdf') ||
      !!attachment.fileName?.toLowerCase().endsWith('.pdf'));

  const handleDownload = async () => {
    try {
      await downloadDocument(attachment, attachment.fileName);
    } catch (err: any) {
      alert(err?.message || 'Gagal mengunduh berkas');
    }
  };

  const handlePrint = () => {
    const printTarget = blobUrl || dataUrl;
    if (!printTarget) return;

    if (isImage) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${attachment.fileName || 'Dokumen Surat'}</title>
              <style>
                body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <img src="${printTarget}" onload="window.print();window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else {
      const printWindow = window.open(printTarget, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full h-[92vh] flex flex-col shadow-2xl overflow-hidden"
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
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Cloud Sekolah
                </span>
              </div>
              <p className="text-xs text-[#45464d] truncate">
                {suratNo ? `Nomor: ${suratNo} • ` : ''}
                {title ? `${title} • ` : ''}
                Ukuran: {attachment.fileSize || 'Dokumen Terverifikasi'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Zoom & Rotation Controls for Canvas / Image */}
            {(isImage || isPdf) && (blobUrl || dataUrl) && (
              <div className="hidden sm:flex items-center bg-[#f2f4f6] rounded-lg p-0.5 mr-1 border border-[#c6c6cd]">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(40, z - 20))}
                  className="p-1.5 text-[#45464d] hover:text-black hover:bg-white rounded cursor-pointer transition-colors"
                  title="Perkecil (-20%)"
                >
                  <span className="material-symbols-outlined text-[18px]">zoom_out</span>
                </button>
                <span className="text-[11px] font-bold px-1.5 text-[#45464d] min-w-[42px] text-center">
                  {zoom}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(250, z + 20))}
                  className="p-1.5 text-[#45464d] hover:text-black hover:bg-white rounded cursor-pointer transition-colors"
                  title="Perbesar (+20%)"
                >
                  <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 text-[#45464d] hover:text-black hover:bg-white rounded cursor-pointer transition-colors ml-0.5"
                  title="Putar 90 Derajat"
                >
                  <span className="material-symbols-outlined text-[18px]">rotate_right</span>
                </button>
              </div>
            )}

            {(blobUrl || dataUrl) && (
              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-1 text-xs bg-white border border-[#c6c6cd] hover:bg-[#f2f4f6] text-[#45464d] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                title="Cetak Dokumen Ini"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Cetak</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1 text-xs bg-[#006a61] hover:bg-[#006a61]/90 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer shadow-xs transition-colors"
              title="Unduh Berkas Asli ke Perangkat"
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
              title="Tutup (Esc)"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-[#191c1e]/5 relative overflow-auto p-3 sm:p-4 flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div className="w-10 h-10 border-3 border-[#006a61] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-[#006a61]">
                Membuka Dokumen dari Cloud Sekolah...
              </p>
              <p className="text-xs text-[#76777d]">
                Tanpa perlu login akun Google Drive
              </p>
            </div>
          ) : error ? (
            <div className="bg-white border border-rose-200 rounded-2xl p-8 max-w-md text-center shadow-lg">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl">error_outline</span>
              </div>
              <h4 className="font-bold text-black text-sm mb-1">Gagal Membuka Pratinjau</h4>
              <p className="text-xs text-[#45464d] mb-4">{error}</p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 bg-[#006a61] text-white rounded-lg text-xs font-bold hover:bg-[#006a61]/90 flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Coba Unduh Berkas
                </button>
                {attachment.driveWebViewLink && (
                  <a
                    href={attachment.driveWebViewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    Buka di Drive
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-[#c6c6cd] rounded-lg text-xs font-semibold hover:bg-[#f2f4f6] cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : isPdf && (dataUrl || blobUrl) ? (
            /* Dedicated High-Fidelity PDF Canvas Viewer */
            <div className="w-full h-full">
              <PdfCanvasViewer
                dataUrl={dataUrl || undefined}
                blobUrl={blobUrl || undefined}
                fileName={attachment.fileName}
                zoom={zoom}
                rotation={rotation}
                onDownload={handleDownload}
              />
            </div>
          ) : isImage && (dataUrl || blobUrl) ? (
            /* High-Fidelity Image Viewer with Pan & Zoom */
            <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
              <img
                src={dataUrl || blobUrl || ''}
                alt={attachment.fileName}
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease',
                  maxHeight: '100%',
                  maxWidth: '100%',
                }}
                className="object-contain rounded-xl shadow-lg border border-[#c6c6cd]/50 bg-white"
                onError={() => {
                  setError('Format gambar tidak dapat ditampilkan secara langsung.');
                }}
              />
            </div>
          ) : (blobUrl || dataUrl) ? (
            /* Document card for Word / Excel / Generic file */
            <div className="bg-white border border-[#c6c6cd] rounded-2xl p-8 max-w-md text-center shadow-lg">
              <span className="material-symbols-outlined text-5xl text-[#006a61] mb-2 block">
                insert_drive_file
              </span>
              <h4 className="font-bold text-black text-base mb-1">{attachment.fileName}</h4>
              <p className="text-xs text-[#45464d] mb-4">
                Dokumen jenis ini siap diunduh dan dibuka langsung dengan aplikasi pendukung pada komputer atau gawai Anda.
              </p>
              <button
                type="button"
                onClick={handleDownload}
                className="px-5 py-2.5 bg-[#006a61] text-white rounded-lg text-xs font-bold hover:bg-[#006a61]/90 flex items-center gap-1.5 mx-auto cursor-pointer shadow-xs"
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
              <span className="material-symbols-outlined text-4xl mb-2 block">drafts</span>
              <p className="text-sm font-semibold">Dokumen tidak dapat ditampilkan.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-[#f7f9fb] border-t border-[#eceef0] flex items-center justify-between text-[11px] text-[#76777d] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Penyimpanan Cloud Sekolah: <strong>{attachment.fileName || 'Dokumen'}</strong>
            </span>
          </div>
          <div>
            Diunggah:{' '}
            {attachment.uploadedAt
              ? new Date(attachment.uploadedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Baru saja'}
          </div>
        </div>
      </div>
    </div>
  );
};
