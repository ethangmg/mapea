import { useState, useEffect, useCallback } from 'react';
import type { SupportedLanguage } from '../i18n/types';

/**
 * Hook personalizado para manejar routing de secciones en SPA
 * Actualiza la URL sin recargar la página usando History API
 */
export const useSectionRouter = (
  currentLang: SupportedLanguage,
  initialSection: string = 'home'
) => {
  const [activeSection, setActiveSection] = useState<string>(initialSection);

  /**
   * Get section from URL: /home, /mission, /es/home -> home, mission, home
   */
  const getSectionFromUrl = useCallback((): string => {
    if (typeof window === 'undefined') return 'home';
    
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    // Only Spanish has a prefix: /es/home -> parts[1]; /home -> parts[0]
    if (parts[0] === 'es' && parts.length > 1) return parts[1];
    if (parts[0] && parts[0] !== 'en') return parts[0]; // inglés: /home, /mission
    return parts[1] || 'home'; // /en/home (legacy) -> home
  }, []);

  /**
   * Navegar a una sección (actualiza URL y hace scroll)
   */
  const navigateToSection = useCallback(
    (sectionId: string, smooth: boolean = true) => {
      // English: /home, /mission. Spanish: /es/home, /es/mission (without /en)
      const newUrl = currentLang === 'es' ? `/es/${sectionId}` : `/${sectionId}`;
      window.history.pushState({ section: sectionId }, '', newUrl);
      
      // Hacer scroll a la sección
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ 
          behavior: smooth ? 'smooth' : 'auto',
          block: 'start'
        });
      }
      
      // Actualizar estado
      setActiveSection(sectionId);
    },
    [currentLang]
  );

  /**
   * Manejar navegación del navegador (back/forward)
   */
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const section = event.state?.section || getSectionFromUrl();
      setActiveSection(section);
      
      // Hacer scroll a la sección sin animación (para que sea instantáneo)
      const sectionElement = document.getElementById(section);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getSectionFromUrl]);

  /**
   * Detectar sección visible con Intersection Observer
   */
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Activar cuando la sección está en el tercio superior
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          
          // Solo actualizar si es diferente
          setActiveSection((prev) => {
            if (prev !== sectionId) {
              const newUrl = currentLang === 'es' ? `/es/${sectionId}` : `/${sectionId}`;
              window.history.replaceState({ section: sectionId }, '', newUrl);
              return sectionId;
            }
            return prev;
          });
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observar todas las secciones
    const sections = ['home', 'mission', 'services', 'contact'];
    sections.forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [currentLang]);

  /**
   * Inicializar desde URL al cargar
   */
  useEffect(() => {
    const initialSection = getSectionFromUrl();
    setActiveSection(initialSection);
    
    // Si hay una sección específica en la URL, hacer scroll a ella
    if (initialSection !== 'home') {
      setTimeout(() => {
        const section = document.getElementById(initialSection);
        if (section) {
          section.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }, 100);
    }
  }, [getSectionFromUrl]);

  return {
    activeSection,
    navigateToSection,
    setActiveSection
  };
};
