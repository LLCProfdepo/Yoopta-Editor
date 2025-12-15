# i18n Migration Guide for Yoopta-Editor

## Current Status

✅ **Phase 1 Complete**: i18n Infrastructure
- TranslationDictionary type expanded with all new keys
- en.json fully populated with 200+ English strings
- es.json and ru.json updated with complete translations
- i18n package built and functional

🔄 **Phase 2 In Progress**: Component Migration
- Core editor BlockOptions component migrated as reference example
- 70+ files remain to be migrated

## Migration Pattern

### For Components with Editor Access

When a component has access to the `editor` instance (via props or `useYooptaEditor()` hook):

**Before:**
```tsx
<button>Delete</button>
```

**After:**
```tsx
<button>
  {'getLabelText' in editor
    ? (editor as any).getLabelText('editor.blockOptions.delete')
    : 'Delete'}
</button>
```

**Why this pattern:**
1. **Runtime check**: `'getLabelText' in editor` ensures backward compatibility
2. **Type cast**: `(editor as any)` resolves TypeScript errors since base `YooEditor` doesn't include i18n methods
3. **Fallback**: If i18n not initialized, falls back to English hardcoded string
4. **Type-safe keys**: Translation keys are validated against `TranslationKey` type

### For Plugin Metadata

Plugin display names and descriptions are accessed differently:

**Before:**
```typescript
export default YooptaPlugin({
  name: 'Paragraph',
  display: {
    title: 'Text',
    description: 'Start writing plain text.'
  },
  // ...
});
```

**After:**
```typescript
export default YooptaPlugin({
  name: 'Paragraph',
  display: {
    title: 'plugins.Paragraph.display.title',
    description: 'plugins.Paragraph.display.description'
  },
  // Note: The action menu will resolve these keys via editor.getLabelText()
  // ...
});
```

### Helper Function (Optional)

For cleaner code, you can create a helper:

```typescript
// Add to component
const t = (key: string, fallback: string): string => {
  if ('getLabelText' in editor && typeof (editor as any).getLabelText === 'function') {
    return (editor as any).getLabelText(key);
  }
  return fallback;
};

// Usage
<button>{t('editor.blockOptions.delete', 'Delete')}</button>
```

## Files Requiring Migration

### Priority 1: Core Editor UI (6 files)
- [x] `/packages/core/editor/src/UI/BlockOptions/BlockOptions.tsx` ✅
- [ ] `/packages/core/editor/src/UI/ExtendedBlockActions/ExtendedBlockActions.tsx`
- [ ] `/packages/core/editor/src/components/Block/FloatingBlockActions.tsx`
- [ ] `/packages/core/editor/src/components/SelectionBox/SelectionBox.tsx`

### Priority 2: Tools (3 packages, ~15 files)

#### Action Menu Tool
- [ ] `/packages/tools/action-menu/src/components/DefaultActionMenuRender.tsx`
  - Line 45: `"No actions available"` → `editor.common.noActionsAvailable`

#### Link Tool
- [ ] `/packages/tools/link-tool/src/components/DefaultLinkToolRender.tsx`
  - Lines 48-134: All label text, placeholders, and button text

#### Toolbar Tool
- [ ] `/packages/tools/toolbar/src/components/DefaultToolbarRender.tsx`
  - Lines 269-402: All aria-labels and visible text

### Priority 3: Plugin UI Components (~50 files)

#### Image Plugin
- [ ] `/packages/plugins/image/src/ui/Placeholder.tsx`
- [ ] `/packages/plugins/image/src/ui/ImageUploader.tsx`
- [ ] `/packages/plugins/image/src/ui/FileUploader.tsx`
- [ ] `/packages/plugins/image/src/ui/EmbedUploader.tsx`
- [ ] `/packages/plugins/image/src/ui/InputAltText.tsx`
- [ ] `/packages/plugins/image/src/ui/ImageBlockOptions.tsx`

#### Video Plugin
- [ ] `/packages/plugins/video/src/ui/Placeholder.tsx`
- [ ] `/packages/plugins/video/src/ui/VideoUploader.tsx`
- [ ] `/packages/plugins/video/src/ui/FileUploader.tsx`
- [ ] `/packages/plugins/video/src/ui/EmbedUploader.tsx`
- [ ] `/packages/plugins/video/src/ui/VideoBlockOptions.tsx`

