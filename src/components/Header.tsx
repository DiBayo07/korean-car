import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check, Menu, X, PlusCircle } from 'lucide-react';
import type { Language, TranslationDict } from '../lib/translations';


interface HeaderProps {
  currentLang: Language;
  setLang: (lang: Language) => void;
  t: TranslationDict;
  activeSection: string;
  setActiveSection: (section: string) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  setLang,
  t,
  activeSection,
  setActiveSection,
  isAdmin,
  setIsAdmin,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
    { code: 'ky', label: 'Кыргызча' },
  ];

  const handleNavClick = (sectionId: string) => {
    setIsAdmin(false);
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    
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

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => handleNavClick('home')}
        >
          {/* Kyrgyz-Korean Styled Logo */}
          <div className="relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-tr from-brand-700 to-brand-500 shadow-lg border border-white/10">
            {/* Red and Blue Taegeuk Wave representation */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-kg-red/80"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-brand-800/80"></div>
            {/* Golden Sun overlay in center */}
            <div className="absolute w-5 h-5 rounded-full bg-kg-gold flex items-center justify-center shadow-md animate-pulse">
              <span className="text-[10px] font-black text-brand-900">KG</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              KG <span className="font-light text-slate-300 text-sm border-l border-white/20 pl-1.5">Motors Korea</span>
            </span>
            <span className="text-[9px] uppercase tracking-[0.15em] text-kg-gold font-bold">Bishkek · Seoul</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => handleNavClick('cars')} 
            className={`text-sm font-medium tracking-wide transition-colors ${activeSection === 'cars' && !isAdmin ? 'text-kg-gold' : 'text-slate-300 hover:text-white'}`}
          >
            {t.navCatalog}
          </button>
          <button 
            onClick={() => handleNavClick('bikes')} 
            className={`text-sm font-medium tracking-wide transition-colors ${activeSection === 'bikes' && !isAdmin ? 'text-kg-gold' : 'text-slate-300 hover:text-white'}`}
          >
            {t.navBikes}
          </button>
          <button 
            onClick={() => handleNavClick('services')} 
            className={`text-sm font-medium tracking-wide transition-colors ${activeSection === 'services' && !isAdmin ? 'text-kg-gold' : 'text-slate-300 hover:text-white'}`}
          >
            {t.navServices}
          </button>
          <button 
            onClick={() => handleNavClick('about')} 
            className={`text-sm font-medium tracking-wide transition-colors ${activeSection === 'about' && !isAdmin ? 'text-kg-gold' : 'text-slate-300 hover:text-white'}`}
          >
            {t.navAbout}
          </button>
          <button 
            onClick={() => handleNavClick('contact')} 
            className={`text-sm font-medium tracking-wide transition-colors ${activeSection === 'contact' && !isAdmin ? 'text-kg-gold' : 'text-slate-300 hover:text-white'}`}
          >
            {t.navContact}
          </button>
          <button 
            onClick={() => setIsAdmin(true)} 
            className={`text-sm font-semibold tracking-wide flex items-center gap-1.5 px-3 py-1 rounded-md border transition-all ${isAdmin ? 'bg-kg-gold/15 text-kg-gold border-kg-gold/30' : 'text-slate-400 hover:text-slate-200 border-white/5 hover:border-white/10'}`}
          >
            <PlusCircle size={14} />
            {t.navAdmin}
          </button>
        </nav>

        {/* Desktop Controls (Lang Switcher & Call Action) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-all text-xs font-semibold"
            >
              <Globe size={14} className="text-slate-400" />
              <span>{currentLang.toUpperCase()}</span>
              <ChevronDown size={12} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-xl bg-dark-card border border-white/10 p-1 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLang(lang.code);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all ${
                      currentLang === lang.code
                        ? 'bg-brand-500 text-white font-semibold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {currentLang === lang.code && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Get In Touch Pill Button */}
          <button
            onClick={() => handleNavClick('contact')}
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-semibold text-xs tracking-wider uppercase rounded-full shadow-lg transition-all duration-200"
          >
            {t.getInTouch}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Language Switcher for Mobile */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-all text-xs"
            >
              <Globe size={13} className="text-slate-400" />
              <span>{currentLang.toUpperCase()}</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-xl bg-dark-card border border-white/10 p-1 shadow-2xl ring-1 ring-black ring-opacity-5">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLang(lang.code);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all ${
                      currentLang === lang.code
                        ? 'bg-brand-500 text-white font-semibold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {currentLang === lang.code && <Check size={12} />}
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
            <button
              onClick={() => handleNavClick('cars')}
              className={`block w-full text-left py-2 px-3 rounded-lg text-sm font-semibold ${activeSection === 'cars' && !isAdmin ? 'bg-brand-500/10 text-kg-gold' : 'text-slate-300 hover:bg-white/5'}`}
            >
              {t.navCatalog}
            </button>
            <button
              onClick={() => handleNavClick('bikes')}
              className={`block w-full text-left py-2 px-3 rounded-lg text-sm font-semibold ${activeSection === 'bikes' && !isAdmin ? 'bg-brand-500/10 text-kg-gold' : 'text-slate-300 hover:bg-white/5'}`}
            >
              {t.navBikes}
            </button>
            <button
              onClick={() => handleNavClick('services')}
              className={`block w-full text-left py-2 px-3 rounded-lg text-sm font-semibold ${activeSection === 'services' && !isAdmin ? 'bg-brand-500/10 text-kg-gold' : 'text-slate-300 hover:bg-white/5'}`}
            >
              {t.navServices}
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`block w-full text-left py-2 px-3 rounded-lg text-sm font-semibold ${activeSection === 'about' && !isAdmin ? 'bg-brand-500/10 text-kg-gold' : 'text-slate-300 hover:bg-white/5'}`}
            >
              {t.navAbout}
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`block w-full text-left py-2 px-3 rounded-lg text-sm font-semibold ${activeSection === 'contact' && !isAdmin ? 'bg-brand-500/10 text-kg-gold' : 'text-slate-300 hover:bg-white/5'}`}
            >
              {t.navContact}
            </button>
            <button
              onClick={() => {
                setIsAdmin(true);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2 px-3 rounded-lg text-sm font-bold flex items-center gap-2 ${isAdmin ? 'bg-kg-gold/15 text-kg-gold' : 'text-slate-300 hover:bg-white/5'}`}
            >
              <PlusCircle size={16} />
              {t.navAdmin}
            </button>
            <div className="pt-2 border-t border-white/5">
              <button
                onClick={() => handleNavClick('contact')}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider text-center rounded-lg shadow-md"
              >
                {t.getInTouch}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
