import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Vehicle } from '../lib/api';
import type { TranslationDict } from '../lib/translations';


interface CarsSectionProps {
  t: TranslationDict;
  vehicles: Vehicle[];
}

export const CarsSection: React.FC<CarsSectionProps> = ({ t, vehicles }) => {
  const [activeTab, setActiveTab] = useState('All');

  // Filter cars only
  const cars = vehicles.filter(v => v.type === 'car');

  // Dynamically extract tabs from brand list
  const brands = ['All', ...Array.from(new Set(cars.map(c => c.brand)))];

  const filteredCars = activeTab === 'All' 
    ? cars 
    : cars.filter(c => c.brand === activeTab);

  // Conversion rate USD to KGS (e.g. 1 USD = 89.5 KGS)
  const USD_TO_KGS = 89.5;

  const formatKGS = (usd: number) => {
    const kgs = Math.round(usd * USD_TO_KGS);
    return kgs.toLocaleString('ru-RU') + ' KGS';
  };

  const formatUSD = (usd: number) => {
    return '$' + usd.toLocaleString('en-US');
  };

  return (
    <section id="cars" className="bg-white text-slate-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2 font-sans">
              {t.carsTitle}
            </h2>
            <p className="text-slate-500 text-sm">
              {t.carsSubtitle}
            </p>
          </div>
          
          <Link to="/korean-car/cars" className="inline-flex items-center gap-1 text-sm font-bold text-brand-500 hover:text-brand-600 group transition-colors self-start sm:self-auto">
            <span>{t.viewAll}</span>
            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => setActiveTab(brand)}
              className={`px-5 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${
                activeTab === brand
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* Grid List */}
        {filteredCars.length === 0 ? (
          <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No cars found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCars.map((car) => (
              <Link 
                to={`/korean-car/car/${car.id}`}
                key={car.id} 
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1 block"
              >
                {/* Image Wrap */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={car.image_url}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Subtle Encar Watermark tag */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 select-none">
                    <span className="text-[9px] font-black text-slate-200 tracking-wider">Encar</span>
                  </div>

                  {/* Red tag placeholder on plate */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded bg-red-600 shadow-md">
                    <span className="text-[8px] font-extrabold uppercase text-white tracking-widest">Encar</span>
                  </div>

                  {/* Status tag */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-wider">
                    {t.available}
                  </div>
                </div>

                {/* Content Block */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Title */}
                    <h3 className="font-bold text-slate-900 group-hover:text-brand-500 transition-colors text-base line-clamp-1 mb-1">
                      {car.brand} {car.model} {car.generation}
                    </h3>
                    
                    {/* Trim */}
                    <p className="text-slate-400 text-xs font-medium line-clamp-1 mb-3">
                      {car.trim || 'Standard Edition'}
                    </p>
                  </div>

                  <div>
                    {/* Year | Mileage */}
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-3 border-t border-slate-50 pt-3">
                      <span>{car.year}.{car.month ? String(car.month).padStart(2, '0') : '01'}</span>
                      <span className="text-slate-300">|</span>
                      <span>{car.mileage.toLocaleString('ru-RU')} km</span>
                    </div>

                    {/* Price Block */}
                    <div className="flex flex-col">
                      <span className="text-lg font-extrabold text-brand-500">
                        ~{formatUSD(car.price_usd)}
                      </span>
                      {/* Kyrgyz vibe: KGS equivalent price */}
                      <span className="text-[10px] font-bold text-kg-teal flex items-center gap-1 mt-0.5">
                        <span className="inline-block w-3 h-2 bg-kg-gold rounded-sm relative overflow-hidden border border-slate-100">
                          <span className="absolute inset-0 bg-red-600 w-1/3"></span>
                        </span>
                        <span>{t.priceConverted} {formatKGS(car.price_usd)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
