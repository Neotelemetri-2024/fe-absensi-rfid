import React, { useState, useEffect } from 'react';
import { Search, Download, Loader2, Eye, Edit2, X } from 'lucide-react';
import api from '../../utils/api';

const AdminLaporan = () => {
  const [laporanData, setLaporanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dariTanggal, setDariTanggal] = useState('');
  const [sampaiTanggal, setSampaiTanggal] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Edit State
  const [editingRecord, setEditingRecord] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editMasuk, setEditMasuk] = useState('');
  const [editKeluar, setEditKeluar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Set default ke awal bulan sampai hari ini
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const formatToYMD = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const strFirst = formatToYMD(firstDay);
    const strToday = formatToYMD(today);

    setDariTanggal(strFirst);
    setSampaiTanggal(strToday);
    
    // Auto load data bulan ini
    loadData(strFirst, strToday);
  }, []);

  const loadData = async (dari, sampai) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/admin/laporan?dari_tanggal=${dari}&sampai_tanggal=${sampai}`);
      setLaporanData(response.data?.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil data laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (record) => {
    setEditingRecord(record);
    setEditStatus(record.status || 'Hadir');
    
    const formatTimeForInput = (timeStr) => {
      if (!timeStr) return '';
      if (timeStr.includes('T')) {
        return new Date(timeStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      return timeStr.substring(0, 5);
    };
    
    setEditMasuk(formatTimeForInput(record.waktu_masuk || record.jam_datang));
    setEditKeluar(formatTimeForInput(record.waktu_keluar || record.jam_pulang));
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    try {
      setIsSubmitting(true);
      await api.put(`/api/admin/laporan/kehadiran/${editingRecord.id}`, {
        status: editStatus,
        waktu_masuk: editMasuk || null,
        waktu_keluar: editKeluar || null
      });
      alert('Status absensi berhasil diperbarui!');
      setEditingRecord(null);
      loadData(dariTanggal, sampaiTanggal);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui absensi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    if (!dariTanggal || !sampaiTanggal) {
      setError('Silakan pilih rentang tanggal terlebih dahulu.');
      return;
    }
    loadData(dariTanggal, sampaiTanggal);
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get(
        `/api/admin/laporan/export?dari_tanggal=${dariTanggal}&sampai_tanggal=${sampaiTanggal}&format=${format}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan_absensi.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowExportMenu(false);
    } catch (err) {
      alert('Gagal mengekspor laporan');
    }
  };

  const handleSyncSheets = async () => {
    try {
      if (!dariTanggal) {
        alert("Pilih tanggal terlebih dahulu!");
        return;
      }
      const month = new Date(dariTanggal).getMonth() + 1;
      const year = new Date(dariTanggal).getFullYear();
      
      alert('Memulai proses sinkronisasi ke Google Sheets... Mohon tunggu...');
      const response = await api.post(`/api/admin/sheets/sync?bulan=${month}&tahun=${year}`);
      alert(response.data?.message || 'Berhasil sinkronisasi ke Google Sheets!');
      setShowExportMenu(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal sinkronisasi ke Google Sheets');
    }
  };

  const stats = laporanData?.data_total || {};
  const records = laporanData?.tabel_rekapan || [];

  return (
    <div className="font-['Poppins']">
      
      {/* HEADER */}
      <div className="mb-6">
        <p className="text-lg font-medium text-black">Welcome to Absensi Neo Telemetri, Admin</p>
        <h1 className="text-4xl font-bold text-black mt-2">Laporan Absensi RFID NEO TELEMETRI</h1>
      </div>

      {/* FILTER + EXPORT */}
      <div className="flex justify-between items-end mb-6">
        <div className="flex items-end gap-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Dari Tanggal</label>
            <input type="date" value={dariTanggal} onChange={(e) => setDariTanggal(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Sampai</label>
            <input type="date" value={sampaiTanggal} onChange={(e) => setSampaiTanggal(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <button onClick={handlePreview} disabled={loading}
            className="px-6 py-2 bg-[#004AB9] hover:bg-[#003a94] text-white rounded-[10px] text-sm font-medium disabled:opacity-50">
            {loading ? 'Memuat...' : 'Preview'}
          </button>
        </div>

        <div className="relative">
          <button onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 bg-[#d69f36] hover:bg-[#c28e2e] text-white px-5 py-2 rounded-[10px] font-medium text-sm">
            <Download size={16} /> Export
          </button>
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
              <button onClick={() => handleExport('xlsx')} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-gray-700">Export Excel</button>
              <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-gray-700 border-b border-gray-100">Export PDF</button>
              <button onClick={handleSyncSheets} className="w-full text-left px-4 py-3 text-sm text-[#004AB9] font-medium hover:bg-blue-50 bg-blue-50/30">
                ☁️ Sync Google Sheets
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* STAT CARDS */}
      {laporanData && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#D1E6D3] rounded-[15px] p-5 shadow-sm">
            <h3 className="text-gray-700 font-medium text-sm mb-2">Total Records</h3>
            <span className="text-4xl font-bold text-gray-800">{stats.total_records || records.length || 0}</span>
            <span className="text-gray-500 text-xs block mt-1">All Time</span>
          </div>
          <div className="bg-[#B2DFB6] rounded-[15px] p-5 shadow-sm">
            <h3 className="text-gray-700 font-medium text-sm mb-2">Total Hadir</h3>
            <span className="text-4xl font-bold text-gray-800">{stats.total_hadir || 0}</span>
            <span className="text-gray-600 text-xs block mt-1">Persen</span>
          </div>
          <div className="bg-[#FFB347] rounded-[15px] p-5 shadow-sm">
            <h3 className="text-white font-medium text-sm mb-2">Total Izin</h3>
            <span className="text-4xl font-bold text-white">{stats.total_izin || 0}</span>
            <span className="text-white/80 text-xs block mt-1">Persen</span>
          </div>
          <div className="bg-[#FF6B6B] rounded-[15px] p-5 shadow-sm">
            <h3 className="text-white font-medium text-sm mb-2">Total Tidak Hadir</h3>
            <span className="text-4xl font-bold text-white">{stats.total_tidak_hadir || 0}</span>
            <span className="text-white/80 text-xs block mt-1">Persen</span>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-[15px] p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-black mb-6">Data Laporan Absensi</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr className="bg-[#d28b24] text-white">
                <th className="py-3 px-4 font-medium rounded-l-md">No</th>
                <th className="py-3 px-4 font-medium text-left">Nama</th>
                <th className="py-3 px-4 font-medium">Hari / Tanggal</th>
                <th className="py-3 px-4 font-medium">Jam Datang</th>
                <th className="py-3 px-4 font-medium">Jam Pulang</th>
                <th className="py-3 px-4 font-medium">Durasi</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Bukti</th>
                <th className="py-3 px-4 font-medium rounded-r-md">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {!laporanData ? (
                <tr><td colSpan="9" className="py-8 text-gray-400">Pilih rentang tanggal dan klik Preview untuk melihat data</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="9" className="py-8 text-gray-400">Tidak ada data pada rentang tanggal ini</td></tr>
              ) : (
                records.map((row, index) => {
                  let statusColor = 'text-gray-500';
                  if (row.status === 'Selesai' || row.status === 'Hadir') statusColor = 'bg-green-100 text-green-700';
                  if (row.status === 'Tidak Hadir') statusColor = 'bg-red-100 text-red-700';
                  if (row.status === 'Izin') statusColor = 'bg-yellow-100 text-yellow-700';

                  const tanggalFormatted = row.tanggal ? new Date(row.tanggal).toLocaleDateString('id-ID', {
                    weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit'
                  }) : '-';

                  const formatTime = (timeStr) => {
                    if (!timeStr) return '-';
                    if (timeStr.includes('T')) {
                      return new Date(timeStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
                    }
                    return timeStr.substring(0, 5);
                  };

                  return (
                    <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-black">{index + 1}</td>
                      <td className="py-4 px-4 font-medium text-black text-left">{row.nama}</td>
                      <td className="py-4 px-4 text-gray-500">{tanggalFormatted}</td>
                      <td className="py-4 px-4 text-gray-500">{formatTime(row.waktu_masuk || row.jam_datang)}</td>
                      <td className="py-4 px-4 text-gray-500">{formatTime(row.waktu_keluar || row.jam_pulang)}</td>
                      <td className="py-4 px-4 text-gray-500">{row.durasi_menit ? `${row.durasi_menit} mnt` : row.durasi || '-'}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-md text-xs font-medium ${statusColor}`}>{row.status || '-'}</span>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {row.bukti ? (
                          <a href={`${import.meta.env.VITE_API_URL || ''}/uploads/bukti/${row.bukti}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-medium">
                            Lihat File
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <button onClick={() => handleEditClick(row)} className="text-[#d28b24] hover:text-[#b8761c] bg-orange-50 hover:bg-orange-100 p-2 rounded-lg transition-colors" title="Edit Manual">
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT MANUAL */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">Edit Manual Kehadiran</h3>
              <button onClick={() => setEditingRecord(null)} className="text-gray-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded-full p-1.5 shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 mb-2">
                <p className="text-sm text-gray-500 mb-1">Nama Anggota</p>
                <p className="font-semibold text-gray-800">{editingRecord.nama}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {editingRecord.tanggal ? new Date(editingRecord.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Status Kehadiran</label>
                <select 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d28b24]/20 focus:border-[#d28b24] transition-all bg-gray-50 focus:bg-white"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Izin">Izin</option>
                  <option value="Tidak Hadir">Tidak Hadir (Alpa)</option>
                  <option value="Sedang Piket">Sedang Piket</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Jam Datang</label>
                  <input 
                    type="time"
                    value={editMasuk}
                    onChange={(e) => setEditMasuk(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d28b24]/20 focus:border-[#d28b24] transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Jam Pulang</label>
                  <input 
                    type="time"
                    value={editKeluar}
                    onChange={(e) => setEditKeluar(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d28b24]/20 focus:border-[#d28b24] transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button 
                onClick={() => setEditingRecord(null)}
                className="px-6 py-2.5 text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl text-sm font-medium transition-colors"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#d28b24] hover:bg-[#b8761c] text-white rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLaporan;
