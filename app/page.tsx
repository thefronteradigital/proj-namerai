import { Hero } from '@/components/hero';
import { GeneratorForm } from '@/features/name-generator/components/generator-form';

export default function Home() {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 flex flex-col justify-center items-center pb-32 pt-20">
      {/* Overlay to reduce background distraction */}
      <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px] pointer-events-none -z-10" />
      
      <div className="w-full max-w-4xl flex flex-col items-center animate-in fade-in zoom-in duration-500 relative z-10">
        <Hero />

        <div className="w-full mt-12">
          <GeneratorForm />
        </div>
      </div>
    </div>
  );
}
