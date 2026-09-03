import { useState } from 'react';
import { Braces, Copy, Download, Link2, Save, Trash } from 'lucide-react';
import { useRgbStore } from './rgbContexts';
import RgbPreview from './RgbPreview';

export default function Presets() {
  const { store, presets, savePreset, deletePreset, loadPreset, exportPresetUrl, pushToast } = useRgbStore();
  const [importJson, setImportJson] = useState('');

  const presetJson = () => {
    const preset: Record<string, unknown> = { ...store };
    delete preset.version;
    return JSON.stringify(preset, (_key, value) => (value === undefined ? undefined : value));
  };

  return (
    <div id="presets" className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h3 className="flex flex-1 items-center gap-2 text-[15px] font-semibold text-[#cdd6f4]">
          <Save size={17} /> Presets
        </h3>
        <button
          type="button"
          id="save"
          onClick={() => {
            savePreset();
            pushToast('Preset Saved!', 'The preset has been saved to this browser.', 'green');
          }}
          className="mc-icon-btn rounded-none px-2.5 py-1.5 text-[13px]"
        >
          <Save size={15} /> Save
        </button>
      </div>

      <div className="mc-input max-h-64 overflow-auto rounded-md p-1.5">
        {presets.length === 0 && (
          <p className="p-2.5 text-center text-xs text-[#6c7086]">
            No presets saved yet. Configure a gradient and press Save.
          </p>
        )}
        {presets.map((preset, i) => {
          const snapshot = { ...store, ...preset };
          return (
            <div key={i} className="flex w-full items-center gap-0 border-b border-white/5 last:border-none">
              <button
                type="button"
                onClick={() => loadPreset(JSON.stringify(preset))}
                className="flex-1 rounded-md py-2 pl-3 pr-1.5 text-left transition-colors hover:bg-white/5"
              >
                <RgbPreview
                  showSelection={false}
                  override={{
                    text: snapshot.text,
                    colors: snapshot.colors,
                    shadowColors: snapshot.shadowColors ?? null,
                    colorLength: snapshot.colorLength,
                    gradientType: snapshot.gradientType,
                    formatting: snapshot.formatting,
                    baseFormatting: snapshot.baseFormatting,
                  }}
                  shadowLength={1}
                />
              </button>
              <button
                type="button"
                aria-label="Delete preset"
                onClick={() => deletePreset(i)}
                className="mr-1.5 rounded-md p-1.5 text-[#a6adc8] transition-colors hover:text-[#f38ba8]"
              >
                <Trash size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <label htmlFor="import" className="flex flex-col gap-1.5 text-[13px] text-[#a6adc8]">
        <span className="flex items-center gap-1.5">
          <Braces size={13} /> Import
        </span>
        <textarea
          id="import"
          rows={6}
          placeholder="Paste a JSON preset here"
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
          className="mc-input w-full resize-y rounded-none px-2.5 py-2 font-mono text-xs leading-relaxed"
        />
        <button
          type="button"
          onClick={() => {
            if (!importJson.trim()) {
              pushToast('Nothing to Load', 'Paste a preset JSON first.', 'orange');
              return;
            }
            const ok = loadPreset(importJson);
            if (ok) {
              pushToast('Successfully imported preset!', 'The preset has been imported.', 'green');
              setImportJson('');
            } else {
              pushToast('Invalid Preset', 'The pasted JSON could not be parsed as a preset.', 'red');
            }
          }}
          disabled={!importJson.trim()}
          className="mc-icon-btn flex items-center justify-center gap-1.5 rounded-none px-2.5 py-2 text-[13px]"
        >
          <Download size={15} /> Load JSON
        </button>
      </label>

      <div className="flex gap-1">
        <button
          type="button"
          id="copy"
          onClick={() => {
            navigator.clipboard
              .writeText(presetJson())
              .then(() => pushToast('Preset Copied!', 'Successfully copied preset to clipboard!', 'green'))
              .catch(() => pushToast('Failed to copy to clipboard!', undefined, 'red'));
          }}
          className="mc-icon-btn flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-[13px]"
        >
          <Copy size={15} /> Copy
        </button>
        <button
          type="button"
          id="createurl"
          onClick={() => {
            const url = exportPresetUrl();
            navigator.clipboard
              .writeText(url)
              .then(() => pushToast('URL Copied!', 'Preset URL copied to clipboard! (The address bar is updated too)', 'green'))
              .catch(() => pushToast('URL Updated', 'Clipboard blocked — the address bar holds the preset URL.', 'orange'));
          }}
          className="mc-icon-btn flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-[13px]"
        >
          <Link2 size={15} /> Get URL
        </button>
      </div>
    </div>
  );
}
