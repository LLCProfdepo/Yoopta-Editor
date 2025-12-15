/**
 * @yoopta/i18n - Internationalization support for Yoopta Editor
 *
 * This package provides comprehensive i18n capabilities for Yoopta Editor,
 * allowing developers to create multilingual editor experiences.
 *
 * @example
 * ```ts
 * import { createYooptaEditor } from '@yoopta/editor';
 * import { withTranslations, I18nYooEditorProvider } from '@yoopta/i18n';
 * import enTranslations from '@yoopta/i18n/locales/en.json';
 * import esTranslations from '@yoopta/i18n/locales/es.json';
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
 * ```
 *
 * @packageDocumentation
 */

// Core extension
export { withTranslations } from './extension/withTranslations';

// React provider and hooks
export { I18nYooEditorProvider, useYooptaI18n } from './provider/I18nYooEditorProvider';
export type { I18nYooEditorProviderProps } from './provider/I18nYooEditorProvider';

// TypeScript types
export type {
  TranslationDictionary,
  TranslationKey,
  RecursiveDotNotation,
  I18nConfig,
  I18nYooEditor,
  LanguageChangeEvent,
} from './types';

// Pre-built translation files (exported as JSON imports)
// These will be available after build for consumers to import
