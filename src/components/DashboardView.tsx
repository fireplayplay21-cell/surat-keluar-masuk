import React from 'react';
import { SuratMasuk, SuratKeluar, TabType, AppUser } from '../types';
import { ROLE_DEFINITIONS } from '../data/authUsers';

interface DashboardViewProps {
  suratMasukList: SuratMasuk[];
  suratKeluarList: SuratKeluar[];
  setActiveTab: (tab: TabType) => void;
  onOpenSuratMasukDetail: (surat: SuratMasuk) => void;
  onAddNewSuratMasuk: () => void;
  onAddNewSuratKeluar: () => void;
  currentUser: AppUser | null;
  onOpenRoleMatrix: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  suratMasukList,
  suratKeluarList,
  setActiveTab,
  onOpenSuratMasukDetail,
  onAddNewSuratMasuk,
  onAddNewSuratKeluar,
  currentUser,
  onOpenRoleMatrix,
}) => {
  const isGuru = currentUser?.role === 'guru';
  const isKepsek = currentUser?.role === 'kepala_sekolah';
  const roleMeta = currentUser ? ROLE_DEFINITIONS[currentUser.role] : null;

  const pendingSurat = suratMasukList.filter((s) => s.status === 'belum');
  const prosesSurat = suratMasukList.filter((s) => s.status === 'diproses');
  const selesaiSurat = suratMasukList.filter((s) => s.status === 'selesai');

  // For teachers: filter letters where user or class or all teachers are in disposisi
  const assignedToTeacher = suratMasukList.filter((s) => {
    if (!currentUser) return false;
    if (!s.disposisi) return false;
    const targets = s.disposisi.diteruskanKepada || [];
    return (
      targets.some((t) => t.toLowerCase().includes(currentUser.nama.toLowerCase())) ||
      (currentUser.kelas && targets.some((t) => t.toLowerCase().includes(currentUser.kelas!.toLowerCase()))) ||
      targets.some((t) => t.toLowerCase().includes('guru') || t.toLowerCase().includes('semua'))
    );
  });

  return (
    <div className="flex-1 p-3 sm:p-4 md:p-8 max-w-[1400px] mx-auto w-full flex flex-col gap-4 sm:gap-6">
      {/* Welcome & Role Banner */}
      <div className="bg-white border border-[#c6c6cd] rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#86f2e4]/40 text-[#006f66] flex items-center justify-center font-black text-lg shrink-0 border border-[#006a61]/20">
            {currentUser?.fotoInitials || 'TU'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-black">
                Selamat Datang, {currentUser?.nama || 'Pengguna'}
              </h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider ${
                  roleMeta?.badgeColor || 'bg-gray-100'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {roleMeta?.icon || 'person'}
                </span>
                {currentUser?.role === 'admin'
                  ? 'Admin Tata Usaha'
                  : currentUser?.role === 'kepala_sekolah'
                  ? 'Kepala Sekolah'
                  : `Dewan Guru (${currentUser?.kelas || 'GTK'})`}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#45464d] mt-1">
              {currentUser?.role === 'admin' &&
                'Anda memiliki wewenang penuh pencatatan agenda surat masuk/keluar, registrasi GTK, dan konfigurasi master data.'}
              {currentUser?.role === 'kepala_sekolah' &&
                'Anda memiliki wewenang pengesahan & penerbitan lembar instruksi/disposisi resmi surat masuk serta persetujuan surat keluar.'}
              {currentUser?.role === 'guru' &&
                'Silakan pantau surat dinas, isi tindak lanjut disposisi, serta buat/terbitkan nomor surat keluar resmi atas nama Anda.'}
            </p>
          </div>
        </div>

        {/* Role contextual actions */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={onOpenRoleMatrix}
            className="bg-[#f2f4f6] text-[#006a61] px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#86f2e4]/30 border border-[#006a61]/20 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[17px]">policy</span>
            <span>Matriks Hak Akses</span>
          </button>

          {currentUser?.permissions.canCreateSurat && (
            <button
              onClick={onAddNewSuratMasuk}
              className="bg-[#006a61] text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#006a61]/90 flex items-center gap-1.5 focus-ring-teal cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[17px]">inbox</span>
              <span>+ Surat Masuk</span>
            </button>
          )}

          {(currentUser?.permissions.canCreateSuratKeluar || currentUser?.permissions.canCreateSurat) && (
            <button
              onClick={onAddNewSuratKeluar}
              className="bg-[#006a61] text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#006a61]/90 flex items-center gap-1.5 focus-ring-teal cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[17px]">send</span>
              <span>+ Surat Keluar</span>
            </button>
          )}

          {isGuru && (
            <button
              onClick={() => setActiveTab('surat-masuk')}
              className="bg-[#38485d] text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#38485d]/90 flex items-center gap-1.5 focus-ring-teal cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[17px]">assignment</span>
              <span>Disposisi Saya ({assignedToTeacher.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Surat Masuk */}
        <div
          onClick={() => setActiveTab('surat-masuk')}
          className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs hover:border-[#006a61] cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#45464d]">
              {isGuru ? 'Surat Terkait / Disposisi' : 'Total Surat Masuk'}
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#86f2e4]/40 flex items-center justify-center text-[#006f66]">
              <span className="material-symbols-outlined text-[20px]">inbox</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-black">
              {isGuru ? assignedToTeacher.length : suratMasukList.length}
            </span>
            <span className="text-xs text-[#006a61] font-semibold">
              {isGuru ? 'Ditujukan ke Anda' : 'Tercatat'}
            </span>
          </div>
          <p className="text-[12px] text-[#76777d] mt-2 group-hover:text-[#006a61] flex items-center gap-1">
            Lihat buku agenda masuk <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </p>
        </div>

        {/* Belum Diproses / Menunggu Disposisi */}
        <div
          onClick={() => setActiveTab('surat-masuk')}
          className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs hover:border-[#ba1a1a] cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#45464d]">
              {isKepsek ? 'Menunggu Disposisi Anda' : 'Belum Diproses'}
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#ffdad6] flex items-center justify-center text-[#93000a]">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#ba1a1a]">{pendingSurat.length}</span>
            <span className="text-xs text-[#93000a] font-semibold">
              {isKepsek ? 'Perlu Arahan' : 'Perlu Disposisi'}
            </span>
          </div>
          <p className="text-[12px] text-[#76777d] mt-2 group-hover:text-[#ba1a1a] flex items-center gap-1">
            Tindak lanjuti segera <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </p>
        </div>

        {/* Sedang Diproses */}
        <div
          onClick={() => setActiveTab('surat-masuk')}
          className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs hover:border-[#006a61] cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#45464d]">
              Sedang Diproses
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#86f2e4] flex items-center justify-center text-[#006f66]">
              <span className="material-symbols-outlined text-[20px]">sync</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-black">{prosesSurat.length}</span>
            <span className="text-xs text-[#006a61] font-semibold">Dalam Pengerjaan</span>
          </div>
          <p className="text-[12px] text-[#76777d] mt-2 group-hover:text-[#006a61] flex items-center gap-1">
            Monitoring progres <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </p>
        </div>

        {/* Total Surat Keluar */}
        <div
          onClick={() => setActiveTab('surat-keluar')}
          className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs hover:border-black cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#45464d]">
              Total Surat Keluar
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#b7c8e1]/50 flex items-center justify-center text-[#38485d]">
              <span className="material-symbols-outlined text-[20px]">send</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-black">{suratKeluarList.length}</span>
            <span className="text-xs text-[#45464d] font-semibold">Terekam</span>
          </div>
          <p className="text-[12px] text-[#76777d] mt-2 group-hover:text-black flex items-center gap-1">
            Buka surat keluar <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Incoming Letters + Quick Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Incoming Letters (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#c6c6cd] flex items-center justify-between bg-[#f2f4f6]">
            <h3 className="font-bold text-black text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006a61] text-[20px]">inbox</span>
              <span>{isGuru ? 'Surat Masuk & Disposisi Terkini' : 'Surat Masuk Terbaru'}</span>
            </h3>
            <button
              onClick={() => setActiveTab('surat-masuk')}
              className="text-xs text-[#006a61] font-bold hover:underline cursor-pointer"
            >
              Lihat Semua →
            </button>
          </div>
          <div className="divide-y divide-[#c6c6cd]/50">
            {suratMasukList.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenSuratMasukDetail(item)}
                className="p-4 hover:bg-[#f7f9fb] transition-colors cursor-pointer flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#006a61] bg-[#86f2e4]/30 px-2 py-0.5 rounded">
                      {item.noUrut || item.noAgenda}
                    </span>
                    <span className="text-xs text-[#76777d]">
                      {item.tglTerimaFormatted}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-black hover:text-[#006a61]">
                    {item.perihal}
                  </h4>
                  <p className="text-xs text-[#45464d]">
                    Dari: <span className="font-medium text-black">{item.pengirim}</span> ({item.noAsal})
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {item.sifat === 'penting' || item.sifat === 'segera' ? (
                    <span className="text-xs px-2 py-0.5 rounded font-medium bg-[#ffdad6] text-[#93000a]">
                      {item.sifat.toUpperCase()}
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded font-medium bg-[#e0e3e5] text-[#45464d]">
                      {item.sifat.toUpperCase()}
                    </span>
                  )}
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      item.status === 'belum'
                        ? 'bg-[#e6e8ea] text-[#191c1e]'
                        : item.status === 'diproses'
                        ? 'bg-[#86f2e4] text-[#006f66]'
                        : 'bg-[#b7c8e1] text-[#38485d]'
                    }`}
                  >
                    {item.status === 'belum'
                      ? 'Belum Diproses'
                      : item.status === 'diproses'
                      ? 'Diproses'
                      : 'Selesai'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Summary & School Info (1 col) */}
        <div className="space-y-6">
          {/* Status Breakdown Card */}
          <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs">
            <h3 className="font-bold text-black text-sm mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006a61] text-[20px]">pie_chart</span>
              Distribusi Status Surat Masuk
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#93000a]">Belum Diproses</span>
                  <span>{pendingSurat.length} dari {suratMasukList.length}</span>
                </div>
                <div className="w-full bg-[#f2f4f6] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#ba1a1a] h-full rounded-full transition-all"
                    style={{
                      width: `${(pendingSurat.length / Math.max(1, suratMasukList.length)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#006f66]">Sedang Diproses</span>
                  <span>{prosesSurat.length} dari {suratMasukList.length}</span>
                </div>
                <div className="w-full bg-[#f2f4f6] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#006a61] h-full rounded-full transition-all"
                    style={{
                      width: `${(prosesSurat.length / Math.max(1, suratMasukList.length)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#38485d]">Selesai Ditindaklanjuti</span>
                  <span>{selesaiSurat.length} dari {suratMasukList.length}</span>
                </div>
                <div className="w-full bg-[#f2f4f6] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#38485d] h-full rounded-full transition-all"
                    style={{
                      width: `${(selesaiSurat.length / Math.max(1, suratMasukList.length)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role Status Callout */}
          <div className="bg-[#86f2e4]/15 border border-[#86f2e4] rounded-xl p-5 text-xs text-[#005049] space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#006f66]">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Hak Akses: {currentUser?.roleLabel}</span>
            </div>
            <p>
              {currentUser?.role === 'admin' &&
                'Status wewenang: Penuh. Anda dapat mencatat dan mengedit seluruh buku agenda serta direktori GTK.'}
              {currentUser?.role === 'kepala_sekolah' &&
                'Status wewenang: Pimpinan. Anda dapat mengesahkan disposisi dan persetujuan surat keluar.'}
              {currentUser?.role === 'guru' &&
                'Status wewenang: Pendidik. Anda dapat melihat surat dinas dan mengisi tindak lanjut instruksi.'}
            </p>
            <div className="pt-2 border-t border-[#86f2e4]/40 flex justify-between items-center text-[11px] font-semibold">
              <span>Buku Agenda: 2023/2024</span>
              <span className="bg-[#006f66] text-white px-2 py-0.5 rounded">Aktif</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
