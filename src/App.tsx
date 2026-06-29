import { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CarsSection } from './components/CarsSection';
import { BikesSection } from './components/BikesSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

import { CarsPage } from './pages/CarsPage';
import { BikesPage } from './pages/BikesPage';
import { CarDetailsPage } from './pages/CarDetailsPage';
import { getVehicles } from './lib/api';
import type { Vehicle } from './lib/api';
import { translations } from './lib/translations';
import type { Language } from './lib/translations';
import { CheckCircle2, ShieldCheck, ClipboardCheck, Sparkles, X } from 'lucide-react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const [lang, setLang] = useState<Language>('ru');

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state (for home page hero search)
  const [searchResults, setSearchResults] = useState<Vehicle[] | null>(null);
  const [searchCriteria, setSearchCriteria] = useState<{ brand?: string; model?: string } | null>(null);

  const t = translations[lang];

  // --- ALL HOOKS BEFORE ANY CONDITIONAL RETURN ---

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getVehicles();
        if (!cancelled) {
          setVehicles(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setVehicles([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const carsOnly = useMemo(() => vehicles.filter(v => v.type === 'car'), [vehicles]);

  const handleSearch = useCallback((brand: string, model: string, generation: string) => {
    if (!brand && !model && !generation) {
      setSearchResults(null);
      setSearchCriteria(null);
      return;
    }

    const filtered = carsOnly.filter(v => {
      const matchBrand = !brand || v.brand.toLowerCase() === brand.toLowerCase();
      const matchModel = !model || v.model.toLowerCase() === model.toLowerCase();
      const matchGen = !generation || v.generation?.toLowerCase() === generation.toLowerCase();
      return matchBrand && matchModel && matchGen;
    });

    setSearchResults(filtered);
    setSearchCriteria({ brand, model });
  }, [carsOnly]);

  const clearSearch = useCallback(() => {
    setSearchResults(null);
    setSearchCriteria(null);
  }, []);

  // --- CONDITIONAL RETURNS ---

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-t-kg-gold border-slate-800 animate-spin" />
        <span className="text-xs font-bold tracking-[0.2em] text-kg-gold uppercase">KG Motors Korea</span>
      </div>
    );
  }



  // Home page content
  const HomePage = () => (
    <main className="flex-grow">
      {/* Hero Section */}
      <Hero
        t={t}
        lang={lang}
        onSearch={handleSearch}
        vehicles={vehicles}
      />

      {/* Search Results Alert if filtered */}
      {searchCriteria && (
        <div className="bg-brand-50 border-y border-brand-100 py-4 px-4 sm:px-6 lg:px-8 text-brand-900 flex justify-between items-center max-w-7xl mx-auto my-6 rounded-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="text-kg-gold shrink-0" size={18} />
            <span className="text-xs font-semibold">
              {lang === 'en' ? 'Showing search results for' : lang === 'ru' ? 'Результаты поиска для' : 'Издөө жыйынтыктары'} :{' '}
              <strong className="text-brand-600">
                {searchCriteria.brand || ''} {searchCriteria.model || ''}
              </strong>{' '}
              ({searchResults?.length || 0} found)
            </span>
          </div>
          <button
            onClick={clearSearch}
            className="p-1 rounded-full hover:bg-brand-100 text-brand-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Cars Catalog Section */}
      <CarsSection
        t={t}
        vehicles={searchResults !== null ? searchResults : vehicles}
      />

      {/* Services Section */}
      <section id="services" className="bg-[#0b0f19] text-white py-24 px-4 sm:px-6 lg:px-8 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-kg-gold uppercase tracking-widest block mb-2">
              {lang === 'en' ? 'Our Advantages' : lang === 'ru' ? 'Наши Преимущества' : 'Биздин Артыкчылыктар'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {lang === 'en' ? 'Why Kyrgyzstan Chooses Us' : lang === 'ru' ? 'Почему Кыргызстан выбирает нас' : 'Эмне үчүн Кыргызстан бизди тандайт'}
            </h2>
            <div className="w-16 h-1 bg-kg-gold mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/5 p-8 rounded-2xl hover:border-kg-gold/20 transition-all duration-300 group">
              <div className="p-4 bg-brand-500/10 rounded-xl text-kg-gold w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-kg-gold/15 transition-all">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-lg font-extrabold mb-3">
                {lang === 'en' ? '100% Verified Cars' : lang === 'ru' ? '100% Проверенные Авто' : '100% Текшерилген Унаалар'}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                {lang === 'en' 
                  ? 'Our certified specialists in Korea conduct detailed technical diagnostics of each vehicle.' 
                  : lang === 'ru' 
                  ? 'Наши сертифицированные специалисты в Корее проводят детальную техническую диагностику каждого автомобиля.'
                  : 'Кореядагы биздин тастыкталган адистер ар бир унааны деталдуу техникалык диагностикадан өткөрүшөт.'}
              </p>
            </div>

            <div className="bg-white/5 border border-white/5 p-8 rounded-2xl hover:border-kg-gold/20 transition-all duration-300 group">
              <div className="p-4 bg-brand-500/10 rounded-xl text-kg-gold w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-kg-gold/15 transition-all">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-lg font-extrabold mb-3">
                {lang === 'en' ? 'Customs & Logistics Support' : lang === 'ru' ? 'Логистика и Растаможка' : 'Логистика жана Бажы'}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                {lang === 'en'
                  ? 'Full escorting of shipping from South Korea to Bishkek.'
                  : lang === 'ru'
                  ? 'Полное сопровождение доставки из Южной Кореи до Бишкека.'
                  : 'Түштүк Кореядан Бишкекке чейин жеткирүүнү толук коштоо.'}
              </p>
            </div>

            <div className="bg-white/5 border border-white/5 p-8 rounded-2xl hover:border-kg-gold/20 transition-all duration-300 group">
              <div className="p-4 bg-brand-500/10 rounded-xl text-kg-gold w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-kg-gold/15 transition-all">
                <ClipboardCheck size={28} />
              </div>
              <h3 className="text-lg font-extrabold mb-3">
                {lang === 'en' ? 'Direct Auction Access' : lang === 'ru' ? 'Прямой Доступ к Аукционам' : 'Аукциондорго түз кирүү'}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                {lang === 'en'
                  ? 'Buy cars directly from major Korean platforms like Encar, K-Car, Lotte.'
                  : lang === 'ru'
                  ? 'Покупайте автомобили напрямую с крупнейших корейских платформ: Encar, K-Car, Lotte и Glovis.'
                  : 'Кореянын эң ири платформаларынан унааларды түз сатып алыңыз: Encar, K-Car, Lotte жана Glovis.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bikes Catalog Section */}
      <BikesSection
        t={t}
        vehicles={vehicles}
      />

      {/* About Section */}
      <section id="about" className="bg-white text-slate-900 py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-700/10 to-transparent rounded-3xl" />
            <img
              src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=600&auto=format&fit=crop"
              alt="KG Motors Team Showroom"
              className="w-full rounded-3xl shadow-xl border border-slate-100 object-cover aspect-[4/3]"
            />
            <div className="absolute -bottom-6 -right-6 bg-brand-950 text-white p-5 rounded-2xl shadow-2xl border border-white/5 flex items-center gap-3">
              <span className="text-3xl font-black text-kg-gold">10+</span>
              <span className="text-[10px] uppercase font-bold tracking-widest leading-tight text-slate-400">
                Years of<br />Experience
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 lg:pl-6">
            <span className="text-xs font-extrabold text-brand-500 uppercase tracking-widest block">
              {lang === 'en' ? 'Who We Are' : lang === 'ru' ? 'О Нашей Компании' : 'Биздин Компания Жөнүндө'}
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {lang === 'en' ? 'KG Motors Korea — Sourcing the Best Korean Vehicles for Kyrgyzstan' : lang === 'ru' ? 'KG Motors Korea — Лучшие автомобили из Кореи для Кыргызстана' : 'KG Motors Korea — Кыргызстан үчүн Кореядан эң мыкты унаалар'}
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              {lang === 'en'
                ? 'KG Motors Korea is a leading export broker operating directly between Seoul and Bishkek.'
                : lang === 'ru'
                ? 'KG Motors Korea — ведущий экспортный брокер, работающий напрямую между Сеулом и Бишкеком. Мы специализируемся на импорте корейских седанов, внедорожников и коммерческой техники.'
                : 'KG Motors Korea — Сеул жана Бишкек шаарларынын ортосунда түз иштеген алдыңкы экспорттук брокер.'}
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-1">Seoul Office</h4>
                <p className="text-xs text-slate-500">Full export licensing, purchasing, vehicle scanning and logistics.</p>
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-1">Bishkek Office</h4>
                <p className="text-xs text-slate-500">Customs clearance support, sales support, client consultations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection t={t} />
    </main>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white selection:bg-kg-gold selection:text-brand-950">
      <ScrollToTop />
      <Header
        currentLang={lang}
        setLang={setLang}
        t={t}
        onHomeClick={clearSearch}
      />

      <Routes>
        <Route path="/korean-car/" element={<HomePage />} />
        <Route path="/korean-car/cars" element={<CarsPage vehicles={vehicles} t={t} lang={lang} />} />
        <Route path="/korean-car/bikes" element={<BikesPage vehicles={vehicles} t={t} lang={lang} />} />
        <Route path="/korean-car/car/:id" element={<CarDetailsPage t={t} lang={lang} />} />
        {/* Fallback to home */}
        <Route path="*" element={<HomePage />} />
      </Routes>

      <Footer
        t={t}
        setActiveSection={() => {}}
      />
    </div>
  );
}

export default App;
