import { useState } from 'react';
import { Search, Calendar, Gauge, DollarSign, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { translateBrandName } from '../api/encarApi';
import type { CarapisManufacturer, CarapisModelGroup, CarapisModel } from '../api/encarApi';
import type { EncarVehicle } from '../api/encarApi';
import type { Language, TranslationDict } from '../lib/translations';

interface CarsPageProps {
  vehicles: EncarVehicle[];
  t: TranslationDict;
  lang: Language;
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  // Catalog data
  manufacturers: CarapisManufacturer[];
  manufacturersLoading: boolean;
  modelGroups: CarapisModelGroup[];
  modelGroupsLoading: boolean;
  models: CarapisModel[];
  modelsLoading: boolean;
  fetchModelGroups: (slug: string) => void;
  fetchModels: (manSlug: string, modelGroupSlug: string) => void;
  setFilters: (f: any) => void;
}

export const CarsPage: React.FC<CarsPageProps> = ({ vehicles, t, lang, loading, hasMore, loadMore, manufacturers, manufacturersLoading, modelGroups, modelGroupsLoading, models, modelsLoading, fetchModelGroups, fetchModels, setFilters }) => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');

  const sortedManufacturers = [...manufacturers]
    .map(m => ({ ...m, translatedName: translateBrandName(m.name) }))
    .sort((a, b) => a.translatedName.localeCompare(b.translatedName));
  const brandNames = [...new Set(sortedManufacturers.map(m => m.translatedName))];

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedGeneration('');
    setSearchText('');
    setYearFrom('');
    setYearTo('');
    setPriceFrom('');
    setPriceTo('');
    setFilters({});
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Banner */}
      <section className="relative w-full h-[40vh] min-h-[280px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center brightness-[0.3]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1920&auto=format&fit=crop')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950" />
        <div className="relative z-10 text-center px-4">
          <span className="text-xs font-extrabold text-kg-gold uppercase tracking-[0.2em] block mb-3">
            {lang === 'en' ? 'Vehicle Catalog' : lang === 'ru' ? 'Каталог транспорта' : 'Унаалар каталогу'}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {lang === 'en' ? 'Cars from Korea' : lang === 'ru' ? 'Автомобили из Кореи' : 'Кореядан унаалар'}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            {lang === 'en' ? 'Browse our selection of verified Korean vehicles' : lang === 'ru' ? 'Проверенные автомобили напрямую из Южной Кореи' : 'Түштүк Кореядан түз текшерилген унаалар'}
          </p>
        </div>
      </section>

      {/* Search / Filter Bar */}
      <div className="sticky top-20 z-30 bg-slate-950/95 backdrop-blur-md border-b border-white/5 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">            {/* Brand */}
          <div className="flex-1 flex flex-col bg-[#121824] rounded-xl px-4 py-2.5 border border-white/5">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">{t.searchBrand}</span>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedModel('');
                setSelectedGeneration('');
                const man = manufacturers.find(m => translateBrandName(m.name) === e.target.value || m.slug === e.target.value);
                if (man) { fetchModelGroups(man.slug); setFilters({ manufacturer_slug: man.slug }); }
              }}
              className="bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900">{manufacturersLoading ? 'Loading...' : t.selectBrand}</option>
              {brandNames.map(b => <option key={b} value={b} className="bg-slate-900">{b}</option>)}
            </select>
          </div>

          {/* Model */}
          <div className="flex-1 flex flex-col bg-[#121824] rounded-xl px-4 py-2.5 border border-white/5">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">{t.searchModel}</span>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                setSelectedGeneration('');
                const man = manufacturers.find(m => translateBrandName(m.name) === selectedBrand || m.slug === selectedBrand);
                const mg = modelGroups.find(mg => mg.name === e.target.value || mg.slug === e.target.value);
                if (man && mg) { fetchModels(man.slug, mg.slug); setFilters({ manufacturer_slug: man.slug, model_group_slug: mg.slug }); }
              }}
              disabled={!selectedBrand}
              className="bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="" className="bg-slate-900">{modelGroupsLoading ? 'Loading...' : t.selectModel}</option>
              {modelGroups.map(mg => <option key={mg.slug} value={mg.name} className="bg-slate-900">{mg.name}</option>)}
            </select>
          </div>

          {/* Generation */}
          <div className="flex-1 flex flex-col bg-[#121824] rounded-xl px-4 py-2.5 border border-white/5">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">{t.searchGeneration}</span>
            <select
              value={selectedGeneration}
              onChange={(e) => {
                setSelectedGeneration(e.target.value);
                const man = manufacturers.find(m => translateBrandName(m.name) === selectedBrand || m.slug === selectedBrand);
                const mg = modelGroups.find(mg => mg.name === selectedModel || mg.slug === selectedModel);
                const mod = models.find(m => m.name === e.target.value || m.slug === e.target.value);
                if (man && mg && mod) setFilters({ manufacturer_slug: man.slug, model_group_slug: mg.slug, model_slug: mod.slug });
              }}
              disabled={!selectedModel}
              className="bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="" className="bg-slate-900">{modelsLoading ? 'Loading...' : t.selectGeneration}</option>
              {models.map(m => <option key={m.slug} value={m.name} className="bg-slate-900">{m.name}</option>)}
            </select>
          </div>

          {/* Clear / Count */}
          <div className="flex items-center gap-3">
            {/* Toggle Advanced Filters */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                showAdvancedFilters || searchText || yearFrom || yearTo || priceFrom || priceTo
                  ? 'bg-kg-gold/20 text-kg-gold border-kg-gold/30'
                  : 'border-white/10 text-slate-300 hover:bg-white/5'
              }`}
              title={lang === 'en' ? 'Advanced filters' : lang === 'ru' ? 'Расширенные фильтры' : 'Кеңейтилген чыпкалар'}
            >
              <SlidersHorizontal size={16} />
            </button>
            {(selectedBrand || selectedModel || selectedGeneration || searchText || yearFrom || yearTo || priceFrom || priceTo) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5 transition-all"
              >
                ✕ {lang === 'en' ? 'Clear' : lang === 'ru' ? 'Сбросить' : 'Тазалоо'}
              </button>
            )}
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
              {loading ? '...' : vehicles.length} {lang === 'en' ? 'cars' : lang === 'ru' ? 'авто' : 'унаа'}
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Filters Section */}
      {showAdvancedFilters && (
        <div className="bg-slate-950/95 backdrop-blur-md border-b border-white/5 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Search text */}
              <div className="flex flex-col bg-[#121824] rounded-xl px-3 py-2 border border-white/5">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">{lang === 'en' ? 'SEARCH' : lang === 'ru' ? 'ПОИСК' : 'ИЗДӨӨ'}</span>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={lang === 'en' ? 'Brand or model...' : lang === 'ru' ? 'Марка или модель...' : 'Марка же модел...'}
                  className="bg-transparent text-white text-sm font-semibold focus:outline-none placeholder:text-slate-600"
                />
              </div>

              {/* Year from */}
              <div className="flex flex-col bg-[#121824] rounded-xl px-3 py-2 border border-white/5">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">{lang === 'en' ? 'YEAR FROM' : lang === 'ru' ? 'ГОД ОТ' : 'ЖЫЛДАН'}</span>
                <input
                  type="number"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  min="2000" max="2026"
                  placeholder={lang === 'en' ? 'e.g. 2020' : 'e.g. 2020'}
                  className="bg-transparent text-white text-sm font-semibold focus:outline-none placeholder:text-slate-600"
                />
              </div>

              {/* Year to */}
              <div className="flex flex-col bg-[#121824] rounded-xl px-3 py-2 border border-white/5">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">{lang === 'en' ? 'YEAR TO' : lang === 'ru' ? 'ГОД ДО' : 'ЖЫЛГА ЧЕЙИН'}</span>
                <input
                  type="number"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  min="2000" max="2026"
                  placeholder={lang === 'en' ? 'e.g. 2025' : 'e.g. 2025'}
                  className="bg-transparent text-white text-sm font-semibold focus:outline-none placeholder:text-slate-600"
                />
              </div>

              {/* Price from */}
              <div className="flex flex-col bg-[#121824] rounded-xl px-3 py-2 border border-white/5">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">{lang === 'en' ? 'PRICE FROM, $' : lang === 'ru' ? 'ЦЕНА ОТ, $' : 'БААДАН, $'}</span>
                <input
                  type="number"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  min="0"
                  placeholder={lang === 'en' ? 'e.g. 5000' : 'e.g. 5000'}
                  className="bg-transparent text-white text-sm font-semibold focus:outline-none placeholder:text-slate-600"
                />
              </div>

              {/* Price to */}
              <div className="flex flex-col bg-[#121824] rounded-xl px-3 py-2 border border-white/5">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">{lang === 'en' ? 'PRICE TO, $' : lang === 'ru' ? 'ЦЕНА ДО, $' : 'БААГА ЧЕЙИН, $'}</span>
                <input
                  type="number"
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                  min="0"
                  placeholder={lang === 'en' ? 'e.g. 30000' : 'e.g. 30000'}
                  className="bg-transparent text-white text-sm font-semibold focus:outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Apply button */}
            <div className="flex justify-end mt-3 gap-2">
              <button
                onClick={() => {
                  const filters: any = {};
                  const man = manufacturers.find(m => translateBrandName(m.name) === selectedBrand || m.slug === selectedBrand);
                  if (man) filters.manufacturer_slug = man.slug;
                  const mg = modelGroups.find(mg => mg.name === selectedModel || mg.slug === selectedModel);
                  if (man && mg) filters.model_group_slug = mg.slug;
                  const mod = models.find(m => m.name === selectedGeneration || m.slug === selectedGeneration);
                  if (man && mg && mod) filters.model_slug = mod.slug;
                  if (searchText.trim()) filters.search = searchText.trim();
                  if (yearFrom.trim()) filters.min_year = parseInt(yearFrom.trim(), 10);
                  if (yearTo.trim()) filters.max_year = parseInt(yearTo.trim(), 10);
                  if (priceFrom.trim()) filters.price_from = parseInt(priceFrom.trim(), 10);
                  if (priceTo.trim()) filters.price_to = parseInt(priceTo.trim(), 10);
                  setFilters(filters);
                }}
                className="px-6 py-2 bg-kg-gold hover:bg-yellow-500 text-brand-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-lg"
              >
                {lang === 'en' ? 'Apply Filters' : lang === 'ru' ? 'Применить' : 'Колдонуу'}
              </button>
              {(searchText || yearFrom || yearTo || priceFrom || priceTo) && (
                <button
                  onClick={() => {
                    setSearchText('');
                    setYearFrom('');
                    setYearTo('');
                    setPriceFrom('');
                    setPriceTo('');
                    setFilters({});
                    setSelectedBrand('');
                    setSelectedModel('');
                    setSelectedGeneration('');
                  }}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5 transition-all"
                >
                  {lang === 'en' ? 'Reset' : lang === 'ru' ? 'Сбросить всё' : 'Баарын тазалоо'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cars Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading && vehicles.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-t-kg-gold border-slate-800 animate-spin" />
            <p className="text-slate-500 text-xs font-semibold">Загрузка...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="py-24 text-center">
            <Search size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500 text-sm font-semibold">
              {lang === 'en' ? 'No cars found matching your criteria' : lang === 'ru' ? 'Автомобили не найдены' : 'Унаалар табылган жок'}
            </p>
            <button onClick={clearFilters} className="mt-4 px-6 py-2 bg-brand-500 text-white text-xs font-bold rounded-lg hover:bg-brand-600 transition-all">
              {lang === 'en' ? 'Clear filters' : lang === 'ru' ? 'Сбросить фильтры' : 'Чыпкаларды тазалоо'}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vehicles.map((car) => (
              <Link
                  to={`/korean-car/car/${car.id}`}
                  key={car.id}
                  className="group bg-[#121824] rounded-2xl border border-white/5 overflow-hidden hover:border-kg-gold/20 hover:shadow-2xl hover:shadow-kg-gold/5 transition-all duration-300 hover:-translate-y-1 block"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={car.image_url}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Brand badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white rounded-lg border border-white/10">
                      {car.brand}
                    </span>
                    {/* Status badge */}
                    <span className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold rounded-lg border backdrop-blur-sm ${
                      car.status === 'Available'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {car.status}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <h3 className="text-sm font-extrabold text-white truncate">
                      {car.model}
                    </h3>
                    {car.trim && (
                      <p className="text-[10px] text-slate-500 font-medium truncate -mt-2">{car.trim}</p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {car.year}{car.month ? `.${String(car.month).padStart(2, '0')}` : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gauge size={11} />
                        {car.mileage.toLocaleString()} km
                      </span>
                      {car.generation && (
                        <span className="px-1.5 py-0.5 bg-white/5 rounded text-[9px]">{car.generation}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="flex items-center gap-1 text-kg-gold font-extrabold text-sm">
                        <DollarSign size={14} />
                        {car.price_usd.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Show More / Load More */}
            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg hover:shadow-brand-500/20 transition-all"
                >
                  {loading ? 'Загрузка...' : (lang === 'en' ? 'Load More' : lang === 'ru' ? 'Загрузить ещё' : 'Дагы жүктөө')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
