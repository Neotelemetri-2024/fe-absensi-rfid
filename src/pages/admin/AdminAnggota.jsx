import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Pencil, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const AdminAnggota = () => {
  const navigate = useNavigate();
  const [anggotaList, setAnggotaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10; // Menyesuaikan limit backend

  useEffect(() => {
    // Memberikan sedikit delay agar tidak spam API saat mengetik pencarian
    const delayDebounceFn = setTimeout(() => {
      fetchAnggota();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm]);

  const fetchAnggota = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/anggota?page=${currentPage}&limit=${perPage}&search=${searchTerm}`);
      
      // Menyesuaikan struktur response server pagination
      setAnggotaList(response.data?.data || []);
      
      const pagination = response.data?.pagination || {};
      setTotalData(pagination.total || 0);
      setTotalPages(pagination.total_pages || 1);

    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil data anggota');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Yakin ingin menghapus anggota "${nama}"?`)) return;
    try {
      await api.delete(`/api/admin/anggota/${id}`);
      fetchAnggota();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus anggota');
    }
  };

  if (loading && anggotaList.length === 0) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;
  }

  return (
    <div className="font-['Poppins']">
      
      {/* HEADER */}
      <div className="mb-6">
        <p className="text-lg font-medium text-black">Welcome to Absensi Neo Telemetri, Admin</p>
        <h1 className="text-4xl font-bold text-black mt-2">Anggota</h1>
      </div>

      {/* SEARCH */}
      <div className="relative mb-4 w-fit">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500 w-[350px]"
          placeholder="Cari Nama / NIM / ID RFID"
        />
      </div>

      {/* TOTAL BAR */}
      <div className="bg-[#004AB9] text-white px-6 py-3 rounded-[10px] mb-6">
        <span className="font-medium">Total Keseluruhan Anggota: {totalData}</span>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[15px] p-8 shadow-sm border border-gray-100 relative">
        {/* Loading overlay saat pencarian/ganti halaman */}
        {loading && anggotaList.length > 0 && (
          <div className="absolute inset-0 bg-white/50 z-10 flex justify-center items-center rounded-[15px]">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto relative z-0">
          <table className="w-full text-center">
            <thead>
              <tr className="bg-[#d28b24] text-white">
                <th className="py-3 px-4 font-medium rounded-l-md">No</th>
                <th className="py-3 px-4 font-medium">Nama</th>
                <th className="py-3 px-4 font-medium">SN</th>
                <th className="py-3 px-4 font-medium">ID RFID</th>
                <th className="py-3 px-4 font-medium">Hari Piket</th>
                <th className="py-3 px-4 font-medium">Shift Piket</th>
                <th className="py-3 px-4 font-medium rounded-r-md">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {anggotaList.length === 0 ? (
                <tr><td colSpan="7" className="py-8 text-gray-400">Belum ada data anggota</td></tr>
              ) : (
                anggotaList.map((row, index) => {
                  const jadwal = row.jadwal_piket || row.schedules || [];
                  const hariList = Array.isArray(jadwal) ? jadwal.map(j => j.hari || j.hari_piket).join(', ') : '-';
                  const shiftList = Array.isArray(jadwal) ? jadwal.map(j => j.nama_shift || `Shift ${j.shift_id}`).join(', ') : '-';

                  return (
                    <tr key={row.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-4 px-4 text-black">{(currentPage - 1) * perPage + index + 1}</td>
                      <td className="py-4 px-4 font-medium text-black">{row.nama}</td>
                      <td className="py-4 px-4 text-gray-500">{row.sn || '-'}</td>
                      <td className="py-4 px-4 text-gray-500">{row.id_rfid || '-'}</td>
                      <td className="py-4 px-4 text-gray-500">{hariList || '-'}</td>
                      <td className="py-4 px-4 text-gray-500">{shiftList || '-'}</td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/anggota/edit/${row.id}`)}
                            className="px-3 py-1 text-sm border border-yellow-500 text-yellow-600 rounded hover:bg-yellow-50 font-medium"
                          >Edit</button>
                          <button
                            onClick={() => handleDelete(row.id, row.nama)}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 font-medium"
                          >hapus</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-500">
              Menampilkan {(currentPage - 1) * perPage + 1} sampai {Math.min(currentPage * perPage, totalData)} dari {totalData} Data
            </p>
            <div className="flex border border-gray-300 rounded-md overflow-hidden text-sm relative z-0">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white hover:bg-gray-50 text-gray-500 border-r border-gray-300 disabled:opacity-40"
              >&lt; Sebelumnya</button>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border-r border-gray-300 ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50 text-black'}`}
                >{i + 1}</button>
              ))}
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white hover:bg-gray-50 text-black disabled:opacity-40"
              >Selanjutnya &gt;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnggota;
