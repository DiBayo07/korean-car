import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Gauge, Fuel, Settings, ShieldCheck, MapPin, CheckCircle2, MessageCircle } from 'lucide-react';
import type { Language, TranslationDict } from '../lib/translations';
import { getCarDetails } from '../lib/api'; // We will create this

interface CarDetailsPageProps {
  t: TranslationDict;
  lang: Language;
}

export const CarDetailsPage = ({ t, lang }: CarDetailsPageProps) => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getCarDetails(id)
        .then((data) => {
          setCar(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b11] pt-28 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-[#080b11] pt-28 flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">Автомобиль не найден</h2>
        <Link to="/korean-car/cars" className="text-brand-500 hover:underline">Вернуться в каталог</Link>
      </div>
    );
  }

  const handleWhatsApp = () => {
    const text = `Здравствуйте, меня интересует этот автомобиль: ${car.brand} ${car.model}\nЦена: $${car.price}\nСсылка: ${window.location.href}`;
    window.open(`https://wa.me/821065914114?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-200 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        
        {/* Back navigation */}
        <Link to="/korean-car/cars" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-6">
          <ChevronLeft size={20} className="mr-1" />
          Назад к каталогу
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-white/5 relative">
              <img 
                src={car.images?.[activeImage] || car.thumbnail} 
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">В наличии</span>
              </div>
            </div>
            
            {/* Thumbnails */}
            {car.images && car.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {car.images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-24 h-24 sm:w-32 sm:h-24 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-brand-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description Tab */}
            <div className="mt-8 bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-white/5">
              <h3 className="text-xl font-bold text-white mb-4">Описание от дилера (Encar)</h3>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                {car.description || 'Описание отсутствует.'}
              </p>
            </div>
          </div>

          {/* Right Column: Details & Action */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="sticky top-28 bg-[#121824] rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl">
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider">{car.brand}</span>
                  <span className="px-2.5 py-1 rounded bg-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider">{car.year}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {car.title || `${car.brand} ${car.model}`}
                </h1>
                {car.generation && <p className="text-slate-400 mt-1">{car.generation}</p>}
              </div>

              <div className="mb-8">
                <span className="text-4xl font-black text-kg-gold">${car.price?.toLocaleString()}</span>
                <span className="text-slate-400 text-sm ml-2">под ключ до Бишкека</span>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-900/80 p-4 rounded-2xl flex flex-col gap-1 border border-white/5">
                  <Calendar size={18} className="text-brand-400 mb-1" />
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Год выпуска</span>
                  <span className="text-sm font-semibold text-white">{car.year} {car.month ? `/${car.month}` : ''}</span>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-2xl flex flex-col gap-1 border border-white/5">
                  <Gauge size={18} className="text-brand-400 mb-1" />
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Пробег</span>
                  <span className="text-sm font-semibold text-white">{car.mileage?.toLocaleString()} км</span>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-2xl flex flex-col gap-1 border border-white/5">
                  <Fuel size={18} className="text-brand-400 mb-1" />
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Топливо</span>
                  <span className="text-sm font-semibold text-white">{car.fuel || '-'}</span>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-2xl flex flex-col gap-1 border border-white/5">
                  <Settings size={18} className="text-brand-400 mb-1" />
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Коробка</span>
                  <span className="text-sm font-semibold text-white">{car.transmission || 'Автомат'}</span>
                </div>
              </div>

              {car.inspectionAvailable && (
                <div className="mb-8 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                  <ShieldCheck className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-emerald-400 font-bold text-sm mb-1">Encar Гарантия</h4>
                    <p className="text-emerald-500/80 text-xs leading-relaxed">
                      Автомобиль прошел полную диагностику Encar. Отсутствуют скрытые дефекты.
                    </p>
                  </div>
                </div>
              )}

              {/* WhatsApp Button */}
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-[#25D366]/20 active:scale-95"
              >
                <MessageCircle size={24} />
                Заказать через WhatsApp
              </button>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 size={16} className="text-brand-500" />
                  <span>Полный видео-осмотр перед покупкой</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 size={16} className="text-brand-500" />
                  <span>Безопасная сделка и таможенная очистка</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin size={16} className="text-brand-500" />
                  <span>Доставка ЖД/Авто до Бишкека за 25-45 дней</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
