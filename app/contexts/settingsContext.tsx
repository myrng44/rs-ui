import React, { createContext, useContext, useEffect, useState } from 'react';

interface SettingsContextValue {
  fadeTransition: boolean;
  setFadeTransition: (v: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [fadeTransition, setFadeTransitionState] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('settings.fadeTransition');
      return raw ? JSON.parse(raw) as boolean : true;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('settings.fadeTransition', JSON.stringify(fadeTransition));
    } catch (e) {}

    if (fadeTransition) {
      document.documentElement.classList.add('ui-fade-enabled');
    } else {
      document.documentElement.classList.remove('ui-fade-enabled');
    }
  }, [fadeTransition]);

  const setFadeTransition = (v: boolean) => setFadeTransitionState(v);

  return (
    <SettingsContext.Provider value={{ fadeTransition, setFadeTransition }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
