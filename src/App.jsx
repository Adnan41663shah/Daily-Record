import { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, FileSpreadsheet, Edit2, Info, LogOut, Copy, Upload, Shield, BarChart2, X, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Helper to generate a unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Default sheet template
const createNewSheet = (name) => {
  let records = [];
  const parts = name.split(' ');
  if (parts.length === 2) {
    const monthName = parts[0];
    const yearStr = parts[1];
    const monthIndex = new Date(Date.parse(monthName + " 1, 2012")).getMonth();
    const year = parseInt(yearStr, 10);
    
    if (!isNaN(monthIndex) && !isNaN(year)) {
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        records.push({
          id: generateId(),
          date: dateStr,
          morning: '',
          night: '',
          notes: ''
        });
      }
    }
  }
  
  if (records.length === 0) {
    records = [{ id: generateId(), date: '', morning: '', night: '', notes: '' }];
  }

  return {
    id: generateId(),
    name: name,
    price: '',
    records
  };
};

// Auth Helpers
const SESSION_DAYS = 15;
const getSession = () => {
  try {
    const session = JSON.parse(localStorage.getItem('tiffin_session'));
    if (session && session.expiresAt > Date.now()) {
      return session.name;
    }
    return null;
  } catch (e) { return null; }
};
const setSession = (name) => {
  localStorage.setItem('tiffin_session', JSON.stringify({
    name,
    expiresAt: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  }));
};
const clearSession = () => localStorage.removeItem('tiffin_session');

