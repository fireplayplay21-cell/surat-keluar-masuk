import React from 'react';
import { ROLE_PERMISSION_MATRIX, ROLE_DEFINITIONS } from '../data/authUsers';

interface ModalRoleMatrixProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalRoleMatrix: React.FC<ModalRoleMatrixProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-[#eceef0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#86f2e4] text-[#006f66] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">policy</span>
            </div>
            <div>
              <h3 className="font-extrabold text-black text-lg">
                Matriks Pemetaan Peran & Hak Akses Pengguna
              </h3>
              <p className="text-xs text-[#45464d] mt-0.5">
                SDN 01 Harapan • Pembagian wewenang berdasarkan tugas pokok dan fungsi (Tupoksi)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#76777d] hover:text-black font-bold p-1 rounded-lg hover:bg-[#f2f4f6] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 3 Role Descriptions Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
          <div className="bg-[#f7f9fb] p-3 rounded-xl border border-[#c6c6cd]/60">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="material-symbols-outlined text-[#006a61] text-[18px]">
                admin_panel_settings
              </span>
              <h4 className="font-bold text-xs text-[#006a61]">
                {ROLE_DEFINITIONS.admin.label}
              </h4>
            </div>
            <p className="text-[11px] text-[#45464d] leading-relaxed">
              {ROLE_DEFINITIONS.admin.description}
            </p>
          </div>

          <div className="bg-[#f7f9fb] p-3 rounded-xl border border-[#c6c6cd]/60">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="material-symbols-outlined text-[#006f66] text-[18px]">
                workspace_premium
              </span>
              <h4 className="font-bold text-xs text-[#006f66]">
                {ROLE_DEFINITIONS.kepala_sekolah.label}
              </h4>
            </div>
            <p className="text-[11px] text-[#45464d] leading-relaxed">
              {ROLE_DEFINITIONS.kepala_sekolah.description}
            </p>
          </div>

          <div className="bg-[#f7f9fb] p-3 rounded-xl border border-[#c6c6cd]/60">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="material-symbols-outlined text-[#38485d] text-[18px]">
                school
              </span>
              <h4 className="font-bold text-xs text-[#38485d]">
                {ROLE_DEFINITIONS.guru.label}
              </h4>
            </div>
            <p className="text-[11px] text-[#45464d] leading-relaxed">
              {ROLE_DEFINITIONS.guru.description}
            </p>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="flex-1 overflow-y-auto border border-[#c6c6cd]/60 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f0f3f6] sticky top-0 border-b border-[#c6c6cd] text-[#45464d] font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5">Modul & Fitur</th>
                <th className="py-2.5 px-3 text-center bg-[#86f2e4]/20 text-[#006f66]">
                  Admin Tata Usaha
                </th>
                <th className="py-2.5 px-3 text-center bg-[#b7c8e1]/20 text-[#38485d]">
                  Kepala Sekolah
                </th>
                <th className="py-2.5 px-3 text-center bg-[#e6e8ea] text-black">
                  Guru / GTK
                </th>
                <th className="py-2.5 px-3.5">Keterangan / Batasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef0]">
              {ROLE_PERMISSION_MATRIX.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#f7f9fb] transition-colors">
                  <td className="py-2 px-3.5 font-medium text-black">
                    <div className="text-[10px] font-bold text-[#76777d] uppercase">
                      {item.kategori}
                    </div>
                    <div>{item.fitur}</div>
                  </td>

                  {/* Admin Column */}
                  <td className="py-2 px-3 text-center">
                    {typeof item.admin === 'boolean' ? (
                      item.admin ? (
                        <span className="inline-flex items-center text-emerald-700 font-black">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        </span>
                      ) : (
                        <span className="text-[#c6c6cd] font-bold">✕</span>
                      )
                    ) : (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#006a61] text-white">
                        {item.admin}
                      </span>
                    )}
                  </td>

                  {/* Kepsek Column */}
                  <td className="py-2 px-3 text-center">
                    {typeof item.kepalaSekolah === 'boolean' ? (
                      item.kepalaSekolah ? (
                        <span className="inline-flex items-center text-emerald-700 font-black">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        </span>
                      ) : (
                        <span className="text-[#c6c6cd] font-bold">✕</span>
                      )
                    ) : (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#86f2e4] text-[#006f66]">
                        {item.kepalaSekolah}
                      </span>
                    )}
                  </td>

                  {/* Guru Column */}
                  <td className="py-2 px-3 text-center">
                    {typeof item.guru === 'boolean' ? (
                      item.guru ? (
                        <span className="inline-flex items-center text-emerald-700 font-black">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        </span>
                      ) : (
                        <span className="text-[#c6c6cd] font-bold">✕</span>
                      )
                    ) : (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#b7c8e1] text-[#38485d]">
                        {item.guru}
                      </span>
                    )}
                  </td>

                  <td className="py-2 px-3.5 text-[11px] text-[#45464d]">
                    {item.keterangan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-[#eceef0] mt-4">
          <div className="text-[11px] text-[#76777d]">
            Sistem Autentikasi SDN 01 Harapan • Akses aman berbasis peran (RBAC)
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#006a61] text-white rounded-lg text-xs font-bold hover:bg-[#006a61]/90 cursor-pointer shadow-xs"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
