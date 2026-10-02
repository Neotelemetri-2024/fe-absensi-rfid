import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, CalendarRange, Clock, LogOut, Menu, Settings, X, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const AnggotaLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Modal Settings State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('profil'); // 'profil' | 'keamanan'
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdData, setPwdData] = useState({ password_lama: '', password_baru: '', konfirmasi_password: '' });
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState({ nama: JSON.parse(localStorage.getItem('user') || '{}').nama || '' });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/anggota/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Jadwal Saya', path: '/anggota/jadwal', icon: <Calendar size={20} /> },
    { name: 'Izin Piket', path: '/anggota/izin', icon: <Clock size={20} /> },
    { name: 'Ganti Jadwal', path: '/anggota/ganti-jadwal', icon: <CalendarRange size={20} /> },
  ];

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdData.password_baru !== pwdData.konfirmasi_password) {
      return alert('Konfirmasi password baru tidak cocok!');
    }
    setPwdLoading(true);
    try {
      await api.put('/api/anggota/change-password', pwdData);
      alert('Password berhasil diubah!');
      setIsSettingsModalOpen(false);
      setPwdData({ password_lama: '', password_baru: '', konfirmasi_password: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await api.put('/api/anggota/profile', profileData);
      alert('Profil berhasil diperbarui!');
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // Refresh the page to show new name on sidebar/dashboard
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-['Poppins']">
      
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-[280px]' : 'w-[80px]'} bg-[#004AB9] text-white flex flex-col shadow-xl fixed h-full z-20 transition-all duration-300`}>
        
        {/* TOGGLE BUTTON */}
        <div className={`flex items-center ${isSidebarOpen ? 'justify-end' : 'justify-center'} p-4`}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <Menu size={24} />
          </button>
        </div>

        {/* LOGO AREA */}
        {isSidebarOpen ? (
          <div className="flex flex-col items-center justify-center pb-6 border-b border-white/20">
            <img 
              src="/6. Lambang white.png" 
              alt="Logo" 
              className="w-[180px] object-contain mb-3"
              onError={(e) => {
                e.target.style.display = 'none';
                document.getElementById('sidebar-logo-text-anggota').style.display = 'block';
              }}
            />
            <div id="sidebar-logo-text-anggota" className="hidden text-white text-center">
              <h1 className="text-xl font-bold italic">NEO TELEMETRI</h1>
            </div>
            <p className="text-white/80 text-[10px] font-light tracking-[0.1em]">SISTEM ABSENSI</p>
            <p className="text-white/60 text-[8px] uppercase tracking-widest mt-1">PENGURUS NEO TELEMETRI 2026</p>
          </div>
        ) : (
          <div className="flex justify-center pb-6 border-b border-white/20">
            <img 
              src="/6. Lambang white.png" 
              alt="Logo" 
              className="w-10 object-contain"
              title="Neo Telemetri"
            />
          </div>
        )}

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={!isSidebarOpen ? item.name : ''}
              className={({ isActive }) => 
                `flex items-center ${isSidebarOpen ? 'gap-4 px-4' : 'justify-center px-0'} py-3 rounded-[10px] transition-all duration-200 ${
                  isActive 
                  ? 'bg-[#002D7A] text-white font-medium' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
                }`
              }
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {isSidebarOpen && <span className="text-[15px] whitespace-nowrap">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* BOTTOM BUTTONS */}
        <div className={`p-3 border-t border-white/10 flex mt-auto ${isSidebarOpen ? 'flex-row gap-2' : 'flex-col gap-2 items-center'}`}>
          <button 
            onClick={handleLogout}
            title={!isSidebarOpen ? 'Logout' : ''}
            className={`flex items-center ${isSidebarOpen ? 'gap-3 px-4 flex-1' : 'justify-center w-10 h-10'} text-red-300 hover:bg-white/10 hover:text-red-100 rounded-[10px] transition-all`}
          >
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="text-[15px] whitespace-nowrap">Logout</span>}
          </button>
          
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            title="Pengaturan Akun"
            className={`flex items-center justify-center ${isSidebarOpen ? 'w-12 shrink-0' : 'w-10 h-10'} rounded-[10px] transition-all text-white/80 hover:bg-white/10 hover:text-white`}
          >
            <Settings size={20} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'} p-10 min-h-screen relative transition-all duration-300`}>
        <Outlet />
      </main>

      {/* MODAL PENGATURAN AKUN */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Pengaturan Akun</h3>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            {/* TABS */}
            <div className="flex border-b border-gray-100">
              <button 
                onClick={() => setActiveSettingsTab('profil')}
                className={`flex-1 py-3 text-sm font-medium ${activeSettingsTab === 'profil' ? 'text-[#004AB9] border-b-2 border-[#004AB9]' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Profil Saya
              </button>
              <button 
                onClick={() => setActiveSettingsTab('keamanan')}
                className={`flex-1 py-3 text-sm font-medium ${activeSettingsTab === 'keamanan' ? 'text-[#004AB9] border-b-2 border-[#004AB9]' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Keamanan
              </button>
            </div>

            {/* TAB: PROFIL */}
            {activeSettingsTab === 'profil' && (
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SN (Serial Number)</label>
                  <input 
                    type="text" 
                    value={JSON.parse(localStorage.getItem('user') || '{}').sn || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">SN terkait dengan kartu RFID Anda.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                  <input 
                    type="text" 
                    value={JSON.parse(localStorage.getItem('user') || '{}').nim || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" required 
                    value={profileData.nama}
                    onChange={e => setProfileData({...profileData, nama: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004AB9] focus:outline-none text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                  <input 
                    type="text" 
                    value={JSON.parse(localStorage.getItem('user') || '{}').jabatan || '-'}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsSettingsModalOpen(false)} className="px-5 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Tutup</button>
                  <button type="submit" disabled={profileLoading} className="flex items-center gap-2 px-5 py-2 text-sm text-white bg-[#004AB9] hover:bg-blue-800 rounded-lg font-medium transition-colors">
                    {profileLoading && <Loader2 size={16} className="animate-spin" />}
                    Simpan Profil
                  </button>
                </div>
              </form>
            )}

            {/* TAB: KEAMANAN (UBAH PASSWORD) */}
            {activeSettingsTab === 'keamanan' && (
              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
                  <input 
                    type="password" required 
                    value={pwdData.password_lama}
                    onChange={e => setPwdData({...pwdData, password_lama: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004AB9] focus:outline-none text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                  <input 
                    type="password" required minLength="6"
                    value={pwdData.password_baru}
                    onChange={e => setPwdData({...pwdData, password_baru: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004AB9] focus:outline-none text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                  <input 
                    type="password" required minLength="6"
                    value={pwdData.konfirmasi_password}
                    onChange={e => setPwdData({...pwdData, konfirmasi_password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004AB9] focus:outline-none text-sm text-gray-700"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsSettingsModalOpen(false)} className="px-5 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Batal</button>
                  <button type="submit" disabled={pwdLoading} className="flex items-center gap-2 px-5 py-2 text-sm text-white bg-[#004AB9] hover:bg-blue-800 rounded-lg font-medium transition-colors">
                    {pwdLoading && <Loader2 size={16} className="animate-spin" />}
                    Ubah Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AnggotaLayout;
