import type { CSSProperties, MouseEvent} from 'react';
import { useState } from 'react';
import type { YooEditor} from '@yoopta/editor';
import { UI } from '@yoopta/editor';
import { PaletteIcon } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useDebouncedCallback } from 'use-debounce';

const { Portal } = UI;

const COLOR_PRESETS = {
  text: [
    { name: 'tools.toolbar.highlightColor.colors.default', value: 'black' },
    { name: 'tools.toolbar.highlightColor.colors.gray', value: '#787774' },
    { name: 'tools.toolbar.highlightColor.colors.brown', value: '#976D57' },
    { name: 'tools.toolbar.highlightColor.colors.orange', value: '#CC772F' },
    { name: 'tools.toolbar.highlightColor.colors.yellow', value: '#C29243' },
    { name: 'tools.toolbar.highlightColor.colors.green', value: '#548064' },
    { name: 'tools.toolbar.highlightColor.colors.blue', value: '#477DA5' },
    { name: 'tools.toolbar.highlightColor.colors.purple', value: '#A48BBE' },
    { name: 'tools.toolbar.highlightColor.colors.pink', value: '#B35588' },
    { name: 'tools.toolbar.highlightColor.colors.red', value: '#C4554D' },
  ],
  background: [
    { name: 'tools.toolbar.highlightColor.colors.default', value: 'unset' },
    { name: 'tools.toolbar.highlightColor.colors.gray', value: '#F1F1EF' },
    { name: 'tools.toolbar.highlightColor.colors.brown', value: '#F3EEEE' },
    { name: 'tools.toolbar.highlightColor.colors.orange', value: '#F8ECDF' },
    { name: 'tools.toolbar.highlightColor.colors.yellow', value: '#FAF3DD' },
    { name: 'tools.toolbar.highlightColor.colors.green', value: '#EEF3ED' },
    { name: 'tools.toolbar.highlightColor.colors.blue', value: '#E9F3F7' },
    { name: 'tools.toolbar.highlightColor.colors.purple', value: '#F6F3F8' },
    { name: 'tools.toolbar.highlightColor.colors.pink', value: '#F9F2F5' },
    { name: 'tools.toolbar.highlightColor.colors.red', value: '#FAECEC' },
  ],
};

type Props = {
  editor: YooEditor;
  highlightColors: CSSProperties;
  onClose: () => void;
  refs: { setFloating: (el: any) => void };
  floatingStyles: React.CSSProperties;
};

const COLOR_PICKER_STYLES = {
  width: '100%',
  height: 170,
};

