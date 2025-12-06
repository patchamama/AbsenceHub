/**
 * ColorPicker Component
 * Color selector for absence types
 */
import { useState } from 'react';

const PRESET_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Orange
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F97316', // Deep Orange
  '#84CC16', // Lime
];

export default function ColorPicker({ value, onChange, label }) {
  const [showPicker, setShowPicker] = useState(false);

  const handleColorSelect = (color) => {
    onChange(color);
    setShowPicker(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="flex items-center gap-3">
        {/* Color preview */}
        <div
          className="w-12 h-12 rounded-md border-2 border-gray-300 cursor-pointer shadow-sm"
          style={{ backgroundColor: value }}
          onClick={() => setShowPicker(!showPicker)}
        />

        {/* Hex input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          pattern="^#[0-9A-Fa-f]{6}$"
        />

        {/* Native color picker */}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-md border-2 border-gray-300 cursor-pointer"
        />
      </div>

      {/* Preset colors */}
      {showPicker && (
        <div className="p-3 bg-white border border-gray-200 rounded-md shadow-lg">
          <p className="text-xs text-gray-600 mb-2">Vordefinierte Farben:</p>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className="w-10 h-10 rounded-md border-2 border-gray-300 hover:border-blue-500 transition-colors"
                style={{ backgroundColor: color }}
                aria-label={`Farbe ${color}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
