# @yoopta/i18n

Internationalization (i18n) support for [Yoopta Editor](https://github.com/LLCProfdepo/Yoopta-Editor).

## Features

- 🌍 **Multi-language support** - Switch between languages dynamically
- 🎯 **Type-safe translations** - Full TypeScript support with autocomplete
- ⚡ **Minimal overhead** - Lightweight extension with zero dependencies
- 🔄 **Automatic re-rendering** - React components update when language changes
- 📦 **Pre-built translations** - English, Spanish, and Russian included
- 🎨 **Customizable** - Override any translation or add your own languages

## Installation

```bash
npm install @yoopta/i18n @yoopta/editor
# or
yarn add @yoopta/i18n @yoopta/editor
```

## Quick Start

### 1. Extend your editor with i18n

```typescript
import { createYooptaEditor } from '@yoopta/editor';
import { withTranslations } from '@yoopta/i18n';
import enTranslations from '@yoopta/i18n/locales/en.json';
import esTranslations from '@yoopta/i18n/locales/es.json';

const baseEditor = createYooptaEditor();

const editor = withTranslations(baseEditor, {
  defaultLanguage: 'en',
  language: 'es', // Start with Spanish
  translations: {
    en: enTranslations,
    es: esTranslations,
  },
});
```

### 2. Wrap your editor with the i18n provider

```tsx
import { YooptaEditor } from '@yoopta/editor';
import { I18nYooEditorProvider } from '@yoopta/i18n';

function App() {
  return (
    <I18nYooEditorProvider editor={editor}>
      <YooptaEditor editor={editor} plugins={plugins} />
    </I18nYooEditorProvider>
  );
}
```

### 3. Add a language switcher (optional)

```tsx
import { useYooptaI18n } from '@yoopta/i18n';

function LanguageSwitcher() {
  const { language, setLanguage, editor } = useYooptaI18n();

  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
      {editor.languages.map((lang) => (
        <option key={lang} value={lang}>
          {lang.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
```

## Built-in Languages

The package includes pre-built translations for:

- 🇬🇧 **English** (`en`) - Default
- 🇪🇸 **Spanish** (`es`)
- 🇷🇺 **Russian** (`ru`)

Import them directly:

```typescript
import enTranslations from '@yoopta/i18n/locales/en.json';
import esTranslations from '@yoopta/i18n/locales/es.json';
import ruTranslations from '@yoopta/i18n/locales/ru.json';
```

## API Reference

### `withTranslations(editor, config)`

Extends a Yoopta editor with i18n capabilities.

**Parameters:**
- `editor: YooEditor` - Base editor instance
- `config: I18nConfig` - Configuration object
  - `defaultLanguage: string` - Fallback language (e.g., 'en')
  - `language: string` - Initial active language (e.g., 'es')
  - `translations: Record<string, Partial<TranslationDictionary>>` - Translation dictionaries

**Returns:** `I18nYooEditor` - Extended editor with i18n methods

**Example:**
```typescript
const editor = withTranslations(createYooptaEditor(), {
  defaultLanguage: 'en',
  language: 'es',
  translations: { en: enTranslations, es: esTranslations },
});
```

### `I18nYooEditorProvider`

React Context Provider for managing i18n state.

**Props:**
- `editor: I18nYooEditor` - Editor extended with `withTranslations()`
- `children: React.ReactNode` - React children

**Example:**
```tsx
<I18nYooEditorProvider editor={editor}>
  <YooptaEditor editor={editor} {...props} />
</I18nYooEditorProvider>
```

### `useYooptaI18n()`

React hook to access i18n state and methods.

**Returns:**
- `language: string` - Current active language
- `setLanguage: (lang: string) => void` - Function to change language
- `editor: I18nYooEditor` - Extended editor instance
- `renderKey: number` - Re-render trigger (increments on language change)

**Example:**
```tsx
function MyComponent() {
  const { language, setLanguage } = useYooptaI18n();

  return (
    <button onClick={() => setLanguage('es')}>
      Current: {language}
    </button>
  );
}
```

### Editor Methods

Extended editors gain these methods:

#### `editor.getLabelText(key: string): string`

Get translated text by dot-notation key.

**Examples:**
```typescript
editor.getLabelText('editor.blockOptions.delete');        // "Delete" or "Eliminar"
editor.getLabelText('plugins.Paragraph.display.title');   // "Paragraph" or "Párrafo"
editor.getLabelText('tools.toolbar.bold');                // "Bold" or "Negrita"
```

**Fallback Strategy:**
1. Try current language translation
2. Fall back to default language translation
3. Fall back to core editor defaults
4. Return the key itself (for debugging)

#### `editor.setLanguage(lang: string): void`

Change the active language dynamically.

**Example:**
```typescript
editor.setLanguage('es'); // Switch to Spanish
```

Emits a `'language-change'` event that triggers re-renders in React components.

## Custom Translations

### Adding a New Language

Create your own translation file following the structure:

```json
{
  "editor": {
    "blockOptions": {
      "delete": "Supprimer",
      "duplicate": "Dupliquer",
      ...
    },
    "placeholder": "Tapez '/' pour les commandes"
  },
  "plugins": {
    "Paragraph": {
      "display": {
        "title": "Paragraphe",
        "description": "Commencez simplement à écrire du texte"
      }
    }
  },
  "tools": {
    "toolbar": {
      "bold": "Gras",
      "italic": "Italique",
      ...
    }
  }
}
```

Then import and use it:

```typescript
import frTranslations from './locales/fr.json';

const editor = withTranslations(baseEditor, {
  defaultLanguage: 'en',
  language: 'fr',
  translations: {
    en: enTranslations,
    fr: frTranslations,
  },
});
```

### Partial Translations

You don't need to translate everything! Missing keys fall back to the default language:

```json
{
  "editor": {
    "blockOptions": {
      "delete": "Supprimer"
      // Other keys will use default language
    }
  }
}
```

## Translation Key Structure

Translations are organized hierarchically:

```
editor.*                                 # Core editor UI
├── blockOptions.*                      # Block context menu
│   ├── delete                          # "Delete"
│   ├── duplicate                       # "Duplicate"
│   └── ...
├── placeholder                         # Editor placeholder text
└── shortcuts.*                         # Keyboard shortcuts

plugins.*                               # Plugin-specific translations
├── Paragraph.*
│   └── display.*
│       ├── title                       # "Paragraph"
│       └── description                 # "Just start writing..."
└── ...

tools.*                                 # Tool-specific translations
├── toolbar.*                           # Toolbar buttons
├── linkTool.*                          # Link tool UI
└── actionMenu.*                        # Action menu search
```

## TypeScript Support

Full type safety with autocomplete:

```typescript
import type { TranslationKey, TranslationDictionary } from '@yoopta/i18n';

// Autocomplete for all valid keys
const key: TranslationKey = 'editor.blockOptions.delete'; // ✅
const invalid: TranslationKey = 'editor.invalid.key';     // ❌ Type error
```

## Events

The editor emits a `'language-change'` event when the language changes:

```typescript
editor.on('language-change', ({ language, previousLanguage }) => {
  console.log(`Language changed from ${previousLanguage} to ${language}`);
});
```

## Best Practices

1. **Always provide a default language** - Ensures fallback for missing translations
2. **Use the React provider** - Ensures components re-render on language change
3. **Keep translation keys consistent** - Follow the hierarchical structure
4. **Test with multiple languages** - Verify UI layout works with longer text
5. **Use TypeScript** - Leverage type safety for translation keys

## Examples

### Complete Example with Language Switcher

```tsx
import { createYooptaEditor, YooptaEditor } from '@yoopta/editor';
import { withTranslations, I18nYooEditorProvider, useYooptaI18n } from '@yoopta/i18n';
import Paragraph from '@yoopta/paragraph';
import enTranslations from '@yoopta/i18n/locales/en.json';
import esTranslations from '@yoopta/i18n/locales/es.json';
import ruTranslations from '@yoopta/i18n/locales/ru.json';

const plugins = [Paragraph];

function LanguageSwitcher() {
  const { language, setLanguage, editor } = useYooptaI18n();

  return (
    <div>
      <label>Language: </label>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        {editor.languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

function App() {
  const baseEditor = createYooptaEditor();

  const editor = withTranslations(baseEditor, {
    defaultLanguage: 'en',
    language: 'es',
    translations: {
      en: enTranslations,
      es: esTranslations,
      ru: ruTranslations,
    },
  });

  return (
    <I18nYooEditorProvider editor={editor}>
      <LanguageSwitcher />
      <YooptaEditor editor={editor} plugins={plugins} />
    </I18nYooEditorProvider>
  );
}
```

## Contributing

We welcome contributions! To add a new language:

1. Fork the repository
2. Create a new translation file in `src/locales/<lang-code>.json`
3. Follow the existing structure
4. Test thoroughly
5. Submit a pull request

## License

MIT © LLCProfdepo
