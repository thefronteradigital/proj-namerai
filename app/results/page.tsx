import type { FormState } from '@/features/name-generator/services/gemini-service';
import { LANGUAGES, NAMING_STYLES, NAME_LENGTHS, type Language, type NamingStyle, type NameLength } from '@/features/name-generator/constants/form-options';
import { Results } from '@/features/name-generator/components/results';
import { generateNamesAction } from '@/features/name-generator/actions/generate-names';
import { redirect } from 'next/navigation';

interface ResultsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  
  // Guard: Validate required parameters
  if (!params.language && !params.style && !params.length) {
    redirect('/');
  }

  // Parse URL Params with defaults
  const keywords = (params.keywords as string) || '';
  const language = (params.language as Language) || LANGUAGES.ENGLISH;
  const style = (params.style as NamingStyle) || NAMING_STYLES.TECHY;
  const length = (params.length as NameLength) || NAME_LENGTHS.SHORT;
  const checkDomains = params.checkDomains === 'true';

  const formState: FormState = {
    keywords,
    language,
    style,
    length,
    checkDomains,
  };

  // Call server action - errors are caught by error.tsx boundary
  const { results, error, rateLimitWarning } = await generateNamesAction(formState);

  // Happy path: render results
  return (
    <Results
      keywords={keywords}
      style={style}
      length={length}
      results={results}
      error={error}
      rateLimitWarning={rateLimitWarning}
    />
  );
}
