import { useState, useEffect } from 'react';
import { hslToHex, hexToHsl } from '../utils/colorUtils';

interface ColorEditorProps {
  actionName: string;
  actionColor: string;
  onSave: (name: string, color: string) => void;
  onCancel: () => void;
}

export default function ColorEditor({
  actionName,
  actionColor,
  onSave,
  onCancel
}: ColorEditorProps) {
  const initialHsl = hexToHsl(actionColor);
  const [name, setName] = useState(actionName);
  const [hue, setHue] = useState(initialHsl.h);
  const [saturation, setSaturation] = useState(initialHsl.s);
  const [lightness, setLightness] = useState(initialHsl.l);

  const currentColor = hslToHex(hue, saturation, lightness);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, currentColor);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Edit Action</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Action Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg
                         focus:border-blue-500 focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Color Preview
            </label>
            <div
              className="w-full h-16 rounded-lg shadow-inner border-2 border-slate-200"
              style={{ backgroundColor: currentColor }}
            />
            <p className="text-center mt-2 text-sm font-mono text-slate-500">
              {currentColor.toUpperCase()}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Hue: {hue}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={(e) => setHue(Number(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  WebkitAppearance: 'none',
                  background: 'linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Saturation: {saturation}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  WebkitAppearance: 'none',
                  background: `linear-gradient(to right,
                    ${hslToHex(hue, 0, lightness)},
                    ${hslToHex(hue, 100, lightness)})`
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Lightness: {lightness}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={lightness}
                onChange={(e) => setLightness(Number(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  WebkitAppearance: 'none',
                  background: `linear-gradient(to right,
                    ${hslToHex(hue, saturation, 0)},
                    ${hslToHex(hue, saturation, 50)},
                    ${hslToHex(hue, saturation, 100)})`
                }}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-lg font-semibold
                         bg-slate-200 text-slate-700 hover:bg-slate-300
                         transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-lg font-semibold
                         bg-blue-500 text-white hover:bg-blue-600
                         transition-colors duration-200 shadow-lg"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
