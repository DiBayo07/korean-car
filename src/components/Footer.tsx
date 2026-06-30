import React from 'react';
import { MessageCircle } from 'lucide-react';
import type { TranslationDict } from '../lib/translations';

interface FooterProps {
  t: TranslationDict;
  setActiveSection: (section: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ t, setActiveSection }) => {
  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    
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
    <footer className="bg-[#080b11] text-slate-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Left column - Brand & Description */}
        <div className="md:col-span-5 space-y-6">
          <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => handleNavClick('home')}
          >
            {/* MK Auto Korea Logo */}
            <div className="relative h-10 flex items-center justify-center">
              <img 
                src="/korean-car/mk-auto-korea.jpg" 
                alt="MK Auto Korea" 
                className="h-full w-auto object-contain drop-shadow-md rounded-md grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            {t.footerAbout}
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {/* Instagram */}
            <a 
              href="https://instagram.com/kg_motors_korea" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 bg-white/5 border border-white/10 hover:border-kg-gold hover:text-kg-gold rounded-full transition-all text-slate-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            {/* TikTok Custom SVG */}
            <a 
              href="https://tiktok.com/@kg_motors_korea" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 bg-white/5 border border-white/10 hover:border-kg-gold hover:text-kg-gold rounded-full transition-all text-slate-300"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95 1.15 2.29 1.94 3.73 2.2v3.91c-1.3-.08-2.58-.55-3.64-1.29-.68-.48-1.28-1.09-1.74-1.8v8.66c.09 1.9-.57 3.82-1.79 5.25-1.57 1.83-4.04 2.8-6.44 2.52-2.52-.25-4.83-1.8-5.99-4.07-1.46-2.73-.99-6.32 1.17-8.54 1.7-1.78 4.26-2.48 6.6-1.84V11.2c-1.12-.39-2.38-.19-3.32.53-.99.72-1.51 1.96-1.34 3.19.14 1.25.96 2.37 2.11 2.87.89.4 1.94.38 2.82-.07.72-.37 1.2-1.1 1.28-1.92L12.52.02z"/>
              </svg>
            </a>

            {/* YouTube */}
            <a 
              href="https://youtube.com/kg_motors_korea" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 bg-white/5 border border-white/10 hover:border-kg-gold hover:text-kg-gold rounded-full transition-all text-slate-300"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>

            {/* WhatsApp */}
            <a 
              href="https://wa.me/821033334019" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 bg-white/5 border border-white/10 hover:border-kg-gold hover:text-kg-gold rounded-full transition-all text-slate-300"
            >
              <MessageCircle size={16} />
            </a>
          </div>
        </div>


        {/* Middle column - Quick Links */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="text-sm font-extrabold uppercase text-white tracking-widest">
            {t.footerLinks}
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <button onClick={() => handleNavClick('cars')} className="hover:text-white transition-colors">
                {t.navCatalog}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('services')} className="hover:text-white transition-colors">
                {t.navServices}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('about')} className="hover:text-white transition-colors">
                {t.navAbout}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('contact')} className="hover:text-white transition-colors">
                {t.navContact}
              </button>
            </li>

          </ul>
        </div>

        {/* Right column - Contacts */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="text-sm font-extrabold uppercase text-white tracking-widest">
            {t.footerContact}
          </h4>
          <ul className="space-y-3.5 text-sm">
            <li className="flex items-start gap-2.5">
              <span className="font-semibold text-white">KR:</span>
              <a href="tel:+821033334019" className="hover:text-white transition-colors">
                +82 10-3333-4019
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="font-semibold text-white">KG:</span>
              <a href="tel:+996555777888" className="hover:text-white transition-colors">
                +996 555-777-888
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="font-semibold text-white">Email:</span>
              <a href="mailto:contact.smtrading@gmail.com" className="hover:text-white transition-colors break-all">
                contact.kgmotors@gmail.com
              </a>
            </li>
            <li className="flex flex-col gap-1">
              <span className="font-semibold text-white">Addresses:</span>
              <span className="text-xs leading-relaxed">
                • #813 Hizen Star, 254 Techno Junang-daero, Daegu, Korea
              </span>
              <span className="text-xs leading-relaxed">
                • 120 Chuy Avenue, Bishkek, Kyrgyzstan
              </span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
        <span>
          © {new Date().getFullYear()} KG Motors Korea. All rights reserved.
        </span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-300">Privacy Policy</a>
          <span>·</span>
          <a href="#" className="hover:text-slate-300">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};
