import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
} catch (e) {
  console.warn('PDF.js worker setup notice:', e);
}

interface PdfCanvasViewerProps {
  dataUrl?: string;
  blobUrl?: string;
  fileName?: string;
  zoom?: number;
  rotation?: number;
  onDownload?: () => void;
}

export const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({
  dataUrl,
  blobUrl,
  fileName = 'Dokumen.pdf',
  zoom = 100,
  rotation = 0,
  onDownload,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const renderTaskRef = useRef<any>(null);

  // 1. Load PDF Document from dataUrl or blobUrl
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setRenderError(null);
    setCurrentPage(1);

    const loadDoc = async () => {
      try {
        let pdfData: Uint8Array | null = null;

        if (dataUrl && dataUrl.startsWith('data:')) {
          const parts = dataUrl.split(',');
          const base64 = parts[1] || parts[0];
          const binStr = atob(base64);
          const len = binStr.length;
          pdfData = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            pdfData[i] = binStr.charCodeAt(i);
          }
        } else if (blobUrl) {
          const res = await fetch(blobUrl);
          const buf = await res.arrayBuffer();
          pdfData = new Uint8Array(buf);
        }

        if (!pdfData) {
          throw new Error('Data berkas PDF tidak ditemukan.');
        }

        const task = pdfjsLib.getDocument({
          data: pdfData,
          cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/',
          cMapPacked: true,
        });

        const doc = await task.promise;
        if (isCancelled) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err: any) {
        if (isCancelled) return;
        console.warn('PDF.js parse error:', err);
        setRenderError(err?.message || 'Gagal memproses berkas PDF');
        setLoading(false);
      }
    };

    loadDoc();

    return () => {
      isCancelled = true;
    };
  }, [dataUrl, blobUrl]);

  // 2. Render Current Page onto Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }

        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Container width measurement
        const containerWidth = containerRef.current?.clientWidth || 700;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const baseScale = Math.min((containerWidth - 40) / unscaledViewport.width, 1.8);
        const finalScale = Math.max(0.4, (baseScale * zoom) / 100);

        const viewport = page.getViewport({ scale: finalScale, rotation });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException' && !isCancelled) {
          console.warn('Canvas page render notice:', err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [pdfDoc, currentPage, zoom, rotation]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center justify-between overflow-hidden"
    >
      {/* Top Page Navigation Bar */}
      {numPages > 1 && !loading && !renderError && (
        <div className="shrink-0 mb-2 py-1 px-3 bg-white/90 backdrop-blur-xs rounded-full border border-[#c6c6cd] shadow-xs flex items-center gap-2 z-10 text-xs">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded-full hover:bg-[#f2f4f6] disabled:opacity-30 cursor-pointer"
            title="Halaman Sebelumnya"
          >
            <span className="material-symbols-outlined text-[16px] block">chevron_left</span>
          </button>
          <span className="font-bold text-[#191c1e]">
            Hal {currentPage} dari {numPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= numPages}
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            className="p-1 rounded-full hover:bg-[#f2f4f6] disabled:opacity-30 cursor-pointer"
            title="Halaman Berikutnya"
          >
            <span className="material-symbols-outlined text-[16px] block">chevron_right</span>
          </button>
        </div>
      )}

      {/* Main Canvas / Error Area */}
      <div className="flex-1 w-full overflow-auto flex items-center justify-center p-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="w-9 h-9 border-3 border-[#006a61] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-[#006a61]">Memproses Halaman PDF...</p>
          </div>
        ) : renderError ? (
          <div className="bg-white border border-rose-200 rounded-2xl p-6 max-w-md text-center shadow-lg">
            <span className="material-symbols-outlined text-4xl text-rose-500 mb-2">
              picture_as_pdf
            </span>
            <h4 className="font-bold text-black text-sm mb-1">{fileName}</h4>
            <p className="text-xs text-[#45464d] mb-4">
              Pratinjau canvas tidak dapat merender berkas ini, namun berkas asli siap diunduh dan dibuka langsung di komputer/perangkat Anda.
            </p>
            <div className="flex justify-center gap-2">
              {onDownload && (
                <button
                  type="button"
                  onClick={onDownload}
                  className="px-4 py-2 bg-[#006a61] text-white rounded-lg text-xs font-bold hover:bg-[#006a61]/90 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Unduh Berkas PDF
                </button>
              )}
              {blobUrl && (
                <a
                  href={blobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#f2f4f6] border border-[#c6c6cd] text-black rounded-lg text-xs font-semibold hover:bg-[#e6e8ea] flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  Buka di Tab Baru
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="inline-block rounded-xl overflow-hidden shadow-lg border border-[#c6c6cd] bg-white transition-all">
            <canvas ref={canvasRef} className="block max-w-full" />
          </div>
        )}
      </div>
    </div>
  );
};
