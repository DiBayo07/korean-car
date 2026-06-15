import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CarsSection } from './components/CarsSection';
import { BikesSection } from './components/BikesSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { getVehicles } from './lib/supabase';
import type { Vehicle } from './lib/supabase';
import { translations } from './lib/translations';
import type { Language } from './lib/translations';
import { CheckCircle2, ShieldCheck, ClipboardCheck, Sparkles, X } from 'lucide-react';

function App() {
  const [lang, setLang] = useState<Language>('ru'); // Default to Russian as requested for Kyrgyz vibe
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchResults, setSearchResults] = useState<Vehicle[] | null>(null);
  const [searchCriteria, setSearchCriteria] = useState<{ brand?: string; model?: string } | null>(null);

  const t = translations[lang];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getVehicles();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-t-kg-gold border-slate-800 animate-spin" />
        <span className="text-xs font-bold tracking-[0.2em] text-kg-gold uppercase">KG Motors Korea</span>
      </div>
    );
  }


  // Extract unique brands, models, generations for Hero search dropdowns
  const carsOnly = vehicles.filter(v => v.type === 'car');
  const brands = Array.from(new Set(carsOnly.map(v => v.brand)));
  
  // Gather models based on selected brand in parent if needed, but for hero it's simpler:
  const models = Array.from(new Set(carsOnly.map(v => v.model)));
  const generations = Array.from(new Set(carsOnly.map(v => v.generation).filter(Boolean))) as string[];

  const handleSearch = (brand: string, model: string, generation: string) => {
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
  };

  const clearSearch = () => {
    setSearchResults(null);
    setSearchCriteria(null);
  };

  // Scroll monitoring to set active tab in Header
  useEffect(() => {
    const handleScroll = () => {
      if (isAdmin) return;
      const sections = ['cars', 'bikes', 'services', 'about', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdmin]);

  if (isAdmin) {
    return <AdminPanel onBack={() => setIsAdmin(false)} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white selection:bg-kg-gold selection:text-brand-950">
      <Header
        currentLang={lang}
        setLang={setLang}
        t={t}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />

      <main className="flex-grow">
        {/* Hero Section */}
        <Hero
          t={t}
          onSearch={handleSearch}
          brands={brands}
          models={models}
          generations={generations}
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

        {/* Services Section (Premium touch with icons & grids) */}
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
              {/* Inspection */}
              <div className="bg-white/5 border border-white/5 p-8 rounded-2xl hover:border-kg-gold/20 transition-all duration-300 group">
                <div className="p-4 bg-brand-500/10 rounded-xl text-kg-gold w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-kg-gold/15 transition-all">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-lg font-extrabold mb-3">
                  {lang === 'en' ? '100% Verified Cars' : lang === 'ru' ? '100% Проверенные Авто' : '100% Текшерилген Унаалар'}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                  {lang === 'en' 
                    ? 'Our certified specialists in Korea conduct detailed technical diagnostics of each vehicle. Paint layers, engine, and structural integrity are thoroughly checked.' 
                    : lang === 'ru' 
                    ? 'Наши сертифицированные специалисты в Корее проводят детальную техническую диагностику каждого автомобиля. Проверяются лакокрасочное покрытие, двигатель и кузов.'
                    : 'Кореядагы биздин тастыкталган адистер ар бир унааны деталдуу техникалык диагностикадан өткөрүшөт. Боёк катмары, кыймылдаткыч жана кузов текшерилет.'}
                </p>
              </div>

              {/* Secure Delivery */}
              <div className="bg-white/5 border border-white/5 p-8 rounded-2xl hover:border-kg-gold/20 transition-all duration-300 group">
                <div className="p-4 bg-brand-500/10 rounded-xl text-kg-gold w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-kg-gold/15 transition-all">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-lg font-extrabold mb-3">
                  {lang === 'en' ? 'Customs & Logistics Support' : lang === 'ru' ? 'Логистика и Растаможка' : 'Логистика жана Бажы'}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                  {lang === 'en'
                    ? 'Full escorting of shipping from South Korea to Bishkek. We provide assistance in customs clearance, registration, and fast overland shipping.'
                    : lang === 'ru'
                    ? 'Полное сопровождение доставки из Южной Кореи до Бишкека. Помогаем с таможенным оформлением, получением СБКТС/ЭПТС и быстрой доставкой автовозом.'
                    : 'Түштүк Кореядан Бишкекке чейин жеткирүүнү толук коштоо. Бажы тариздөөсү, СБКТС/ЭПТС алуу жана автоунаа ташуучу менен тез жеткирүүгө жардам беребиз.'}
                </p>
              </div>

              {/* Direct Auction */}
              <div className="bg-white/5 border border-white/5 p-8 rounded-2xl hover:border-kg-gold/20 transition-all duration-300 group">
                <div className="p-4 bg-brand-500/10 rounded-xl text-kg-gold w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-kg-gold/15 transition-all">
                  <ClipboardCheck size={28} />
                </div>
                <h3 className="text-lg font-extrabold mb-3">
                  {lang === 'en' ? 'Direct Auction Access' : lang === 'ru' ? 'Прямой Доступ к Аукционам' : 'Аукциондорго түз кирүү'}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                  {lang === 'en'
                    ? 'Buy cars directly from major Korean platforms like Encar, K-Car, Lotte, and Glovis. No hidden fees or middleman charges.'
                    : lang === 'ru'
                    ? 'Покупайте автомобили напрямую с крупнейших корейских платформ: Encar, K-Car, Lotte и Glovis. Полная прозрачность сделки без лишних наценок.'
                    : 'Кореянын эң ири платформаларынан унааларды түз сатып алыңыз: Encar, K-Car, Lotte жана Glovis. Ашыкча кошумча төлөмдөрсүз келишимдин толук ачыктыгы.'}
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
            {/* Left side Image with golden-accent borders */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-700/10 to-transparent rounded-3xl" />
              <img
                src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=600&auto=format&fit=crop"
                alt="KG Motors Team Showroom"
                className="w-full rounded-3xl shadow-xl border border-slate-100 object-cover aspect-[4/3]"
              />
              {/* Badge */}
              <div className="absolute -bottom-6 -right-6 bg-brand-950 text-white p-5 rounded-2xl shadow-2xl border border-white/5 flex items-center gap-3">
                <span className="text-3xl font-black text-kg-gold">10+</span>
                <span className="text-[10px] uppercase font-bold tracking-widest leading-tight text-slate-400">
                  Years of<br />Experience
                </span>
              </div>
            </div>

            {/* Right side Text */}
            <div className="lg:col-span-7 space-y-6 lg:pl-6">
              <span className="text-xs font-extrabold text-brand-500 uppercase tracking-widest block">
                {lang === 'en' ? 'Who We Are' : lang === 'ru' ? 'О Нашей Компании' : 'Биздин Компания Жөнүндө'}
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {lang === 'en' ? 'KG Motors Korea — Sourcing the Best Korean Vehicles for Kyrgyzstan' : lang === 'ru' ? 'KG Motors Korea — Лучшие автомобили из Кореи для Кыргызстана' : 'KG Motors Korea — Кыргызстан үчүн Кореядан эң мыкты унаалар'}
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                {lang === 'en'
                  ? 'KG Motors Korea is a leading export broker operating directly between Seoul and Bishkek. We specialize in importing premium Korean sedans, SUVs, and commercial vehicles. Our priority is quality, transparency, and building long-term relationships with our clients in Kyrgyzstan.'
                  : lang === 'ru'
                  ? 'KG Motors Korea — ведущий экспортный брокер, работающий напрямую между Сеулом и Бишкеком. Мы специализируемся на импорте корейских седанов, внедорожников и коммерческой техники. Наш приоритет — качество, прозрачность сделки и долгосрочное доверие клиентов из Кыргызстана.'
                  : 'KG Motors Korea — Сеул жана Бишкек шаарларынын ортосунда түз иштеген алдыңкы экспорттук брокер. Биз корей седандарын, жол тандабастарын жана коммерциялык техникаларын импорттоого адистешкенбиз. Биздин артыкчылык — сапат, келишимдин ачыктыгы жана Кыргызстандагы кардарлардын узак мөөнөттүү ишеними.'}
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

      <Footer
        t={t}
        setActiveSection={setActiveSection}
        setIsAdmin={setIsAdmin}
      />
    </div>
  );
}

export default App;
