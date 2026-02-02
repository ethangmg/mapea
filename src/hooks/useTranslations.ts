import { useState, useCallback } from 'react';
import type { SupportedLanguage } from '../i18n/types';
import { getLocalizedUrl } from '../utils/i18n-astro';

/**
 * Hook simple para manejar traducciones sin dependencias externas
 * Recibe las traducciones como props desde Astro
 */
export const useTranslations = (translations: Record<string, any>, currentLang: SupportedLanguage) => {
  const [language, setLanguage] = useState<SupportedLanguage>(currentLang);

  /**
   * Función de traducción
   */
  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return the key if not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  }, [translations]);

  /**
   * Change language: English without prefix (/home), Spanish with /es (/es/home).
   */
  const changeLanguage = useCallback((newLang: SupportedLanguage) => {
    setLanguage(newLang);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('mapea-language', newLang);
      const currentPath = window.location.pathname;
      const newPath = getLocalizedUrl(newLang, currentPath);
      window.location.href = newPath;
    }
  }, []);

  return {
    t,
    changeLanguage,
    currentLanguage: language,
    isEnglish: language === 'en',
    isSpanish: language === 'es',
  };
};
