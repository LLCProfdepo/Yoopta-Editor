# Complete Usage Examples for @yoopta/i18n

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [React Integration](#react-integration)
3. [Language Switcher](#language-switcher)
4. [Angular Integration](#angular-integration-for-profdepo-telegram-client)
5. [Custom Translations](#custom-translations)
6. [Advanced Usage](#advanced-usage)

---

## Basic Setup

### Step 1: Install Dependencies

```bash
npm install @yoopta/editor @yoopta/i18n
# Also install any plugins you need
npm install @yoopta/paragraph @yoopta/headings @yoopta/marks
```

### Step 2: Create Editor with i18n

```typescript
import { createYooptaEditor } from '@yoopta/editor';
import { withTranslations } from '@yoopta/i18n';
import enTranslations from '@yoopta/i18n/locales/en.json';
import esTranslations from '@yoopta/i18n/locales/es.json';

// 1. Create base editor
const baseEditor = createYooptaEditor();

// 2. Extend with i18n
const editor = withTranslations(baseEditor, {
  defaultLanguage: 'en',      // Fallback language
  language: 'es',             // Initial language
  translations: {
    en: enTranslations,
    es: esTranslations,
  },
});

// 3. Use the editor
console.log(editor.getLabelText('editor.blockOptions.delete')); // "Eliminar"
```

---

## React Integration

### Complete React Component

```tsx
import React, { useMemo, useState } from 'react';
import { createYooptaEditor, YooptaEditor } from '@yoopta/editor';
import { withTranslations, I18nYooEditorProvider, useYooptaI18n } from '@yoopta/i18n';
import Paragraph from '@yoopta/paragraph';
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings';
import { Bold, Italic, Underline } from '@yoopta/marks';
import enTranslations from '@yoopta/i18n/locales/en.json';
import esTranslations from '@yoopta/i18n/locales/es.json';
import ruTranslations from '@yoopta/i18n/locales/ru.json';

const plugins = [
  Paragraph,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
];

const marks = [Bold, Italic, Underline];

function EditorWithLanguageSwitcher() {
  const baseEditor = useMemo(() => createYooptaEditor(), []);

  const editor = useMemo(
    () =>
      withTranslations(baseEditor, {
        defaultLanguage: 'en',
        language: 'es',
        translations: {
          en: enTranslations,
          es: esTranslations,
          ru: ruTranslations,
        },
      }),
    [baseEditor]
  );

  const [value, setValue] = useState({});

  return (
    <I18nYooEditorProvider editor={editor}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <LanguageSwitcher />
        <YooptaEditor
          editor={editor}
          plugins={plugins}
          marks={marks}
          value={value}
          onChange={setValue}
          placeholder="Start writing..."
        />
      </div>
    </I18nYooEditorProvider>
  );
}

function LanguageSwitcher() {
  const { language, setLanguage, editor } = useYooptaI18n();

  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Español',
    ru: 'Русский',
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ marginRight: '10px', fontWeight: 'bold' }}>
        Language:
      </label>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{ padding: '5px 10px', fontSize: '14px' }}
      >
        {editor.languages.map((lang) => (
          <option key={lang} value={lang}>
            {languageNames[lang] || lang.toUpperCase()}
          </option>
        ))}
      </select>
      <span style={{ marginLeft: '10px', color: '#666' }}>
        Current: {languageNames[language]}
      </span>
    </div>
  );
}

export default EditorWithLanguageSwitcher;
```

---

## Language Switcher Variations

### Simple Dropdown

```tsx
function SimpleLanguageSwitcher() {
  const { language, setLanguage } = useYooptaI18n();

  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="ru">Русский</option>
    </select>
  );
}
```

### Button Group

```tsx
function ButtonLanguageSwitcher() {
  const { language, setLanguage } = useYooptaI18n();

  const languages = [
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'es', label: 'ES', flag: '🇪🇸' },
    { code: 'ru', label: 'RU', flag: '🇷🇺' },
  ];

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {languages.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          style={{
            padding: '8px 16px',
            backgroundColor: language === code ? '#007bff' : '#f0f0f0',
            color: language === code ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {flag} {label}
        </button>
      ))}
    </div>
  );
}
```

---

## Angular Integration (for profdepo-telegram-client)

### Angular Service Wrapper

```typescript
// yoopta-i18n.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { I18nYooEditor } from '@yoopta/i18n';

@Injectable({
  providedIn: 'root'
})
export class YooptaI18nService {
  private languageSubject = new BehaviorSubject<string>('en');
  public language$ = this.languageSubject.asObservable();

  private editor: I18nYooEditor | null = null;

  setEditor(editor: I18nYooEditor) {
    this.editor = editor;
    this.languageSubject.next(editor.language);

    // Listen to editor language changes
    editor.on('language-change', ({ language }) => {
      this.languageSubject.next(language);
    });
  }

  setLanguage(lang: string) {
    if (this.editor) {
      this.editor.setLanguage(lang);
    }
  }

  getLanguage(): string {
    return this.editor?.language || 'en';
  }

  getAvailableLanguages(): string[] {
    return this.editor?.languages || [];
  }
}
```

### Angular Component Integration

```typescript
// yoopta-editor-wrapper.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { createYooptaEditor } from '@yoopta/editor';
import { withTranslations } from '@yoopta/i18n';
import enTranslations from '@yoopta/i18n/locales/en.json';
import esTranslations from '@yoopta/i18n/locales/es.json';
import ruTranslations from '@yoopta/i18n/locales/ru.json';
import { YooptaI18nService } from './yoopta-i18n.service';

@Component({
  selector: 'app-yoopta-editor-wrapper',
  template: `
    <div class="editor-container">
      <div class="language-switcher">
        <label>Language:</label>
        <select [value]="currentLanguage" (change)="onLanguageChange($event)">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="ru">Русский</option>
        </select>
      </div>

      <!-- Your Yoopta Editor React component wrapped here -->
      <app-yoopta-editor [editor]="editor"></app-yoopta-editor>
    </div>
  `
})
export class YooptaEditorWrapperComponent implements OnInit, OnDestroy {
  editor: any;
  currentLanguage = 'en';

  constructor(private i18nService: YooptaI18nService) {}

  ngOnInit() {
    // Create base editor
    const baseEditor = createYooptaEditor();

    // Extend with i18n
    this.editor = withTranslations(baseEditor, {
      defaultLanguage: 'en',
      language: this.currentLanguage,
      translations: {
        en: enTranslations,
        es: esTranslations,
        ru: ruTranslations,
      },
    });

    // Register with service
    this.i18nService.setEditor(this.editor);

    // Subscribe to language changes
    this.i18nService.language$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  onLanguageChange(event: any) {
    this.i18nService.setLanguage(event.target.value);
  }

  ngOnDestroy() {
    // Cleanup if needed
  }
}
```

---

## Custom Translations

### Adding a New Language (German)

```json
// locales/de.json
{
  "editor": {
    "blockOptions": {
      "delete": "Löschen",
      "duplicate": "Duplizieren",
      "turnInto": "Umwandeln in",
      "copyBlockLink": "Blocklink kopieren",
      "moveUp": "Nach oben",
      "moveDown": "Nach unten"
    },
    "placeholder": "Geben Sie '/' für Befehle ein"
  },
  "plugins": {
    "Paragraph": {
      "display": {
        "title": "Absatz",
        "description": "Beginnen Sie einfach mit dem Schreiben"
      }
    }
  }
}
```

```typescript
import deTranslations from './locales/de.json';

const editor = withTranslations(baseEditor, {
  defaultLanguage: 'en',
  language: 'de',
  translations: {
    en: enTranslations,
    de: deTranslations,
  },
});
```

### Partial Translation Override

```typescript
// Only override specific keys
const customTranslations = {
  en: {
    ...enTranslations,
    editor: {
      ...enTranslations.editor,
      placeholder: "Custom placeholder text",
    },
  },
};

const editor = withTranslations(baseEditor, {
  defaultLanguage: 'en',
  language: 'en',
  translations: customTranslations,
});
```

---

## Advanced Usage

### Detecting User's Browser Language

```typescript
function getUserLanguage(): string {
  const browserLang = navigator.language.split('-')[0]; // 'en-US' -> 'en'
  const supportedLanguages = ['en', 'es', 'ru'];

  return supportedLanguages.includes(browserLang) ? browserLang : 'en';
}

const editor = withTranslations(baseEditor, {
  defaultLanguage: 'en',
  language: getUserLanguage(), // Auto-detect
  translations: {
    en: enTranslations,
    es: esTranslations,
    ru: ruTranslations,
  },
});
```

### Persisting Language Preference

```typescript
function getStoredLanguage(): string {
  return localStorage.getItem('yoopta-language') || 'en';
}

function saveLanguagePreference(lang: string) {
  localStorage.setItem('yoopta-language', lang);
}

// In your component
const [currentLang, setCurrentLang] = useState(getStoredLanguage());

const handleLanguageChange = (lang: string) => {
  setLanguage(lang);
  saveLanguagePreference(lang);
  setCurrentLang(lang);
};
```

### Dynamic Translation Loading

```typescript
async function loadTranslations(lang: string) {
  const translations = await import(`./locales/${lang}.json`);
  return translations.default;
}

async function changeLanguageDynamic(editor: I18nYooEditor, lang: string) {
  if (!editor.translations[lang]) {
    const newTranslations = await loadTranslations(lang);
    editor.translations[lang] = newTranslations;
  }
  editor.setLanguage(lang);
}
```

### Using with NgRx (Angular State Management)

```typescript
// language.actions.ts
export const changeLanguage = createAction(
  '[Editor] Change Language',
  props<{ language: string }>()
);

// language.effects.ts
@Injectable()
export class LanguageEffects {
  changeLanguage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changeLanguage),
      tap(({ language }) => {
        this.i18nService.setLanguage(language);
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private i18nService: YooptaI18nService
  ) {}
}
```

---

## Testing i18n

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { createYooptaEditor } from '@yoopta/editor';
import { withTranslations } from '@yoopta/i18n';
import enTranslations from '@yoopta/i18n/locales/en.json';
import esTranslations from '@yoopta/i18n/locales/es.json';

describe('Yoopta i18n', () => {
  it('should return translated text for current language', () => {
    const editor = withTranslations(createYooptaEditor(), {
      defaultLanguage: 'en',
      language: 'es',
      translations: { en: enTranslations, es: esTranslations },
    });

    expect(editor.getLabelText('editor.blockOptions.delete')).toBe('Eliminar');
  });

  it('should fall back to default language for missing keys', () => {
    const partialSpanish = {
      editor: { blockOptions: { delete: 'Eliminar' } },
    };

    const editor = withTranslations(createYooptaEditor(), {
      defaultLanguage: 'en',
      language: 'es',
      translations: { en: enTranslations, es: partialSpanish },
    });

    // This key exists in English but not in our partial Spanish
    expect(editor.getLabelText('editor.placeholder')).toBe("Type '/' for commands");
  });

  it('should change language dynamically', () => {
    const editor = withTranslations(createYooptaEditor(), {
      defaultLanguage: 'en',
      language: 'en',
      translations: { en: enTranslations, es: esTranslations },
    });

    expect(editor.language).toBe('en');
    expect(editor.getLabelText('editor.blockOptions.delete')).toBe('Delete');

    editor.setLanguage('es');

    expect(editor.language).toBe('es');
    expect(editor.getLabelText('editor.blockOptions.delete')).toBe('Eliminar');
  });
});
```

---

## Troubleshooting

### Issue: Components don't re-render when language changes

**Solution**: Make sure you're using the `I18nYooEditorProvider`:

```tsx
// ❌ Wrong
<YooptaEditor editor={editor} />

// ✅ Correct
<I18nYooEditorProvider editor={editor}>
  <YooptaEditor editor={editor} />
</I18nYooEditorProvider>
```

### Issue: TypeScript errors for translation keys

**Solution**: Import types explicitly:

```typescript
import type { TranslationKey } from '@yoopta/i18n';

const key: TranslationKey = 'editor.blockOptions.delete'; // Type-safe
```

### Issue: Missing translations show key names

**Solution**: This is intentional! It helps identify missing translations. Add the missing keys to your translation file.

---

## Best Practices

1. ✅ **Always provide a default language** for fallbacks
2. ✅ **Use TypeScript** for type-safe translation keys
3. ✅ **Test with multiple languages** to catch layout issues
4. ✅ **Keep translations consistent** across all language files
5. ✅ **Use the React provider** to ensure re-renders work correctly
6. ✅ **Persist user language preference** in localStorage or cookies
7. ✅ **Auto-detect browser language** for better UX

---

## Resources

- [Main README](./README.md)
- [Yoopta Editor Documentation](https://github.com/LLCProfdepo/Yoopta-Editor)
- [TypeScript Types Reference](./src/types/index.ts)

## Support

For issues or questions, please open an issue on GitHub:
https://github.com/LLCProfdepo/Yoopta-Editor/issues
