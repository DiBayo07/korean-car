import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Loader2, RefreshCw, Car, ShieldAlert, Lock, LogIn } from 'lucide-react';
import { getVehicles, addVehicle, deleteVehicle } from '../lib/api';
import type { Vehicle } from '../lib/api';


interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- Dashboard State ---
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  // Form states
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [generation, setGeneration] = useState('');
  const [trim, setTrim] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(1);
  const [mileage, setMileage] = useState(0);
  const [priceUsd, setPriceUsd] = useState(0);
  const [priceKrw, setPriceKrw] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('Available');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    // Simple credential check
    const validUser = atob('YWRtaW4='); // 'admin'
    const validPass = atob('YWRtaW4xMjM='); // 'admin123'
    if (loginUser === validUser && loginPass === validPass) {
      setIsAuthenticated(true);
    } else {
      setLoginError('Неверный логин или пароль');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !imageUrl) {
      setMessage({ text: 'Заполните Марку, Модель и URL изображения', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const vehicleData: Omit<Vehicle, 'id'> = {
      type: 'car' as const,
      brand: brand.trim(),
      model: model.trim(),
      generation: generation.trim() || undefined,
      trim: trim.trim() || undefined,
      year: Number(year),
      month: Number(month) || undefined,
      mileage: Number(mileage),
      price_usd: Number(priceUsd),
      price_krw: priceKrw ? Number(priceKrw) : undefined,
      image_url: imageUrl.trim(),
      status,
    };

    try {
      const added = await addVehicle(vehicleData);
      setVehicles([added as Vehicle, ...vehicles]);
      
      // Reset Form
      setBrand('');
      setModel('');
      setGeneration('');
      setTrim('');
      setMileage(0);
      setPriceUsd(0);
      setPriceKrw(0);
      setImageUrl('');
      setMessage({ text: 'Транспорт добавлен успешно!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Ошибка при добавлении. Попробуйте снова.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить?')) return;
    try {
      const success = await deleteVehicle(id);
      if (success) {
        setVehicles(vehicles.filter(v => v.id !== id));
        setMessage({ text: 'Удалено успешно.', type: 'success' });
      } else {
        setMessage({ text: 'Ошибка удаления.', type: 'error' });
      }
    } catch (e) {
      setMessage({ text: 'Ошибка удаления.', type: 'error' });
    }
  };

  // Filter list by active tab and search
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.brand.toLowerCase().includes(search.toLowerCase()) || 
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      (v.korean_name && v.korean_name.toLowerCase().includes(search.toLowerCase()));
    
    return matchesSearch;
  });

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-[#121824] border border-white/5 rounded-2xl p-8 shadow-2xl">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-brand-700 to-brand-500 shadow-lg border border-white/10 mb-4">
                <Lock size={24} className="text-kg-gold" />
              </div>
              <h1 className="text-xl font-extrabold text-white">KG Motors Korea</h1>
              <p className="text-[10px] text-kg-gold font-bold uppercase tracking-wider mt-1">Панель администратора</p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl mb-4 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert size={14} />
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Логин</label>
                <input
                  type="text"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  placeholder="Введите логин"
                  className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Пароль</label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="Введите пароль"
                  className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-extrabold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-200"
              >
                <LogIn size={16} />
                Войти
              </button>
            </form>

            <button
              onClick={onBack}
              className="w-full mt-4 py-2.5 text-slate-500 text-xs font-semibold hover:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={14} />
              Вернуться на сайт
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- ADMIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Top Navbar */}
      <div className="sticky top-0 z-40 bg-slate-900 border-b border-white/5 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-300 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-extrabold flex items-center gap-2">
                KG Motors <span className="font-light text-slate-400 text-sm">Dashboard</span>
              </h1>
              <p className="text-[10px] text-kg-gold font-bold uppercase tracking-wider">Admin Panel · Inventory Manager</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Обновить
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column - Left */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#121824] border border-white/5 p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-extrabold mb-6 flex items-center gap-2">
              <Plus size={18} className="text-kg-gold" />
              Добавить автомобиль
            </h2>

            {message && (
              <div className={`p-4 rounded-xl mb-6 text-xs font-semibold flex items-center gap-2 border ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                <ShieldAlert size={16} />
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-4">                  {/* Brand and Model */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Марка</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Hyundai, Kia..."
                    className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Модель</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Grandeur, K7..."
                    className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                  />
                </div>
              </div>

              {/* Generation and Trim */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Поколение</label>
                    <input
                      type="text"
                      value={generation}
                      onChange={(e) => setGeneration(e.target.value)}
                      placeholder="IG, VF..."
                      className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Комплектация</label>
                    <input
                      type="text"
                      value={trim}
                      onChange={(e) => setTrim(e.target.value)}
                      placeholder="2.5 Premium..."
                      className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                    />
                  </div>
                </div>

              {/* Year & Month & Mileage */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Год</label>
                  <input
                    type="number"
                    value={year || ''}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Месяц</label>
                  <input
                    type="number"
                    value={month || ''}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Пробег (км)</label>
                  <input
                    type="number"
                    value={mileage || ''}
                    onChange={(e) => setMileage(Number(e.target.value))}
                    className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                  />
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Цена (USD)</label>
                  <input
                    type="number"
                    value={priceUsd || ''}
                    onChange={(e) => setPriceUsd(Number(e.target.value))}
                    placeholder="15400..."
                    className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">
                    Цена (KRW) (Необязательно)
                  </label>
                  <input
                    type="number"
                    value={priceKrw || ''}
                    onChange={(e) => setPriceKrw(Number(e.target.value))}
                    placeholder="5200000..."
                    className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">URL Изображения</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                />
              </div>

              {/* Status Select */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Статус</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white cursor-pointer"
                >
                  <option value="Available">В наличии</option>
                  <option value="Sold">Продано</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-extrabold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-200 disabled:opacity-40"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Сохранение...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Добавить автомобиль</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* List Column - Right */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Search card */}
          <div className="bg-[#121824] border border-white/5 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по марке или модели..."
              className="w-full sm:w-64 bg-[#1c2436] border border-white/5 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-brand-500/50 text-white"
            />
            <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] text-slate-400 font-bold whitespace-nowrap">
              {filteredVehicles.length} авто
            </span>
          </div>

          {/* List Display */}
          <div className="bg-[#121824] border border-white/5 p-6 rounded-2xl shadow-xl min-h-[400px]">
            <h3 className="text-base font-extrabold mb-6 flex items-center justify-between border-b border-white/5 pb-4">
              <span className="flex items-center gap-2">
                <Car size={16} className="text-kg-gold" />
                Автомобили
              </span>
            </h3>

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 size={32} className="animate-spin text-kg-gold" />
                <span className="text-xs font-semibold">Загрузка инвентаря...</span>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="py-24 text-center text-slate-500 text-xs font-semibold border border-dashed border-white/5 rounded-xl">
                Автомобили не найдены
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredVehicles.map((vehicle) => (
                  <div 
                    key={vehicle.id} 
                    className="flex items-center gap-4 bg-[#1c2436] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all justify-between"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Image Preview */}
                      <div className="w-16 h-12 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={vehicle.image_url} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      {/* Details */}
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                          <Car size={13} className="text-slate-400" />
                          {vehicle.brand} {vehicle.model}
                        </h4>
                        
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {vehicle.year} · {vehicle.mileage.toLocaleString()} км · ${vehicle.price_usd.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/10 hover:border-red-500/20 transition-all flex-shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