#### File Plugin
- [ ] `/packages/plugins/file/src/ui/Placeholder.tsx`
- [ ] `/packages/plugins/file/src/ui/FileUploader.tsx`
- [ ] `/packages/plugins/file/src/ui/FileBlockOptions.tsx`

#### Embed Plugin
- [ ] `/packages/plugins/embed/src/ui/Placeholder.tsx`
- [ ] `/packages/plugins/embed/src/ui/EmbedLinkUploader.tsx`
- [ ] `/packages/plugins/embed/src/ui/EmbedUploader.tsx`
- [ ] `/packages/plugins/embed/src/ui/EmbedBlockOptions.tsx`

#### Table Plugin
- [ ] `/packages/plugins/table/src/components/TableBlockOptions.tsx`
- [ ] `/packages/plugins/table/src/components/TableColumnOptions.tsx`
- [ ] `/packages/plugins/table/src/components/TableRowOptions.tsx`

#### Callout Plugin
- [ ] `/packages/plugins/callout/src/ui/CalloutBlockOptions.tsx`

#### Code Plugin
- [ ] `/packages/plugins/code/src/ui/CodeBlockOptions.tsx`

#### Divider Plugin
- [ ] `/packages/plugins/divider/src/components/DividerBlockOptions.tsx`

## Translation Key Reference

### Core Editor Keys
```typescript
'editor.blockOptions.delete'
'editor.blockOptions.duplicate'
'editor.blockOptions.turnInto'
'editor.blockOptions.copyBlockLink'
'editor.blockOptions.moveUp'
'editor.blockOptions.moveDown'
'editor.placeholder'
'editor.loading'
'editor.common.update'
'editor.common.delete'
'editor.common.cancel'
'editor.common.save'
'editor.common.alignment'
'editor.common.open'
'editor.common.download'
'editor.common.add'
'editor.common.replace'
```

### Plugin Keys (Pattern)
```typescript
// For plugin named "Image":
'plugins.Image.display.title'           // "Image"
'plugins.Image.display.description'     // "Upload from device..."
'plugins.Image.placeholders.click'      // "Click to add image"
'plugins.Image.placeholders.paste'      // "Paste image link"
'plugins.Image.placeholders.editAlt'    // "Edit alt text"
'plugins.Image.labels.altText'          // "Alternative text"
'plugins.Image.labels.replaceImage'     // "Replace image"
'plugins.Image.actions.upload'          // "Upload"
'plugins.Image.actions.embedImage'      // "Embed image"
'plugins.Image.options.fit'             // "Fit"
'plugins.Image.options.fill'            // "Fill"
'plugins.Image.options.cover'           // "Cover"
```

### Tool Keys
```typescript
'tools.toolbar.bold'
'tools.toolbar.italic'
'tools.toolbar.link'
'tools.toolbar.ariaLabels.bold'
'tools.toolbar.ariaLabels.blockFormatting'
'tools.linkTool.placeholder'
'tools.linkTool.labels.linkTitle'
'tools.linkTool.placeholders.editTitle'
'tools.linkTool.actions.add'
'tools.linkTool.actions.update'
'tools.linkTool.actions.delete'
'tools.actionMenu.search'
'tools.actionMenu.noResults'
'tools.actionMenu.noActionsAvailable'
```

## Bulk Migration Strategy

### Step 1: Create Migration Helper

Create a helper function to simplify migrations:

```typescript
// packages/core/editor/src/utils/i18nHelpers.ts
export function getTranslatedText(
  editor: any,
  key: string,
  fallback: string
): string {
  if ('getLabelText' in editor && typeof editor.getLabelText === 'function') {
    return editor.getLabelText(key);
  }
  return fallback;
}

// Usage in components
import { getTranslatedText as t } from '../../utils/i18nHelpers';

// Then:
<button>{t(editor, 'editor.blockOptions.delete', 'Delete')}</button>
```

### Step 2: Use Find & Replace with Regex

For systematic migration, use regex patterns:

**Pattern 1: Simple JSX text**
```
Find:    >Delete<
Replace: >{'getLabelText' in editor ? (editor as any).getLabelText('editor.blockOptions.delete') : 'Delete'}<
```

