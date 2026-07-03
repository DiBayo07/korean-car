import React from 'react';
import { Phone, Mail, MessageCircle, Send } from 'lucide-react';
import type { TranslationDict } from '../lib/translations';


interface ContactSectionProps {
  t: TranslationDict;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ t }) => {
  return (
    <section id="contact" className="bg-brand-950 text-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background grid/pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Decorative Kyrgyz sun glow */}
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-kg-gold/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column - Contact Details */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <span className="text-xs font-extrabold text-kg-gold uppercase tracking-widest block mb-3">
              {t.contactTag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              {t.contactTitle}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              {t.contactSubtitle}
            </p>
          </div>

          <div className="space-y-6 pt-4">
            {/* Phone/WhatsApp */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-kg-gold mt-1">
                <Phone size={20} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold block mb-1">WhatsApp / Telegram</span>
                <a href="tel:+821065914114" className="text-base font-extrabold hover:text-kg-gold transition-colors">
                  +82 10-6591-4114
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-kg-gold mt-1">
                <Mail size={20} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold block mb-1">Email</span>
                <a href="mailto:baktybek.kokoev04@gmail.com" className="text-base font-extrabold hover:text-kg-gold transition-colors">
                  baktybek.kokoev04@gmail.com
                </a>
                <span className="text-xs text-slate-400 block mt-0.5">mkautokorea@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Contact Form Card */}
        <div className="lg:col-span-5">
          <div className="bg-[#151b26] border border-white/5 p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Top gold bar detail */}
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-kg-red via-kg-gold to-brand-500" />
            
            <h3 className="text-xl font-extrabold text-white mb-6 font-sans">
              {t.contactQuick}
            </h3>

            <div className="space-y-4">
              {/* WhatsApp Button */}
              <a
                href="https://wa.me/821065914114"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 bg-[#25d366] hover:bg-[#20ba5a] active:scale-[0.98] text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-[#25d366]/20 transition-all duration-200"
              >
                <MessageCircle size={18} fill="currentColor" />
                <span>{t.contactWhatsApp}</span>
              </a>

              {/* Telegram Button */}
              <a
                href="https://t.me/mkautokorea"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 bg-[#5969ea] hover:bg-[#4958d6] active:scale-[0.98] text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-[#5969ea]/20 transition-all duration-200"
              >
                <Send size={18} fill="currentColor" className="rotate-[-10deg]" />
                <span>{t.contactViber}</span>
              </a>

              {/* Email Button */}
              <a
                href="mailto:baktybek.kokoev04@gmail.com"
                className="w-full py-4 px-6 bg-[#242c3d] hover:bg-[#2b354a] border border-white/5 active:scale-[0.98] text-slate-200 font-extrabold text-sm rounded-xl flex items-center justify-center gap-3 shadow-lg transition-all duration-200"
              >
                <Mail size={18} />
                <span>{t.contactEmailBtn}</span>
              </a>
            </div>

            <p className="text-[10px] text-center text-slate-400 font-medium mt-6">
              {t.contactLanguages}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
