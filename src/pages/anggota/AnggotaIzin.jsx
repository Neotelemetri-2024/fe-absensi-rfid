import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../utils/api';

const AnggotaIzin = () => {
  const [loading, setLoading] = useState(false);
  const [riwayat, setRiwayat] = useState([]);
  const [formData, setFormData] = useState({
    alasan: '',
    bukti_foto: null
  });
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    try {
      const response = await api.get('/api/anggota/pengajuan');
      const filtered = (response.data.data || []).filter(p => p.tipe_pengajuan === 'Izin');
      setRiwayat(filtered);
    } catch (err) {
      console.error('Gagal memuat riwayat pengajuan');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bukti_foto) {
      return alert('Mohon lampirkan foto/surat bukti izin.');
    }

    setLoading(true);
    const data = new FormData();
    data.append('tipe_pengajuan', 'Izin');
    data.append('tanggal_pengajuan', new Date().toISOString().split('T')[0]); // Hari ini
    data.append('alasan', formData.alasan);
    data.append('bukti_foto', formData.bukti_foto);

    try {
      await api.post('/api/anggota/pengajuan', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Pengajuan izin berhasil dikirim!');
      setFormData({ alasan: '', bukti_foto: null });
      fetchRiwayat();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim pengajuan izin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-['Poppins']">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-black">Form Izin Tidak Piket</h1>
        <p className="text-gray-500 mt-2">Ajukan izin jika berhalangan hadir piket</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* FORM IZIN */}
        <div className="flex-1 w-full bg-white rounded-[15px] p-6 sm:p-8 shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-black mb-2 block">Nama Lengkap</label>
                <input type="text" value={user.nama || ''} disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-[10px] text-sm bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="text-sm font-bold text-black mb-2 block">SN (Serial Number)</label>
                <input type="text" value={user.sn || ''} disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-[10px] text-sm bg-gray-50 text-gray-500" />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-black mb-2 block">Alasan</label>
              <textarea required value={formData.alasan} onChange={(e) => setFormData({...formData, alasan: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500 h-32 resize-none"
                placeholder="Tuliskan alasan izin..." />
            </div>

            <div>
              <label className="text-sm font-bold text-black mb-2 block">Lampirkan Foto / Surat Sakit</label>
              <input type="file" accept="image/*" required
                onChange={(e) => setFormData({...formData, bukti_foto: e.target.files[0]})}
                className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500" />
              <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG. Maks 2MB.</p>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-[#004AB9] hover:bg-[#003a94] text-white rounded-[10px] text-sm font-medium disabled:opacity-50">
                {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
              </button>
            </div>
          </form>
        </div>

        {/* RIWAYAT PENGAJUAN */}
        <div className="w-full lg:w-[450px] bg-white rounded-[15px] p-6 shadow-sm border border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-black mb-4">Riwayat Izin Anda</h2>
          <div className="space-y-4">
            {riwayat.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada riwayat izin</p>
            ) : (
              riwayat.map(r => {
                let statusBg = 'bg-[#d69f36]';
                let statusText = 'Menunggu';
                if (r.status_approval === 'Approved') { statusBg = 'bg-green-500'; statusText = 'Disetujui'; }
                if (r.status_approval === 'Rejected') { statusBg = 'bg-red-500'; statusText = 'Ditolak'; }

                return (
                  <div key={r.id} className="p-4 border border-gray-100 rounded-[10px] bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold text-gray-800">
                        {new Date(r.tanggal_pengajuan).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                      <span className={`px-2 py-1 text-[10px] font-bold text-white rounded-full ${statusBg}`}>
                        {statusText}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{r.alasan}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnggotaIzin;
