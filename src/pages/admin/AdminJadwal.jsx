import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import api from '../../utils/api';

const AdminJadwal = () => {
  const [jadwalList, setJadwalList] = useState([]);
  const [rekomendasi, setRekomendasi] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHari, setSelectedHari] = useState('');
  const [selectedShift, setSelectedShift] = useState('');

  const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (selectedHari && selectedShift) {
      fetchRekomendasi();
    }
  }, [selectedHari, selectedShift]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [jadwalRes, shiftsRes] = await Promise.all([
        api.get('/api/admin/jadwal'),
        api.get('/api/shifts'),
      ]);
      
      // Backend mengirim data grid berbentuk Object di "data", dan flat array di "raw_data"
      const rawData = jadwalRes.data?.raw_data || [];
      setJadwalList(Array.isArray(rawData) ? rawData : []);
      
      setShifts(shiftsRes.data?.data || shiftsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil data jadwal');
    } finally {
      setLoading(false);
    }
  };

  const fetchRekomendasi = async () => {
    try {
      const response = await api.get(`/api/admin/jadwal/rekomendasi?hari=${selectedHari}&shift_id=${selectedShift}`);
      setRekomendasi(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Gagal mengambil rekomendasi:', err);
    }
  };

  const handleTugaskan = async (userId) => {
    try {
      await api.post('/api/admin/jadwal', {
        user_id: userId,
        hari_piket: selectedHari,
        shift_id: parseInt(selectedShift)
      });
      fetchAll();
      fetchRekomendasi();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menugaskan jadwal');
    }
  };

  const handleHapusJadwal = async (jadwalId) => {
    if (!window.confirm('Yakin ingin menghapus jadwal ini?')) return;
    try {
      await api.delete(`/api/admin/jadwal/${jadwalId}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus jadwal');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;
  }

  // Organize jadwal into a grid: hari -> shift -> [names]
  const jadwalGrid = {};
  hariList.forEach(hari => {
    jadwalGrid[hari] = {};
    shifts.forEach(shift => {
      jadwalGrid[hari][shift.id] = [];
    });
  });
  
  (Array.isArray(jadwalList) ? jadwalList : []).forEach(j => {
    const hari = j.hari_piket || j.hari;
    const shiftId = j.shift_id;
    if (jadwalGrid[hari] && jadwalGrid[hari][shiftId]) {
      jadwalGrid[hari][shiftId].push({ ...j });
    }
  });

  return (
    <div className="font-['Poppins']">
      
      {/* HEADER */}
      <div className="mb-6">
        <p className="text-lg font-medium text-black">Welcome to Absensi Neo Telemetri, Admin</p>
        <h1 className="text-4xl font-bold text-black mt-2">Kelola Penjadwalan Piket</h1>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white rounded-[15px] p-6 shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-bold text-black mb-2 block">Hari Piket</label>
            <select value={selectedHari} onChange={(e) => setSelectedHari(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500 bg-white">
              <option value="">Pilih Hari</option>
              {hariList.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-bold text-black mb-2 block">Shift Piket</label>
            <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500 bg-white">
              <option value="">Pilih Shift</option>
              {shifts.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nama_shift} ({s.jam_mulai?.substring(0,5)} - {s.jam_selesai?.substring(0,5)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* REKOMENDASI */}
      {selectedHari && selectedShift && (
        <div className="bg-white rounded-[15px] p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-black mb-4">Rekomendasi</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead>
                <tr className="bg-[#d28b24] text-white">
                  <th className="py-3 px-4 font-medium rounded-l-md">No</th>
                  <th className="py-3 px-4 font-medium">Nama</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium rounded-r-md">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rekomendasi.length === 0 ? (
                  <tr><td colSpan="4" className="py-6 text-gray-400">Tidak ada rekomendasi tersedia</td></tr>
                ) : (
                  rekomendasi.map((row, index) => {
                    const isTerjadwal = row.sudah_terjadwal || row.status === 'Sudah Terjadwal';
                    return (
                      <tr key={row.id || index} className="border-b border-gray-100 last:border-0">
                        <td className="py-4 px-4 text-black">{index + 1}</td>
                        <td className="py-4 px-4 font-medium text-black">{row.nama}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-md text-xs font-medium ${
                            isTerjadwal ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'
                          }`}>{isTerjadwal ? 'Sudah Terjadwal' : 'Belum Terjadwal'}</span>
                        </td>
                        <td className="py-4 px-4">
                          {!isTerjadwal ? (
                            <button onClick={() => handleTugaskan(row.id || row.user_id)}
                              className="px-4 py-1 bg-[#004AB9] text-white rounded-md text-sm font-medium hover:bg-[#003a94]">
                              Tugaskan
                            </button>
                          ) : (
                            <span className="px-4 py-1 bg-gray-200 text-gray-500 rounded-md text-sm">Tugaskan</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JADWAL PIKET TABLE */}
      <div className="bg-white rounded-[15px] p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">Jadwal Piket</h2>
          <p className="text-sm text-[#d69f36]">Tekan X untuk menghapus</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr className="bg-[#d28b24] text-white">
                <th className="py-3 px-4 font-medium rounded-l-md">Hari</th>
                {shifts.map(s => (
                  <th key={s.id} className="py-3 px-4 font-medium last:rounded-r-md">
                    {s.nama_shift}: ({s.jam_mulai?.substring(0,5)} - {s.jam_selesai?.substring(0,5)})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hariList.map(hari => (
                <tr key={hari} className="border-b border-gray-100 last:border-0">
                  <td className="py-4 px-4 font-medium text-black">{hari}</td>
                  {shifts.map(shift => {
                    const entries = jadwalGrid[hari]?.[shift.id] || [];
                    return (
                      <td key={shift.id} className="py-3 px-2">
                        {entries.length === 0 ? (
                          <span className="text-gray-300">-</span>
                        ) : (
                          <div className="space-y-2">
                            {entries.map((entry, i) => (
                              <div key={i} className="flex items-start justify-between gap-1 border-b border-gray-100 last:border-0 pb-1 last:pb-0">
                                <span className="text-[13px] leading-snug text-left text-black break-words">{entry.nama || entry.user_nama}</span>
                                <button onClick={() => handleHapusJadwal(entry.schedule_id)}
                                  className="text-red-500 hover:text-red-700 text-sm font-bold shrink-0 ml-1">X</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminJadwal;
