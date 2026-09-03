import React, { useState } from 'react';
import { SuratMasuk, SuratKeluar, SchoolProfile } from '../types';
import { LOGO_URL } from './Sidebar';

interface ModalCetakLaporanProps {
  isOpen: boolean;
  onClose: () => void;
  suratMasukList: SuratMasuk[];
  suratKeluarList: SuratKeluar[];
  schoolProfile: SchoolProfile;
}

export const ModalCetakLaporan: React.FC<ModalCetakLaporanProps> = ({
  isOpen,
  onClose,
  suratMasukList,
  suratKeluarList,
  schoolProfile,
}) => {
  const [tipeLaporan, setTipeLaporan] = useState<'masuk' | 'keluar'>('masuk');
  const [filterBulan, setFilterBulan] = useState<string>('all');
  const [filterTahun, setFilterTahun] = useState<string>('2023');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const filteredMasuk = suratMasukList.filter((item) => {
    if (filterTahun && !item.tglTerima.startsWith(filterTahun)) return false;
    if (filterBulan !== 'all') {
      const monthStr = item.tglTerima.split('-')[1];
      if (monthStr !== filterBulan) return false;
    }
    return true;
  });

  const filteredKeluar = suratKeluarList.filter((item) => {
    if (filterTahun && !item.tglSurat.startsWith(filterTahun)) return false;
    if (filterBulan !== 'all') {
      const monthStr = item.tglSurat.split('-')[1];
      if (monthStr !== filterBulan) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 my-8 max-h-[92vh] flex flex-col">
        {/* Controls Bar (No Print) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#eceef0] gap-3 no-print">
          <div>
            <h3 className="font-bold text-black text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006a61]">print</span>
              Cetak Buku Agenda & Rekapitulasi Persuratan
            </h3>
            <p className="text-xs text-[#45464d]">
              Pilih format jenis buku agenda dan periode arsip laporan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#006a61] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#006a61]/90 flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Cetak Dokumen
            </button>
            <button
              onClick={onClose}
              className="text-[#76777d] hover:text-black font-bold p-1 rounded-md"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter Controls (No Print) */}
        <div className="flex flex-wrap gap-3 py-3 border-b border-[#eceef0] no-print text-xs items-center bg-[#f7f9fb] px-3 rounded-lg my-2">
          <div>
            <label className="font-bold text-[#45464d] mr-2">Jenis Buku:</label>
            <select
              value={tipeLaporan}
              onChange={(e) => setTipeLaporan(e.target.value as 'masuk' | 'keluar')}
              className="border border-[#c6c6cd] rounded p-1 bg-white"
            >
              <option value="masuk">Buku Agenda Surat Masuk</option>
              <option value="keluar">Buku Agenda Surat Keluar</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-[#45464d] mr-2">Bulan:</label>
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="border border-[#c6c6cd] rounded p-1 bg-white"
            >
              <option value="all">Semua Bulan</option>
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-[#45464d] mr-2">Tahun:</label>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="border border-[#c6c6cd] rounded p-1 bg-white"
            >
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>

        {/* Printable Report Canvas */}
        <div id="printable-area" className="flex-1 overflow-y-auto pr-1 text-xs space-y-4 pt-2">
          {/* Header Kop */}
          <div className="text-center pb-2 border-b-2 border-black">
            <div className="flex items-center justify-center gap-3">
              <img
                src={LOGO_URL}
                alt="Logo"
                className="w-12 h-12 object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="text-center font-serif">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-black">
                  PEMERINTAH KOTA {schoolProfile.kota.toUpperCase()}
                </h4>
                <h5 className="text-[10px] font-bold uppercase text-black">
                  DINAS PENDIDIKAN DAN KEBUDAYAAN
                </h5>
                <h3 className="text-sm font-black uppercase text-black">
                  {schoolProfile.namaSekolah.toUpperCase()}
                </h3>
                <p className="text-[9px] text-[#191c1e] font-sans">
                  {schoolProfile.alamat} | Telp: {schoolProfile.telepon} | NPSN: {schoolProfile.npsn}
                </p>
              </div>
            </div>
            <div className="h-0.5 bg-black mt-1" />
            <h4 className="text-center font-bold text-sm uppercase tracking-wider mt-2 font-sans underline">
              {tipeLaporan === 'masuk'
                ? 'BUKU AGENDA SURAT MASUK'
                : 'BUKU AGENDA SURAT KELUAR'}
            </h4>
            <p className="text-[10px] text-[#45464d] font-sans mt-0.5">
              Periode: {filterBulan === 'all' ? 'Tahun' : `Bulan ${filterBulan} / Tahun`} {filterTahun}
            </p>
          </div>

          {/* Table Data */}
          {tipeLaporan === 'masuk' ? (
            <table className="w-full text-left border-collapse border border-black text-[10.5px]">
              <thead className="bg-[#f2f4f6] border-b border-black">
                <tr>
                  <th className="p-1.5 border border-black text-center w-8">No</th>
                  <th className="p-1.5 border border-black whitespace-nowrap">No. Urut</th>
                  <th className="p-1.5 border border-black whitespace-nowrap">Tgl Terima</th>
                  <th className="p-1.5 border border-black">Surat Dari / Asal</th>
                  <th className="p-1.5 border border-black">No. & Tgl Asal</th>
                  <th className="p-1.5 border border-black">Isi Ringkas / Perihal</th>
                  <th className="p-1.5 border border-black text-center">Sifat</th>
                  <th className="p-1.5 border border-black">Disposisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {filteredMasuk.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="p-1.5 border border-black text-center">{idx + 1}</td>
                    <td className="p-1.5 border border-black font-semibold">{item.noUrut || item.noAgenda}</td>
                    <td className="p-1.5 border border-black whitespace-nowrap">{item.tglTerimaFormatted}</td>
                    <td className="p-1.5 border border-black">{item.pengirim}</td>
                    <td className="p-1.5 border border-black">
                      <div>{item.noAsal}</div>
                      <div className="text-[9px] text-[#45464d]">{item.tglAsalFormatted}</div>
                    </td>
                    <td className="p-1.5 border border-black">{item.perihal}</td>
                    <td className="p-1.5 border border-black text-center uppercase font-bold text-[9px]">
                      {item.sifat}
                    </td>
                    <td className="p-1.5 border border-black text-[9px]">
                      {item.disposisi?.diteruskanKepada?.join(', ') || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse border border-black text-[10.5px]">
              <thead className="bg-[#f2f4f6] border-b border-black">
                <tr>
                  <th className="p-1.5 border border-black text-center w-8">No</th>
                  <th className="p-1.5 border border-black whitespace-nowrap">No. Urut</th>
                  <th className="p-1.5 border border-black">No. Surat Keluar</th>
                  <th className="p-1.5 border border-black whitespace-nowrap">Tgl Surat</th>
                  <th className="p-1.5 border border-black">Pembuat / Penerbit</th>
                  <th className="p-1.5 border border-black">Tujuan / Penerima</th>
                  <th className="p-1.5 border border-black">Perihal</th>
                  <th className="p-1.5 border border-black">Penandatangan</th>
                  <th className="p-1.5 border border-black text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {filteredKeluar.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="p-1.5 border border-black text-center">{idx + 1}</td>
                    <td className="p-1.5 border border-black font-semibold">{item.noUrut || item.noAgenda}</td>
                    <td className="p-1.5 border border-black">{item.noSurat}</td>
                    <td className="p-1.5 border border-black whitespace-nowrap">{item.tglSuratFormatted}</td>
                    <td className="p-1.5 border border-black font-medium">{item.pembuatSurat || 'Admin Tata Usaha'}</td>
                    <td className="p-1.5 border border-black">{item.tujuan}</td>
                    <td className="p-1.5 border border-black">{item.perihal}</td>
                    <td className="p-1.5 border border-black">{item.penandatangan}</td>
                    <td className="p-1.5 border border-black text-center uppercase font-bold text-[9px]">
                      {item.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Signature Footer */}
          <div className="flex justify-between items-end pt-6 text-xs text-black">
            <div>
              <p>Mengetahui,</p>
              <p className="font-semibold">Kepala Sekolah,</p>
              <div className="h-12" />
              <p className="font-bold underline">{schoolProfile.kepalaSekolah}</p>
              <p className="text-[10px]">NIP. {schoolProfile.nipKepalaSekolah}</p>
            </div>
            <div className="text-right">
              <p>{schoolProfile.kota}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-semibold">Pengelola Persuratan / TU,</p>
              <div className="h-12" />
              <p className="font-bold underline">Budi Santoso, S.AP.</p>
              <p className="text-[10px]">NIP. 19750821 200501 1 008</p>
            </div>
          </div>
        </div>

        {/* Footer (No Print) */}
        <div className="flex justify-end gap-2 pt-4 border-t border-[#eceef0] no-print mt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#c6c6cd] rounded-lg text-xs font-semibold hover:bg-[#f2f4f6]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
