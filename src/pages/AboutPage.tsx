import React, { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { SiteSettings } from '../types/bakery';
import { bakeryStore } from '../lib/bakeryStore';
import { Heart, Sparkles, ShieldCheck, Clock, Award, Users, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate } = useNavigation();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    bakeryStore.getSiteSettings().then(setSettings);
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO */}
      <section className="bg-amber-50/40 border-b border-amber-950/10 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs uppercase tracking-widest font-bold text-amber-800">
              About Esteria Bakery
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#2D1A12] leading-tight text-balance">
              {settings?.about_title || 'Baked With Passion, Made For You.'}
            </h1>
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
              Crafting premium Nigerian pastries, savory finger foods, and celebratory cakes with unwavering dedication to authenticity, real butter, and community warmth.
            </p>
          </div>
        </div>
      </section>

      {/* 2. OUR STORY & KITCHEN CRAFT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-stone-100">
            <img
              src="/src/assets/images/about_baker_kitchen_1791355988029.jpg"
              alt="Artisanal baker kitchen at Esteria Bakery"
              className="w-full h-80 sm:h-[420px] object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  '/src/assets/images/hero_nigerian_bakery_spread_1791355942203.jpg';
              }}
            />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase tracking-widest font-bold text-amber-800">
              Our Journey
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#2D1A12]">
              From a Passion for Pure Nigerian Baking to a Beloved Brand
            </h2>
            <div className="space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed">
              <p>
                {settings?.about_text ||
                  'At Esteria Bakery, we believe good food creates unforgettable memories. Starting with a deep love for baking, we perfected the art of golden, flaky pastries, moist celebration cakes, and mouth-watering small chops that bring family, friends, and colleagues together.'}
              </p>
              <p>
                In a market often flooded with mass-produced snacks using cheap shortening and artificial flavorings, Esteria Bakery was born out of a desire for excellence: crusts that crumble delicately, minced beef seasoned with authentic herbs and vegetables, and celebration cakes that taste as divine as they look.
              </p>
              <p>
                Every morning, our ovens are fired early to ensure that when your box arrives, you experience that unforgettable warmth and aroma of genuine homemade baking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR MISSION */}
      <section className="bg-stone-50 border-y border-stone-200 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xs uppercase tracking-widest font-bold text-amber-800">
            Our Mission
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#2D1A12] max-w-2xl mx-auto text-balance">
            To make every bite a celebration of Nigerian taste and culinary care.
          </h2>
          <p className="text-stone-700 text-base leading-relaxed max-w-3xl mx-auto">
            {settings?.mission_text ||
              'Our mission is to bake every single item fresh to order using premium, locally trusted ingredients, zero shortcuts, and heartfelt craftsmanship that honors authentic Nigerian bakery traditions.'}
          </p>
        </div>
      </section>

      {/* 4. CORE VALUES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest font-bold text-amber-800">
            What Defines Us
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#2D1A12]">
            Our Core Values
          </h2>
          <p className="text-stone-600 text-sm">
            Principles that guide every recipe, interaction, and delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-amber-950/10 shadow-xs space-y-3">
            <Award className="w-6 h-6 text-amber-700" />
            <h3 className="font-serif font-bold text-base text-[#2D1A12]">
              Uncompromised Quality
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We never cut corners on butter, beef quality, or ingredients.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-amber-950/10 shadow-xs space-y-3">
            <Sparkles className="w-6 h-6 text-amber-700" />
            <h3 className="font-serif font-bold text-base text-[#2D1A12]">
              Artisanal Creativity
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Custom designs, bespoke party platters, and personalized cake decor.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-amber-950/10 shadow-xs space-y-3">
            <Clock className="w-6 h-6 text-amber-700" />
            <h3 className="font-serif font-bold text-base text-[#2D1A12]">
              True Freshness
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Baked daily on demand to guarantee peak flavor and fluffy texture.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-amber-950/10 shadow-xs space-y-3">
            <ShieldCheck className="w-6 h-6 text-amber-700" />
            <h3 className="font-serif font-bold text-base text-[#2D1A12]">
              Reliability
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              When we commit to your event date and hour, we deliver without excuses.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-amber-950/10 shadow-xs space-y-3">
            <Heart className="w-6 h-6 text-amber-700" />
            <h3 className="font-serif font-bold text-base text-[#2D1A12]">
              Customer Care
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Attentive WhatsApp coordination for each order and special request.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-amber-500 text-[#2D1A12] space-y-6 shadow-lg">
          <h2 className="font-serif text-3xl font-bold">
            Taste the Difference for Yourself
          </h2>
          <p className="text-sm sm:text-base text-stone-900 max-w-xl mx-auto">
            From our signature Nigerian meat pies to grand celebration cakes, explore what Esteria Bakery has ready for you today.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/menu')}
              className="py-3 px-8 rounded-xl bg-[#2D1A12] text-white hover:bg-stone-900 font-bold text-sm transition-colors shadow-xs flex items-center gap-2"
            >
              <span>Explore Our Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
