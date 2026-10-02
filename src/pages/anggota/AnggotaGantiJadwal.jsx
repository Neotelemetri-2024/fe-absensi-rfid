import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../utils/api';

const AnggotaGantiJadwal = () => {
  const [loading, setLoading] = useState(false);
  const [riwayat, setRiwayat] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [formData, setFormData] = useState({
    shift_awal_id: '',
    tanggal_pengajuan: '',
    tanggal_pengganti: '',
    shift_id: '',
    alasan: ''
  });
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [riwayatRes, shiftsRes] = await Promise.all([
        api.get('/api/anggota/pengajuan'),
        api.get('/api/shifts')
      ]);
      const filtered = (riwayatRes.data?.data || []).filter(p => p.tipe_pengajuan === 'Ganti Jadwal');
      setRiwayat(filtered);
      setShifts(shiftsRes.data?.data || shiftsRes.data || []);
    } catch (err) {
      console.error('Gagal memuat data ganti jadwal');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    data.append('tipe_pengajuan', 'Ganti Jadwal');
    data.append('tanggal_pengajuan', formData.tanggal_pengajuan);
    data.append('tanggal_pengganti', formData.tanggal_pengganti);
    data.append('shift_awal_id', formData.shift_awal_id);
    data.append('shift_id', formData.shift_id);
    data.append('alasan', formData.alasan);

    try {
      await api.post('/api/anggota/pengajuan', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Pengajuan ganti jadwal berhasil dikirim!');
      setFormData({ shift_awal_id: '', tanggal_pengajuan: '', tanggal_pengganti: '', shift_id: '', alasan: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim pengajuan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-['Poppins']">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-black">Form Ganti Jadwal</h1>
        <p className="text-gray-500 mt-2">Ajukan pergantian jadwal piket sementara</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* FORM GANTI JADWAL */}
        <div className="flex-1 bg-white rounded-[15px] p-8 shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
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

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-black mb-2 block">Shift Sekarang (Yang Ditinggalkan)</label>
                <select required value={formData.shift_awal_id} onChange={(e) => setFormData({...formData, shift_awal_id: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option value="">Pilih Shift Asal</option>
                  {shifts.map(s => <option key={s.id} value={s.id}>{s.nama_shift} ({s.jam_mulai?.substring(0,5)} - {s.jam_selesai?.substring(0,5)})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-black mb-2 block">Tanggal Asli Piket</label>
                <input type="date" required value={formData.tanggal_pengajuan} onChange={(e) => setFormData({...formData, tanggal_pengajuan: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-black mb-2 block">Pindah Ke Shift</label>
                <select required value={formData.shift_id} onChange={(e) => setFormData({...formData, shift_id: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option value="">Pilih Shift Tujuan</option>
                  {shifts.map(s => <option key={s.id} value={s.id}>{s.nama_shift} ({s.jam_mulai?.substring(0,5)} - {s.jam_selesai?.substring(0,5)})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-black mb-2 block">Ganti Jadwal Ke (Tanggal)</label>
                <input type="date" required value={formData.tanggal_pengganti} onChange={(e) => setFormData({...formData, tanggal_pengganti: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-black mb-2 block">Alasan</label>
              <textarea required value={formData.alasan} onChange={(e) => setFormData({...formData, alasan: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500 h-24 resize-none"
                placeholder="Tuliskan alasan ganti jadwal..." />
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={loading}
                className="px-8 py-3 bg-[#004AB9] hover:bg-[#003a94] text-white rounded-[10px] text-sm font-medium disabled:opacity-50">
                {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
              </button>
            </div>
          </form>
        </div>

        {/* RIWAYAT PENGAJUAN */}
        <div className="w-[450px] bg-white rounded-[15px] p-6 shadow-sm border border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-black mb-4">Riwayat Ganti Jadwal Anda</h2>
          <div className="space-y-4">
            {riwayat.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada riwayat ganti jadwal</p>
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
                    <div className="text-xs text-gray-600 mb-2 space-y-1">
                      <p><span className="font-medium text-gray-800">Asal:</span> {r.shift_asal} (Tanggal: {r.tanggal_pengajuan})</p>
                      <p><span className="font-medium text-gray-800">Tujuan:</span> {r.shift_tujuan}</p>
                    </div>
                    <p className="text-xs text-gray-500 border-t border-gray-200 pt-2">{r.alasan}</p>
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

export default AnggotaGantiJadwal;
