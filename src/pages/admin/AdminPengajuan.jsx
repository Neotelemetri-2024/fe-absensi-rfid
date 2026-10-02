import React, { useState, useEffect } from 'react';
import { Search, Loader2, Check, X } from 'lucide-react';
import api from '../../utils/api';

const AdminPengajuan = () => {
  const [pengajuanList, setPengajuanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterTanggal, setFilterTanggal] = useState('');

  useEffect(() => {
    fetchPengajuan();
  }, []);

  const fetchPengajuan = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/pengajuan');
      const data = response.data?.data || response.data || [];
      setPengajuanList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil data pengajuan');
    } finally {
      setLoading(false);
    }
  };

  const handleValidasi = async (id, status) => {
    try {
      await api.put(`/api/admin/pengajuan/${id}/validasi`, { status });
      fetchPengajuan();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memvalidasi pengajuan');
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

  const statusFilters = ['Semua', 'Menunggu', 'Disetujui', 'Ditolak'];
  const statusColors = {
    Semua: 'bg-[#004AB9] text-white',
    Menunggu: 'bg-[#d69f36] text-white',
    Disetujui: 'bg-green-500 text-white',
    Ditolak: 'bg-red-500 text-white',
  };

  // Filter data
  const filtered = pengajuanList.filter(p => {
    const matchSearch = (p.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.nim || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Map UI status to Backend status
    let mappedFilterStatus = filterStatus;
    if (filterStatus === 'Menunggu') mappedFilterStatus = 'Pending';
    if (filterStatus === 'Disetujui') mappedFilterStatus = 'Approved';
    if (filterStatus === 'Ditolak') mappedFilterStatus = 'Rejected';
    
    const matchStatus = filterStatus === 'Semua' || 
                        (p.status_approval || '').toLowerCase() === mappedFilterStatus.toLowerCase();

    // Match Date (if selected)
    const matchDate = filterTanggal ? (p.tanggal_pengajuan && p.tanggal_pengajuan.startsWith(filterTanggal)) : true;

    return matchSearch && matchStatus && matchDate;
  });

  return (
    <div className="font-['Poppins']">
      
      {/* HEADER */}
      <div className="mb-6">
        <p className="text-lg font-medium text-black">Welcome to Absensi Neo Telemetri, Admin</p>
        <h1 className="text-4xl font-bold text-black mt-2">Pengajuan</h1>
      </div>

      {/* CONTENT */}
      <div className="bg-white rounded-[15px] p-8 shadow-sm border border-gray-100">
        
        {/* SEARCH & DATE FILTER */}
        <div className="flex gap-4 mb-6">
          <div className="relative w-[300px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500"
              placeholder="Cari Nama / NIM / ID RFID / Hari..." />
          </div>
          <div className="relative w-[200px]">
            <input type="date" value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-[10px] text-sm text-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="Filter Tanggal" />
          </div>
        </div>

        {/* FILTER BUTTONS */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setFilterStatus('Menunggu')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              filterStatus === 'Menunggu' ? 'bg-[#d69f36] text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>Menunggu</button>
          
          <button onClick={() => setFilterStatus('Semua')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              filterStatus === 'Semua' ? 'bg-[#004AB9] text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>Semua</button>
            
          <button onClick={() => setFilterStatus('Disetujui')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              filterStatus === 'Disetujui' ? 'bg-green-500 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>Disetujui</button>
            
          <button onClick={() => setFilterStatus('Ditolak')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              filterStatus === 'Ditolak' ? 'bg-red-500 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>Ditolak</button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr className="bg-[#d28b24] text-white">
                <th className="py-3 px-4 font-medium rounded-l-md">No</th>
                <th className="py-3 px-4 font-medium">Nama</th>
                <th className="py-3 px-4 font-medium">Tanggal</th>
                <th className="py-3 px-4 font-medium">Keterangan</th>
                <th className="py-3 px-4 font-medium">Bukti</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium rounded-r-md">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="py-8 text-gray-400">Belum ada pengajuan</td></tr>
              ) : (
                filtered.map((row, index) => {
                  let statusBg = 'bg-gray-100 text-gray-500';
                  let displayStatus = row.status_approval || 'Menunggu';

                  if (row.status_approval === 'Pending') {
                    statusBg = 'bg-[#d69f36] text-white';
                    displayStatus = 'Menunggu';
                  }
                  if (row.status_approval === 'Approved') {
                    statusBg = 'bg-green-500 text-white';
                    displayStatus = 'Disetujui';
                  }
                  if (row.status_approval === 'Rejected') {
                    statusBg = 'bg-red-500 text-white';
                    displayStatus = 'Ditolak';
                  }

                  return (
                    <tr key={row.id || index} className="border-b border-gray-100 last:border-0">
                      <td className="py-4 px-4 text-black">{index + 1}</td>
                      <td className="py-4 px-4 font-medium text-black">{row.nama}</td>
                      <td className="py-4 px-4 text-gray-500">
                        {row.tanggal_pengajuan ? new Date(row.tanggal_pengajuan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="py-4 px-4 text-gray-500">{row.alasan || '-'}</td>
                      <td className="py-4 px-4 text-sm">
                        {row.bukti_foto ? (
                          <a href={`${import.meta.env.VITE_API_URL || ''}/uploads/bukti/${row.bukti_foto}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-medium">
                            Lihat File
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-4 py-1.5 rounded-md text-xs font-medium ${statusBg}`}>{displayStatus}</span>
                      </td>
                      <td className="py-4 px-4">
                        {row.status_approval === 'Pending' ? (
                          <div className="flex justify-center gap-2">
                            <button onClick={() => {
                              if(window.confirm('Setujui pengajuan ini?')) handleValidasi(row.id, 'Approved')
                            }}
                              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs font-medium">
                              Setuju
                            </button>
                            <button onClick={() => {
                              if(window.confirm('Tolak pengajuan ini?')) handleValidasi(row.id, 'Rejected')
                            }}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-medium">
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
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
    </div>
  );
};

export default AdminPengajuan;
