import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Zap, X, Loader2, Trash2, Plus } from 'lucide-react';
import api from '../../utils/api';

const AdminEditAnggota = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shifts, setShifts] = useState([]);
  const [formData, setFormData] = useState({
    nama: '', email: '', sn: '', id_rfid: '',
  });
  const [jadwalPiket, setJadwalPiket] = useState([]);
  const [selectedHari, setSelectedHari] = useState('Senin');
  const [selectedShift, setSelectedShift] = useState('');
  const [krsData, setKrsData] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [anggotaRes, shiftsRes] = await Promise.all([
          api.get(`/api/admin/anggota/${id}`),
          api.get('/api/shifts'),
        ]);
        
        const anggota = anggotaRes.data?.data || anggotaRes.data;
        const shiftsData = shiftsRes.data?.data || shiftsRes.data || [];
        
        setFormData({
          nama: anggota.nama || '',
          email: anggota.email || '',
          sn: anggota.sn || '',
          id_rfid: anggota.id_rfid || '',
        });
        
        setJadwalPiket(anggota.jadwal_piket || anggota.schedules || []);
        setKrsData(anggota.krs || []);
        setShifts(Array.isArray(shiftsData) ? shiftsData : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal mengambil data anggota');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRealtimeScan = () => {
    alert('Fitur Realtime Scan akan aktif setelah RFID reader terhubung.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        jadwal_piket: JSON.stringify(jadwalPiket.map(j => ({
          hari: j.hari || j.hari_piket,
          shift_id: j.shift_id
        })))
      };
      await api.put(`/api/admin/anggota/${id}`, payload);
      setSuccess('Anggota berhasil diperbarui!');
      setTimeout(() => navigate('/admin/anggota'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui anggota');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Filter KRS berdasarkan hari yang dipilih
  const krsFiltered = krsData.filter(k => k.hari === selectedHari);

  // Cek status shift: apakah ada jadwal kuliah yang bentrok?
  const getShiftStatus = (shift) => {
    const shiftStart = shift.jam_mulai?.substring(0, 5);
    const shiftEnd = shift.jam_selesai?.substring(0, 5);
    
    const hasConflict = krsFiltered.some(krs => {
      return krs.jam_mulai < shiftEnd && krs.jam_selesai > shiftStart;
    });

    const isAssigned = jadwalPiket.some(j => 
      (j.hari || j.hari_piket) === selectedHari && j.shift_id === shift.id
    );

    if (isAssigned) return 'assigned';
    if (hasConflict) return 'conflict';
    return 'available';
  };

  const handleAddJadwal = () => {
    if (!selectedHari || !selectedShift) return;
    const exists = jadwalPiket.find(j => (j.hari === selectedHari || j.hari_piket === selectedHari) && j.shift_id === parseInt(selectedShift));
    if (!exists) {
      setJadwalPiket([...jadwalPiket, { hari: selectedHari, shift_id: parseInt(selectedShift) }]);
    }
  };

  const handleRemoveJadwal = (hari, shift_id) => {
    setJadwalPiket(jadwalPiket.filter(j => !((j.hari === hari || j.hari_piket === hari) && j.shift_id === shift_id)));
  };

  return (
    <div className="font-['Poppins']">
      
      {/* HEADER */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <span className="text-gray-500 cursor-pointer hover:text-blue-600" onClick={() => navigate('/admin/anggota')}>Anggota</span>
        <span className="text-gray-400">/</span>
        <span className="text-blue-600 font-medium">Edit</span>
      </div>
      
      <div className="mb-6">
        <p className="text-lg font-medium text-black">Welcome to Absensi Neo Telemetri, Admin</p>
        <h1 className="text-4xl font-bold text-black mt-2">Edit Anggota</h1>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-6 items-start">
          
          {/* KOLOM KIRI: DATA ANGGOTA */}
          <div className="flex-1 bg-white rounded-[15px] p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-black mb-6">Detail Anggota</h2>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-black">Nama Lengkap</label>
                <input type="text" name="nama" value={formData.nama} onChange={handleChange} required
                  className="px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Masukkan nama lengkap" />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-black">SN</label>
                <input type="text" name="sn" value={formData.sn} onChange={handleChange}
                  className="px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Masukkan SN" />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-black">ID RFID</label>
                <input type="text" name="id_rfid" value={formData.id_rfid} onChange={handleChange}
                  className="px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Masukkan ID RFID" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-black">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Masukkan Email" />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-black">File KRS</label>
                <div className="px-4 py-3 border border-gray-300 rounded-[10px] text-sm bg-gray-50 flex items-center text-blue-600">
                  <span className="truncate">File_KRS_{formData.nim || '210511002'}.pdf</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button type="submit" disabled={saving}
                className="px-8 py-3 bg-[#004AB9] hover:bg-[#003a94] text-white rounded-[10px] text-sm font-medium disabled:opacity-50 shadow-md">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>

          {/* KOLOM KANAN: JADWAL PIKET */}
          <div className="w-[450px] bg-white rounded-[15px] p-8 shadow-sm border border-gray-100 shrink-0">
            <h2 className="text-xl font-bold text-black mb-6">Jadwal Piket</h2>
            
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="text-sm font-bold text-black mb-2 block">Hari</label>
                <div className="relative">
                  <select value={selectedHari} onChange={(e) => setSelectedHari(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500 appearance-none bg-white">
                    {hariList.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <label className="text-sm font-bold text-black mb-2 block">Shift</label>
                <div className="relative">
                  <select 
                    value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="">Pilih Shift</option>
                    {shifts.map(s => {
                      const status = getShiftStatus(s);
                      const isConflict = status === 'conflict';
                      return (
                        <option key={s.id} value={s.id} disabled={isConflict}>
                          {s.nama_shift} {isConflict ? '(Bentrok Kuliah)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleAddJadwal}
              disabled={!selectedHari || !selectedShift}
              className="w-full mb-6 py-3 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-[10px] text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} /> Tambah Jadwal
            </button>

            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-black block">Jadwal Terpilih</label>
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{jadwalPiket.length}</span>
              </div>
              
              {jadwalPiket.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-4 border border-dashed rounded-[10px]">Belum ada jadwal yang dipilih.</p>
              ) : (
                jadwalPiket.map((j, idx) => {
                  const hari = j.hari || j.hari_piket;
                  const shiftDetail = shifts.find(s => s.id === j.shift_id);
                  return (
                    <div key={idx} className="flex justify-between items-center px-4 py-3 rounded-[10px] border border-gray-200 bg-gray-50">
                      <div>
                        <p className="text-sm font-bold text-black">{hari} - {shiftDetail?.nama_shift}</p>
                        <p className="text-xs text-gray-500">{shiftDetail?.jam_mulai?.substring(0,5)} - {shiftDetail?.jam_selesai?.substring(0,5)}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveJadwal(hari, j.shift_id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default AdminEditAnggota;
