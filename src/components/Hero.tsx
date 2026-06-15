import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { TranslationDict } from '../lib/translations';


interface HeroProps {
  t: TranslationDict;
  onSearch: (brand: string, model: string, generation: string) => void;
  brands: string[];
  models: string[];
  generations: string[];
}

export const Hero: React.FC<HeroProps> = ({ t, onSearch, brands, models, generations }) => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState('');

  const handleSearch = () => {
    onSearch(selectedBrand, selectedModel, selectedGeneration);
    
    // Smooth scroll down to Catalog/Cars section to show results
    const carsSection = document.getElementById('cars');
    if (carsSection) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = carsSection.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative w-full min-h-[85vh] flex flex-col justify-between overflow-hidden bg-brand-950">
      {/* Background Car Image with Dark Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 brightness-[0.4]"
        style={{ 
          backgroundImage: `linear-gradient(180deg, rgba(10, 13, 20, 0.8) 0%, rgba(10, 13, 20, 0.4) 60%, rgba(10, 13, 20, 0.95) 100%), url('https://images.unsplash.com/photo-1617469767053-d3b508a0d84d?q=80&w=1920&auto=format&fit=crop')` 
        }}
      />

      {/* Decorative Kyrgyz solar pattern overlay / subtle glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-kg-gold/5 blur-[120px] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-12 max-w-5xl mx-auto text-center">
        {/* Kyrgyz Flag-colored Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-kg-red"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-kg-gold"></span>
          <span className="text-[10px] tracking-[0.2em] font-bold text-kg-gold uppercase">Direct Export from Seoul</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mb-6">
          {t.heroTitle.split(' ').map((word, idx) => 
            idx >= 3 ? <span key={idx} className="text-kg-gold block sm:inline">{word} </span> : word + ' '
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mb-12 leading-relaxed">
          {t.heroSubtitle}
        </p>

        {/* Search Widget */}
        <div className="w-full max-w-4xl bg-white p-4 sm:p-5 rounded-3xl sm:rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-4 items-stretch sm:items-center text-left border border-slate-100 transition-all duration-300 hover:shadow-kg-gold/5">
          {/* Brand select */}
          <div className="flex-1 flex flex-col px-3 border-r-0 sm:border-r border-slate-100 pb-3 sm:pb-0">
            <span className="text-[10px] font-extrabold text-brand-800 tracking-wider mb-1.5 uppercase opacity-60">
              {t.searchBrand}
            </span>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedModel('');
                setSelectedGeneration('');
              }}
              className="w-full text-slate-700 bg-transparent text-sm font-semibold focus:outline-none cursor-pointer py-1"
            >
              <option value="">{t.selectBrand}</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Model select */}
          <div className="flex-1 flex flex-col px-3 border-r-0 sm:border-r border-slate-100 pb-3 sm:pb-0">
            <span className="text-[10px] font-extrabold text-brand-800 tracking-wider mb-1.5 uppercase opacity-60">
              {t.searchModel}
            </span>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                setSelectedGeneration('');
              }}
              disabled={!selectedBrand}
              className="w-full text-slate-700 bg-transparent text-sm font-semibold focus:outline-none cursor-pointer py-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">{t.selectModel}</option>
              {models.map(m => <option key={m} value={m}>{m}</option>)}
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
              <option value="">{t.selectGeneration}</option>
              {generations.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="sm:w-auto px-8 py-4 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-brand-500/25 transition-all duration-200"
          >
            <Search size={18} />
            <span>{t.searchBtn}</span>
          </button>
        </div>

        {/* Stats Section */}
        <div className="w-full max-w-3xl mt-16 grid grid-cols-3 gap-4 border-t border-white/10 pt-10">
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1">
              {t.statVehicles}
            </span>
            <span className="text-xs sm:text-sm text-slate-400 font-medium">
              {t.statVehiclesSub}
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-white/10">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1">
              {t.statCountries}
            </span>
            <span className="text-xs sm:text-sm text-slate-400 font-medium">
              {t.statCountriesSub}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1">
              {t.statYears}
            </span>
            <span className="text-xs sm:text-sm text-slate-400 font-medium">
              {t.statYearsSub}
            </span>
          </div>
        </div>
      </div>

      {/* Wave Separator Transition */}
      <div className="relative w-full overflow-hidden leading-none z-10 select-none pointer-events-none">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-[45px] text-white"
          fill="currentColor"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C26.9,8.75,57.05,18.3,90.38,27.12,149.77,42.85,236.87,72.16,321.39,56.44Z" />
        </svg>
      </div>
    </section>
  );
};