// ----------------------------------------------------------------------
// DATE FORMATTER & COMPONENT
// ----------------------------------------------------------------------
const formatDateToDDMMYY = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year.slice(2)}`;
};

function CustomDateInput({ value, onChange }) {
  const [isEditing, setIsEditing] = useState(false);
  
  if (isEditing) {
    return (
      <input 
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setIsEditing(false)}
        autoFocus
        className="w-full bg-transparent border-0 focus:ring-0 p-1 sm:p-1.5 text-xs sm:text-sm text-zinc-800 font-medium rounded-md hover:bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-zinc-900/10 transition-all outline-none"
      />
    );
  }
  
  return (
    <div 
      onClick={() => setIsEditing(true)}
      className="w-full p-1 sm:p-1.5 text-xs sm:text-sm text-zinc-800 font-medium rounded-md hover:bg-zinc-100 transition-all cursor-pointer min-h-[28px] sm:min-h-[32px] flex items-center"
    >
      {value ? formatDateToDDMMYY(value) : 'Select date...'}
    </div>
  );
}

// ----------------------------------------------------------------------
// LOGIN SCREEN
// ----------------------------------------------------------------------
function LoginScreen({ onLogin }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isImportMode, setIsImportMode] = useState(false);
  const [importCode, setImportCode] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (isImportMode) {
      try {
        const decoded = JSON.parse(atob(importCode));
        if (!decoded.name || !decoded.password || !decoded.data) throw new Error();
        
        const safeName = decoded.name;
        localStorage.setItem(`tiffin_auth_${safeName}`, JSON.stringify({ password: decoded.password }));
        localStorage.setItem(`tiffinTrackerData_${safeName}`, JSON.stringify(decoded.data));
        
        onLogin(safeName);
      } catch (e) {
        setError("Invalid sync code. Please check and try again.");
      }
      return;
    }

    if (!name.trim() || !password.trim()) {
      setError("Please enter both name and password.");
      return;
    }
    const safeName = name.trim().toLowerCase();
    const authKey = `tiffin_auth_${safeName}`;
    const storedAuth = localStorage.getItem(authKey);
    
    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);
      if (parsedAuth.password !== password) {
        setError("Incorrect password for this name.");
        return;
      }
    } else {
      // Register new user locally
      localStorage.setItem(authKey, JSON.stringify({ password }));
    }
    onLogin(safeName);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 selection:bg-zinc-200 selection:text-zinc-900 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden relative z-10">
        <div className="p-8 pb-4 text-center">
          <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-zinc-900/20">
            <Shield className="text-white" size={26} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Welcome to Tiffin Tracker</h2>
          <p className="text-zinc-500 mt-2 text-sm font-medium">Secure local access for your daily records</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 pt-4 space-y-5">
          {error && (
            <div className="p-3 bg-red-50/80 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-red-500 block"></span>
              {error}
            </div>
          )}

          {!isImportMode ? (
            <>
              <div className="space-y-1">
                <label className="block text-xs font-semibold tracking-wide text-zinc-600 uppercase">Your Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border border-slate-200/80 rounded-xl focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all outline-none text-zinc-900 font-medium placeholder-zinc-400"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold tracking-wide text-zinc-600 uppercase">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white border border-slate-200/80 rounded-xl focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all outline-none text-zinc-900 font-medium placeholder-zinc-400"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 rounded-md transition-colors focus:outline-none"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                <strong className="text-zinc-700 font-semibold">Note:</strong> Data is stored locally on this device. To access data elsewhere, use the "Sync" feature inside.
              </p>
            </>
          ) : (
            <div className="space-y-1">
              <label className="block text-xs font-semibold tracking-wide text-zinc-600 uppercase">Paste Sync Code</label>
              <textarea 
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-slate-200/80 rounded-xl focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all outline-none h-32 resize-none font-mono text-xs text-zinc-800 placeholder-zinc-400"
                placeholder="Paste the code copied from your other device here..."
              />
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-zinc-900/10 hover:shadow-lg active:scale-[0.98] flex justify-center items-center gap-2"
          >
            {isImportMode ? "Import & Login" : "Continue"}
          </button>

          <div className="text-center pt-2">
            <button 
              type="button" 
              onClick={() => { setIsImportMode(!isImportMode); setError(''); }}
              className="text-xs text-zinc-500 font-semibold hover:text-zinc-900 transition-colors"
            >
              {isImportMode ? "Back to Login" : "Import data from another device?"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// DASHBOARD
// ----------------------------------------------------------------------
function Dashboard({ user, onLogout }) {
  const dataKey = `tiffinTrackerData_${user}`;

  // Load data from localStorage or initialize with one sheet
  const [sheets, setSheets] = useState(() => {
    try {
      const saved = localStorage.getItem(dataKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load data from localStorage', e);
    }
    const currentMonthYear = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    return [createNewSheet(currentMonthYear)];
  });

  const [activeSheetId, setActiveSheetId] = useState(sheets[0]?.id);
  const [editingSheetId, setEditingSheetId] = useState(null);
  const [editSheetName, setEditSheetName] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showMonthSelect, setShowMonthSelect] = useState(false);
  const [showNavbarPassword, setShowNavbarPassword] = useState(false);

  // Persist data to localStorage whenever sheets change
  useEffect(() => {
    localStorage.setItem(dataKey, JSON.stringify(sheets));
  }, [sheets, dataKey]);

  const activeSheetIndex = sheets.findIndex(s => s.id === activeSheetId);
  const activeSheet = sheets[activeSheetIndex];

  if (!activeSheet) {
    if (sheets.length > 0) setActiveSheetId(sheets[0].id);
    return null;
  }

  // --- Sync / Export feature ---
  const handleExportSync = () => {
    const auth = JSON.parse(localStorage.getItem(`tiffin_auth_${user}`));
    const payload = btoa(JSON.stringify({ name: user, password: auth.password, data: sheets }));
    navigator.clipboard.writeText(payload);
    alert("Sync code copied to clipboard! \n\nTo use on another device:\n1. Open this app on the new device.\n2. Click 'Import data from another device' on the login screen.\n3. Paste the code.");
  };

  // --- Sheet Actions ---
  const handleAddSheet = (monthName) => {
    const newSheet = createNewSheet(monthName);
    setSheets([...sheets, newSheet]);
    setActiveSheetId(newSheet.id);
    setShowMonthSelect(false);
  };

  const handleDeleteSheet = (id) => {
    if (sheets.length === 1) {
      alert("You must have at least one sheet.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this sheet?")) {
      const newSheets = sheets.filter(s => s.id !== id);
      setSheets(newSheets);
      if (activeSheetId === id) {
        setActiveSheetId(newSheets[0].id);
      }
    }
  };

  const startEditingSheet = (id, name) => {
    setEditingSheetId(id);
    setEditSheetName(name);
  };

  const saveSheetName = (id) => {
    if (editSheetName.trim() === '') return;
    updateSheet(id, { name: editSheetName.trim() });
    setEditingSheetId(null);
  };

  const updateSheet = (id, updates) => {
    setSheets(sheets.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const updateActiveSheet = (updates) => {
    updateSheet(activeSheetId, updates);
  };

  // --- Record Actions ---
  const updateRecord = (recordId, field, value) => {
    let newRecords = activeSheet.records.map(rec => 
      rec.id === recordId ? { ...rec, [field]: value } : rec
    );
    
    // Automatically add a new row if the last row is being filled
    const lastRecord = newRecords[newRecords.length - 1];
    if (lastRecord.id === recordId && value !== '') {
       if (lastRecord.date !== '' || lastRecord.morning !== '' || lastRecord.night !== '' || lastRecord.notes !== '') {
          newRecords.push({ id: generateId(), date: '', morning: '', night: '', notes: '' });
       }
    }

    updateActiveSheet({ records: newRecords });
  };

  const deleteRecord = (recordId) => {
    let newRecords = activeSheet.records.filter(r => r.id !== recordId);
    if (newRecords.length === 0) {
      newRecords = [{ id: generateId(), date: '', morning: '', night: '', notes: '' }];
    }
    updateActiveSheet({ records: newRecords });
  };

  // --- Calculations & Formatting ---
  const getDayOfWeek = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const safeParseInt = (val) => {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const totalMorning = activeSheet.records.reduce((sum, rec) => sum + safeParseInt(rec.morning), 0);
  const totalNight = activeSheet.records.reduce((sum, rec) => sum + safeParseInt(rec.night), 0);
  const totalTiffins = totalMorning + totalNight;
  
  const [calculatedTotal, setCalculatedTotal] = useState(null);

  // Reset calculated total if price changes to prompt recalculation
  useEffect(() => {
    setCalculatedTotal(null);
  }, [activeSheet.price, totalTiffins]);

  const handleCalculate = () => {
    const priceNum = parseFloat(activeSheet.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid price.");
      return;
    }
    setCalculatedTotal(totalTiffins * priceNum);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-800 font-sans selection:bg-zinc-200 selection:text-zinc-900">
      
      {/* Header & Tabs */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 shadow-[0_1px_0_0_rgb(0,0,0,0.03)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:h-16 gap-3 sm:gap-0">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm shadow-zinc-900/20">
                  <FileSpreadsheet size={16} />
                </div>
                <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
                  Tiffin Tracker
                </h1>
              </div>
              
              {/* Mobile Right Icons */}
              <div className="flex items-center gap-1 sm:hidden">
                <button onClick={() => setIsReportOpen(true)} className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors" title="View Report">
                  <BarChart2 size={18} />
                </button>
                <button onClick={handleExportSync} className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors" title="Copy Sync Code">
                  <Copy size={18} />
                </button>
                <button onClick={onLogout} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
            
            {/* Desktop Right Info */}
            <div className="hidden sm:flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white text-zinc-700 rounded-lg text-sm font-semibold border border-slate-200/80 shadow-sm hover:bg-zinc-50 hover:border-slate-300 transition-all active:scale-95" onClick={() => setIsReportOpen(true)} title="View Summary Report">
                <BarChart2 size={15} />
                <span className="hidden md:inline">Report</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white text-zinc-700 rounded-lg text-sm font-semibold border border-slate-200/80 shadow-sm hover:bg-zinc-50 hover:border-slate-300 transition-all active:scale-95" onClick={handleExportSync} title="Click to copy cross-device sync code">
                <Copy size={15} />
                <span className="hidden md:inline">Sync</span>
              </button>
              <div className="h-5 w-px bg-slate-200/80 mx-1"></div>
              <div className="flex items-center gap-3">
                <div 
                  className="flex flex-col items-end cursor-pointer select-none group"
                  onClick={() => setShowNavbarPassword(!showNavbarPassword)}
                  title="Click to reveal password"
                >
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold group-hover:text-zinc-600 transition-colors">Account</span>
                  <span className="text-sm font-semibold text-zinc-900 capitalize leading-none mt-0.5 group-hover:text-zinc-700 transition-colors">
                    {showNavbarPassword ? JSON.parse(localStorage.getItem(`tiffin_auth_${user}`))?.password : user}
                  </span>
                </div>
                <button onClick={onLogout} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Sheet Tabs - Scrollable horizontally on mobile */}
          <div className="flex overflow-x-auto hide-scrollbar gap-1.5 items-center py-2 sm:py-3 border-t border-slate-100 sm:border-0 sm:mt-0">
            {sheets.map(sheet => (
              <div key={sheet.id} className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 border",
                activeSheetId === sheet.id 
                  ? "bg-white border-slate-200/80 text-zinc-900 shadow-sm" 
                  : "bg-transparent border-transparent text-zinc-500 hover:bg-black/[0.03] hover:text-zinc-800 cursor-pointer"
              )}>
                {editingSheetId === sheet.id ? (
                  <div className="flex items-center gap-1">
                    <input 
                      autoFocus
                      type="text"
                      className="bg-white border border-zinc-300 rounded px-2 py-0.5 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 text-zinc-900"
                      value={editSheetName}
                      onChange={(e) => setEditSheetName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveSheetName(sheet.id)}
                      onBlur={() => saveSheetName(sheet.id)}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2" onClick={() => setActiveSheetId(sheet.id)}>
                    <span>{sheet.name}</span>
                    {activeSheetId === sheet.id && (
                      <button onClick={(e) => { e.stopPropagation(); startEditingSheet(sheet.id, sheet.name); }} className="text-zinc-400 hover:text-zinc-900 p-0.5 rounded transition-colors">
                        <Edit2 size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            <button onClick={() => setShowMonthSelect(true)} className="flex items-center justify-center w-7 h-7 rounded-lg bg-white text-zinc-600 hover:bg-zinc-50 transition-all shrink-0 border border-slate-200/80 shadow-sm ml-1" title="Add Sheet">
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Sheet Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">{activeSheet.name}</h2>
            <p className="text-sm text-zinc-500 mt-1 font-medium">Manage your daily tiffin records.</p>
          </div>
          <button 
            onClick={() => handleDeleteSheet(activeSheetId)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-red-600 bg-transparent hover:bg-red-50 rounded-lg transition-colors self-start sm:self-auto group"
          >
            <Trash2 size={14} className="opacity-70 group-hover:opacity-100" />
            Delete Sheet
          </button>
        </div>

        {/* Data Table Card */}
        <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200/80 overflow-hidden flex flex-col">
          <div className="overflow-auto hide-scrollbar max-h-[60vh] sm:max-h-[500px]">
            <table className="w-full text-left border-collapse min-w-[700px] relative">
              <thead className="sticky top-0 z-20">
                <tr className="shadow-[0_1px_0_0_#e2e8f0] text-[10px] sm:text-xs">
                  <th className="py-2 px-2 sm:py-3 sm:px-4 font-bold text-zinc-400 uppercase tracking-widest w-12 sm:w-16 text-center border-r border-slate-100 bg-zinc-50/95 backdrop-blur-md">S.No</th>
                  <th className="py-2 px-2 sm:py-3 sm:px-4 font-bold text-zinc-400 uppercase tracking-widest min-w-[120px] sm:min-w-[140px] border-r border-slate-100 bg-zinc-50/95 backdrop-blur-md">Date</th>
                  <th className="py-2 px-2 sm:py-3 sm:px-4 font-bold text-zinc-400 uppercase tracking-widest w-16 sm:w-20 text-center border-r border-slate-100 bg-zinc-50/95 backdrop-blur-md">Day</th>
                  <th className="py-0 px-0 font-bold text-zinc-400 uppercase tracking-widest text-center border-r border-slate-100 bg-slate-50/95 backdrop-blur-md" colSpan={2}>
                    <div className="py-1 sm:py-1.5 border-b border-slate-200/60">Tiffin Count</div>
                    <div className="flex w-full">
                      <span className="flex-1 py-1 sm:py-1.5 text-center text-zinc-500">Morning</span>
                      <span className="flex-1 py-1 sm:py-1.5 text-center text-zinc-500 border-l border-slate-200/60">Night</span>
                    </div>
                  </th>
                  <th className="py-2 px-2 sm:py-3 sm:px-4 font-bold text-zinc-400 uppercase tracking-widest min-w-[120px] sm:min-w-[150px] border-r border-slate-100 text-center bg-zinc-50/95 backdrop-blur-md">Notes</th>
                  <th className="py-2 px-2 sm:py-3 sm:px-4 font-bold text-zinc-400 uppercase tracking-widest w-16 sm:w-20 text-center bg-zinc-50/95 backdrop-blur-md">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {activeSheet.records.map((record, index) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-zinc-400 text-center border-r border-slate-100/60 font-semibold">
                      {index + 1}
                    </td>
                    <td className="py-1 sm:py-2 px-2 sm:px-4 border-r border-slate-100/60">
                      <CustomDateInput 
                        value={record.date}
                        onChange={(val) => updateRecord(record.id, 'date', val)}
                      />
                    </td>
                    <td className="py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-zinc-500 text-center border-r border-slate-100/60 font-medium">
                      {getDayOfWeek(record.date)}
                    </td>
                    <td className="py-0 px-0 border-r border-slate-100/60 bg-zinc-50/30 h-full" colSpan={2}>
                      <div className="flex h-full min-h-[32px] sm:min-h-[40px] items-stretch">
                        <div className="flex-1 border-r border-slate-100/60 p-0.5 sm:p-1 flex items-center">
                           <input 
                              type="number" 
                              min="0"
                              placeholder="0"
                              value={record.morning}
                              onChange={(e) => updateRecord(record.id, 'morning', e.target.value)}
                              className="w-full bg-transparent border-0 focus:ring-0 p-1 text-xs sm:text-sm text-center text-zinc-900 font-semibold rounded-md hover:bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-zinc-900/10 transition-all outline-none"
                            />
                        </div>
                        <div className="flex-1 p-0.5 sm:p-1 flex items-center">
                           <input 
                              type="number" 
                              min="0"
                              placeholder="0"
                              value={record.night}
                              onChange={(e) => updateRecord(record.id, 'night', e.target.value)}
                              className="w-full bg-transparent border-0 focus:ring-0 p-1 text-xs sm:text-sm text-center text-zinc-900 font-semibold rounded-md hover:bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-zinc-900/10 transition-all outline-none"
                            />
                        </div>
                      </div>
                    </td>
                    <td className="py-1 sm:py-2 px-2 sm:px-4 border-r border-slate-100/60">
                      <input 
                        type="text" 
                        placeholder="Add note..."
                        value={record.notes || ''}
                        onChange={(e) => updateRecord(record.id, 'notes', e.target.value)}
                        className="w-full bg-transparent border-0 focus:ring-0 p-1 sm:p-1.5 text-xs sm:text-sm text-zinc-800 font-medium rounded-md hover:bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-zinc-900/10 transition-all outline-none"
                      />
                    </td>
                    <td className="py-1 sm:py-2 px-2 sm:px-4 text-center">
                      <button 
                        onClick={() => deleteRecord(record.id)}
                        className="p-1.5 sm:p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 sm:scale-90 group-hover:scale-100 mx-auto"
                        title="Delete row"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 z-20 shadow-[0_-1px_0_0_#e2e8f0] font-semibold text-xs sm:text-sm">
                <tr>
                  <td colSpan={3} className="py-2 px-2 sm:py-3 sm:px-4 text-right text-zinc-500 border-r border-slate-100/60 bg-zinc-50 uppercase tracking-widest text-[10px] sm:text-xs font-bold">
                    Total Count
                  </td>
                  <td className="border-r border-slate-100/60 p-0" colSpan={2}>
                     <div className="flex h-full items-stretch">
                        <div className="flex-1 py-2 sm:py-3 text-center text-zinc-900 bg-white border-r border-slate-100/60 text-base sm:text-lg">
                          {totalMorning}
                        </div>
                        <div className="flex-1 py-2 sm:py-3 text-center text-zinc-900 bg-white text-base sm:text-lg">
                          {totalNight}
                        </div>
                     </div>
                  </td>
                  <td colSpan={2} className="py-2 px-2 sm:py-3 sm:px-4 text-center text-zinc-900 bg-zinc-100/80 font-bold whitespace-nowrap text-base sm:text-lg border-t border-slate-100/60">
                    {totalTiffins} Total
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Calculation Section */}
        <div className="bg-zinc-900 rounded-2xl shadow-xl shadow-zinc-900/10 border border-zinc-800 overflow-hidden text-white relative">
          <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="p-6 sm:p-8 relative z-10">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center justify-between">
              
              {/* Left: Input */}
              <div className="w-full md:w-auto flex-1 max-w-md">
                <label className="block text-xs font-semibold tracking-wide text-zinc-400 uppercase mb-2">Price per Tiffin</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-zinc-500 font-medium text-lg">₹</span>
                    </div>
                    <input 
                      type="number" 
                      min="0"
                      step="any"
                      value={activeSheet.price}
                      onChange={(e) => updateActiveSheet({ price: e.target.value })}
                      placeholder="e.g. 50"
                      className="block w-full pl-10 pr-4 py-3.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20 focus:border-zinc-500 transition-all font-medium text-lg"
                    />
                  </div>
                  <button 
                    onClick={handleCalculate}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-xl shadow-lg shadow-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-white active:scale-95 whitespace-nowrap"
                  >
                    <Calculator size={18} />
                    <span>Calculate</span>
                  </button>
                </div>
              </div>

              {/* Right: Result */}
              <div className="w-full md:w-auto bg-zinc-800/30 backdrop-blur-md border border-zinc-700/50 rounded-xl p-5 min-w-[280px] flex flex-col justify-center items-center md:items-end text-center md:text-right">
                <div className="text-zinc-400 text-[10px] font-bold mb-1 uppercase tracking-widest">Total Payable Amount</div>
                <div className="text-5xl font-bold text-white tracking-tight my-1">
                  {calculatedTotal !== null ? `₹${calculatedTotal.toLocaleString('en-IN')}` : '---'}
                </div>
                {calculatedTotal !== null && (
                  <div className="text-xs text-zinc-400 mt-2 font-medium flex items-center gap-1.5 bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-700/80">
                    <CheckCircle2 size={14} className="text-zinc-300" />
                    <span>Calculated for {totalTiffins} tiffins @ ₹{activeSheet.price}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer padding for mobile */}
      <div className="h-12 sm:h-8"></div>
      
      {isReportOpen && <ReportModal sheets={sheets} onClose={() => setIsReportOpen(false)} />}
      {showMonthSelect && <MonthSelectModal onClose={() => setShowMonthSelect(false)} onSelect={handleAddSheet} />}
    </div>
  );
}

// ----------------------------------------------------------------------
// REPORT MODAL
// ----------------------------------------------------------------------
function ReportModal({ sheets, onClose }) {
  const safeParseInt = (val) => {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const reportData = sheets.map(sheet => {
    const totalMorning = sheet.records.reduce((sum, rec) => sum + safeParseInt(rec.morning), 0);
    const totalNight = sheet.records.reduce((sum, rec) => sum + safeParseInt(rec.night), 0);
    const totalTiffins = totalMorning + totalNight;
    const priceNum = parseFloat(sheet.price) || 0;
    const totalAmount = totalTiffins * priceNum;
    
    return {
      id: sheet.id,
      name: sheet.name,
      morning: totalMorning,
      night: totalNight,
      total: totalTiffins,
      price: priceNum,
      amount: totalAmount
    };
  });

  const grandMorning = reportData.reduce((sum, row) => sum + row.morning, 0);
  const grandNight = reportData.reduce((sum, row) => sum + row.night, 0);
  const grandTotalTiffins = grandMorning + grandNight;
  const grandTotalAmount = reportData.reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/60 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-100 text-zinc-900 rounded-2xl flex items-center justify-center border border-slate-200/60">
              <BarChart2 size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Comprehensive Report</h2>
              <p className="text-[13px] text-zinc-500 font-medium mt-0.5">All sheets summary and calculations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-[#FAFAFA]">
          <div className="overflow-x-auto hide-scrollbar rounded-xl border border-slate-200/80 bg-white shadow-sm">
            <table className="w-full text-left border-collapse min-w-[300px] sm:min-w-[600px]">
              <thead>
                <tr className="bg-zinc-50/95 border-b border-slate-200/80">
                  <th className="py-2 px-1.5 sm:py-3 sm:px-4 text-[9px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest border-r border-slate-100/60">
                    <span className="hidden sm:inline">Sheet Name</span>
                    <span className="sm:hidden">Month</span>
                  </th>
                  <th className="py-2 px-1.5 sm:py-3 sm:px-4 text-[9px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-center border-r border-slate-100/60">
                    <span className="hidden sm:inline">Morning</span>
                    <span className="sm:hidden">Morn</span>
                  </th>
                  <th className="py-2 px-1.5 sm:py-3 sm:px-4 text-[9px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-center border-r border-slate-100/60">
                    <span className="hidden sm:inline">Night</span>
                    <span className="sm:hidden">Night</span>
                  </th>
                  <th className="py-2 px-1.5 sm:py-3 sm:px-4 text-[9px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-center border-r border-slate-100/60 bg-zinc-100/50">
                    <span className="hidden sm:inline">Total Tiffins</span>
                    <span className="sm:hidden">Total</span>
                  </th>
                  <th className="py-2 px-1.5 sm:py-3 sm:px-4 text-[9px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-right border-r border-slate-100/60">
                    <span className="hidden sm:inline">Price / Unit</span>
                    <span className="sm:hidden">Price</span>
                  </th>
                  <th className="py-2 px-1.5 sm:py-3 sm:px-4 text-[9px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-right bg-zinc-100/50">
                    <span className="hidden sm:inline">Amount Payable</span>
                    <span className="sm:hidden">Amount</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {reportData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors text-[11px] sm:text-sm">
                    <td className="py-2 px-1.5 sm:py-3 sm:px-4 font-semibold text-zinc-900 border-r border-slate-100/60 whitespace-nowrap tracking-tighter sm:tracking-normal">{row.name}</td>
                    <td className="py-2 px-1.5 sm:py-3 sm:px-4 text-center font-medium text-zinc-500 border-r border-slate-100/60">{row.morning}</td>
                    <td className="py-2 px-1.5 sm:py-3 sm:px-4 text-center font-medium text-zinc-500 border-r border-slate-100/60">{row.night}</td>
                    <td className="py-2 px-1.5 sm:py-3 sm:px-4 text-center font-bold text-zinc-900 border-r border-slate-100/60 bg-zinc-50/50">{row.total}</td>
                    <td className="py-2 px-1.5 sm:py-3 sm:px-4 text-right font-medium text-zinc-400 border-r border-slate-100/60 tracking-tighter sm:tracking-normal">₹{row.price}</td>
                    <td className="py-2 px-1.5 sm:py-3 sm:px-4 text-right font-bold text-zinc-900 bg-zinc-50/50 whitespace-nowrap tracking-tighter sm:tracking-normal">₹{row.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-zinc-900 text-white font-semibold text-[11px] sm:text-sm shadow-[0_-1px_0_0_rgba(0,0,0,0.1)]">
                <tr>
                  <td className="py-3 px-1.5 sm:py-4 sm:px-4 text-right border-r border-zinc-800 tracking-widest uppercase text-[10px] sm:text-xs text-zinc-400">
                    <span className="hidden sm:inline">Grand Total:</span>
                    <span className="sm:hidden">Total:</span>
                  </td>
                  <td className="py-3 px-1.5 sm:py-4 sm:px-4 text-center border-r border-zinc-800 text-zinc-300">{grandMorning}</td>
                  <td className="py-3 px-1.5 sm:py-4 sm:px-4 text-center border-r border-zinc-800 text-zinc-300">{grandNight}</td>
                  <td className="py-3 px-1.5 sm:py-4 sm:px-4 text-center border-r border-zinc-800 text-white font-bold sm:text-lg">{grandTotalTiffins}</td>
                  <td className="py-3 px-1.5 sm:py-4 sm:px-4 text-right border-r border-zinc-800 text-zinc-600">---</td>
                  <td className="py-3 px-1.5 sm:py-4 sm:px-4 text-right font-bold text-white sm:text-xl tracking-tight whitespace-nowrap">₹{grandTotalAmount.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MONTH SELECT MODAL
// ----------------------------------------------------------------------
function MonthSelectModal({ onClose, onSelect }) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear());

  const handleCreate = () => {
    onSelect(`${selectedMonth} ${year}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-8 w-full max-w-sm border border-white/20">
        <h3 className="text-xl font-bold text-zinc-900 tracking-tight mb-1.5">Create New Sheet</h3>
        <p className="text-[13px] text-zinc-500 font-medium mb-6">Select the month and year for this sheet.</p>
        
        <div className="flex gap-4 mb-8">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Month</label>
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)} 
              className="w-full p-3.5 bg-white border border-slate-200/80 rounded-xl focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-500 outline-none text-zinc-900 font-semibold transition-all shadow-sm"
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="w-1/3">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Year</label>
            <input 
              type="number" 
              value={year} 
              onChange={e => setYear(e.target.value)} 
              className="w-full p-3.5 bg-white border border-slate-200/80 rounded-xl focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-500 outline-none text-zinc-900 font-semibold transition-all shadow-sm" 
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-zinc-600 bg-white border border-slate-200/80 hover:bg-zinc-50 hover:border-slate-300 rounded-xl font-semibold transition-all shadow-sm">Cancel</button>
          <button onClick={handleCreate} className="px-5 py-2.5 text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl font-semibold transition-all shadow-md shadow-zinc-900/20 active:scale-95">Create Sheet</button>
        </div>
      </div>
    </div>
  );
}

// Main App export wrappers
export default function App() {
  const [user, setUser] = useState(getSession());

  if (!user) {
    return <LoginScreen onLogin={(name) => { setSession(name); setUser(name); }} />;
  }

  return <Dashboard user={user} onLogout={() => { clearSession(); setUser(null); }} />;
}
