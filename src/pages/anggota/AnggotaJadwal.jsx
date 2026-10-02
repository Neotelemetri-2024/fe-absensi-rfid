import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Plus, Loader2, X } from 'lucide-react';
import api from '../../utils/api';

const SHIFTS = [
  { id: 1, name: 'Shift 1', start: '08:00', end: '10:00' },
  { id: 2, name: 'Shift 2', start: '10:00', end: '12:00' },
  { id: 3, name: 'Shift 3', start: '12:00', end: '14:00' },
  { id: 4, name: 'Shift 4', start: '14:00', end: '16:00' },
];

const AnggotaJadwal = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = useState('Senin');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  
  // State KRS (Courses) per day
  const [krsData, setKrsData] = useState({
    Senin: [], Selasa: [], Rabu: [], Kamis: [], Jumat: []
  });

  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    fetchKrs();
  }, []);

  const fetchKrs = async () => {
    try {
      const res = await api.get('/api/anggota/krs');
      const fetchedData = res.data.data;
      
      // Ensure all days exist
      const completeData = { Senin: [], Selasa: [], Rabu: [], Kamis: [], Jumat: [] };
      Object.keys(completeData).forEach(hari => {
        if (fetchedData[hari]) completeData[hari] = fetchedData[hari];
      });
      
      setKrsData(completeData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if two time ranges overlap
  const checkOverlap = (start1, end1, start2, end2) => {
    if (!start1 || !end1 || !start2 || !end2) return false;
    return (start1 < end2) && (start2 < end1);
  };

  const calculateShiftStatus = (hari, shift) => {
    const courses = krsData[hari];
    let isOverlap = false;
    for (const course of courses) {
      if (checkOverlap(course.start, course.end, shift.start, shift.end)) {
        isOverlap = true;
        break;
      }
    }
    return isOverlap ? 'Kegiatan' : 'Tersedia';
  };

  const handleAddMatkul = () => {
    const newCourse = { id: Date.now(), name: '', start: '08:00', end: '10:00' };
    setKrsData(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newCourse]
    }));
  };

  const handleRemoveMatkul = (idToRemove) => {
    setKrsData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(c => c.id !== idToRemove)
    }));
  };

  const handleChangeMatkul = (id, field, value) => {
    setKrsData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const handleChangeDay = (id, newDay) => {
    if (newDay === activeTab) return;
    setKrsData(prev => {
      const courseToMove = prev[activeTab].find(c => c.id === id);
      if (!courseToMove) return prev;
      
      return {
        ...prev,
        [activeTab]: prev[activeTab].filter(c => c.id !== id),
        [newDay]: [...prev[newDay], courseToMove]
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post('/api/anggota/krs', { krsData });
      alert('Jadwal KRS berhasil disimpan! Data waktu luang Anda sekarang terhubung ke AI Admin.');
    } catch (error) {
      alert('Gagal menyimpan KRS: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handlePdfUpload = async (fileOrEvent) => {
    let file = null;
    if (fileOrEvent.target && fileOrEvent.target.files) {
      file = fileOrEvent.target.files[0];
    } else {
      file = fileOrEvent; // From drag and drop
    }
    
    if (!file) return;
    setPdfFile(file);
    
    const formData = new FormData();
    formData.append('krs_pdf', file);

    try {
      setParsing(true);
      const res = await api.post('/api/anggota/krs/parse-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const parsedCourses = res.data.data;
      if (parsedCourses.length === 0) {
        alert('Tidak ada mata kuliah yang terdeteksi di PDF ini.');
        return;
      }

      // Reset data agar tidak bertumpuk jika diupload berulang kali
      setKrsData({
        Senin: [], Selasa: [], Rabu: [], Kamis: [], Jumat: []
      });

      setTimeout(() => {
        setKrsData(prev => {
          const newData = {
            Senin: [...prev.Senin],
            Selasa: [...prev.Selasa],
            Rabu: [...prev.Rabu],
            Kamis: [...prev.Kamis],
            Jumat: [...prev.Jumat]
          };
          
          parsedCourses.forEach((c, idx) => {
            const hari = c.hari;
            if (newData[hari]) {
              newData[hari].push({
                id: Date.now() + idx,
                name: c.matakuliah,
                sks: c.sks,
                start: c.jamMulai,
                end: c.jamSelesai
              });
            }
          });
          return newData;
        });
      }, 100);
      alert(`Berhasil mengekstrak ${parsedCourses.length} mata kuliah dari PDF! Silakan periksa kembali jamnya.`);
    } catch (error) {
      alert('Gagal memproses PDF: ' + (error.response?.data?.message || error.message));
    } finally {
      setParsing(false);
      if (fileOrEvent.target) fileOrEvent.target.value = null;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handlePdfUpload(e.dataTransfer.files[0]);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>;

  return (
    <div className="font-['Poppins']">
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-medium text-black">Hello, {user.nama}!</h1>
        <h2 className="text-3xl font-bold text-black mt-2">Kelola Jadwal Piket & KRS</h2>
        <p className="text-gray-400 mt-1">Isi jadwal dan data KRS pada form yang disediakan.</p>
      </div>

      {/* UPLOAD PDF KRS */}
      <div 
        className="bg-white rounded-[15px] p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between mb-6 border-2 border-dashed hover:border-blue-400 transition-colors gap-4 md:gap-0"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-black">
            <FileText size={40} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-black">Lampiran Bukti KRS (PDF)</h3>
            <p className="text-sm text-gray-400">Silakan unggah file KRS dalam format .pdf untuk validasi data, atau seret (drag & drop) file ke kotak ini.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <label className={`cursor-pointer px-5 py-2.5 rounded-lg text-sm font-medium transition-colors text-white text-center w-full sm:w-auto ${parsing ? 'bg-gray-400' : 'bg-[#3B82F6] hover:bg-blue-600'}`}>
            {parsing ? <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Ekstrak AI...</span> : 'Choose file'}
            <input type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} disabled={parsing} />
          </label>
          <div className="flex items-center">
            <span className="text-gray-400 text-sm max-w-[200px] truncate" title={pdfFile ? pdfFile.name : 'No file chosen'}>
              {pdfFile ? pdfFile.name : 'No file chosen'}
            </span>
            {pdfFile && !parsing && (
              <button 
                onClick={() => setPdfFile(null)} 
                className="ml-2 text-red-500 hover:text-red-700 transition-colors bg-red-50 rounded-full p-1"
                title="Hapus File"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN FORM AREA */}
      <div className="bg-white rounded-[15px] shadow-sm border border-gray-100 p-4 md:p-8 mb-8">
        
        {/* TABS */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4 mb-8">
          {Object.keys(krsData).map(hari => (
            <button
              key={hari}
              onClick={() => setActiveTab(hari)}
              className={`flex-1 min-w-[30%] sm:min-w-0 py-2 sm:py-3 rounded-lg font-bold transition-all text-sm sm:text-base ${
                activeTab === hari 
                  ? 'bg-[#3B82F6] text-white shadow-md' 
                  : 'bg-[#E0E7FF] text-black hover:bg-[#c7d2fe]'
              }`}
            >
              {hari}
            </button>
          ))}
        </div>

        {/* KELOLA MATKUL HARI INI */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
            <h3 className="text-lg font-bold text-black">Daftar KRS {activeTab}</h3>
            <button 
              onClick={handleAddMatkul}
              className="bg-[#D97706] hover:bg-[#b45309] text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
            >
              <Plus size={16} />
              Tambah Matkul
            </button>
          </div>

          <div className="space-y-4">
            {krsData[activeTab].length === 0 ? (
              <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                Tidak ada kelas pada hari {activeTab}.
              </div>
            ) : (
              krsData[activeTab].map((course) => (
                <div key={course.id} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center bg-gray-50 p-4 sm:p-0 sm:bg-transparent rounded-lg">
                  <input 
                    type="text" 
                    value={course.name}
                    onChange={(e) => handleChangeMatkul(course.id, 'name', e.target.value)}
                    placeholder="Nama Mata Kuliah"
                    className="w-full sm:flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-gray-700"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select 
                      value={activeTab} 
                      onChange={(e) => handleChangeDay(course.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-gray-700 bg-white cursor-pointer"
                    >
                      {Object.keys(krsData).map(h => <option key={h} value={h}>{h.substring(0,3)}</option>)}
                    </select>
                    <input 
                      type="time" 
                      value={course.start}
                      onChange={(e) => handleChangeMatkul(course.id, 'start', e.target.value)}
                      className="flex-1 sm:w-28 border border-gray-300 rounded-lg px-2 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-gray-700"
                    />
                    <span className="text-gray-400 font-bold">-</span>
                    <input 
                      type="time" 
                      value={course.end}
                      onChange={(e) => handleChangeMatkul(course.id, 'end', e.target.value)}
                      className="flex-1 sm:w-28 border border-gray-300 rounded-lg px-2 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-gray-700"
                    />
                    <button 
                      onClick={() => handleRemoveMatkul(course.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* STATUS SHIFT PREVIEW */}
        <div className="border-t border-gray-100 pt-8 mt-6">
          <h3 className="text-lg font-bold text-black mb-6">Status Waktu Luang (Shift)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SHIFTS.map(shift => {
              const status = calculateShiftStatus(activeTab, shift);
              const isAvailable = status === 'Tersedia';
              
              return (
                <div 
                  key={shift.id} 
                  className={`flex justify-between items-center p-4 rounded-xl border ${
                    isAvailable 
                      ? 'bg-[#dcfce7] border-[#bbf7d0] text-green-800' // Green
                      : 'bg-[#fee2e2] border-[#fecaca] text-red-800'  // Red
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-lg">{shift.name}</h4>
                    <p className={`text-sm ${isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                      {shift.start} - {shift.end}
                    </p>
                  </div>
                  <span className="text-sm font-medium opacity-80">{status}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* FOOTER BUTTONS */}
      <div className="flex justify-end gap-4 pb-10">
        <button 
          onClick={fetchKrs}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
        >
          Batal (Reset)
        </button>
        <button 
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-white font-medium transition-colors shadow-sm ${saving ? 'bg-blue-400' : 'bg-[#3B82F6] hover:bg-blue-600'}`}
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

    </div>
  );
};

export default AnggotaJadwal;
