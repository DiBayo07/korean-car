import { useState, useMemo } from 'react';
import { Search, Calendar, Gauge, DollarSign, Zap } from 'lucide-react';
import type { Vehicle } from '../lib/api';
import type { Language, TranslationDict } from '../lib/translations';

interface BikesPageProps {
  vehicles: Vehicle[];
  t: TranslationDict;
  lang: Language;
}

export const BikesPage: React.FC<BikesPageProps> = ({ vehicles, t, lang }) => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);

  const bikesOnly = useMemo(() => vehicles.filter(v => v.type === 'bike'), [vehicles]);
  const brands = useMemo(() => Array.from(new Set(bikesOnly.map(v => v.brand))).sort(), [bikesOnly]);

  // Cascading: models filtered by selected brand
  const models = useMemo(() => {
    if (!selectedBrand) return [];
    return Array.from(new Set(
      bikesOnly.filter(v => v.brand === selectedBrand).map(v => v.model)
    )).sort();
  }, [bikesOnly, selectedBrand]);

  // Filtered results
  const filtered = useMemo(() => {
    return bikesOnly.filter(v => {
      const matchBrand = !selectedBrand || v.brand === selectedBrand;
      const matchModel = !selectedModel || v.model === selectedModel;
      return matchBrand && matchModel;
    });
  }, [bikesOnly, selectedBrand, selectedModel]);

  const visibleBikes = filtered.slice(0, visibleCount);

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedModel('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Banner */}
      <section className="relative w-full h-[40vh] min-h-[280px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center brightness-[0.3]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1920&auto=format&fit=crop')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950" />
        <div className="relative z-10 text-center px-4">
          <span className="text-xs font-extrabold text-kg-gold uppercase tracking-[0.2em] block mb-3">
            {lang === 'en' ? 'Motorcycle Catalog' : lang === 'ru' ? 'Каталог мототехники' : 'Мотоцикл каталогу'}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {lang === 'en' ? 'Motorcycles from Korea' : lang === 'ru' ? 'Мотоциклы из Кореи' : 'Кореядан мотоциклдер'}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            {lang === 'en' ? 'Quality motorcycles and scooters at the best prices' : lang === 'ru' ? 'Качественные мотоциклы и скутеры по лучшим ценам' : 'Эң жакшы баада сапаттуу мотоциклдер жана скутерлер'}
          </p>
        </div>
      </section>

      {/* Search / Filter Bar */}
      <div className="sticky top-20 z-30 bg-slate-950/95 backdrop-blur-md border-b border-white/5 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Brand */}
          <div className="flex-1 flex flex-col bg-[#121824] rounded-xl px-4 py-2.5 border border-white/5">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">{t.searchBrand}</span>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedModel('');
              }}
              className="bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900">{t.selectBrand}</option>
              {brands.map(b => <option key={b} value={b} className="bg-slate-900">{b}</option>)}
            </select>
          </div>

          {/* Model */}
          <div className="flex-1 flex flex-col bg-[#121824] rounded-xl px-4 py-2.5 border border-white/5">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">{t.searchModel}</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!selectedBrand}
              className="bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="" className="bg-slate-900">{t.selectModel}</option>
              {models.map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)}
            </select>
          </div>

          {/* Clear / Count */}
          <div className="flex items-center gap-3">
            {(selectedBrand || selectedModel) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5 transition-all"
              >
                ✕ {lang === 'en' ? 'Clear' : lang === 'ru' ? 'Сбросить' : 'Тазалоо'}
              </button>
            )}
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
              {filtered.length} {lang === 'en' ? 'bikes' : lang === 'ru' ? 'мото' : 'мотоцикл'}
            </span>
          </div>
        </div>
      </div>

      {/* Bikes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <Search size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500 text-sm font-semibold">
              {lang === 'en' ? 'No motorcycles found' : lang === 'ru' ? 'Мотоциклы не найдены' : 'Мотоциклдер табылган жок'}
            </p>
            <button onClick={clearFilters} className="mt-4 px-6 py-2 bg-brand-500 text-white text-xs font-bold rounded-lg hover:bg-brand-600 transition-all">
              {lang === 'en' ? 'Clear filters' : lang === 'ru' ? 'Сбросить фильтры' : 'Чыпкаларды тазалоо'}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleBikes.map((bike) => (
                <div
                  key={bike.id}
                  className="group bg-[#121824] rounded-2xl border border-white/5 overflow-hidden hover:border-kg-gold/20 hover:shadow-2xl hover:shadow-kg-gold/5 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={bike.image_url}
                      alt={`${bike.brand} ${bike.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Brand badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white rounded-lg border border-white/10">
                      {bike.brand}
                    </span>
                    {/* Status badge */}
                    <span className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold rounded-lg border backdrop-blur-sm ${
                      bike.status === 'Available'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {bike.status}
                    </span>
                    {/* Engine CC badge */}
                    {bike.engine_cc && (
                      <span className="absolute bottom-3 left-3 px-2 py-1 bg-brand-500/80 backdrop-blur-sm text-[10px] font-bold text-white rounded-lg flex items-center gap-1">
                        <Zap size={10} />
                        {bike.engine_cc}cc
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <h3 className="text-sm font-extrabold text-white truncate">
                      {bike.brand} {bike.model}
                    </h3>
                    {bike.korean_name && (
                      <p className="text-[10px] text-slate-500 font-medium truncate -mt-2">{bike.korean_name}</p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {bike.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gauge size={11} />
                        {bike.mileage.toLocaleString()} km
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="flex items-center gap-1 text-kg-gold font-extrabold text-sm">
                        <DollarSign size={14} />
                        {bike.price_usd.toLocaleString()}
                      </span>
                      {bike.price_krw && (
                        <span className="text-[10px] text-slate-500 font-semibold">
                          ₩{bike.price_krw.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More */}
            {visibleCount < filtered.length && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg hover:shadow-brand-500/20 transition-all"
                >
                  {lang === 'en' ? 'Show More' : lang === 'ru' ? 'Показать ещё' : 'Дагы көрсөтүү'} ({filtered.length - visibleCount} {lang === 'en' ? 'remaining' : lang === 'ru' ? 'осталось' : 'калды'})
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
