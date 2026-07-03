import React from 'react';
import { MessageCircle } from 'lucide-react';
import type { TranslationDict } from '../lib/translations';

interface FooterProps {
  t: TranslationDict;
  setActiveSection: (section: string) => void;
  onHomeClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ t, setActiveSection, onHomeClick }) => {
  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    
    if (sectionId === 'home') {
      if (onHomeClick) onHomeClick();
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
        <div className="md:col-span-7 space-y-6">
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
              href="https://www.instagram.com/mkautokorea?igsh=YjNhYjRkYmpycWE2" 
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

            {/* Telegram */}
            <a 
              href="https://t.me/mkautokorea" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 bg-white/5 border border-white/10 hover:border-kg-gold hover:text-kg-gold rounded-full transition-all text-slate-300"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.62.15-.16 2.72-2.5 2.77-2.7.01-.03.01-.15-.06-.21-.07-.06-.17-.04-.25-.02-.11.02-1.92 1.21-5.42 3.56-.51.35-.97.52-1.38.51-.45-.01-1.32-.26-1.97-.47-.8-.26-1.43-.4-1.38-.85.03-.23.35-.47.96-.71 3.76-1.64 6.27-2.72 7.54-3.25 3.58-1.5 4.32-1.76 4.81-1.77.11 0 .35.03.5.15.13.1.17.24.18.34z"/>
              </svg>
            </a>

            {/* WhatsApp */}
            <a 
              href="https://wa.me/821065914114" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 bg-white/5 border border-white/10 hover:border-kg-gold hover:text-kg-gold rounded-full transition-all text-slate-300"
            >
              <MessageCircle size={16} />
            </a>

            {/* Gmail */}
            <a 
              href="mailto:baktybek.kokoev04@gmail.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 bg-white/5 border border-white/10 hover:border-kg-gold hover:text-kg-gold rounded-full transition-all text-slate-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </a>
          </div>
        </div>


        {/* Right column - Contacts */}
        <div className="md:col-span-5 space-y-4">
          <h4 className="text-sm font-extrabold uppercase text-white tracking-widest">
            {t.footerContact}
          </h4>
          <ul className="space-y-3.5 text-sm">
            <li className="flex items-start gap-2.5">
              <span className="font-semibold text-white">Phone:</span>
              <a href="tel:+821065914114" className="hover:text-white transition-colors">
                +82 10-6591-4114
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="font-semibold text-white">Email:</span>
              <a href="mailto:baktybek.kokoev04@gmail.com" className="hover:text-white transition-colors break-all">
                baktybek.kokoev04@gmail.com
              </a>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
        <span>
          © {new Date().getFullYear()} MK Auto Korea. All rights reserved.
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
