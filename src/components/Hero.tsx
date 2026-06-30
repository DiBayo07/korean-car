import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { translateBrandName } from '../api/encarApi';
import type { CarapisManufacturer, CarapisModelGroup, CarapisModel } from '../api/encarApi';
import type { TranslationDict } from '../lib/translations';
import type { UseVehiclesFilters } from '../hooks/useVehicles';

interface HeroProps {
  t: TranslationDict;
  lang: string;
  onSearch: (brand: string, model: string, generation: string) => void;
  // Catalog data from useVehicles
  manufacturers: CarapisManufacturer[];
  manufacturersLoading: boolean;
  modelGroups: CarapisModelGroup[];
  modelGroupsLoading: boolean;
  models: CarapisModel[];
  modelsLoading: boolean;
  fetchModelGroups: (slug: string) => void;
  fetchModels: (manSlug: string, modelGroupSlug: string) => void;
  encarFilters?: UseVehiclesFilters;
  onEncarFilterChange?: (filters: UseVehiclesFilters) => void;
}

export const Hero: React.FC<HeroProps> = ({
  t, lang, onSearch,
  manufacturers, manufacturersLoading,
  modelGroups, modelGroupsLoading,
  models, modelsLoading,
  fetchModelGroups, fetchModels,
  encarFilters, onEncarFilterChange,
}) => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localBrand, setLocalBrand] = useState(encarFilters?.manufacturer_slug || '');
  const [localYear, setLocalYear] = useState(encarFilters?.min_year ? String(encarFilters.min_year) : '');

  // When brand changes, fetch model groups
  useEffect(() => {
    if (selectedBrand) {
      const man = manufacturers.find(m => translateBrandName(m.name) === selectedBrand || m.slug === selectedBrand);
      if (man) fetchModelGroups(man.slug);
      setSelectedModel('');
      setSelectedGeneration('');
    }
  }, [selectedBrand, manufacturers, fetchModelGroups]);

  // When model changes, fetch models (generations)
  useEffect(() => {
    if (selectedBrand && selectedModel) {
      const man = manufacturers.find(m => translateBrandName(m.name) === selectedBrand || m.slug === selectedBrand);
      const mg = modelGroups.find(mg => mg.name === selectedModel || mg.slug === selectedModel);
      if (man && mg) fetchModels(man.slug, mg.slug);
      setSelectedGeneration('');
    }
  }, [selectedModel, selectedBrand, manufacturers, modelGroups, fetchModels]);

  const sortedManufacturers = [...manufacturers]
    .map(m => ({ ...m, translatedName: translateBrandName(m.name) }))
    .sort((a, b) => a.translatedName.localeCompare(b.translatedName));

  const brandNames = [...new Set(sortedManufacturers.map(m => m.translatedName))];

  const handleSearch = () => {
    onSearch(selectedBrand, selectedModel, selectedGeneration);

    // Also set API filters
    if (onEncarFilterChange) {
      const filters: UseVehiclesFilters = {};
      const man = manufacturers.find(m => translateBrandName(m.name) === selectedBrand || m.slug === selectedBrand);
      if (man) filters.manufacturer_slug = man.slug;
      const mg = modelGroups.find(mg => mg.name === selectedModel || mg.slug === selectedModel);
      if (man && mg) filters.model_group_slug = mg.slug;
      const mod = models.find(m => m.name === selectedGeneration || m.slug === selectedGeneration);
      if (man && mg && mod) filters.model_slug = mod.slug;
      onEncarFilterChange(filters);
    }

    const carsSection = document.getElementById('cars');
    if (carsSection) {
      const offset = 80;
      const elementPosition = carsSection.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setLocalBrand(encarFilters?.manufacturer_slug || '');
    setLocalYear(encarFilters?.min_year ? String(encarFilters.min_year) : '');
  }, [encarFilters?.manufacturer_slug, encarFilters?.min_year]);

  const applyFilters = () => {
    if (onEncarFilterChange) {
      const filters: UseVehiclesFilters = {};
      if (localBrand.trim()) filters.manufacturer_slug = localBrand.trim().toLowerCase();
      if (localYear.trim()) filters.min_year = parseInt(localYear.trim(), 10);
      onEncarFilterChange(filters);
    }
    const carsSection = document.getElementById('cars');
    if (carsSection) {
      const elementPosition = carsSection.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - 80, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setLocalBrand('');
    setLocalYear('');
    if (onEncarFilterChange) onEncarFilterChange({});
  };

  const hasActiveFilters = localBrand || localYear;

  return (
    <section className="relative w-full min-h-[85vh] flex flex-col justify-between overflow-hidden bg-brand-950">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 brightness-[0.4]"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(10, 13, 20, 0.8) 0%, rgba(10, 13, 20, 0.4) 60%, rgba(10, 13, 20, 0.95) 100%), url('https://images.unsplash.com/photo-1617469767053-d3b508a0d84d?q=80&w=1920&auto=format&fit=crop')`
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-kg-gold/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-12 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-kg-red"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-kg-gold"></span>
          <span className="text-[10px] tracking-[0.2em] font-bold text-kg-gold uppercase">Direct Export from Seoul</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mb-6">
          {t.heroTitle.split(' ').map((word, idx) =>
            idx >= 3 ? <span key={idx} className="text-kg-gold block sm:inline">{word} </span> : word + ' '
          )}
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mb-12 leading-relaxed">
          {t.heroSubtitle}
        </p>

        <div className="w-full max-w-4xl bg-white p-4 sm:p-5 rounded-3xl sm:rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-4 items-stretch sm:items-center text-left border border-slate-100 transition-all duration-300 hover:shadow-kg-gold/5">
          {/* Brand select */}
          <div className="flex-1 flex flex-col px-3 border-r-0 sm:border-r border-slate-100 pb-3 sm:pb-0">
            <span className="text-[10px] font-extrabold text-brand-800 tracking-wider mb-1.5 uppercase opacity-60">
              {t.searchBrand}
            </span>
            <select
              value={selectedBrand}
              onChange={(e) => { setSelectedBrand(e.target.value); }}
              className="w-full text-slate-700 bg-transparent text-sm font-semibold focus:outline-none cursor-pointer py-1"
            >
              <option value="">{manufacturersLoading ? 'Loading...' : t.selectBrand}</option>
              {brandNames.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Model select */}
          <div className="flex-1 flex flex-col px-3 border-r-0 sm:border-r border-slate-100 pb-3 sm:pb-0">
            <span className="text-[10px] font-extrabold text-brand-800 tracking-wider mb-1.5 uppercase opacity-60">
              {t.searchModel}
            </span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!selectedBrand}
              className="w-full text-slate-700 bg-transparent text-sm font-semibold focus:outline-none cursor-pointer py-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">{modelGroupsLoading ? 'Loading...' : t.selectModel}</option>
              {modelGroups.map(mg => <option key={mg.slug} value={mg.name}>{mg.name}</option>)}
            </select>
          </div>

          {/* Generation select */}
          <div className="flex-1 flex flex-col px-3 pb-3 sm:pb-0">
            <span className="text-[10px] font-extrabold text-brand-800 tracking-wider mb-1.5 uppercase opacity-60">
              {t.searchGeneration}
            </span>
            <select
              value={selectedGeneration}
              onChange={(e) => setSelectedGeneration(e.target.value)}
              disabled={!selectedModel}
              className="w-full text-slate-700 bg-transparent text-sm font-semibold focus:outline-none cursor-pointer py-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">{modelsLoading ? 'Loading...' : t.selectGeneration}</option>
              {models.map(m => <option key={m.slug} value={m.name}>{m.name}</option>)}
            </select>
          </div>

          {/* Toggle Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`sm:w-auto px-4 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 border group ${
              showFilters || hasActiveFilters
                ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
            }`}
            title={lang === 'ru' ? 'Фильтры' : lang === 'en' ? 'Filters' : 'Чыпкалар'}
          >
            <SlidersHorizontal size={18} className={showFilters || hasActiveFilters ? '' : 'group-hover:scale-110 transition-transform'} />
          </button>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="sm:w-auto px-8 py-4 bg-slate-950 hover:bg-black active:scale-95 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:shadow-kg-gold/20 transition-all duration-300 border border-slate-800 group"
          >
            <Search size={18} className="text-kg-gold group-hover:scale-110 transition-transform" />
            {t.searchBtn || (lang === 'ru' ? 'Найти' : lang === 'en' ? 'Search' : 'Издөө')}
          </button>
        </div>

        {/* Advanced Filter Bar */}
        {showFilters && (
          <div className="w-full max-w-4xl mt-4 bg-white/10 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-2xl border border-white/10 transition-all duration-300">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
              <div className="flex-1 flex flex-col">
                <span className="text-[10px] font-extrabold text-kg-gold tracking-wider mb-1.5 uppercase">
                  {lang === 'ru' ? 'ПРОИЗВОДИТЕЛЬ' : lang === 'en' ? 'MANUFACTURER' : 'ӨНДҮРҮҮЧҮ'}
                </span>
                <input
                  type="text"
                  value={localBrand}
                  onChange={(e) => setLocalBrand(e.target.value)}
                  placeholder={lang === 'ru' ? 'Напр. hyundai, kia' : 'e.g. hyundai, kia'}
                  className="w-full bg-white/10 border border-white/10 text-white text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:border-kg-gold/50 focus:bg-white/15 transition-all placeholder:text-white/30"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <span className="text-[10px] font-extrabold text-kg-gold tracking-wider mb-1.5 uppercase">
                  {lang === 'ru' ? 'ГОД ОТ' : lang === 'en' ? 'YEAR FROM' : 'ЖЫЛДАН'}
                </span>
                <input
                  type="number"
                  value={localYear}
                  onChange={(e) => setLocalYear(e.target.value)}
                  min="2000" max="2026"
                  placeholder={lang === 'ru' ? 'Напр. 2022' : 'e.g. 2022'}
                  className="w-full bg-white/10 border border-white/10 text-white text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:border-kg-gold/50 focus:bg-white/15 transition-all placeholder:text-white/30"
                />
              </div>

              <div className="flex gap-2 shrink-0">
                <button onClick={applyFilters} className="px-6 py-2.5 bg-kg-gold hover:bg-yellow-500 text-brand-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-lg">
                  {lang === 'ru' ? 'Применить' : lang === 'en' ? 'Apply' : 'Колдонуу'}
                </button>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="w-full max-w-3xl mt-16 grid grid-cols-3 gap-4 border-t border-white/10 pt-10">
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1">{t.statVehicles}</span>
            <span className="text-xs sm:text-sm text-slate-400 font-medium">{t.statVehiclesSub}</span>
          </div>
          <div className="flex flex-col items-center border-x border-white/10">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1">{t.statCountries}</span>
            <span className="text-xs sm:text-sm text-slate-400 font-medium">{t.statCountriesSub}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1">{t.statYears}</span>
            <span className="text-xs sm:text-sm text-slate-400 font-medium">{t.statYearsSub}</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden leading-none z-10 select-none pointer-events-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[45px] text-white" fill="currentColor">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C26.9,8.75,57.05,18.3,90.38,27.12,149.77,42.85,236.87,72.16,321.39,56.44Z" />
        </svg>
      </div>
    </section>
  );
};
