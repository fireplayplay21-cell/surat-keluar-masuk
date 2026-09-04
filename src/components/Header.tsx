import React, { useState, useEffect } from 'react';
import { TabType, SuratMasuk, AppUser } from '../types';
import { ROLE_DEFINITIONS } from '../data/authUsers';
import { getDriveAuthStatus, connectGoogleDrive, DriveAuthStatus } from '../services/googleDrive';

interface HeaderProps {
  activeTab: TabType;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddNew: () => void;
  onOpenHelp: () => void;
  onSelectSurat: (surat: SuratMasuk) => void;
  pendingLetters: SuratMasuk[];
  onToggleMobileMenu: () => void;
  currentUser: AppUser | null;
  onLogout: () => void;
  onOpenRoleMatrix: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  searchQuery,
  setSearchQuery,
  onAddNew,
  onOpenHelp,
  onSelectSurat,
  pendingLetters,
  onToggleMobileMenu,
  currentUser,
  onLogout,
  onOpenRoleMatrix,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [driveStatus, setDriveStatus] = useState<DriveAuthStatus>(() => getDriveAuthStatus());
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);

  useEffect(() => {
    setDriveStatus(getDriveAuthStatus());
    const interval = setInterval(() => {
      setDriveStatus(getDriveAuthStatus());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickConnectDrive = async () => {
    try {
      setIsConnectingDrive(true);
      await connectGoogleDrive();
      setDriveStatus(getDriveAuthStatus());
    } catch (err) {
      console.warn('Google Drive connect cancelled or failed:', err);
    } finally {
      setIsConnectingDrive(false);
    }
  };

  const isGuru = currentUser?.role === 'guru';
  const roleMeta = currentUser ? ROLE_DEFINITIONS[currentUser.role] : null;

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return isGuru ? `Dashboard Guru (${currentUser?.kelas || 'GTK'})` : 'Dashboard Persuratan';
      case 'surat-masuk':
        return isGuru ? 'Surat Masuk & Disposisi Terkait' : 'Surat Masuk';
      case 'surat-keluar':
        return 'Surat Keluar';
      case 'data-pengguna':
        return 'Data Pengguna & Guru (GTK)';
      case 'master-data':
        return 'Master Data & Klasifikasi';
      case 'pengaturan':
        return 'Pengaturan Sistem';
      default:
        return 'Sistem Tata Usaha';
    }
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'surat-masuk':
        return 'Tambah Surat Masuk';
      case 'surat-keluar':
        return 'Tambah Surat Keluar';
      case 'data-pengguna':
        return 'Tambah Guru / Pengguna';
      case 'master-data':
        return 'Tambah Master Data';
      default:
        return 'Tambah Data';
    }
  };

  // Determine if Add button should be visible based on user permissions
  const canShowAddButton = () => {
    if (!currentUser) return false;
    if (activeTab === 'surat-masuk') return currentUser.permissions.canCreateSurat;
    if (activeTab === 'surat-keluar') return currentUser.permissions.canCreateSurat;
    if (activeTab === 'data-pengguna') return currentUser.permissions.canManagePengguna;
    if (activeTab === 'master-data') return currentUser.permissions.canManageMasterData;
    return false;
  };

  return (
    <header className="bg-white sticky top-0 z-30 border-b border-[#c6c6cd]/50 w-full shadow-2xs">
      <div className="flex justify-between items-center w-full px-4 sm:px-6 py-2.5 max-w-[1400px] mx-auto h-16">
        {/* Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="mobile-menu-toggle-btn"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 -ml-2 text-black hover:bg-[#eceef0] focus-ring-teal rounded-lg cursor-pointer"
            aria-label="Buka Menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          {/* Desktop Sidebar Fold / Expand Button */}
          {onToggleSidebarCollapse && (
            <button
              id="desktop-sidebar-toggle-btn"
              type="button"
              onClick={onToggleSidebarCollapse}
              className="hidden md:flex p-1.5 -ml-1 text-[#45464d] hover:text-black hover:bg-[#eceef0] focus-ring-teal rounded-lg cursor-pointer transition-colors"
              aria-label={isSidebarCollapsed ? 'Perluas Sidebar' : 'Lipat Sidebar'}
              title={isSidebarCollapsed ? 'Perluas Sidebar (Tampilkan Penuh)' : 'Lipat Sidebar (Mode Ringkas)'}
            >
              <span className="material-symbols-outlined text-[22px]">
                {isSidebarCollapsed ? 'menu_open' : 'menu'}
              </span>
            </button>
          )}

          <div>
            <h2 id="header-page-title" className="text-[16px] sm:text-[19px] font-bold text-black tracking-tight flex items-center gap-2">
              <span className="truncate max-w-[200px] xs:max-w-[260px] sm:max-w-none">{getPageTitle()}</span>
              {currentUser?.role === 'kepala_sekolah' && (
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-[#86f2e4] text-[#006f66] font-extrabold uppercase">
                  Wewenang Disposisi
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Bar */}
          <div className="hidden lg:flex relative items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#76777d] text-[19px] pointer-events-none">
              search
            </span>
            <input
              id="header-global-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari agenda atau surat..."
              className="pl-9 pr-4 py-1.5 border border-[#c6c6cd] rounded-lg bg-white text-[13px] text-[#191c1e] w-56 input-focus-glow transition-all placeholder-[#76777d]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-[#76777d] hover:text-black text-xs font-bold p-0.5 cursor-pointer"
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>

          {/* Icon Buttons */}
          <div className="flex items-center gap-1">
            {/* Mobile Search Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="lg:hidden p-2 text-[#45464d] hover:text-black hover:bg-[#f2f4f6] transition-colors rounded-full cursor-pointer"
              title="Cari"
              aria-label="Buka Pencarian"
            >
              <span className="material-symbols-outlined text-[21px]">
                {showMobileSearch ? 'close' : 'search'}
              </span>
            </button>
            {/* Notification Button */}
            <div className="relative">
              <button
                id="header-btn-notifications"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                aria-label="Notifications"
                className="relative p-2 text-[#45464d] hover:text-black hover:bg-[#f2f4f6] transition-colors rounded-full focus-ring-teal cursor-pointer"
                title="Surat Menunggu Tindak Lanjut"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {pendingLetters.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div
                  id="notifications-dropdown"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#c6c6cd] rounded-xl shadow-xl z-50 p-3 text-sm animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#eceef0] mb-2 px-1">
                    <span className="font-bold text-black flex items-center gap-2 text-xs">
                      <span className="material-symbols-outlined text-[#006a61] text-[18px]">mark_email_unread</span>
                      Surat Menunggu Tindak Lanjut ({pendingLetters.length})
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[#76777d] hover:text-black text-xs cursor-pointer font-semibold"
                    >
                      Tutup
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#eceef0]">
                    {pendingLetters.length === 0 ? (
                      <p className="text-xs text-[#76777d] py-4 text-center">
                        Semua surat masuk sudah ditindaklanjuti.
                      </p>
                    ) : (
                      pendingLetters.map((letter) => (
                        <div
                          key={letter.id}
                          onClick={() => {
                            onSelectSurat(letter);
                            setShowNotifications(false);
                          }}
                          className="py-2.5 px-2 hover:bg-[#f7f9fb] rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-[#006a61]">{letter.noAgenda}</span>
                            <span className="text-[#76777d]">{letter.tglTerimaFormatted}</span>
                          </div>
                          <p className="font-medium text-black text-[13px] line-clamp-1">
                            {letter.perihal}
                          </p>
                          <p className="text-xs text-[#45464d] truncate mt-0.5">
                            Dari: {letter.pengirim}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Google Drive Connection Indicator */}
            {driveStatus.isConnected ? (
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold"
                title={`Google Drive Aktif (${driveStatus.userEmail || 'Tersambung'}). Arsip scan tersimpan di Drive.`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span className="material-symbols-outlined text-[15px] text-[#4285F4]">cloud_done</span>
                <span className="max-w-[100px] truncate">{driveStatus.userEmail?.split('@')[0] || 'Drive Aktif'}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleQuickConnectDrive}
                disabled={isConnectingDrive}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#45464d] hover:text-[#006a61] border border-[#c6c6cd] text-[11px] font-bold transition-colors cursor-pointer"
                title="Hubungkan akun Google Drive untuk menyimpan scan surat"
              >
                <span className="material-symbols-outlined text-[15px] text-[#4285F4]">
                  {isConnectingDrive ? 'sync' : 'add_to_drive'}
                </span>
                <span>{isConnectingDrive ? 'Menghubungkan...' : 'Google Drive'}</span>
              </button>
            )}

            {/* Matrix Role Guide Button */}
            <button
              id="header-btn-matrix"
              onClick={onOpenRoleMatrix}
              aria-label="Matriks Hak Akses"
              className="p-2 text-[#45464d] hover:text-black hover:bg-[#f2f4f6] transition-colors rounded-full focus-ring-teal cursor-pointer"
              title="Pemetaan Wewenang & Hak Akses Peran"
            >
              <span className="material-symbols-outlined text-[22px]">policy</span>
            </button>

            {/* Help Button */}
            <button
              id="header-btn-help"
              onClick={onOpenHelp}
              aria-label="Bantuan & Petunjuk Sistem"
              className="p-2 text-[#45464d] hover:text-black hover:bg-[#f2f4f6] transition-colors rounded-full focus-ring-teal cursor-pointer"
              title="Petunjuk Penggunaan"
            >
              <span className="material-symbols-outlined text-[22px]">help</span>
            </button>
          </div>

          {/* Primary Action Button (conditional by role) */}
          {canShowAddButton() && (
            <button
              id="header-btn-tambah-data"
              onClick={onAddNew}
              className="hidden sm:flex bg-[#006a61] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold items-center gap-1.5 hover:bg-[#006a61]/90 transition-all focus-ring-teal whitespace-nowrap active:scale-95 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">add</span>
              <span>{getAddButtonText()}</span>
            </button>
          )}

          {/* Profile Dropdown Badge & Avatar */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-[#f2f4f6] transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#86f2e4] text-[#006f66] font-black text-xs flex items-center justify-center border border-[#006a61]/30">
                {currentUser?.fotoInitials || 'TU'}
              </div>
              <span className="material-symbols-outlined text-[18px] text-[#76777d]">
                expand_more
              </span>
            </button>

            {showProfileMenu && (
              <div
                id="profile-dropdown-menu"
                className="absolute right-0 mt-2 w-72 bg-white border border-[#c6c6cd] rounded-xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-[#eceef0]">
                  <div className="w-10 h-10 rounded-full bg-[#86f2e4]/50 text-[#006f66] font-black text-sm flex items-center justify-center border border-[#006a61]/30">
                    {currentUser?.fotoInitials || 'TU'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-black text-xs leading-tight truncate">
                      {currentUser?.nama}
                    </h4>
                    <p className="text-[11px] text-[#006a61] font-semibold truncate mt-0.5">
                      {currentUser?.jabatan}
                    </p>
                    <p className="text-[10px] text-[#76777d]">NIP: {currentUser?.nip || '-'}</p>
                  </div>
                </div>

                <div className="py-2.5 text-xs text-[#45464d] space-y-1.5">
                  <div className="flex justify-between py-0.5">
                    <span>Peran Akun:</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        roleMeta?.badgeColor || 'bg-gray-100'
                      }`}
                    >
                      {currentUser?.role === 'admin'
                        ? 'Admin TU'
                        : currentUser?.role === 'kepala_sekolah'
                        ? 'Kepala Sekolah'
                        : 'Dewan Guru'}
                    </span>
                  </div>

                  {currentUser?.kelas && currentUser.kelas !== '-' && (
                    <div className="flex justify-between py-0.5">
                      <span>Wali Kelas:</span>
                      <span className="font-bold text-[#006f66] bg-[#86f2e4]/30 px-1.5 py-0.5 rounded text-[10.5px]">
                        {currentUser.kelas}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between py-0.5">
                    <span>Status:</span>
                    <span className="text-[#006a61] font-semibold flex items-center gap-1 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Aktif Bertugas
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#eceef0] space-y-1.5">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenRoleMatrix();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#f7f9fb] text-xs font-semibold text-black flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[17px] text-[#006a61]">
                      policy
                    </span>
                    <span>Lihat Matriks Hak Akses</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#ffdad6]/40 text-xs font-bold text-[#ba1a1a] flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[17px]">logout</span>
                    <span>Ganti Akun / Keluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Expandable Bar */}
      {showMobileSearch && (
        <div className="lg:hidden px-4 py-2.5 bg-[#f2f4f6] border-t border-[#c6c6cd]/50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#76777d] text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor agenda, nomor surat, perihal..."
              className="w-full pl-9 pr-9 py-2 border border-[#c6c6cd] rounded-lg bg-white text-xs text-[#191c1e] input-focus-glow placeholder-[#76777d]"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-[#76777d] hover:text-black text-xs font-bold p-1 cursor-pointer"
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
