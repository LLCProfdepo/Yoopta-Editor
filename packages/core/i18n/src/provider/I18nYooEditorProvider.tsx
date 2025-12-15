import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { I18nYooEditor, LanguageChangeEvent } from '../types';

/**
 * Context value provided by I18nYooEditorProvider
 */
interface I18nContextValue {
  /** Current active language code */
  language: string;
  /** Function to change the active language */
  setLanguage: (lang: string) => void;
  /** Extended editor instance with i18n capabilities */
  editor: I18nYooEditor;
  /** Force re-render key (increments on language change) */
  renderKey: number;
}

/**
 * React Context for i18n state
 */
const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Props for I18nYooEditorProvider
 */
export interface I18nYooEditorProviderProps {
  /** Editor instance extended with withTranslations() */
  editor: I18nYooEditor;
  /** React children */
  children: React.ReactNode;
}

/**
 * React Context Provider for Yoopta i18n
 *
 * Manages language state and ensures components re-render when language changes.
 * Wrap your editor component tree with this provider to enable i18n support.
 *
 * @example
 * ```tsx
 * import { createYooptaEditor, YooptaEditor } from '@yoopta/editor';
 * import { withTranslations, I18nYooEditorProvider } from '@yoopta/i18n';
 * import enTranslations from './locales/en.json';
 * import esTranslations from './locales/es.json';
 *
 * const baseEditor = createYooptaEditor();
 * const editor = withTranslations(baseEditor, {
 *   defaultLanguage: 'en',
 *   language: 'es',
 *   translations: { en: enTranslations, es: esTranslations },
 * });
 *
 * function App() {
 *   return (
 *     <I18nYooEditorProvider editor={editor}>
 *       <YooptaEditor editor={editor} {...props} />
 *     </I18nYooEditorProvider>
 *   );
 * }
 * ```
 */
export function I18nYooEditorProvider({ editor, children }: I18nYooEditorProviderProps) {
  const [language, setLanguageState] = useState(editor.language);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    /**
     * Handler for 'language-change' event from editor
     * Updates React state to trigger re-renders across all components
     */
    const handleLanguageChange = ({ language: newLang }: LanguageChangeEvent) => {
      setLanguageState(newLang);
      setRenderKey((prev) => prev + 1); // Force re-render of all child components
    };

    editor.on('language-change', handleLanguageChange);

    return () => {
      editor.off('language-change', handleLanguageChange);
    };
  }, [editor]);

  /**
   * Wrapper around editor.setLanguage() to update React state
   */
  const setLanguage = useCallback(
    (lang: string) => {
      editor.setLanguage(lang);
    },
    [editor]
  );

  const contextValue: I18nContextValue = {
    language,
    setLanguage,
    editor,
    renderKey,
  };

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

/**
 * Hook to access i18n state and methods in React components
 *
 * @throws Error if used outside of I18nYooEditorProvider
 * @returns I18n context with language, setLanguage, editor, and renderKey
 *
 * @example
 * ```tsx
 * function LanguageSwitcher() {
 *   const { language, setLanguage, editor } = useYooptaI18n();
 *
 *   return (
 *     <select value={language} onChange={(e) => setLanguage(e.target.value)}>
 *       {editor.languages.map((lang) => (
 *         <option key={lang} value={lang}>{lang.toUpperCase()}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useYooptaI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useYooptaI18n must be used within I18nYooEditorProvider');
  }

  return context;
}
