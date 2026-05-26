import { useState, useEffect } from 'react';
import { translations, SupportedLanguage, TranslationSchema } from './translations';
import { storage } from './storage';

export const useTranslation = () => {
  const [lang, setLang] = useState<SupportedLanguage>('bn');

  useEffect(() => {
    const init = async () => {
      const user = await storage.getCurrentUser();
      if (user?.preferences?.lang) {
        setLang(user.preferences.lang as SupportedLanguage);
      } else {
        const saved = localStorage.getItem('tsolver_lang') as SupportedLanguage;
        if (saved) setLang(saved);
      }
    };
    init();

    // Listen for manual language changes (e.g. from profile)
    const handleLangChange = () => {
      const saved = localStorage.getItem('tsolver_lang') as SupportedLanguage;
      if (saved) setLang(saved);
    };
    window.addEventListener('storage', handleLangChange);
    return () => window.removeEventListener('storage', handleLangChange);
  }, []);

  const t = translations[lang] || translations.en;

  return { t, lang };
};
