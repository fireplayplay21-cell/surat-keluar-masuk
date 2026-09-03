import React from 'react';
import { TabType, AppUser } from '../types';
import { ROLE_DEFINITIONS } from '../data/authUsers';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenCetakLaporan: () => void;
  pendingSuratMasukCount: number;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  currentUser: AppUser | null;
  onLogout: () => void;
  onOpenRoleMatrix: () => void;
  schoolName?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const LOGO_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBFn98YsXS-pvzorefLeKLmb78mUnJuK4MCnQR-ocepjsmAUCLE_5oNjy8Q_17PWMflP3FIdFaHpR23AMGOn0cieEOuF1sJ-YGbq92UDS5dunnI2EZccCx9BDbTwCUp9aI2PUWKoO5TgW64QwYd9AoxtJz1pKFrtajKTDJt38LC2zR86U23t8R4YuZTH84PP-1tnP3cqwct02lAEFhf4KjMUBgkxGDtqPb9SPyauoE0cfuEUuTlTl5RUg';
export const AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDyjlwXcx4t0hJfJxhKY4hCvnaHWvnD9e6egHzcAORR5yqaBM8c-_MkgdXtTmbaEYCwmvYWdWMlIrAUiwqCmgBuOjPJ7wCxxkl7CQbe-wz2oHBDEucmRB_JzQB1iP9auDizQWevRCc5RO_qBwzZKJPNnKf4ZJ9JrMeRSRsA06opwy6ZRduSo3jx7gBmFo1wuexMapQL416lTr9FOmUVH7Lb2yIX-DCPPOFR3emWgfuMrRWeZ6iroPugQw';

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCetakLaporan,
  pendingSuratMasukCount,
  mobileOpen,
  setMobileOpen,
  currentUser,
  onLogout,
  onOpenRoleMatrix,
  schoolName = 'UPTD SPF SDN Mawas',
  isCollapsed,
  onToggleCollapse,
}) => {
  const isGuru = currentUser?.role === 'guru';
  const isKepsek = currentUser?.role === 'kepala_sekolah';

  const navItems: { id: TabType; label: string; icon: string; badge?: number; hidden?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'surat-masuk', label: 'Surat Masuk', icon: 'inbox', badge: pendingSuratMasukCount },
    { id: 'surat-keluar', label: 'Surat Keluar', icon: 'send' },
    { id: 'data-pengguna', label: 'Data Pengguna', icon: 'group' },
    { id: 'master-data', label: 'Master Data', icon: 'database', hidden: isGuru },
    { id: 'pengaturan', label: 'Pengaturan', icon: 'settings', hidden: isGuru || isKepsek },
  ];

  const handleNavClick = (tabId: TabType) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  const roleMeta = currentUser ? ROLE_DEFINITIONS[currentUser.role] : null;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          id="sidebar-backdrop"
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-label="Tutup Menu Sidebar"
        />
      )}

      {/* Main Sidebar (Desktop Collapsible & Mobile Slide-Over Drawer) */}
      <nav
        id="main-sidebar"
        className={`fixed left-0 top-0 z-50 h-screen bg-[#f7f9fb] border-r border-[#c6c6cd]/60 py-4 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          // Mobile state: slide in / out
          mobileOpen ? 'translate-x-0 w-72 sm:w-80 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${
          // Desktop state: collapsed (w-20) vs expanded (w-64)
          isCollapsed ? 'md:w-20' : 'md:w-64'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div
            className={`px-4 mb-3 flex items-center transition-all ${
              isCollapsed ? 'md:justify-center justify-between' : 'justify-between'
            }`}
          >
            <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'md:hidden flex' : 'flex'}`}>
              <img
                id="school-logo-sidebar"
                alt={`Logo Sekolah ${schoolName}`}
                src={LOGO_URL}
                className="w-10 h-10 object-contain rounded-full border border-[#c6c6cd]/60 bg-white p-0.5 shadow-xs shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="overflow-hidden min-w-0">
                <h1 className="text-[14.5px] font-extrabold text-[#000000] leading-tight truncate" title={schoolName}>
                  {schoolName}
                </h1>
                <p className="text-[11px] font-medium text-[#45464d] tracking-wide truncate">
                  Sistem Tata Usaha
                </p>
              </div>
            </div>

            {/* Desktop Collapsed Logo View */}
            {isCollapsed && (
              <div className="hidden md:flex flex-col items-center justify-center gap-1.5 w-full">
                <img
                  alt={`Logo Sekolah ${schoolName}`}
                  src={LOGO_URL}
                  className="w-10 h-10 object-contain rounded-full border border-[#c6c6cd]/60 bg-white p-0.5 shadow-xs shrink-0"
                  referrerPolicy="no-referrer"
                  title={`${schoolName} - Sistem Tata Usaha`}
                />
              </div>
            )}

            {/* Top Buttons: Mobile Close Button & Desktop Collapse Toggle */}
            <div className="flex items-center gap-1">
              {/* Desktop Toggle Button (Fold / Expand) */}
              <button
                type="button"
                id="sidebar-desktop-toggle-btn"
                onClick={onToggleCollapse}
                aria-label={isCollapsed ? 'Perluas Sidebar' : 'Lipat Sidebar'}
                title={isCollapsed ? 'Perluas Sidebar (Tampilkan Teks)' : 'Lipat Sidebar (Mode Ringkas)'}
                className="hidden md:flex items-center justify-center p-1.5 rounded-lg text-[#45464d] hover:text-black hover:bg-[#e6e8ea] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isCollapsed ? 'last_page' : 'first_page'}
                </span>
              </button>

              {/* Mobile Close Drawer Button */}
              <button
                type="button"
                id="sidebar-mobile-close-btn"
                onClick={() => setMobileOpen(false)}
                aria-label="Tutup Menu Sidebar"
                title="Tutup Menu"
                className="md:hidden flex items-center justify-center p-2 rounded-lg text-[#45464d] hover:text-black hover:bg-[#e6e8ea] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>
          </div>

          {/* Desktop Collapsed Expand Action Button right under logo */}
          {isCollapsed && (
            <div className="hidden md:flex justify-center mb-3 px-2">
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Klik untuk membuka/memperluas sidebar"
                className="w-10 h-8 flex items-center justify-center rounded-lg bg-[#e6e8ea] text-[#006a61] hover:bg-[#86f2e4]/40 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_right</span>
              </button>
            </div>
          )}

          {/* Active User Card Box */}
          {currentUser && (
            <>
              {/* Full User Box (Shown when expanded or on mobile) */}
              <div
                className={`mx-3 mb-3 p-3 bg-white rounded-xl border border-[#c6c6cd]/60 shadow-2xs transition-all ${
                  isCollapsed ? 'md:hidden block' : 'block'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#86f2e4]/40 text-[#006f66] font-black text-xs flex items-center justify-center shrink-0 border border-[#006a61]/20">
                    {currentUser.fotoInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-black truncate">
                      {currentUser.nama}
                    </div>
                    <div className="text-[10.5px] text-[#006a61] font-semibold truncate">
                      {currentUser.jabatan}
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-[#eceef0] flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider ${
                      roleMeta?.badgeColor || 'bg-gray-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      {roleMeta?.icon || 'person'}
                    </span>
                    {currentUser.role === 'admin'
                      ? 'Admin TU'
                      : currentUser.role === 'kepala_sekolah'
                      ? 'Kepala Sekolah'
                      : 'Dewan Guru'}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenRoleMatrix();
                      setMobileOpen(false);
                    }}
                    className="text-[10px] text-[#006a61] hover:underline font-bold cursor-pointer"
                    title="Lihat Wewenang Peran"
                  >
                    Info Akses
                  </button>
                </div>
              </div>

              {/* Compact User Icon (Shown when collapsed on desktop) */}
              <div
                className={`hidden ${
                  isCollapsed ? 'md:flex' : 'md:hidden'
                } justify-center mb-3`}
              >
                <button
                  type="button"
                  onClick={onOpenRoleMatrix}
                  title={`${currentUser.nama} (${currentUser.jabatan}) - Klik untuk info hak akses`}
                  className="w-10 h-10 rounded-full bg-[#86f2e4]/50 text-[#006f66] font-black text-xs flex items-center justify-center border-2 border-[#006a61] shadow-2xs hover:scale-105 transition-transform cursor-pointer relative"
                >
                  {currentUser.fotoInitials}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                </button>
              </div>
            </>
          )}

          {/* Navigation Links */}
          <ul className="flex flex-col gap-1 px-2.5">
            {navItems
              .filter((item) => !item.hidden)
              .map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      id={`nav-item-${item.id}`}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      title={isCollapsed ? `${item.label}${item.badge ? ` (${item.badge})` : ''}` : undefined}
                      className={`w-full flex items-center rounded-lg text-[13px] transition-all font-medium cursor-pointer ${
                        isCollapsed ? 'md:justify-center md:px-0 px-3.5 py-2' : 'justify-between px-3.5 py-2'
                      } ${
                        isActive
                          ? 'bg-[#86f2e4] text-[#006f66] font-bold shadow-xs'
                          : 'text-[#45464d] hover:text-[#000000] hover:bg-[#e6e8ea]'
                      }`}
                    >
                      <div className={`flex items-center gap-2.5 ${isCollapsed ? 'md:gap-0' : ''}`}>
                        <div className="relative flex items-center justify-center">
                          <span
                            className={`material-symbols-outlined text-[20px] transition-colors ${
                              isActive ? 'text-[#006f66]' : 'text-[#45464d]'
                            }`}
                            style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            {item.icon}
                          </span>
                          {/* Collapsed mode badge on icon corner */}
                          {isCollapsed && item.badge && item.badge > 0 ? (
                            <span className="hidden md:flex absolute -top-1.5 -right-2 px-1 min-w-[15px] h-[15px] text-[9px] font-black items-center justify-center rounded-full bg-[#ffdad6] text-[#93000a] border border-white">
                              {item.badge}
                            </span>
                          ) : null}
                        </div>
                        <span className={`truncate ${isCollapsed ? 'md:hidden inline' : 'inline'}`}>
                          {item.label}
                        </span>
                      </div>

                      {/* Expanded mode badge at row end */}
                      {item.badge && item.badge > 0 ? (
                        <span
                          className={`px-1.5 py-0.5 text-[10.5px] font-bold rounded-full ${
                            isCollapsed ? 'md:hidden inline-block' : 'inline-block'
                          } ${
                            isActive ? 'bg-[#006f66] text-white' : 'bg-[#ffdad6] text-[#93000a]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>

        {/* Bottom Actions */}
        <div className="px-2.5 space-y-2 pt-3 border-t border-[#c6c6cd]/50">
          {/* Cetak Laporan Button */}
          <button
            id="sidebar-btn-cetak-laporan"
            type="button"
            onClick={() => {
              onOpenCetakLaporan();
              setMobileOpen(false);
            }}
            title="Cetak Buku Agenda & Laporan Persuratan"
            className={`w-full bg-[#006a61] text-white text-[12.5px] font-semibold py-2 rounded-lg hover:bg-[#006a61]/90 transition-all focus-ring-teal flex items-center justify-center shadow-xs cursor-pointer active:scale-[0.98] ${
              isCollapsed ? 'md:px-0 px-3 gap-1.5' : 'px-3 gap-1.5'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span className={isCollapsed ? 'md:hidden inline' : 'inline'}>Cetak Laporan</span>
          </button>

          {/* Logout Button */}
          <button
            id="sidebar-btn-logout"
            type="button"
            onClick={() => {
              onLogout();
              setMobileOpen(false);
            }}
            title="Keluar / Ganti Akun"
            className={`w-full flex items-center text-[#ba1a1a] hover:bg-[#ffdad6]/40 py-2 transition-all rounded-lg text-[12.5px] font-bold cursor-pointer ${
              isCollapsed ? 'md:justify-center md:px-0 justify-between px-3' : 'justify-between px-3'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span className={isCollapsed ? 'md:hidden inline' : 'inline'}>Keluar (Ganti Akun)</span>
            </div>
            <span className={`material-symbols-outlined text-[15px] ${isCollapsed ? 'md:hidden inline' : 'inline'}`}>
              chevron_right
            </span>
          </button>

          {/* Collapsible toggle info on bottom (when expanded) */}
          {!isCollapsed && (
            <div className="hidden md:flex justify-center pt-1 text-[10.5px] text-[#76777d]">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="flex items-center gap-1 hover:text-[#006a61] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">first_page</span>
                <span>Lipat Sidebar</span>
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};
