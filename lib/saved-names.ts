import type { GeneratedName } from "@/features/name-generator/services/name-generator";

const STORAGE_KEY = "namerai.savedNames";

const getSavedKey = (item: GeneratedName) =>
  `${item.name}::${item.languageOrigin}`;

const isGeneratedName = (item: unknown): item is GeneratedName => {
  if (!item || typeof item !== "object") return false;
  const candidate = item as GeneratedName;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.meaning === "string" &&
    typeof candidate.languageOrigin === "string"
  );
};

export const getSavedNames = (): GeneratedName[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isGeneratedName);
  } catch (error) {
    console.error("Failed to load saved names:", error);
    return [];
  }
};

export const setSavedNames = (names: GeneratedName[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
  } catch (error) {
    console.error("Failed to save names:", error);
  }
};

export const isNameSaved = (item: GeneratedName, saved: GeneratedName[]) =>
  saved.some((savedItem) => getSavedKey(savedItem) === getSavedKey(item));

export const toggleSavedName = (
  item: GeneratedName,
  saved: GeneratedName[]
) => {
  const exists = isNameSaved(item, saved);
  const nextSaved = exists
    ? saved.filter((savedItem) => getSavedKey(savedItem) !== getSavedKey(item))
    : [...saved, item];
  setSavedNames(nextSaved);
  return nextSaved;
};
