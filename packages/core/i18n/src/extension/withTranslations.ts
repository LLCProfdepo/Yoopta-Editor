import type { YooEditor } from '@yoopta/editor';
import type { I18nConfig, I18nYooEditor, TranslationKey, LanguageChangeEvent } from '../types';

/**
 * Higher-order function that extends a YooEditor with i18n capabilities
 *
 * @param editor - Base Yoopta editor instance
 * @param config - i18n configuration (languages, translations, defaults)
 * @returns Extended editor with translation methods and properties
 *
 * @example
 * ```ts
 * import { createYooptaEditor } from '@yoopta/editor';
 * import { withTranslations } from '@yoopta/i18n';
 * import enTranslations from './locales/en.json';
 * import esTranslations from './locales/es.json';
 *
 * const baseEditor = createYooptaEditor();
 * const editor = withTranslations(baseEditor, {
 *   defaultLanguage: 'en',
 *   language: 'es',
 *   translations: {
 *     en: enTranslations,
 *     es: esTranslations,
 *   },
 * });
 *
 * // Use translations
 * editor.getLabelText('editor.blockOptions.delete'); // "Eliminar" (Spanish)
 * editor.setLanguage('en'); // Switch to English
 * ```
 */
export function withTranslations(editor: YooEditor, config: I18nConfig): I18nYooEditor {
  const { defaultLanguage, language, translations } = config;

  const i18nEditor = editor as I18nYooEditor;

  // Store translation configuration on the editor instance
  i18nEditor.language = language;
  i18nEditor.languages = Object.keys(translations);
  i18nEditor.defaultLanguage = defaultLanguage;
  i18nEditor.translations = translations;

  /**
   * Get translated text by dot-notation key path
   * Implements cascading fallback strategy:
   * 1. Try current language translation
   * 2. Fall back to default language translation
   * 3. Fall back to core editor's default labels (if available)
   * 4. Return the key itself as final fallback
   */
  i18nEditor.getLabelText = (key: TranslationKey | string): string => {
    if (!key) return '';

    const keyParts = key.split('.');

    // Try current language first
    let value = getNestedValue(translations[i18nEditor.language], keyParts);

    // Fallback to default language
    if (value === undefined && i18nEditor.language !== defaultLanguage) {
      value = getNestedValue(translations[defaultLanguage], keyParts);
    }

    // Fallback to core editor's default labels (if the base editor has them)
    if (value === undefined && 'getCoreLabelText' in editor) {
      const coreMethod = (editor as any).getCoreLabelText;
      if (typeof coreMethod === 'function') {
        value = coreMethod(key);
      }
    }

    // Final fallback to the key itself (helps developers identify missing translations)
    return value !== undefined ? value : key;
  };

  /**
   * Change the active language dynamically
   * Emits 'language-change' event to trigger re-renders in React components
   */
  i18nEditor.setLanguage = (newLang: string) => {
    if (!translations[newLang]) {
      console.warn(`[Yoopta i18n] Language "${newLang}" not found in translations. Available: ${i18nEditor.languages.join(', ')}`);
      return;
    }

    const previousLanguage = i18nEditor.language;
    i18nEditor.language = newLang;

    // Emit event for React components to re-render
    const eventPayload: LanguageChangeEvent = {
      language: newLang,
      previousLanguage,
    };

    editor.emit('language-change', eventPayload);

    console.log(`[Yoopta i18n] Language changed from "${previousLanguage}" to "${newLang}"`);
  };

  return i18nEditor;
}

/**
 * Helper function to traverse nested objects by dot-notation path
 * @param obj - Object to traverse
 * @param keys - Array of keys representing the path
 * @returns Value at the path, or undefined if not found
 *
 * @example
 * ```ts
 * const obj = { editor: { blockOptions: { delete: 'Delete' } } };
 * getNestedValue(obj, ['editor', 'blockOptions', 'delete']); // 'Delete'
 * getNestedValue(obj, ['editor', 'missing']); // undefined
 * ```
 */
function getNestedValue(obj: any, keys: string[]): string | undefined {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }

  return keys.reduce((accumulator, key) => {
    if (accumulator && typeof accumulator === 'object' && key in accumulator) {
      return accumulator[key];
    }
    return undefined;
  }, obj);
}
