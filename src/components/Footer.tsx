import React, { useState, useEffect } from 'react';
import { useNavigation, AppRoute } from '../context/NavigationContext';
import { bakeryStore } from '../lib/bakeryStore';
import { SiteSettings } from '../types/bakery';
import { Phone, MessageCircle, MapPin, Instagram, Facebook, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useNavigation();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    bakeryStore.getSiteSettings().then(setSettings);
    const unsub = bakeryStore.subscribe(() => {
      bakeryStore.getSiteSettings().then(setSettings);
    });
    return unsub;
  }, []);

  const handleNav = (route: AppRoute) => {
    navigate(route);
  };

  return (
    <footer className="bg-[#26150E] text-[#F0E6DF] border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt="Esteria Bakery"
                className="h-14 w-auto max-w-[200px] object-contain drop-shadow-sm brightness-105"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#26150E] font-serif font-extrabold text-2xl shadow-md border border-amber-300/40 shrink-0">
                  E
                </div>
                <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-white inline-flex items-baseline">
                  Esteria Bakery
                  <span className="text-amber-500 ml-0.5">.</span>
                </span>
              </div>
            )}
            <p className="text-sm text-stone-300 leading-relaxed">
              Savour the flavour in every bite. Bringing authentic Nigerian pastries, exquisite celebration cakes, and irresistible small chops straight to your doorstep.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Esteria Bakery on Instagram"
                className="w-9 h-9 rounded-full bg-stone-800/80 hover:bg-amber-500 hover:text-stone-950 flex items-center justify-center transition-colors text-stone-300"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Esteria Bakery on Facebook"
                className="w-9 h-9 rounded-full bg-stone-800/80 hover:bg-amber-500 hover:text-stone-950 flex items-center justify-center transition-colors text-stone-300"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/2349158209566"
                target="_blank"
                rel="noreferrer"
                aria-label="Direct WhatsApp Chat"
                className="w-9 h-9 rounded-full bg-stone-800/80 hover:bg-amber-500 hover:text-stone-950 flex items-center justify-center transition-colors text-stone-300"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white tracking-wide mb-4">
              Explore Menu
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-300">
              <li>
                <button
                  onClick={() => handleNav('/menu')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Custom Celebration Cakes
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/menu')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Flaky Pastries &amp; Pies
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/menu')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Puff-Puff &amp; Finger Foods
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/menu')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Party Small Chops Platters
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/menu')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Natural Fresh Fruit Juices
                </button>
              </li>
            </ul>
          </div>

          {/* Bakery Navigation */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white tracking-wide mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-300">
              <li>
                <button onClick={() => handleNav('/')} className="hover:text-amber-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/about')} className="hover:text-amber-400 transition-colors">
                  Our Story &amp; Values
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/menu')} className="hover:text-amber-400 transition-colors">
                  Full Menu &amp; Pricing
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/reviews')} className="hover:text-amber-400 transition-colors">
                  Customer Reviews
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/order')} className="hover:text-amber-400 transition-colors">
                  Place an Order
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white tracking-wide mb-4">
              Get In Touch
            </h4>
            <div className="space-y-3 text-sm text-stone-300">
              <a
                href="https://wa.me/2349158209566"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 hover:text-amber-400 transition-colors group"
              >
                <MessageCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>WhatsApp: <strong className="font-mono text-white group-hover:text-amber-400">09158209566</strong></span>
              </a>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>Call: <strong className="font-mono text-white">09158209566</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>Lagos &amp; Abuja Delivery Hubs, Nigeria</span>
              </div>
              <div className="pt-2 text-xs text-stone-400">
                Opening Hours: Monday – Saturday: 8:00 AM – 7:00 PM
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            &copy; 2026 Esteria Bakery. All rights reserved. Made fresh in Nigeria.
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleNav('/admin')}
              className="flex items-center gap-1.5 text-stone-400 hover:text-amber-400 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Owner Dashboard</span>
            </button>
            <span>·</span>
            <span>Delivery Across Lagos &amp; Abuja</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
