import { Hero } from '@/components/hero';
import { GeneratorForm } from '@/features/name-generator/components/generator-form';

export default function Home() {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 flex flex-col justify-center items-center pb-32 pt-20">
      <div className="w-full max-w-4xl flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <Hero />

        <div className="w-full mt-16">
          <GeneratorForm />
        </div>
      </div>
    </div>
  );
}