const HighlightColor = ({ editor, refs, floatingStyles, highlightColors = {} }: Props) => {
  const [tab, setTab] = useState<'text' | 'background'>('text');
  const [showColorPicker, setShowColorPicker] = useState(true);
  const [localColor, setLocalColor] = useState<string | null>(null);

  const debouncedUpdateColor = useDebouncedCallback(
    (type: 'color' | 'backgroundColor', color: string) => {
      const value = editor.formats.highlight.getValue();
      if (value?.[type] === color) {
        editor.formats.highlight.update({ ...highlightColors, [type]: undefined });
      } else {
        editor.formats.highlight.update({ ...highlightColors, [type]: color });
      }

      setLocalColor(null);
    },
    50,
  );

  const handleColorChange = (
    type: 'color' | 'backgroundColor',
    color: string,
    shouldDebounce?: boolean,
  ) => {
    if (shouldDebounce) {
      setLocalColor(color);
      debouncedUpdateColor(type, color);
    } else {
      const value = editor.formats.highlight.getValue();
      if (value?.[type] === color) {
        editor.formats.highlight.update({ ...highlightColors, [type]: undefined });
      } else {
        editor.formats.highlight.update({ ...highlightColors, [type]: color });
      }
    }
  };

  const getItemStyles = (type: 'color' | 'backgroundColor', color: string) => {
    const currentColor = localColor || highlightColors?.[type];
    const isActive = currentColor === color;
    return {
      backgroundColor: color,
      border: isActive ? '2px solid #3b82f6' : '1px solid #e3e3e3',
      position: 'relative' as const,
    };
  };

  return (
    <Portal id="yoo-highlight-color-portal">
      <div
        style={floatingStyles}
        ref={refs.setFloating}
        onClick={(e: MouseEvent) => e.stopPropagation()}
        className="yoo-toolbar-z-50">
        <div className="yoo-toolbar-bg-[#FFFFFF] yoo-toolbar-p-2 yoo-toolbar-rounded-md yoo-toolbar-shadow-md yoo-toolbar-border yoo-toolbar-border-solid yoo-toolbar-border-[#e5e7eb]">
          {/* Tabs */}
          <div className="yoo-toolbar-flex yoo-toolbar-space-x-2 yoo-toolbar-mb-3">
            <button
              type="button"
              className={`yoo-toolbar-px-3 yoo-toolbar-py-1 yoo-toolbar-text-sm yoo-toolbar-rounded ${
                tab === 'text'
                  ? 'yoo-toolbar-bg-blue-50 yoo-toolbar-text-blue-600'
                  : 'yoo-toolbar-text-gray-600 hover:yoo-toolbar-bg-gray-50'
              }`}
              onClick={() => setTab('text')}>
              {'getLabelText' in editor ? (editor as any).getLabelText('tools.toolbar.highlightColor.tabs.textColor') : 'Text'}
            </button>
            <button
              type="button"
              className={`yoo-toolbar-px-3 yoo-toolbar-py-1 yoo-toolbar-text-sm yoo-toolbar-rounded ${
                tab === 'background'
                  ? 'yoo-toolbar-bg-blue-50 yoo-toolbar-text-blue-600'
                  : 'yoo-toolbar-text-gray-600 hover:yoo-toolbar-bg-gray-50'
              }`}
              onClick={() => setTab('background')}>
              {'getLabelText' in editor ? (editor as any).getLabelText('tools.toolbar.highlightColor.tabs.background') : 'Background'}
            </button>
          </div>

          {/* Presets Grid */}
          <div className="yoo-toolbar-grid yoo-toolbar-justify-items-center yoo-toolbar-grid-cols-5 yoo-toolbar-gap-1 yoo-toolbar-mb-3">
            {COLOR_PRESETS[tab].map(({ name, value }) => (
              <button
                type="button"
                key={name}
                title={'getLabelText' in editor ? (editor as any).getLabelText(name as any) : name}
                className="yoo-toolbar-w-6 yoo-toolbar-h-6 yoo-toolbar-rounded yoo-toolbar-transition-all hover:yoo-toolbar-scale-110"
                style={getItemStyles(tab === 'text' ? 'color' : 'backgroundColor', value)}
                onClick={() =>
                  handleColorChange(tab === 'text' ? 'color' : 'backgroundColor', value)
                }
              />
            ))}
          </div>

          {/* Custom Color Section */}
          <div className="yoo-toolbar-border-t yoo-toolbar-pt-2">
            <button
              type="button"
              className="yoo-toolbar-text-sm yoo-toolbar-text-gray-600 hover:yoo-toolbar-text-gray-900 yoo-toolbar-flex yoo-toolbar-items-center"
              onClick={() => setShowColorPicker(!showColorPicker)}>
              {'getLabelText' in editor ? (editor as any).getLabelText('tools.toolbar.highlightColor.colorPicker') : 'Color Picker'}
              <PaletteIcon className="yoo-toolbar-w-4 yoo-toolbar-h-4 yoo-toolbar-ml-1" />
            </button>

            {showColorPicker && (
              <div className="yoo-toolbar-mt-2">
                <HexColorPicker
                  color={
                    localColor ||
                    highlightColors?.[tab === 'text' ? 'color' : 'backgroundColor'] ||
                    '#000000'
                  }
                  onChange={(color) =>
                    handleColorChange(tab === 'text' ? 'color' : 'backgroundColor', color, true)
                  }
                  style={COLOR_PICKER_STYLES}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export { HighlightColor };
