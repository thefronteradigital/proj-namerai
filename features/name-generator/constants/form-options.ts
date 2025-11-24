export type Language = typeof LANGUAGES[keyof typeof LANGUAGES];
export type NamingStyle = typeof NAMING_STYLES[keyof typeof NAMING_STYLES];
export type NameLength = typeof NAME_LENGTHS[keyof typeof NAME_LENGTHS];

// Language options
export const LANGUAGES = {
  ENGLISH: 'English',
  MALAY: 'Bahasa Melayu',
  JAPANESE: 'Japanese',
  MIX: 'Mix',
};

// Naming style options
export const NAMING_STYLES = {
  TECHY: 'Techy',
  MINIMAL: 'Minimal',
  PLAYFUL: 'Playful',
  PROFESSIONAL: 'Professional',
  AI: 'AI-Powered',
  MYTHICAL: 'Mythical',
};

// Name length options
export const NAME_LENGTHS = {
  SHORT: 'Short',
  MEDIUM: 'Medium',
  LONG: 'Long',
};

