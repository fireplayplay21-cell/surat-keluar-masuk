import React, { useState, useEffect, useRef } from 'react';
import {
  SuratMasuk,
  SifatSurat,
  StatusSuratMasuk,
  MasterKlasifikasi,
  MasterInstansi,
  GoogleDriveAttachment,
  DocumentAttachment,
  AppUser,
} from '../types';
import {
  getDriveAuthStatus,
  connectGoogleDrive,
  subscribeToDriveAuthStatus,
  DriveAuthStatus,
} from '../services/googleDrive';
import {
  uploadDocument,
  downloadDocument,
} from '../services/documentStorage';
import { ModalDokumenViewer } from './ModalDokumenViewer';

interface ModalSuratMasukProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<SuratMasuk, 'id'>, editId?: string) => void;
  editItem?: SuratMasuk | null;
  klasifikasiList: MasterKlasifikasi[];
  instansiList: MasterInstansi[];
  nextNoUrut?: string;
  nextAgendaNumber?: string;
  currentUser?: AppUser | null;
}

export const ModalSuratMasuk: React.FC<ModalSuratMasukProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
  klasifikasiList,
  instansiList,
  nextNoUrut,
  nextAgendaNumber,
  currentUser,
}) => {
  const [noUrut, setNoUrut] = useState('');
  const [tglTerima, setTglTerima] = useState('');
  const [noAsal, setNoAsal] = useState('');
  const [tglAsal, setTglAsal] = useState('');
  const [pengirim, setPengirim] = useState('');
  const [perihal, setPerihal] = useState('');
  const [sifat, setSifat] = useState<SifatSurat>('biasa');
  const [status, setStatus] = useState<StatusSuratMasuk>('belum');
  const [kodeKlasifikasi, setKodeKlasifikasi] = useState('');
  const [ringkasan, setRingkasan] = useState('');

  // Document Attachment states (Direct App Cloud Storage)
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileAttachment, setFileAttachment] = useState<DocumentAttachment | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [driveAttachment, setDriveAttachment] = useState<GoogleDriveAttachment | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [driveStatus, setDriveStatus] = useState<DriveAuthStatus>({
    isConnected: false,
    userEmail: null,
    userName: null,
    expiresAt: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUploadError(null);
      setUploadSuccessMsg(null);
      const unsubscribe = subscribeToDriveAuthStatus((status) => {
        setDriveStatus(status);
      });
      return () => unsubscribe();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editItem) {
      setNoUrut(editItem.noUrut || editItem.noAgenda || '');
      setTglTerima(editItem.tglTerima);
      setNoAsal(editItem.noAsal);
      setTglAsal(editItem.tglAsal);
      setPengirim(editItem.pengirim);
      setPerihal(editItem.perihal);
      setSifat(editItem.sifat);
      setStatus(editItem.status);
      setKodeKlasifikasi(editItem.kodeKlasifikasi || '');
      setRingkasan(editItem.ringkasan || '');
      setFileName(editItem.fileLampiran || editItem.fileAttachment?.fileName || editItem.driveFileName || '');
      setFileSize(editItem.fileSize || editItem.fileAttachment?.fileSize || editItem.driveAttachment?.fileSize || '');
      setFileAttachment(
        editItem.fileAttachment ||
          (editItem.fileLampiran
            ? {
                fileId: editItem.driveFileId || `legacy-${editItem.id}`,
                fileName: editItem.fileLampiran,
                fileSize: editItem.fileSize || '1.2 MB',
                mimeType: editItem.fileLampiran.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
                driveWebViewLink: editItem.driveWebViewLink,
                driveThumbnailLink: editItem.driveThumbnailLink,
                uploadedAt: editItem.tglTerima,
              }
            : undefined)
      );
      setDriveAttachment(
        editItem.driveAttachment ||
          (editItem.driveFileId
            ? {
                fileId: editItem.driveFileId,
                fileName: editItem.driveFileName || editItem.fileLampiran || 'Scan_Surat.pdf',
                mimeType: 'application/pdf',
                webViewLink: editItem.driveWebViewLink,
                thumbnailLink: editItem.driveThumbnailLink,
              }
            : undefined)
      );
      setSelectedFile(null);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setNoUrut(nextNoUrut || nextAgendaNumber || '001');
      setTglTerima(today);
      setNoAsal('');
      setTglAsal(today);
      setPengirim('');
      setPerihal('');
      setSifat('biasa');
      setStatus('belum');
      setKodeKlasifikasi('421');
      setRingkasan('');
      setFileName('');
      setFileSize('');
      setSelectedFile(null);
      setFileAttachment(undefined);
      setDriveAttachment(undefined);
    }
  }, [editItem, nextNoUrut, nextAgendaNumber, isOpen]);

  if (!isOpen) return null;

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const month = months[parseInt(parts[1], 10) - 1] || parts[1];
    const day = parts[2];
    return `${day} ${month} ${year}`;
  };

  const handleConnectDrive = async () => {
    try {
      setUploadError(null);
      await connectGoogleDrive();
      setDriveStatus(getDriveAuthStatus());
    } catch (err: any) {
      setUploadError(err?.message || 'Gagal menghubungkan Google Drive.');
    }
  };

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
    setUploadError(null);
    setUploadSuccessMsg(null);

    try {
      setIsUploading(true);
      // Directly upload to school app cloud storage (Firestore) without requiring Google Drive!
      const attachment = await uploadDocument(file, {
        noSurat: noAsal || 'SURAT_MASUK',
        noUrut: noUrut || '001',
        category: 'surat_masuk',
        uploaderName: currentUser?.nama || 'Petugas Tata Usaha',
        backupToGoogleDriveIfConnected: driveStatus.isConnected,
      });

      setFileAttachment(attachment);
      setFileSize(attachment.fileSize);

      if (attachment.driveFileId) {
        setDriveAttachment({
          fileId: attachment.driveFileId,
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          fileSize: attachment.fileSize,
          webViewLink: attachment.driveWebViewLink,
          thumbnailLink: attachment.driveThumbnailLink,
        });
      }

      setUploadSuccessMsg('Dokumen berhasil disimpan ke Cloud Sekolah! Dapat diakses dari semua perangkat.');
    } catch (err: any) {
      console.error('Document upload error:', err);
      setUploadError(err?.message || 'Gagal menyimpan dokumen ke cloud. Silakan coba kembali.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileName('');
    setFileSize('');
    setFileAttachment(undefined);
    setDriveAttachment(undefined);
    setUploadSuccessMsg(null);
    setUploadError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noUrut || !tglTerima || !noAsal || !pengirim || !perihal) {
      alert('Mohon lengkapi semua kolom wajib.');
      return;
    }

    onSave(
      {
        noUrut,
        noAgenda: noUrut, // tetap simpan untuk kompatibilitas data lama
        tglTerima,
        tglTerimaFormatted: formatDateIndo(tglTerima),
        noAsal,
        tglAsal,
        tglAsalFormatted: formatDateIndo(tglAsal),
        pengirim,
        perihal,
        sifat,
        status,
        kodeKlasifikasi,
        ringkasan,
        fileLampiran: fileName || fileAttachment?.fileName || (editItem?.fileLampiran ?? ''),
        fileSize: fileSize || fileAttachment?.fileSize || editItem?.fileSize || '',
        fileAttachment: fileAttachment || editItem?.fileAttachment,
        driveAttachment: driveAttachment || editItem?.driveAttachment,
        driveFileId: driveAttachment?.fileId || editItem?.driveFileId,
        driveWebViewLink: driveAttachment?.webViewLink || editItem?.driveWebViewLink,
        driveThumbnailLink: driveAttachment?.thumbnailLink || editItem?.driveThumbnailLink,
        driveFileName: driveAttachment?.fileName || editItem?.driveFileName || fileName,
        disposisi: editItem?.disposisi,
      },
      editItem?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 my-8 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#eceef0] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#86f2e4]/30 flex items-center justify-center text-[#006f66] font-bold">
              <span className="material-symbols-outlined text-[20px]">inbox</span>
            </div>
            <div>
              <h3 className="font-extrabold text-black text-base">
                {editItem ? 'Edit Data Surat Masuk' : 'Pendaftaran Surat Masuk Baru'}
              </h3>
              <p className="text-[11px] text-[#45464d]">
                Registrasi persuratan sekolah & sinkronisasi otomatis ke Firebase & Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#76777d] hover:text-black font-bold p-1.5 rounded-lg hover:bg-[#f2f4f6] cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm overflow-y-auto pr-1">
          {/* Row 1: No Urut & Tgl Terima */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Nomor Urut Surat Masuk <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={noUrut}
                onChange={(e) => setNoUrut(e.target.value)}
                placeholder="001"
                className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs font-bold text-[#006a61] input-focus-glow"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Tanggal Diterima TU <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tglTerima}
                onChange={(e) => setTglTerima(e.target.value)}
                className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs input-focus-glow"
              />
            </div>
          </div>

          {/* Row 2: No Asal & Tgl Asal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Nomor Surat Asal / Pengirim <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={noAsal}
                onChange={(e) => setNoAsal(e.target.value)}
                placeholder="421/089/Disdik"
                className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs font-semibold input-focus-glow"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Tanggal Surat Asal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tglAsal}
                onChange={(e) => setTglAsal(e.target.value)}
                className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs input-focus-glow"
              />
            </div>
          </div>

          {/* Row 3: Pengirim & Klasifikasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Instansi Pengirim <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  list="instansi-suggestions"
                  value={pengirim}
                  onChange={(e) => setPengirim(e.target.value)}
                  placeholder="e.g. Dinas Pendidikan Kota"
                  className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs input-focus-glow font-medium"
                />
                <datalist id="instansi-suggestions">
                  {instansiList.map((ins) => (
                    <option key={ins.id} value={ins.nama} />
                  ))}
                </datalist>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Kode Klasifikasi Surat
              </label>
              <select
                value={kodeKlasifikasi}
                onChange={(e) => setKodeKlasifikasi(e.target.value)}
                className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs input-focus-glow"
              >
                <option value="">Pilih Klasifikasi</option>
                {klasifikasiList.map((kl) => (
                  <option key={kl.id} value={kl.kode}>
                    {kl.kode} - {kl.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Perihal */}
          <div>
            <label className="block text-xs font-bold text-[#45464d] mb-1">
              Perihal / Isi Ringkas Surat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              placeholder="e.g. Undangan Sosialisasi Kurikulum Merdeka Jenjang SD"
              className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs input-focus-glow font-medium"
            />
          </div>

          {/* Row 5: Sifat & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Sifat Derajat Surat
              </label>
              <select
                value={sifat}
                onChange={(e) => setSifat(e.target.value as SifatSurat)}
                className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs input-focus-glow"
              >
                <option value="biasa">Biasa</option>
                <option value="penting">Penting</option>
                <option value="segera">Segera</option>
                <option value="rahasia">Rahasia</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#45464d] mb-1">
                Status Tindak Lanjut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusSuratMasuk)}
                className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs input-focus-glow"
              >
                <option value="belum">Belum Diproses</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
          </div>

          {/* Ringkasan Lengkap */}
          <div>
            <label className="block text-xs font-bold text-[#45464d] mb-1">
              Catatan Isi / Uraian Detail (Opsional)
            </label>
            <textarea
              value={ringkasan}
              onChange={(e) => setRingkasan(e.target.value)}
              rows={2}
              placeholder="Catatan poin penting surat, tanggal pelaksanaan kegiatan, lokasi..."
              className="w-full border border-[#c6c6cd] rounded-lg p-2 text-xs input-focus-glow"
            />
          </div>

          {/* CLOUD DOCUMENT ATTACHMENT SECTION */}
          <div className="border border-[#c6c6cd] rounded-xl p-3.5 bg-[#f7f9fb]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#006a61]/15 flex items-center justify-center text-[#006a61]">
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-black flex items-center gap-1.5 flex-wrap">
                    <span>Lampiran Scan PDF / Foto Surat</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Cloud Sekolah (Tanpa Perlu Login Google Drive)
                    </span>
                  </h4>
                  <p className="text-[10.5px] text-[#76777d]">
                    Langsung disimpan ke cloud sekolah dan dapat diakses dari semua perangkat
                  </p>
                </div>
              </div>

              {/* Optional Google Drive Indicator */}
              {driveStatus.isConnected ? (
                <span className="bg-[#4285F4]/10 text-[#1a73e8] text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 self-start sm:self-auto shrink-0">
                  <span className="material-symbols-outlined text-[12px]">cloud_done</span>
                  Drive Terhubung (Cadangan Aktif)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectDrive}
                  className="text-[11px] text-[#45464d] hover:text-[#006a61] underline flex items-center gap-1 self-start sm:self-auto shrink-0 cursor-pointer"
                  title="Hubungkan jika ingin membuat cadangan tambahan di Google Drive pribadi"
                >
                  <span className="material-symbols-outlined text-[13px]">link</span>
                  Cadangkan ke Drive (Opsional)
                </button>
              )}
            </div>

            {uploadError && (
              <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs p-2 rounded-lg mb-2.5 flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-amber-700 mt-0.5 shrink-0">warning</span>
                <p className="font-medium">{uploadError}</p>
              </div>
            )}

            {uploadSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-2 rounded-lg mb-2.5 flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 mt-0.5 shrink-0">check_circle</span>
                <p className="font-semibold">{uploadSuccessMsg}</p>
              </div>
            )}

            {/* Dropzone & Picker */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-[#c6c6cd] hover:border-[#006a61] rounded-xl p-4 text-center bg-white transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp,image/jpg,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {isUploading ? (
                <div className="py-4 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-3 border-[#006a61] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-[#006a61]">
                    Menyimpan berkas ke Cloud Dokumen Sekolah...
                  </p>
                  <p className="text-[11px] text-[#76777d]">
                    Mengoptimasi dokumen dan membuat salinan akses antar-perangkat
                  </p>
                </div>
              ) : fileAttachment || fileName ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                      <span className="material-symbols-outlined text-[22px]">
                        {fileAttachment?.mimeType?.startsWith('image/') || fileName.match(/\.(jpe?g|png|webp)$/i)
                          ? 'image'
                          : 'picture_as_pdf'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-bold text-black truncate max-w-xs sm:max-w-sm">
                          {fileAttachment?.fileName || fileName}
                        </p>
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                          Cloud Sekolah
                        </span>
                        {fileAttachment?.driveFileId && (
                          <span className="bg-[#4285F4] text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                            Google Drive
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-emerald-900 mt-0.5">
                        Ukuran: {fileAttachment?.fileSize || fileSize || '1.2 MB'} • Siap Diakses Semua Perangkat
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(true)}
                      className="text-xs bg-[#006a61] hover:bg-[#006a61]/90 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                      title="Lihat Pratinjau Dokumen"
                    >
                      <span className="material-symbols-outlined text-[15px]">visibility</span>
                      <span>Pratinjau</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs bg-white border border-[#c6c6cd] hover:border-black text-[#45464d] hover:text-black font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                      title="Ganti berkas dengan file lain"
                    >
                      Ganti
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Hapus lampiran"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-3">
                  <span className="material-symbols-outlined text-4xl text-[#006a61] block mb-1">
                    document_scanner
                  </span>
                  <p className="text-xs font-bold text-black">
                    Pilih Berkas Scan PDF atau Foto Surat
                  </p>
                  <p className="text-[11px] text-[#76777d] mt-0.5">
                    Langsung terunggah ke Cloud Sekolah tanpa perlu otorisasi Google Drive
                  </p>

                  <div className="flex justify-center gap-2.5 mt-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white border border-[#c6c6cd] hover:border-[#006a61] text-black font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-[#f7f9fb] transition-all"
                    >
                      <span className="material-symbols-outlined text-[17px] text-[#006a61]">
                        folder_open
                      </span>
                      Pilih Dokumen / PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="bg-[#86f2e4]/30 hover:bg-[#86f2e4]/50 text-[#005049] font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <span className="material-symbols-outlined text-[17px]">photo_camera</span>
                      Ambil Foto Scan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#eceef0]">
            <span className="text-[11px] text-[#76777d] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#006a61]">cloud_sync</span>
              Penyimpanan Cloud Sekolah Aktif
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#c6c6cd] rounded-lg text-xs font-semibold hover:bg-[#f2f4f6] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-5 py-2 bg-[#006a61] text-white rounded-lg text-xs font-bold hover:bg-[#006a61]/90 focus-ring-teal cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>{editItem ? 'Simpan Perubahan' : 'Catat Surat Masuk'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Interactive Document Preview Modal */}
      {isPreviewOpen && (
        <ModalDokumenViewer
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          attachment={
            fileAttachment ||
            (fileName
              ? {
                  fileId: `preview-${Date.now()}`,
                  fileName,
                  fileSize: fileSize || 'Dokumen',
                  mimeType: fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
                  driveWebViewLink: driveAttachment?.webViewLink,
                  uploadedAt: new Date().toISOString(),
                }
              : null)
          }
          title={perihal}
          suratNo={noAsal || noUrut}
        />
      )}
    </div>
  );
};
