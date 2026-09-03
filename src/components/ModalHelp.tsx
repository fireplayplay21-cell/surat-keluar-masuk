import React from 'react';

interface ModalHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalHelp: React.FC<ModalHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 my-8 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center pb-3 border-b border-[#eceef0] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#86f2e4] flex items-center justify-center text-[#006f66]">
              <span className="material-symbols-outlined text-[20px]">help</span>
            </div>
            <h3 className="font-bold text-black text-base">
              Petunjuk Penggunaan Sistem Tata Usaha Sekolah
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#76777d] hover:text-black font-bold p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 text-xs text-[#191c1e] pr-1 leading-relaxed">
          <div className="border border-[#c6c6cd] rounded-lg p-3 bg-[#f7f9fb]">
            <h4 className="font-bold text-black text-sm mb-1 flex items-center gap-1.5 text-[#006a61]">
              <span className="material-symbols-outlined text-[17px]">inbox</span>
              1. Alur Pengelolaan Surat Masuk
            </h4>
            <p>
              Setiap surat masuk yang diterima petugas TU dicatat melalui tombol <strong>+ Tambah Data</strong> atau tombol <strong>Tambah Surat Masuk</strong>. Sistem otomatis mengisi nomor agenda berikutnya.
            </p>
          </div>

          <div className="border border-[#c6c6cd] rounded-lg p-3 bg-[#f7f9fb]">
            <h4 className="font-bold text-black text-sm mb-1 flex items-center gap-1.5 text-[#006a61]">
              <span className="material-symbols-outlined text-[17px]">assignment</span>
              2. Pembuatan Lembar Disposisi Kepala Sekolah
            </h4>
            <p>
              Klik ikon lembar tugas (assignment) pada baris surat untuk mencetak atau mencatat instruksi Kepala Sekolah. Anda dapat memilih penerima disposisi (Wakasek, Bendahara, Dewan Guru) serta langsung mencetak fisik lembar disposisi.
            </p>
          </div>

          <div className="border border-[#c6c6cd] rounded-lg p-3 bg-[#f7f9fb]">
            <h4 className="font-bold text-black text-sm mb-1 flex items-center gap-1.5 text-[#006a61]">
              <span className="material-symbols-outlined text-[17px]">send</span>
              3. Pencatatan Surat Keluar
            </h4>
            <p>
              Digunakan untuk pengarsipan surat tugas, surat keterangan aktif siswa, undangan komite, atau balasan surat kedinasan lengkap dengan nomor surat resmi sekolah.
            </p>
          </div>

          <div className="border border-[#c6c6cd] rounded-lg p-3 bg-[#f7f9fb]">
            <h4 className="font-bold text-black text-sm mb-1 flex items-center gap-1.5 text-[#006a61]">
              <span className="material-symbols-outlined text-[17px]">print</span>
              4. Cetak Rekapitulasi & Buku Agenda Resmi
            </h4>
            <p>
              Gunakan tombol <strong>Cetak Laporan</strong> di sidebar untuk mencetak Buku Agenda Surat Masuk / Keluar bulanan maupun tahunan yang siap ditandatangani Kepala Sekolah.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#eceef0] mt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#006a61] text-white rounded-lg text-xs font-bold hover:bg-[#006a61]/90"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
