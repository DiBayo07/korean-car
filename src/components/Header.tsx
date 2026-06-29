import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check, Menu, X, Car, Bike } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Language, TranslationDict } from '../lib/translations';


interface HeaderProps {
  currentLang: Language;
  setLang: (lang: Language) => void;
  t: TranslationDict;
  onHomeClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  setLang,
  t,
  onHomeClick,
}) => {
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target as Node)) {
        setDesktopDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setMobileDropdownOpen(false);
      }
      // Close mobile menu when clicking outside the header entirely
      if (mobileMenuOpen && headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside as EventListener);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as EventListener);
    };
  }, [mobileMenuOpen]);

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
    { code: 'ky', label: 'Кыргызча' },
  ];

  const handleScrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    
    const isHomePage = location.pathname === '/' || location.pathname === '/korean-car' || location.pathname === '/korean-car/';
    
    // If we are not on the home page, navigate there first
    if (!isHomePage) {
      navigate('/korean-car/');
      // Wait for React to render the home page, then scroll
      setTimeout(() => {
        if (sectionId === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const element = document.getElementById(sectionId);
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 300);
      return;
    }

    // Only scroll if we're already on the home page
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleHomeClick = () => {
    if (onHomeClick) onHomeClick();
    handleScrollToSection('home');
  };

  const isActive = (path: string) => {
    const currentPath = location.pathname.replace(/\/$/, '');
    const checkPath = path.replace(/\/$/, '');
    return currentPath === checkPath;
  };

  const basePath = '/korean-car';

  return (
    <>
    {/* Backdrop overlay to close mobile menu on outside tap */}
    {mobileMenuOpen && (
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
        onClick={() => setMobileMenuOpen(false)}
      />
    )}
    <header ref={headerRef} className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          to={`${basePath}/`}
          onClick={handleHomeClick}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          {/* MK Auto Korea Logo */}
          <div className="relative h-12 flex items-center justify-center">
            <img 
              src={`${basePath}/mk-auto-korea.jpg`} 
              alt="MK Auto Korea" 
              className="h-full w-auto object-contain drop-shadow-md rounded-md"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to={`${basePath}/`}
            onClick={handleHomeClick}
            className={`text-sm font-medium tracking-wide transition-colors ${isActive(basePath) || isActive(`${basePath}/`) ? 'text-kg-gold' : 'text-slate-300 hover:text-white'}`}
          >
            {currentLang === 'en' ? 'Home' : currentLang === 'ru' ? 'Главная' : 'Башкы бет'}
          </Link>
          <Link
            to={`${basePath}/cars`}
            className={`text-sm font-medium tracking-wide transition-colors flex items-center gap-1.5 ${isActive(`${basePath}/cars`) ? 'text-kg-gold' : 'text-slate-300 hover:text-white'}`}
          >
            <Car size={14} />
            {currentLang === 'en' ? 'Cars' : currentLang === 'ru' ? 'Авто' : 'Унаалар'}
          </Link>
          <Link
            to={`${basePath}/bikes`}
            className={`text-sm font-medium tracking-wide transition-colors flex items-center gap-1.5 ${isActive(`${basePath}/bikes`) ? 'text-kg-gold' : 'text-slate-300 hover:text-white'}`}
          >
            <Bike size={14} />
            {t.navBikes}
          </Link>
          <button 
            onClick={() => handleScrollToSection('services')} 
            className="text-sm font-medium tracking-wide transition-colors text-slate-300 hover:text-white"
          >
            {t.navServices}
          </button>
          <button 
            onClick={() => handleScrollToSection('about')} 
            className="text-sm font-medium tracking-wide transition-colors text-slate-300 hover:text-white"
          >
            {t.navAbout}
          </button>
          <button 
            onClick={() => handleScrollToSection('contact')} 
            className="text-sm font-medium tracking-wide transition-colors text-slate-300 hover:text-white"
          >
            {t.navContact}
          </button>
        </nav>

        {/* Desktop Controls (Lang Switcher & Call Action) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Switcher - DESKTOP (separate ref and state) */}
          <div className="relative" ref={desktopDropdownRef}>
            <button
              onClick={() => setDesktopDropdownOpen(!desktopDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-all text-xs font-semibold"
            >
              <Globe size={14} className="text-slate-400" />
              <span>{currentLang.toUpperCase()}</span>
              <ChevronDown size={12} className={`text-slate-400 transition-transform ${desktopDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {desktopDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-xl bg-slate-900 border border-white/10 p-1 shadow-2xl z-[100]">
                {languages.map((langItem) => (
                  <button
                    key={langItem.code}
                    onClick={() => {
                      setLang(langItem.code);
                      setDesktopDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all ${
                      currentLang === langItem.code
                        ? 'bg-brand-500 text-white font-semibold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{langItem.label}</span>
                    {currentLang === langItem.code && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Get In Touch Pill Button */}
          <button
            onClick={() => handleScrollToSection('contact')}
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-semibold text-xs tracking-wider uppercase rounded-full shadow-lg transition-all duration-200"
          >
            {t.getInTouch}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Language Switcher for Mobile (separate ref and state) */}
          <div className="relative" ref={mobileDropdownRef}>
            <button
              onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-all text-xs"
            >
              <Globe size={13} className="text-slate-400" />
              <span>{currentLang.toUpperCase()}</span>
            </button>
            {mobileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-xl bg-slate-900 border border-white/10 p-1 shadow-2xl z-[100]">
                {languages.map((langItem) => (
                  <button
                    key={langItem.code}
                    onClick={() => {
                      setLang(langItem.code);
                      setMobileDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all ${
                      currentLang === langItem.code
                        ? 'bg-brand-500 text-white font-semibold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{langItem.label}</span>
                    {currentLang === langItem.code && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-3">
            <Link
              to={`${basePath}/`}
              onClick={() => {
                setMobileMenuOpen(false);
                handleHomeClick();
              }}
              className={`block w-full text-left py-2 px-3 rounded-lg text-sm font-semibold ${isActive(basePath) || isActive(`${basePath}/`) ? 'bg-brand-500/10 text-kg-gold' : 'text-slate-300 hover:bg-white/5'}`}
            >
              {currentLang === 'en' ? 'Home' : currentLang === 'ru' ? 'Главная' : 'Башкы бет'}
            </Link>
            <Link
              to={`${basePath}/cars`}
              onClick={() => setMobileMenuOpen(false)}
              className={`block w-full text-left py-2 px-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${isActive(`${basePath}/cars`) ? 'bg-brand-500/10 text-kg-gold' : 'text-slate-300 hover:bg-white/5'}`}
            >
              <Car size={16} />
              {currentLang === 'en' ? 'Cars' : currentLang === 'ru' ? 'Авто' : 'Унаалар'}
            </Link>
            <Link
              to={`${basePath}/bikes`}
              onClick={() => setMobileMenuOpen(false)}
              className={`block w-full text-left py-2 px-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${isActive(`${basePath}/bikes`) ? 'bg-brand-500/10 text-kg-gold' : 'text-slate-300 hover:bg-white/5'}`}
            >
              <Bike size={16} />
              {t.navBikes}
            </Link>
            <button
              onClick={() => handleScrollToSection('services')}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-300 hover:bg-white/5"
            >
              {t.navServices}
            </button>
            <button
              onClick={() => handleScrollToSection('about')}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-300 hover:bg-white/5"
            >
              {t.navAbout}
            </button>
            <button
              onClick={() => handleScrollToSection('contact')}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-300 hover:bg-white/5"
            >
              {t.navContact}
            </button>
            <div className="pt-2 border-t border-white/5">
              <button
                onClick={() => handleScrollToSection('contact')}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider text-center rounded-lg shadow-md"
              >
                {t.getInTouch}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
};
