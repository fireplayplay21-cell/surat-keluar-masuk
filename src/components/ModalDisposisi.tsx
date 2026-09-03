import React, { useState, useEffect } from 'react';
import { SuratMasuk, MasterPejabat, SchoolProfile, AppUser } from '../types';
import { INSTRUCTION_OPTIONS } from '../data/initialData';
import { LOGO_URL } from './Sidebar';

interface ModalDisposisiProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratMasuk | null;
  pejabatList: MasterPejabat[];
  schoolProfile: SchoolProfile;
  onSaveDisposisi: (suratId: string, disposisiData: NonNullable<SuratMasuk['disposisi']>) => void;
  currentUser?: AppUser | null;
}

export const ModalDisposisi: React.FC<ModalDisposisiProps> = ({
  isOpen,
  onClose,
  surat,
  pejabatList,
  schoolProfile,
  onSaveDisposisi,
  currentUser,
}) => {
  const [selectedPejabat, setSelectedPejabat] = useState<string[]>([]);
  const [selectedInstruksi, setSelectedInstruksi] = useState<string[]>([]);
  const [catatanKepsek, setCatatanKepsek] = useState('');
  const [catatanTindakLanjut, setCatatanTindakLanjut] = useState('');
  const [tglDisposisi, setTglDisposisi] = useState('');

  const isGuru = currentUser?.role === 'guru';
  const isKepsek = currentUser?.role === 'kepala_sekolah';

  useEffect(() => {
    if (surat) {
      if (surat.disposisi) {
        setSelectedPejabat(surat.disposisi.diteruskanKepada || []);
        setSelectedInstruksi(surat.disposisi.instruksi || []);
        setCatatanKepsek(surat.disposisi.catatanKepalaSekolah || '');
        setCatatanTindakLanjut(surat.disposisi.catatanTindakLanjut || '');
        setTglDisposisi(surat.disposisi.tglDisposisi || new Date().toISOString().split('T')[0]);
      } else {
        setSelectedPejabat([]);
        setSelectedInstruksi(['Tindak lanjuti segera']);
        setCatatanKepsek('');
        setCatatanTindakLanjut('');
        setTglDisposisi(new Date().toISOString().split('T')[0]);
      }
    }
  }, [surat, isOpen]);

  if (!isOpen || !surat) return null;

  const togglePejabat = (namaOrJabatan: string) => {
    if (isGuru) return; // Teachers cannot reassign disposition targets
    setSelectedPejabat((prev) =>
      prev.includes(namaOrJabatan)
        ? prev.filter((p) => p !== namaOrJabatan)
        : [...prev, namaOrJabatan]
    );
  };

  const toggleInstruksi = (item: string) => {
    if (isGuru) return; // Teachers cannot change principal's instructions
    setSelectedInstruksi((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSave = () => {
    onSaveDisposisi(surat.id, {
      tglDisposisi: tglDisposisi || new Date().toISOString().split('T')[0],
      diteruskanKepada: selectedPejabat,
      instruksi: selectedInstruksi,
      catatanKepalaSekolah: catatanKepsek,
      catatanTindakLanjut,
    });
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 my-8 max-h-[92vh] flex flex-col">
        {/* Header Controls (No Print) */}
        <div className="flex justify-between items-center pb-3 border-b border-[#eceef0] mb-4 no-print">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#86f2e4] flex items-center justify-center text-[#006f66]">
              <span className="material-symbols-outlined text-[20px]">assignment</span>
            </div>
            <div>
              <h3 className="font-bold text-black text-base">Lembar Disposisi Kepala Sekolah</h3>
              <p className="text-xs text-[#45464d]">No. Agenda: {surat.noAgenda}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-[#006a61] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#006a61]/90 flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Cetak Lembar
            </button>
            <button
              onClick={onClose}
              className="text-[#76777d] hover:text-black font-bold p-1 rounded-md"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Disposisi Area */}
        <div id="printable-area" className="flex-1 overflow-y-auto pr-1 text-sm space-y-4">
          {/* Kop Surat */}
          <div className="text-center pb-3 border-b-2 border-black">
            <div className="flex items-center justify-center gap-4">
              <img
                src={LOGO_URL}
                alt="Logo Sekolah"
                className="w-14 h-14 object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="text-center font-serif">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                  PEMERINTAH KOTA {schoolProfile.kota.toUpperCase()}
                </h4>
                <h5 className="text-[11px] font-bold uppercase text-black">
                  DINAS PENDIDIKAN DAN KEBUDAYAAN
                </h5>
                <h3 className="text-base font-black uppercase text-black tracking-tight">
                  {schoolProfile.namaSekolah.toUpperCase()}
                </h3>
                <p className="text-[10px] text-[#191c1e] font-sans">
                  {schoolProfile.alamat}, {schoolProfile.kota} | Telp: {schoolProfile.telepon} | Email: {schoolProfile.email}
                </p>
              </div>
            </div>
            <div className="h-0.5 bg-black mt-1" />
            <h4 className="text-center font-bold text-sm uppercase tracking-widest mt-2 underline font-sans">
              LEMBAR DISPOSISI
            </h4>
          </div>

          {/* Letter Metadata Grid */}
          <div className="border border-black grid grid-cols-2 text-xs">
            <div className="p-2 border-r border-b border-black">
              <span className="font-semibold text-black">Surat Dari:</span>{' '}
              <span className="text-black">{surat.pengirim}</span>
            </div>
            <div className="p-2 border-b border-black">
              <span className="font-semibold text-black">No. Urut:</span>{' '}
              <span className="font-bold text-black">{surat.noUrut || surat.noAgenda}</span>
            </div>
            <div className="p-2 border-r border-b border-black">
              <span className="font-semibold text-black">No. Surat Asal:</span>{' '}
              <span className="text-black">{surat.noAsal}</span>
            </div>
            <div className="p-2 border-b border-black">
              <span className="font-semibold text-black">Tgl Diterima:</span>{' '}
              <span className="text-black">{surat.tglTerimaFormatted}</span>
            </div>
            <div className="p-2 border-r border-b border-black">
              <span className="font-semibold text-black">Tgl Surat:</span>{' '}
              <span className="text-black">{surat.tglAsalFormatted}</span>
            </div>
            <div className="p-2 border-b border-black">
              <span className="font-semibold text-black">Sifat Surat:</span>{' '}
              <span className="font-bold text-black uppercase">[{surat.sifat}]</span>
            </div>
            <div className="col-span-2 p-2 border-black bg-[#f7f9fb]/40">
              <span className="font-semibold text-black">Perihal:</span>{' '}
              <span className="font-medium text-black">{surat.perihal}</span>
            </div>
          </div>

          {/* Disposition Routing: Diteruskan Kepada */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Diteruskan Kepada Yth:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-black p-3 rounded-xs bg-white text-xs">
              {pejabatList.map((pj) => {
                const isChecked = selectedPejabat.includes(pj.jabatan) || selectedPejabat.includes(pj.nama);
                return (
                  <label key={pj.id} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePejabat(pj.jabatan)}
                      className="rounded border-black text-[#006a61] focus:ring-0 cursor-pointer"
                    />
                    <span className={isChecked ? 'font-bold text-black' : 'text-[#45464d]'}>
                      {pj.jabatan}
                    </span>
                  </label>
                );
              })}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedPejabat.includes('Semua Dewan Guru')}
                  onChange={() => togglePejabat('Semua Dewan Guru')}
                  className="rounded border-black text-[#006a61] focus:ring-0 cursor-pointer"
                />
                <span className={selectedPejabat.includes('Semua Dewan Guru') ? 'font-bold text-black' : 'text-[#45464d]'}>
                  Semua Dewan Guru
                </span>
              </label>
            </div>
          </div>

          {/* Disposition Instructions */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Petunjuk / Instruksi Kepala Sekolah:
            </label>
            <div className="grid grid-cols-2 gap-2 border border-black p-3 rounded-xs bg-white text-xs">
              {INSTRUCTION_OPTIONS.map((instruksi) => {
                const isChecked = selectedInstruksi.includes(instruksi);
                return (
                  <label key={instruksi} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleInstruksi(instruksi)}
                      className="rounded border-black text-[#006a61] focus:ring-0 cursor-pointer"
                    />
                    <span className={isChecked ? 'font-bold text-black' : 'text-[#45464d]'}>
                      {instruksi}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Notes / Special Instructions */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Catatan Khusus Kepala Sekolah:
            </label>
            <textarea
              value={catatanKepsek}
              onChange={(e) => setCatatanKepsek(e.target.value)}
              rows={3}
              disabled={isGuru}
              placeholder={isGuru ? "(Hanya dapat diisi oleh Kepala Sekolah)" : "Tuliskan instruksi arahan langsung dari Kepala Sekolah..."}
              className={`w-full border border-black rounded-xs p-2 text-xs font-medium input-focus-glow ${
                isGuru ? 'bg-[#f2f4f6] text-[#45464d] cursor-not-allowed' : 'bg-white'
              }`}
            />
          </div>

          {/* Teacher Follow Up / Catatan Tindak Lanjut */}
          <div className="bg-[#86f2e4]/10 border border-[#006a61]/30 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#005049] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">task_alt</span>
                Catatan & Laporan Tindak Lanjut Guru / Penerima Disposisi:
              </label>
              {isGuru && (
                <span className="text-[10px] bg-[#86f2e4] text-[#005049] font-bold px-1.5 py-0.5 rounded">
                  Anda ({currentUser?.nama})
                </span>
              )}
            </div>
            <textarea
              value={catatanTindakLanjut}
              onChange={(e) => setCatatanTindakLanjut(e.target.value)}
              rows={2}
              placeholder="Contoh: Telah diumumkan kepada seluruh siswa kelas IX pada rapat wali kelas tanggal 24 Okt 2025..."
              className="w-full border border-[#006a61]/40 rounded p-2 text-xs font-medium bg-white input-focus-glow"
            />
          </div>

          {/* Signature & Date Area */}
          <div className="flex justify-between items-end pt-2 text-xs">
            <div className="w-1/2">
              <label className="block font-bold text-black mb-1 no-print">Tgl Disposisi:</label>
              <input
                type="date"
                value={tglDisposisi}
                onChange={(e) => setTglDisposisi(e.target.value)}
                className="border border-black p-1 text-xs rounded-xs no-print"
              />
              <p className="hidden print:block text-black">
                Tanggal: {tglDisposisi}
              </p>
            </div>
            <div className="text-right w-1/2 text-black">
              <p>{schoolProfile.kota}, {tglDisposisi}</p>
              <p className="font-semibold">Kepala Sekolah,</p>
              <div className="h-12 flex items-center justify-end">
                <span className="text-[10px] text-[#76777d] italic no-print">[ Tanda Tangan ]</span>
              </div>
              <p className="font-bold underline text-black">{schoolProfile.kepalaSekolah}</p>
              <p className="text-[11px]">NIP. {schoolProfile.nipKepalaSekolah}</p>
            </div>
          </div>
        </div>

        {/* Action Footer (No Print) */}
        <div className="flex justify-between items-center pt-4 border-t border-[#eceef0] no-print mt-3">
          <span className="text-xs text-[#45464d]">
            Disposisi otomatis memperbarui status menjadi <strong>Diproses</strong>.
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#c6c6cd] rounded-lg text-xs font-semibold hover:bg-[#f2f4f6] cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-[#006a61] text-white rounded-lg text-xs font-bold hover:bg-[#006a61]/90 focus-ring-teal cursor-pointer shadow-xs"
            >
              Simpan Disposisi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
