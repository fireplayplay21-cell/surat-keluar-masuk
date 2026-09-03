import React, { useState } from 'react';
import { AppUser } from '../types';
import { INITIAL_AUTH_USERS, ROLE_DEFINITIONS } from '../data/authUsers';
import { ModalRoleMatrix } from './ModalRoleMatrix';

interface LoginPageProps {
  onLoginSuccess: (user: AppUser) => void;
  usersList: AppUser[];
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, usersList }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'admin' | 'kepala_sekolah' | 'guru'>('all');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedUser = usernameInput.trim().toLowerCase();
    const trimmedPass = passwordInput.trim();

    if (!trimmedUser) {
      setErrorMessage('Silakan masukkan Username, NIP, atau Email Anda.');
      return;
    }
    if (!trimmedPass) {
      setErrorMessage('Silakan masukkan kata sandi Anda.');
      return;
    }

    // Match by username, email, or nip
    const foundUser = usersList.find(
      (u) =>
        u.username.toLowerCase() === trimmedUser ||
        u.email.toLowerCase() === trimmedUser ||
        (u.nip && u.nip.replace(/\s+/g, '') === trimmedUser.replace(/\s+/g, ''))
    );

    if (!foundUser) {
      setErrorMessage(
        'Akun tidak ditemukan. Gunakan username "admin", "kepsek", atau "guru.siti" (password: 123).'
      );
      return;
    }

    // Check password (accept predefined password or fallback default '123' / '123456')
    const validPasswords = [foundUser.password || '123', '123', '123456', 'admin123', 'kepsek123', 'guru123'];
    if (!validPasswords.includes(trimmedPass)) {
      setErrorMessage('Kata sandi yang Anda masukkan salah. Coba gunakan sandi "123".');
      return;
    }

    onLoginSuccess(foundUser);
  };

  const handleQuickLogin = (user: AppUser) => {
    onLoginSuccess(user);
  };

  const filteredUsers = usersList.filter((u) => {
    if (selectedRoleFilter === 'all') return true;
    return u.role === selectedRoleFilter;
  });

  return (
    <div className="min-h-screen bg-[#f2f4f6] flex flex-col justify-between font-sans text-black selection:bg-[#86f2e4] selection:text-[#006f66]">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-[#c6c6cd]/50 shadow-2xs px-4 sm:px-8 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#006a61] text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[24px]">school</span>
          </div>
          <div>
            <div className="text-xs font-black tracking-widest text-[#006a61] uppercase">
              Kementerian Pendidikan Dasar & Menengah
            </div>
            <div className="text-sm font-extrabold text-black leading-none mt-0.5">
              UPTD SPF SDN MAWAS
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMatrixModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#006a61] bg-[#86f2e4]/30 hover:bg-[#86f2e4]/60 border border-[#006a61]/20 rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">policy</span>
            <span>Matriks Pemetaan Peran</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Welcome Headline */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#86f2e4]/40 border border-[#006a61]/20 text-[#006f66] text-xs font-bold mb-3">
            <span className="material-symbols-outlined text-[15px]">mark_email_read</span>
            Aplikasi Persuratan & Tata Usaha Sekolah
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black tracking-tight leading-tight">
            Selamat Datang di Manajemen Pencatatan Surat Sekolah
          </h1>
          <p className="text-xs sm:text-sm text-[#45464d] mt-2 max-w-xl mx-auto">
            Sistem administrasi persuratan digital terpadu untuk Kepala Sekolah, Tim Tata Usaha, dan Dewan Guru UPTD SPF SDN Mawas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Login Form Box (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-[#c6c6cd]/60 shadow-lg relative overflow-hidden">
            {/* Top Accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#006a61] via-[#86f2e4] to-[#38485d]" />

            <div className="mb-6">
              <h2 className="text-lg font-extrabold text-black">Masuk ke Akun Anda</h2>
              <p className="text-xs text-[#45464d] mt-0.5">
                Gunakan kredensial resmi sekolah untuk mengakses dashboard.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                <span className="material-symbols-outlined text-[18px] shrink-0 text-red-600">
                  error
                </span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#45464d] mb-1.5">
                  Username / NIP / Email Belajar.id
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#76777d] text-[18px]">
                    badge
                  </span>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Contoh: admin / kepsek / guru.siti"
                    className="w-full pl-9 pr-3 py-2.5 border border-[#c6c6cd] rounded-xl text-xs sm:text-sm font-medium input-focus-glow bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-[#45464d]">
                    Kata Sandi (Password)
                  </label>
                  <span className="text-[11px] text-[#006a61] font-semibold">
                    Demo: 123
                  </span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#76777d] text-[18px]">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Masukkan kata sandi..."
                    className="w-full pl-9 pr-10 py-2.5 border border-[#c6c6cd] rounded-xl text-xs sm:text-sm font-medium input-focus-glow bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#76777d] hover:text-black cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#45464d]">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-[#006a61] focus:ring-0"
                  />
                  <span>Ingat sesi saya</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsMatrixModalOpen(true)}
                  className="text-[#006a61] hover:underline font-bold"
                >
                  Panduan Peran
                </button>
              </div>

              <button
                type="submit"
                id="btn-login-submit"
                className="w-full py-3 bg-[#006a61] text-white rounded-xl text-xs sm:text-sm font-extrabold hover:bg-[#006a61]/90 transition-all flex items-center justify-center gap-2 focus-ring-teal cursor-pointer shadow-md active:scale-98"
              >
                <span>Masuk ke Sistem Persuratan</span>
                <span className="material-symbols-outlined text-[18px]">login</span>
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#eceef0] text-center">
              <p className="text-[11px] text-[#76777d]">
                Atau pilih langsung <strong>Akun Peran Cepat (1-Klik)</strong> di sebelah kanan untuk simulasi tanpa login manual.
              </p>
            </div>
          </div>

          {/* Right Column: Roles Breakdown & Quick Login Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#c6c6cd]/50">
              <div>
                <h2 className="text-base font-extrabold text-black flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006a61] text-[20px]">
                    account_tree
                  </span>
                  Pilih Akun Berdasarkan Peran (Role-Based Login)
                </h2>
                <p className="text-xs text-[#45464d]">
                  Klik tombol pada kartu peran untuk masuk instan dengan hak akses masing-masing.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#c6c6cd]/60">
                <button
                  onClick={() => setSelectedRoleFilter('all')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    selectedRoleFilter === 'all'
                      ? 'bg-[#006a61] text-white'
                      : 'text-[#45464d] hover:bg-[#f2f4f6]'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setSelectedRoleFilter('admin')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    selectedRoleFilter === 'admin'
                      ? 'bg-[#006a61] text-white'
                      : 'text-[#45464d] hover:bg-[#f2f4f6]'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => setSelectedRoleFilter('kepala_sekolah')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    selectedRoleFilter === 'kepala_sekolah'
                      ? 'bg-[#006a61] text-white'
                      : 'text-[#45464d] hover:bg-[#f2f4f6]'
                  }`}
                >
                  Kepsek
                </button>
                <button
                  onClick={() => setSelectedRoleFilter('guru')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    selectedRoleFilter === 'guru'
                      ? 'bg-[#006a61] text-white'
                      : 'text-[#45464d] hover:bg-[#f2f4f6]'
                  }`}
                >
                  Guru
                </button>
              </div>
            </div>

            {/* List of Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredUsers.map((user) => {
                const roleMeta = ROLE_DEFINITIONS[user.role];
                return (
                  <div
                    key={user.id}
                    className="bg-white p-4 rounded-xl border border-[#c6c6cd]/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Badge and Role Indicator */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${roleMeta.badgeColor}`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {roleMeta.icon}
                          </span>
                          {user.role === 'admin'
                            ? 'Admin TU'
                            : user.role === 'kepala_sekolah'
                            ? 'Kepala Sekolah'
                            : 'Dewan Guru'}
                        </span>
                        <span className="text-[11px] font-mono text-[#76777d] bg-[#f2f4f6] px-1.5 py-0.5 rounded">
                          @{user.username}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#86f2e4]/30 text-[#006f66] font-black text-sm flex items-center justify-center shrink-0 border border-[#006a61]/20">
                          {user.fotoInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-black text-sm leading-tight truncate">
                            {user.nama}
                          </h3>
                          <p className="text-xs text-[#006a61] font-semibold mt-0.5 truncate">
                            {user.jabatan}
                          </p>
                          <div className="text-[11px] text-[#76777d] mt-1 flex items-center gap-1.5">
                            {user.kelas && user.kelas !== '-' && (
                              <span className="bg-[#b7c8e1]/30 text-[#38485d] font-bold px-1.5 py-0.5 rounded text-[10px]">
                                {user.kelas}
                              </span>
                            )}
                            <span className="truncate">NIP: {user.nip}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Scope Description */}
                      <div className="mt-3 p-2 bg-[#f7f9fb] rounded-lg border border-[#eceef0] text-[11px] text-[#45464d] line-clamp-2">
                        {user.role === 'admin' &&
                          '🔑 Akses penuh: Surat Masuk, Keluar, GTK, Master Data, Setting'}
                        {user.role === 'kepala_sekolah' &&
                          '✍️ Lembar Disposisi surat masuk, persetujuan surat keluar, rekap laporan'}
                        {user.role === 'guru' &&
                          '📋 Baca disposisi terkait tugas/kelas, isi tindak lanjut, direktori kontak'}
                      </div>
                    </div>

                    {/* Quick Login Action Button */}
                    <div className="mt-3 pt-2.5 border-t border-[#eceef0]">
                      <button
                        onClick={() => handleQuickLogin(user)}
                        className="w-full py-2 bg-[#f2f4f6] hover:bg-[#006a61] text-black hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs group-hover:bg-[#006a61] group-hover:text-white"
                      >
                        <span>Masuk sebagai {user.nama.split(' ')[0]}</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Matrix Link Callout */}
            <div className="bg-[#86f2e4]/20 border border-[#006a61]/20 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#006f66]">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
                <div>
                  <span className="font-bold">Pemetaan Hak Akses Sistem: </span>
                  <span className="text-[#45464d]">
                    Hak fitur disesuaikan secara dinamis dan aman berdasarkan peran.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMatrixModalOpen(true)}
                className="font-bold text-[#006a61] hover:underline whitespace-nowrap cursor-pointer text-xs"
              >
                Buka Matriks Detail →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#c6c6cd]/50 py-3 text-center text-xs text-[#76777d] px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            © {new Date().getFullYear()} SDN 01 Harapan • Sistem Informasi Administrasi Tata Usaha Sekolah
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Aktif & Terlindungi
            </span>
          </div>
        </div>
      </footer>

      {/* Modal Role Matrix */}
      <ModalRoleMatrix
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
      />
    </div>
  );
};
