import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Vehicle } from '../lib/api';
import type { TranslationDict } from '../lib/translations';


interface BikesSectionProps {
  t: TranslationDict;
  vehicles: Vehicle[];
}

export const BikesSection: React.FC<BikesSectionProps> = ({ t, vehicles }) => {
  const bikes = vehicles.filter(v => v.type === 'bike');

  // Conversion rate USD to KGS (e.g. 1 USD = 89.5 KGS)
  const USD_TO_KGS = 89.5;

  const formatKGS = (usd: number) => {
    const kgs = Math.round(usd * USD_TO_KGS);
    return kgs.toLocaleString('ru-RU') + ' KGS';
  };

  const formatUSD = (usd: number) => {
    return '$' + usd.toLocaleString('en-US');
  };

  const formatKRW = (krw?: number) => {
    if (!krw) return '';
    return krw.toLocaleString('ko-KR') + ' KRW';
  };

  return (
    <section id="bikes" className="bg-slate-50 text-slate-900 py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-extrabold text-brand-500 uppercase tracking-widest block mb-2">
              {t.bikesTag}
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
              {t.bikesTitle}
            </h2>
            <p className="text-slate-500 text-sm">
              {t.bikesSubtitle}
            </p>
          </div>
          
          <Link to="/korean-car/bikes" className="inline-flex items-center gap-1 text-sm font-bold text-brand-500 hover:text-brand-600 group transition-colors self-start sm:self-auto">
            <span>{t.viewAll}</span>
            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid List */}
        {bikes.length === 0 ? (
          <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            No bikes found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bikes.map((bike) => (
              <div 
                key={bike.id} 
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
              >
                {/* Image Wrap */}
                <div className="relative aspect-[4/3] bg-slate-200 overflow-hidden">
                  <img
                    src={bike.image_url}
                    alt={`${bike.brand} ${bike.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Brand Tag (Left Badge) */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-brand-700 text-white font-extrabold text-[10px] uppercase shadow-md border border-brand-500/25">
                    {bike.brand}
                  </div>

                  {/* Available Tag (Right Badge) */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-emerald-500 text-white font-extrabold text-[10px] uppercase shadow-md">
                    {t.available}
                  </div>
                </div>

                {/* Content Block */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Title in Korean/English */}
                    <h3 className="font-extrabold text-slate-900 group-hover:text-brand-500 transition-colors text-base line-clamp-1 mb-1 font-sans">
                      {bike.korean_name || `${bike.brand} ${bike.model}`}
                    </h3>
                    {bike.korean_name && (
                      <p className="text-slate-400 text-xs font-semibold mb-3">
                        {bike.brand} {bike.model}
                      </p>
                    )}
                  </div>

                  <div>
                    {/* Specs info: Year · Mileage · Engine */}
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-4 border-t border-slate-50 pt-3">
                      <span>{bike.year}</span>
                      <span className="text-slate-300">·</span>
                      <span>{bike.mileage.toLocaleString('ru-RU')} km</span>
                      <span className="text-slate-300">·</span>
                      <span>{bike.engine_cc ? `${bike.engine_cc}cc` : '0cc'}</span>
                    </div>

                    {/* Price Block */}
                    <div className="flex flex-col border-t border-slate-50 pt-3">
                      {/* KRW price (bold and highlighted) */}
                      <span className="text-base font-extrabold text-slate-900">
                        {formatKRW(bike.price_krw) || `${bike.price_usd * 1300} KRW`}
                      </span>
                      {/* USD price */}
                      <span className="text-xs font-bold text-slate-500 mt-0.5">
                        {formatUSD(bike.price_usd)}
                      </span>
                      {/* Kyrgyz vibe: KGS equivalent price */}
                      <span className="text-[10px] font-bold text-kg-teal flex items-center gap-1 mt-1">
                        <span className="inline-block w-3 h-2 bg-kg-gold rounded-sm relative overflow-hidden border border-slate-100">
                          <span className="absolute inset-0 bg-red-600 w-1/3"></span>
                        </span>
                        <span>{t.priceConverted} {formatKGS(bike.price_usd)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
