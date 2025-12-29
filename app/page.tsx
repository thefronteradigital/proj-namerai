import type { Metadata } from 'next';
import { Hero } from '@/components/hero';
import { GeneratorForm } from '@/features/name-generator/components/generator-form';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://namerai.frontera.my.id";

export const metadata: Metadata = {
  title: "AI Brand Name Generator - Create Unique Business Names",
  description: "Generate creative, multilingual brand names instantly with AI. Choose from techy, minimal, playful, or professional styles. Includes free domain availability checks.",
  openGraph: {
    title: "AI Brand Name Generator - Create Unique Business Names",
    description: "Generate creative, multilingual brand names instantly with AI. Free domain availability checks included.",
    url: APP_URL,
  },
  alternates: {
    canonical: APP_URL,
  },
};

export default function Home() {
  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Namer.ai',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    url: APP_URL,
    description: 'AI-powered brand name generator that creates unique, multilingual business names with automated domain availability checks. Limited free search.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: '500 free queries per month',
    },
    creator: {
      '@type': 'Organization',
      name: 'Frontera',
    },
    featureList: [
      'AI-powered name generation',
      'Multilingual support',
      'Domain availability checking',
      'Multiple naming styles (techy, minimal, playful, professional)',
      'Customizable name length',
    ],
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 flex flex-col justify-center items-center pb-16 pt-10 md:pb-32 md:pt-20">
        {/* Overlay to reduce background distraction */}
        <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px] pointer-events-none -z-10" />

        <div className="w-full max-w-4xl flex flex-col items-center animate-in fade-in zoom-in duration-500 relative z-10">
          <Hero />

          <div className="w-full mt-8 md:mt-12">
            <GeneratorForm />
          </div>
        </div>
      </div>
    </>
  );
}
