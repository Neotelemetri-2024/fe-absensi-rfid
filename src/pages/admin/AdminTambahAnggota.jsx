import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, X, Loader2, Trash2, Plus } from 'lucide-react';
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
  const [jadwalPiket, setJadwalPiket] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [selectedHari, setSelectedHari] = useState('Senin');
  const [selectedShift, setSelectedShift] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await api.get('/api/shifts');
        setShifts(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Failed to fetch shifts:', err);
      }
    };
    fetchShifts();
  }, []);

  const handleAddJadwal = () => {
    if (!selectedHari || !selectedShift) return;
    const exists = jadwalPiket.find(j => j.hari === selectedHari && j.shift_id === parseInt(selectedShift));
    if (!exists) {
      setJadwalPiket([...jadwalPiket, { hari: selectedHari, shift_id: parseInt(selectedShift) }]);
    }
  };

  const handleRemoveJadwal = (hari, shift_id) => {
    setJadwalPiket(jadwalPiket.filter(j => !(j.hari === hari && j.shift_id === shift_id)));
  };

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
      const payload = {
        ...formData,
        jadwal_piket: jadwalPiket
      };
      
      // Jika form tidak punya NIM, kita ambil dari SN, tapi form punya NIM?
      // Wait, in backend `nim` is required. Let's send NIM from formData or derive it.
      await api.post('/api/admin/anggota', payload);
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
        <div className="flex gap-6 items-start">
          {/* KOLOM KIRI: DATA ANGGOTA */}
          <div className="flex-1 bg-white rounded-[15px] p-8 shadow-sm border border-gray-100 mb-6">
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

              {/* NIM */}
              <div className="flex items-center gap-6">
                <label className="w-[80px] text-sm font-medium text-black shrink-0">NIM</label>
                <input
                  type="text" name="nim" value={formData.nim || ''} onChange={handleChange} required
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Masukkan NIM"
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
                    type="text" name="sn" value={formData.sn} onChange={handleChange} required
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
                      type="text" name="id_rfid" value={formData.id_rfid} onChange={handleChange} required
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

          {/* KOLOM KANAN: JADWAL PIKET */}
          <div className="w-[400px] bg-white rounded-[15px] p-8 shadow-sm border border-gray-100 shrink-0 mb-6">
            <h2 className="text-xl font-bold text-black mb-6">Jadwal Piket</h2>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="text-sm font-bold text-black mb-2 block">Hari</label>
                <div className="relative">
                  <select 
                    value={selectedHari} onChange={(e) => setSelectedHari(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500 appearance-none bg-white"
                  >
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
                    {shifts.map(s => <option key={s.id} value={s.id}>{s.nama_shift}</option>)}
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

            {/* List Jadwal Terpilih */}
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-black block">Jadwal Terpilih</label>
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{jadwalPiket.length}</span>
              </div>
              
              {jadwalPiket.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-4 border border-dashed rounded-[10px]">Belum ada jadwal yang dipilih.</p>
              ) : (
                jadwalPiket.map((j, idx) => {
                  const shiftDetail = shifts.find(s => s.id === j.shift_id);
                  return (
                    <div key={idx} className="flex justify-between items-center px-4 py-3 rounded-[10px] border border-gray-200 bg-gray-50">
                      <div>
                        <p className="text-sm font-bold text-black">{j.hari} - {shiftDetail?.nama_shift}</p>
                        <p className="text-xs text-gray-500">{shiftDetail?.jam_mulai?.substring(0,5)} - {shiftDetail?.jam_selesai?.substring(0,5)}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveJadwal(j.hari, j.shift_id)}
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
