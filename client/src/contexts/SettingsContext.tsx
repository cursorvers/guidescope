/**
 * Medical AI Prompt Builder - Extended Settings Context
 * Design: Medical Precision 2.0
 * 
 * Provides global access to extended settings across the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  type ExtendedSettings,
  type TemplateSettings,
  type SearchSettings,
  type OutputSettings,
  type UISettings,
  loadExtendedSettings,
  saveExtendedSettings,
  createDefaultExtendedSettings,
} from '@/lib/settings';

interface SettingsContextType {
  settings: ExtendedSettings;
  updateTemplateSettings: (updates: Partial<TemplateSettings>) => void;
  updateSearchSettings: (updates: Partial<SearchSettings>) => void;
  updateOutputSettings: (updates: Partial<OutputSettings>) => void;
  updateUISettings: (updates: Partial<UISettings>) => void;
  resetAllSettings: () => void;
  exportSettings: () => string;
  importSettings: (json: string) => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<ExtendedSettings>(() => loadExtendedSettings());

  // Save to localStorage whenever settings change
  useEffect(() => {
    saveExtendedSettings(settings);
  }, [settings]);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    const theme = settings.ui.theme;
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.ui.theme]);

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    const scale = settings.ui.fontSize === 'small' ? 0.9 : settings.ui.fontSize === 'large' ? 1.1 : 1;
    root.style.setProperty('--font-scale', String(scale));
  }, [settings.ui.fontSize]);

  const updateTemplateSettings = useCallback((updates: Partial<TemplateSettings>) => {
    setSettings(prev => ({
      ...prev,
      template: { ...prev.template, ...updates },
    }));
  }, []);

  const updateSearchSettings = useCallback((updates: Partial<SearchSettings>) => {
    setSettings(prev => ({
      ...prev,
      search: { ...prev.search, ...updates },
    }));
  }, []);

  const updateOutputSettings = useCallback((updates: Partial<OutputSettings>) => {
    setSettings(prev => ({
      ...prev,
      output: { ...prev.output, ...updates },
    }));
  }, []);

  const updateUISettings = useCallback((updates: Partial<UISettings>) => {
    setSettings(prev => ({
      ...prev,
      ui: { ...prev.ui, ...updates },
    }));
  }, []);

  const resetAllSettings = useCallback(() => {
    const defaults = createDefaultExtendedSettings();
    setSettings(defaults);
  }, []);

  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (parsed && typeof parsed === 'object' && 'template' in parsed) {
        setSettings(parsed as ExtendedSettings);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateTemplateSettings,
        updateSearchSettings,
        updateOutputSettings,
        updateUISettings,
        resetAllSettings,
        exportSettings,
        importSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useExtendedSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useExtendedSettings must be used within SettingsProvider');
  }
  return context;
}
