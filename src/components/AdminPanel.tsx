import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Loader2, RefreshCw, Car, Bike, ShieldAlert } from 'lucide-react';
import { getVehicles, addVehicle, deleteVehicle } from '../lib/supabase';
import type { Vehicle } from '../lib/supabase';


interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'car' | 'bike' | 'salvage'>('all');

  // Form states
  const [type, setType] = useState<'car' | 'bike' | 'salvage'>('car');
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
  const [engineCc, setEngineCc] = useState(0);
  const [koreanName, setKoreanName] = useState('');

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

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
      setMessage({ text: 'Please fill in Brand, Model, and Image URL', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const vehicleData: Omit<Vehicle, 'id'> = {
      type,
      brand: brand.trim(),
      model: model.trim(),
      generation: generation.trim() || undefined,
      trim: trim.trim() || undefined,
      year: Number(year),
      month: Number(month) || undefined,
      mileage: Number(mileage),
      price_usd: Number(priceUsd),
      price_krw: type === 'bike' && priceKrw ? Number(priceKrw) : undefined,
      image_url: imageUrl.trim(),
      status,
      engine_cc: type === 'bike' && engineCc ? Number(engineCc) : undefined,
      korean_name: type === 'bike' && koreanName ? koreanName.trim() : undefined,
    };

    try {
      const added = await addVehicle(vehicleData);
      setVehicles([added, ...vehicles]);
      
      // Reset Form
      setBrand('');
      setModel('');
      setGeneration('');
      setTrim('');
      setMileage(0);
      setPriceUsd(0);
      setPriceKrw(0);
      setImageUrl('');
      setEngineCc(0);
      setKoreanName('');
      
      setMessage({ text: 'Vehicle added successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to add vehicle. Try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      const success = await deleteVehicle(id);
      if (success) {
        setVehicles(vehicles.filter(v => v.id !== id));
        setMessage({ text: 'Vehicle deleted successfully.', type: 'success' });
      } else {
        setMessage({ text: 'Failed to delete vehicle.', type: 'error' });
      }
    } catch (e) {
      setMessage({ text: 'Error deleting vehicle.', type: 'error' });
    }
  };

  // Filter list
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.brand.toLowerCase().includes(search.toLowerCase()) || 
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      (v.korean_name && v.korean_name.toLowerCase().includes(search.toLowerCase()));
    
    const matchesType = filterType === 'all' || v.type === filterType;
    return matchesSearch && matchesType;
  });

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
              <p className="text-[10px] text-kg-gold font-bold uppercase tracking-wider">Admin Panel & Inventory Manager</p>
            </div>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column - Left */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#121824] border border-white/5 p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-extrabold mb-6 flex items-center gap-2">
              <Plus size={18} className="text-kg-gold" />
              Add New Vehicle
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

            <form onSubmit={handleAdd} className="space-y-4">
              
              {/* Type Switcher */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-2 uppercase">Vehicle Type</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-1 rounded-xl border border-white/5">
                  {(['car', 'bike', 'salvage'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg capitalize transition-all ${
                        type === t 
                          ? 'bg-brand-500 text-white shadow-md' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand and Model */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Hyundai, Yamaha..."
                    className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Model</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Grandeur, YZF-R3..."
                    className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                  />
                </div>
              </div>

              {/* Car Specific: Generation and Trim */}
              {type === 'car' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Generation</label>
                    <input
                      type="text"
                      value={generation}
                      onChange={(e) => setGeneration(e.target.value)}
                      placeholder="IG, VF..."
                      className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Trim / Option</label>
                    <input
                      type="text"
                      value={trim}
                      onChange={(e) => setTrim(e.target.value)}
                      placeholder="2.5 Premium Choice..."
                      className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                    />
                  </div>
                </div>
              )}

              {/* Bike Specific: Korean name and Engine CC */}
              {type === 'bike' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Korean Name</label>
                    <input
                      type="text"
                      value={koreanName}
                      onChange={(e) => setKoreanName(e.target.value)}
                      placeholder="로얄엔필드 인터셉터..."
                      className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Engine CC</label>
                    <input
                      type="number"
                      value={engineCc || ''}
                      onChange={(e) => setEngineCc(Number(e.target.value))}
                      placeholder="650, 321..."
                      className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                    />
                  </div>
                </div>
              )}

              {/* Year & Month & Mileage */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Year</label>
                  <input
                    type="number"
                    value={year || ''}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Month</label>
                  <input
                    type="number"
                    value={month || ''}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Mileage (km)</label>
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
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Price (USD)</label>
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
                    Price (KRW) {type !== 'bike' && '(Optional)'}
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
                <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Image URL</label>
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
                <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1.5 uppercase">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#1c2436] border border-white/5 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-brand-500/50 text-white cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Add Vehicle</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* List Column - Right */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Filters card */}
          <div className="bg-[#121824] border border-white/5 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by brand or model..."
              className="w-full sm:w-64 bg-[#1c2436] border border-white/5 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-brand-500/50 text-white"
            />

            {/* Type selector */}
            <div className="flex gap-1 bg-slate-900/60 p-1 rounded-lg border border-white/5 self-stretch sm:self-auto justify-between">
              {(['all', 'car', 'bike', 'salvage'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`py-1.5 px-3 text-[10px] font-extrabold rounded-md uppercase transition-all ${
                    filterType === t 
                      ? 'bg-brand-500 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* List Display */}
          <div className="bg-[#121824] border border-white/5 p-6 rounded-2xl shadow-xl min-h-[400px]">
            <h3 className="text-base font-extrabold mb-6 flex items-center justify-between border-b border-white/5 pb-4">
              <span>Inventory List</span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-slate-400 font-bold">
                {filteredVehicles.length} Vehicles
              </span>
            </h3>

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 size={32} className="animate-spin text-kg-gold" />
                <span className="text-xs font-semibold">Loading current inventory...</span>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="py-24 text-center text-slate-500 text-xs font-semibold border border-dashed border-white/5 rounded-xl">
                No matching vehicles found.
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
                          {vehicle.type === 'car' ? <Car size={13} className="text-slate-400" /> : <Bike size={13} className="text-slate-400" />}
                          {vehicle.brand} {vehicle.model}
                        </h4>
                        
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {vehicle.year} · {vehicle.mileage.toLocaleString()} km · ${vehicle.price_usd.toLocaleString()}
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
