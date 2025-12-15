import type { YooEditor } from '@yoopta/editor';

/**
 * Translation dictionary structure
 * Organized hierarchically: editor -> plugins -> tools
 */
export type TranslationDictionary = {
  editor: {
    blockOptions: {
      delete: string;
      duplicate: string;
      turnInto: string;
      copyBlockLink: string;
      moveUp: string;
      moveDown: string;
    };
    placeholder: string;
    shortcuts: {
      bold: string;
      italic: string;
      underline: string;
      strike: string;
      code: string;
    };
  };
  plugins: Record<
    string,
    {
      display: {
        title: string;
        description: string;
      };
      placeholders?: Record<string, string>;
      labels?: Record<string, string>;
    }
  >;
  tools: {
    toolbar: {
      bold: string;
      italic: string;
      underline: string;
      strike: string;
      code: string;
      highlight: string;
      highlightColor: {
        text: string;
      };
    };
    linkTool: {
      placeholder: string;
      edit: string;
      unlink: string;
      openInNewTab: string;
    };
    actionMenu: {
      search: string;
      noResults: string;
    };
  };
};

/**
 * Recursive type to generate dot-notation paths from nested objects
 * Examples: "editor.blockOptions.delete", "plugins.Paragraph.display.title"
 */
export type RecursiveDotNotation<T, P extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? RecursiveDotNotation<T[K], `${P}${K}.`>
          : `${P}${K}`
        : never;
    }[keyof T]
  : never;

/**
 * Valid translation key paths (dot-notation)
 */
export type TranslationKey = RecursiveDotNotation<TranslationDictionary>;

/**
 * Configuration for initializing i18n
 */
export interface I18nConfig {
  /** Default fallback language (e.g., 'en') */
  defaultLanguage: string;
  /** Initial active language (e.g., 'es') */
  language: string;
  /** Translation dictionaries for each language */
  translations: Record<string, Partial<TranslationDictionary>>;
}

/**
 * Extended editor type with i18n capabilities
 */
export type I18nYooEditor = YooEditor & {
  /** Current active language code */
  language: string;
  /** Array of available language codes */
  languages: string[];
  /** Default fallback language */
  defaultLanguage: string;
  /** All translation dictionaries */
  translations: Record<string, Partial<TranslationDictionary>>;
  /**
   * Change the active language
   * Emits 'language-change' event
   */
  setLanguage: (lang: string) => void;
  /**
   * Get translated text by key
   * Falls back: current lang -> default lang -> core defaults -> key
   */
  getLabelText: (key: TranslationKey | string) => string;
};

/**
 * Event payload for language change
 */
export interface LanguageChangeEvent {
  language: string;
  previousLanguage?: string;
}

/**
 * Extend YooptaEventsMap to include language-change event
 * This allows TypeScript to recognize 'language-change' as a valid event
 */
declare module '@yoopta/editor' {
  interface YooptaEventsMap {
    'language-change': LanguageChangeEvent;
  }
}
