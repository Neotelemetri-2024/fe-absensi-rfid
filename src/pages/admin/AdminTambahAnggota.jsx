import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, X, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const AdminTambahAnggota = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    sn: '',
    id_rfid: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRealtimeScan = () => {
    // Placeholder: Nanti bisa dihubungkan ke WebSocket/API realtime scan
    alert('Fitur Realtime Scan akan aktif setelah RFID reader terhubung.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/api/admin/anggota', formData);
      setSuccess('Anggota berhasil ditambahkan!');
      setTimeout(() => navigate('/admin/anggota'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan anggota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-['Poppins']">
      
      {/* HEADER */}
      <div className="mb-6">
        <p className="text-lg font-medium text-black">Welcome to Absensi Neo Telemetri, Admin</p>
        <h1 className="text-4xl font-bold text-black mt-2">Tambah Anggota</h1>
      </div>

      {/* MESSAGES */}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">{success}</div>}

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-[15px] p-8 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-black mb-6">Data Anggota</h2>
          
          <div className="space-y-5">
            {/* Nama */}
            <div className="flex items-center gap-6">
              <label className="w-[80px] text-sm font-medium text-black shrink-0">Nama</label>
              <input
                type="text" name="nama" value={formData.nama} onChange={handleChange} required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {/* Email */}
            <div className="flex items-center gap-6">
              <label className="w-[80px] text-sm font-medium text-black shrink-0">Email</label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange} required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500"
                placeholder="Masukkan Email"
              />
            </div>

            {/* SN */}
            <div className="flex items-center gap-6">
              <label className="w-[80px] text-sm font-medium text-black shrink-0">SN</label>
              <div className="flex-1">
                <input
                  type="text" name="sn" value={formData.sn} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Masukkan SN"
                />
                <p className="text-xs text-gray-400 mt-1">Format wajib: SN. AXX-0XX</p>
              </div>
            </div>

            {/* ID RFID */}
            <div className="flex items-center gap-6">
              <label className="w-[80px] text-sm font-medium text-black shrink-0">ID RFID</label>
              <div className="flex-1 flex gap-3">
                <div className="flex-1">
                  <input
                    type="text" name="id_rfid" value={formData.id_rfid} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Scan atau input ID RFID"
                  />
                  <p className="text-xs text-gray-400 mt-1">ID RFID harus unik untuk setiap anggota</p>
                </div>
                <button
                  type="button"
                  onClick={handleRealtimeScan}
                  className="flex items-center gap-2 bg-[#d69f36] hover:bg-[#c28e2e] text-white px-5 py-3 rounded-[10px] font-medium text-sm shrink-0 h-fit"
                >
                  <Zap size={16} />
                  <span>Realtime Scan</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/anggota')}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-[10px] text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <X size={16} /> Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#004AB9] hover:bg-[#003a94] text-white rounded-[10px] text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminTambahAnggota;
