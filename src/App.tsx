import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CarsSection } from './components/CarsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

import { CarsPage } from './pages/CarsPage';
import { CarDetailsPage } from './pages/CarDetailsPage';
import { useVehicles } from './hooks/useVehicles';
import type { UseVehiclesFilters } from './hooks/useVehicles';
import type { Vehicle } from './lib/api';
import { translations, getLangText } from './lib/translations';
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

  const {
    vehicles: encarVehicles, loading, filters: encarFilters, setFilters: setEncarFilters,
    manufacturers, manufacturersLoading,
    modelGroups, modelGroupsLoading,
    models, modelsLoading,
    fetchModelGroups, fetchModels,
    hasMore, loadMore,
  } = useVehicles({ limit: 50 });
  
  // Convert EncarVehicle[] to Vehicle[] for compatibility with existing components
  const vehicles = encarVehicles as unknown as Vehicle[];
  
  // Search state (for home page hero search)
  const [searchCriteria, setSearchCriteria] = useState<{ brand?: string; model?: string } | null>(null);

  const t = translations[lang];

  const handleSearch = useCallback((brand: string, model: string, generation: string) => {
    if (!brand && !model && !generation) {
      setSearchCriteria(null);
      return;
    }
    setSearchCriteria({ brand, model });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchCriteria(null);
    setEncarFilters({}, true);
  }, [setEncarFilters]);

  // Handler for encar API filter changes from Hero
  const handleEncarFilterChange = useCallback((filters: UseVehiclesFilters) => {
    setEncarFilters(filters, true);
  }, [setEncarFilters]);

  // --- CONDITIONAL RETURNS ---

  const isInitialLoading = loading && encarVehicles.length === 0;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-t-kg-gold border-slate-800 animate-spin" />
        <span className="text-xs font-bold tracking-[0.2em] text-kg-gold uppercase">MK Auto Korea</span>
      </div>
    );
  }

  // Home page content
  const homePageElement = (
    <main className="flex-grow">
      {/* Hero Section */}
      <Hero
        key={searchCriteria ? 'active' : 'reset'}
        t={t}
        lang={lang}
        onSearch={handleSearch}
        manufacturers={manufacturers}
        manufacturersLoading={manufacturersLoading}
        modelGroups={modelGroups}
        modelGroupsLoading={modelGroupsLoading}
        models={models}
        modelsLoading={modelsLoading}
        fetchModelGroups={fetchModelGroups}
        fetchModels={fetchModels}
        encarFilters={encarFilters}
        onEncarFilterChange={handleEncarFilterChange}
      />

      {/* Search Results Alert if filtered */}
      {searchCriteria && (
        <div className="bg-brand-50 border-y border-brand-100 py-4 px-4 sm:px-6 lg:px-8 text-brand-900 flex justify-between items-center max-w-7xl mx-auto my-6 rounded-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="text-kg-gold shrink-0" size={18} />
            <span className="text-xs font-semibold">
              {getLangText(lang, 'Showing search results for', 'Результаты поиска для', 'Издөө жыйынтыктары')} :{' '}
              <strong className="text-brand-600">
                {searchCriteria.brand || ''} {searchCriteria.model || ''}
              </strong>{' '}
              ({vehicles.length} found)
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
        vehicles={vehicles}
      />

      {/* Services Section */}
      <section id="services" className="bg-[#0b0f19] text-white py-24 px-4 sm:px-6 lg:px-8 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-kg-gold uppercase tracking-widest block mb-2">
              {getLangText(lang, 'Our Advantages', 'Наши Преимущества', 'Биздин Артыкчылыктар')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {getLangText(lang, 'Why Clients Choose Us', 'Почему клиенты выбирают нас', 'Эмне үчүн кардарлар бизди тандайт')}
            </h2>
            <div className="w-16 h-1 bg-kg-gold mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/5 p-8 rounded-2xl hover:border-kg-gold/20 transition-all duration-300 group">
              <div className="p-4 bg-brand-500/10 rounded-xl text-kg-gold w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-kg-gold/15 transition-all">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-lg font-extrabold mb-3">
                {getLangText(lang, '100% Verified Cars', '100% Проверенные Авто', '100% Текшерилген Унаалар')}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                {getLangText(lang,
                  'Our certified specialists in Korea conduct detailed technical diagnostics of each vehicle.',
                  'Наши сертифицированные специалисты в Корее проводят детальную техническую диагностику каждого автомобиля.',
                  'Кореядагы биздин тастыкталган адистер ар бир унааны деталдуу техникалык диагностикадан өткөрүшөт.'
                )}
              </p>
            </div>

            <div className="bg-white/5 border border-white/5 p-8 rounded-2xl hover:border-kg-gold/20 transition-all duration-300 group">
              <div className="p-4 bg-brand-500/10 rounded-xl text-kg-gold w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-kg-gold/15 transition-all">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-lg font-extrabold mb-3">
                {getLangText(lang, 'Customs & Logistics Support', 'Логистика и Растаможка', 'Логистика жана Бажы')}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                {getLangText(lang,
                  'Full escorting of shipping from South Korea to your destination.',
                  'Полное сопровождение доставки из Южной Кореи до вашей страны.',
                  'Түштүк Кореядан сиздин өлкөгө чейин жеткирүүнү толук коштоо.'
                )}
              </p>
            </div>

            <div className="bg-white/5 border border-white/5 p-8 rounded-2xl hover:border-kg-gold/20 transition-all duration-300 group">
              <div className="p-4 bg-brand-500/10 rounded-xl text-kg-gold w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-kg-gold/15 transition-all">
                <ClipboardCheck size={28} />
              </div>
              <h3 className="text-lg font-extrabold mb-3">
                {getLangText(lang, 'Direct Auction Access', 'Прямой Доступ к Аукционам', 'Аукциондорго түз кирүү')}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                {getLangText(lang,
                  'Buy cars directly from major Korean platforms like Encar, K-Car, Lotte.',
                  'Покупайте автомобили напрямую с крупнейших корейских платформ: Encar, K-Car, Lotte и Glovis.',
                  'Кореянын эң ири платформаларынан унааларды түз сатып алыңыз: Encar, K-Car, Lotte жана Glovis.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white text-slate-900 py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-700/10 to-transparent rounded-3xl" />
            <img
              src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=600&auto=format&fit=crop"
              alt="MK Auto Team Showroom"
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
              {getLangText(lang, 'Who We Are', 'О Нашей Компании', 'Биздин Компания Жөнүндө')}
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {getLangText(lang, 'MK Auto Korea — Sourcing the Best Korean Vehicles for Export', 'MK Auto Korea — Лучшие автомобили из Кореи для экспорта', 'MK Auto Korea — Кореядан экспорттоо үчүн эң мыкты унаалар')}
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              {getLangText(lang,
                'MK Auto Korea is a leading export broker operating directly from Seoul, South Korea.',
                'MK Auto Korea — ведущий экспортный брокер, работающий напрямую из Сеула, Южная Корея. Мы специализируемся на экспорте корейских седанов, внедорожников и коммерческой техники.',
                'MK Auto Korea — Түштүк Кореядан сапаттуу унааларды экспорттоо боюнча ишенимдүү өнөктөшүңүз.'
              )}
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-1">Seoul Office</h4>
                <p className="text-xs text-slate-500">Full export licensing, purchasing, vehicle scanning and logistics.</p>
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-1">Regional Office</h4>
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
        <Route path="/korean-car/" element={homePageElement} />
        <Route path="/korean-car/cars" element={
          <CarsPage
            vehicles={encarVehicles}
            t={t}
            lang={lang}
            loading={loading}
            hasMore={hasMore}
            loadMore={loadMore}
            manufacturers={manufacturers}
            manufacturersLoading={manufacturersLoading}
            modelGroups={modelGroups}
            modelGroupsLoading={modelGroupsLoading}
            models={models}
            modelsLoading={modelsLoading}
            fetchModelGroups={fetchModelGroups}
            fetchModels={fetchModels}
            setFilters={setEncarFilters}
          />
        } />
        <Route path="/korean-car/car/:id" element={<CarDetailsPage t={t} lang={lang} />} />
        {/* Fallback to home */}
        <Route path="*" element={homePageElement} />
      </Routes>

      <Footer
        t={t}
        setActiveSection={() => {}}
        onHomeClick={clearSearch}
      />
    </div>
  );
}

export default App;
