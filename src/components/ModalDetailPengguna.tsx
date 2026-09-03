import React from 'react';
import { DataPengguna } from '../types';

interface ModalDetailPenggunaProps {
  isOpen: boolean;
  onClose: () => void;
  pengguna: DataPengguna | null;
  onEdit: (pengguna: DataPengguna) => void;
}

export const ModalDetailPengguna: React.FC<ModalDetailPenggunaProps> = ({
  isOpen,
  onClose,
  pengguna,
  onEdit,
}) => {
  if (!isOpen || !pengguna) return null;

  const getInitials = (name: string) => {
    return name
      .replace(/^(Drs\.|Dr\.|H\.|Hj\.|Ustadz)\s+/gi, '')
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-[#eceef0]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#86f2e4] text-[#006f66] flex items-center justify-center font-black text-base border-2 border-[#006a61]/20">
              {getInitials(pengguna.nama)}
            </div>
            <div>
              <h3 className="font-bold text-black text-base leading-tight">
                {pengguna.nama}
              </h3>
              <p className="text-xs text-[#006a61] font-semibold mt-0.5">
                {pengguna.jabatan}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#76777d] hover:text-black font-bold p-1 rounded-md cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Details Grid */}
        <div className="py-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-[#f7f9fb] p-3 rounded-lg border border-[#c6c6cd]/50">
            <div>
              <span className="text-[11px] font-bold text-[#45464d] uppercase block">
                NIP / NUPTK
              </span>
              <span className="font-semibold text-black">{pengguna.nip || '-'}</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#45464d] uppercase block">
                Kelas Diampu
              </span>
              <span className="font-bold text-[#006f66] bg-[#86f2e4]/30 px-2 py-0.5 rounded inline-block">
                {pengguna.kelas}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#45464d] uppercase block">
                Status Kepegawaian
              </span>
              <span className="font-semibold text-black">
                {pengguna.statusKepegawaian}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#45464d] uppercase block">
                Jenis Kelamin
              </span>
              <span className="font-semibold text-black">
                {pengguna.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#45464d] uppercase block">
                Status Keaktifan
              </span>
              <span
                className={`inline-flex items-center gap-1 font-bold ${
                  pengguna.statusAktif ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    pengguna.statusAktif ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                {pengguna.statusAktif ? 'Aktif Bertugas' : 'Non-Aktif'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#45464d] uppercase block">
                Instansi Tugas
              </span>
              <span className="font-semibold text-black">SDN 01 Harapan</span>
            </div>
          </div>

          {/* Contact Section */}
          <div className="border border-[#c6c6cd]/60 p-3 rounded-lg bg-white space-y-2">
            <h4 className="font-bold text-xs text-[#006f66] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">call</span>
              Informasi Kontak & Komunikasi
            </h4>
            <div className="space-y-1 text-black">
              <div className="flex justify-between items-center">
                <span className="text-[#45464d]">No. Telepon / WA:</span>
                <span className="font-semibold">{pengguna.telepon || '-'}</span>
              </div>
              {pengguna.email && (
                <div className="flex justify-between items-center">
                  <span className="text-[#45464d]">Email:</span>
                  <span className="font-medium text-[#006a61]">{pengguna.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-[#eceef0]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(pengguna);
            }}
            className="px-4 py-2 bg-[#f2f4f6] text-black rounded-lg text-xs font-bold hover:bg-[#e6e8ea] flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Edit Data
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#006a61] text-white rounded-lg text-xs font-bold hover:bg-[#006a61]/90 cursor-pointer shadow-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
