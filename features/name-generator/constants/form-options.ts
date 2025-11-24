export type Language = typeof LANGUAGES[keyof typeof LANGUAGES];
export type NamingStyle = typeof NAMING_STYLES[keyof typeof NAMING_STYLES];
export type NameLength = typeof NAME_LENGTHS[keyof typeof NAME_LENGTHS];

// Language options
export const LANGUAGES = {
  ENGLISH: 'English',
  MALAY: 'Bahasa Melayu',
  JAPANESE: 'Japanese',
  MIX: 'Mix (Multilingual)',
};

// Naming style options
export const NAMING_STYLES = {
  TECHY: 'Techy / Futuristic',
  MINIMAL: 'Minimal / Clean',
  PLAYFUL: 'Playful / Creative',
  PROFESSIONAL: 'Professional / Corporate',
  AI: 'AI / Machine Learning',
  MYTHICAL: 'Mythical / Fantasy',
};

// Name length options
export const NAME_LENGTHS = {
  SHORT: 'Short (1 word)',
  MEDIUM: 'Medium (2 words)',
  LONG: 'Long (3+ words)',
};

