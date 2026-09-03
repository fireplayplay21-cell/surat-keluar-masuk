import React, { useState, useEffect, useRef } from 'react';
import {
  SuratMasuk,
  SifatSurat,
  StatusSuratMasuk,
  MasterKlasifikasi,
  MasterInstansi,
  GoogleDriveAttachment,
  AppUser,
} from '../types';
import {
  getDriveAuthStatus,
  connectGoogleDrive,
  uploadFileToGoogleDrive,
  DriveAuthStatus,
} from '../services/googleDrive';

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

  // Attachment & Google Drive states
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [driveAttachment, setDriveAttachment] = useState<GoogleDriveAttachment | undefined>(undefined);
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
      setDriveStatus(getDriveAuthStatus());
      setUploadError(null);
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
      setFileName(editItem.fileLampiran || editItem.driveFileName || '');
      setFileSize(editItem.fileSize || editItem.driveAttachment?.fileSize || '');
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
    const sizeKb = (file.size / 1024).toFixed(1);
    const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${sizeKb} KB`;
    setFileSize(sizeStr);
    setUploadError(null);

    // Auto upload to Google Drive if already connected or attempt upload
    try {
      setIsUploadingDrive(true);
      const attachment = await uploadFileToGoogleDrive(file, {
        noSurat: noAsal || 'SURAT_MASUK',
        noAgenda: noUrut || '001',
        kategori: 'surat_masuk',
        uploaderName: currentUser?.nama || 'Petugas Tata Usaha',
      });
      setDriveAttachment(attachment);
      setDriveStatus(getDriveAuthStatus());
    } catch (err: any) {
      console.warn('Drive upload error:', err);
      setUploadError(err?.message || 'Gagal mengunggah ke Google Drive, file disimpan lokal sementara.');
    } finally {
      setIsUploadingDrive(false);
    }
  };

  const handleManualUploadToDrive = async () => {
    if (!selectedFile) return;
    try {
      setIsUploadingDrive(true);
      setUploadError(null);
      const attachment = await uploadFileToGoogleDrive(selectedFile, {
        noSurat: noAsal || 'SURAT_MASUK',
        noAgenda: noUrut || '001',
        kategori: 'surat_masuk',
        uploaderName: currentUser?.nama || 'Petugas Tata Usaha',
      });
      setDriveAttachment(attachment);
      setDriveStatus(getDriveAuthStatus());
    } catch (err: any) {
      setUploadError(err?.message || 'Gagal mengunggah ke Google Drive.');
    } finally {
      setIsUploadingDrive(false);
    }
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
        fileLampiran: fileName || (editItem?.fileLampiran ?? 'Scan_Surat_Masuk.pdf'),
        fileSize: fileSize || editItem?.fileSize || '1.2 MB',
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

          {/* GOOGLE DRIVE SCAN / PDF ATTACHMENT SECTION */}
          <div className="border border-[#c6c6cd] rounded-xl p-3.5 bg-[#f7f9fb]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#4285F4]/15 flex items-center justify-center text-[#4285F4]">
                  <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-black flex items-center gap-1.5">
                    Simpan Scan PDF / Foto ke Google Drive
                    {driveStatus.isConnected && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Drive Terhubung ({driveStatus.userEmail || 'Google'})
                      </span>
                    )}
                  </h4>
                </div>
              </div>

              {!driveStatus.isConnected && (
                <button
                  type="button"
                  onClick={handleConnectDrive}
                  className="text-xs bg-white border border-[#c6c6cd] hover:border-[#006a61] text-[#006a61] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                >
                  <span className="material-symbols-outlined text-[14px]">link</span>
                  Hubungkan Drive
                </button>
              )}
            </div>

            {uploadError && (
              <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs p-2 rounded-lg mb-2.5 flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-amber-700 mt-0.5">warning</span>
                <div>
                  <p className="font-semibold">{uploadError}</p>
                </div>
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

              {isUploadingDrive ? (
                <div className="py-3 flex flex-col items-center justify-center gap-2">
                  <div className="w-7 h-7 border-3 border-[#006a61] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-[#006a61]">
                    Mengunggah scan surat ke Google Drive...
                  </p>
                  <p className="text-[11px] text-[#76777d]">Membuat tautan pratinjau cloud...</p>
                </div>
              ) : driveAttachment ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <span className="material-symbols-outlined text-[20px]">
                        {driveAttachment.mimeType.includes('image') ? 'image' : 'picture_as_pdf'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-black truncate max-w-xs">
                          {driveAttachment.fileName}
                        </p>
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                          Google Drive
                        </span>
                      </div>
                      <p className="text-[10.5px] text-emerald-800">
                        Ukuran: {driveAttachment.fileSize || fileSize || '-'} • Tersimpan di Cloud
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {driveAttachment.webViewLink && (
                      <a
                        href={driveAttachment.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        Buka di Drive
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-[#45464d] hover:text-black font-semibold px-2 py-1"
                    >
                      Ganti
                    </button>
                  </div>
                </div>
              ) : fileName ? (
                <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg text-left">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-700 text-[20px]">
                      description
                    </span>
                    <div>
                      <p className="text-xs font-bold text-black">{fileName}</p>
                      <p className="text-[10px] text-[#76777d]">{fileSize || 'Dokumen Lokal'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleManualUploadToDrive}
                      className="text-xs bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">cloud_upload</span>
                      Unggah ke Drive
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-[#45464d] hover:text-black font-semibold px-1.5 py-1"
                    >
                      Ganti
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  <span className="material-symbols-outlined text-3xl text-[#006a61] block mb-1">
                    document_scanner
                  </span>
                  <p className="text-xs font-bold text-black">
                    Pilih Berkas Scan PDF atau Foto Surat
                  </p>
                  <p className="text-[11px] text-[#76777d] mt-0.5">
                    Tersimpan otomatis ke Google Drive & database Firebase sekolah
                  </p>

                  <div className="flex justify-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white border border-[#c6c6cd] hover:border-[#006a61] text-black font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#006a61]">
                        folder_open
                      </span>
                      Pilih Dokumen / PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="bg-[#86f2e4]/30 hover:bg-[#86f2e4]/50 text-[#005049] font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                      Ambil Foto / Scan
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
              Sinkronisasi Cloud Aktif
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
                disabled={isUploadingDrive}
                className="px-5 py-2 bg-[#006a61] text-white rounded-lg text-xs font-bold hover:bg-[#006a61]/90 focus-ring-teal cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>{editItem ? 'Simpan Perubahan' : 'Catat Surat Masuk'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