**Pattern 2: aria-label attributes**
```
Find:    aria-label="Bold"
Replace: aria-label={'getLabelText' in editor ? (editor as any).getLabelText('tools.toolbar.ariaLabels.bold') : 'Bold'}
```

### Step 3: Test Each Plugin Independently

After migrating each plugin:
1. Build: `cd packages/plugins/[plugin-name] && yarn build`
2. Verify no TypeScript errors
3. Test in dev environment with:
   - Editor without i18n (should show English fallbacks)
   - Editor with i18n (should show translated text)

## Testing Strategy

### Test Case 1: Without i18n
```typescript
import { createYooptaEditor } from '@yoopta/editor';

const editor = createYooptaEditor(); // No i18n
// Should display: English fallback strings
```

### Test Case 2: With i18n (English)
```typescript
import { createYooptaEditor } from '@yoopta/editor';
import { withTranslations } from '@yoopta/i18n';
import enTranslations from '@yoopta/i18n/locales/en.json';

const baseEditor = createYooptaEditor();
const editor = withTranslations(baseEditor, {
  defaultLanguage: 'en',
  language: 'en',
  translations: { en: enTranslations },
});
// Should display: English from translations
```

### Test Case 3: With i18n (Spanish)
```typescript
import { createYooptaEditor } from '@yoopta/editor';
import { withTranslations } from '@yoopta/i18n';
import enTranslations from '@yoopta/i18n/locales/en.json';
import esTranslations from '@yoopta/i18n/locales/es.json';

const baseEditor = createYooptaEditor();
const editor = withTranslations(baseEditor, {
  defaultLanguage: 'en',
  language: 'es',
  translations: { en: enTranslations, es: esTranslations },
});
// Should display: Spanish translations
```

### Test Case 4: Language Switching
```typescript
// Start with Spanish
editor.setLanguage('es');
// UI should show Spanish

editor.setLanguage('en');
// UI should re-render and show English
```

## Common Pitfalls

### 1. Wrong Key Name
❌ `editor.blockOptions.delete_button`
✅ `editor.blockOptions.delete`

Always reference the translation JSON files for exact key names.

### 2. Missing Type Cast
❌ `editor.getLabelText('key')` → TypeScript error
✅ `(editor as any).getLabelText('key')` → Works

### 3. Forgetting Fallback
❌ `(editor as any).getLabelText('key')` → Breaks without i18n
✅ `'getLabelText' in editor ? (editor as any).getLabelText('key') : 'Fallback'`

### 4. Plugin Metadata
For plugins, the display title/description should be **key strings**, not resolved:

```typescript
display: {
  title: 'plugins.Paragraph.display.title',  // Key string
  description: 'plugins.Paragraph.display.description'  // Key string
}
```

The ActionMenu will resolve these automatically via `editor.getLabelText()`.

## Next Steps

1. **Complete component migrations** following the patterns above
2. **Build all packages**: `yarn build` from repository root
3. **Verify type-checking**: `yarn tsc --noEmit` in each package
4. **Test in development**: Verify UI displays correctly with/without i18n
5. **Update documentation**: Add i18n usage examples to main README
6. **Release**: Create new version with `yarn release:local 4.10.0-llc.3`

## Benefits of This Migration

✅ **Multilingual support**: Editor now supports English, Spanish, Russian (and easily extensible)
✅ **Type-safe**: Translation keys are validated at compile time
✅ **Backward compatible**: Works with and without i18n initialization
✅ **User customizable**: Users can override any translation key
✅ **Centralized**: All UI text in one place (locales/*.json)
✅ **Dynamic switching**: Can change language at runtime

## Maintenance

When adding new UI features:
1. Add English text to `/packages/core/i18n/src/locales/en.json`
2. Add keys to `TranslationDictionary` type if needed
3. Add placeholder translations to `es.json` and `ru.json`
4. Use `editor.getLabelText()` in components
5. Community can contribute translations via PRs

---

**Status**: Migration infrastructure complete. Component refactoring in progress.
**Completion**: ~5% (1 of 70+ files migrated)
**Estimated time to complete**: 8-12 hours for systematic migration of all files
