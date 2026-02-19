"use client";

import { useState } from "react";
import { serviceIcons, getIconByName } from "@/utils/serviceIcons";
import { Check, Sparkles } from "lucide-react";

interface IconPickerProps {
  selectedIcon: string;
  onIconChange: (iconName: string) => void;
  onAutoSuggest?: () => void;
}

export function IconPicker({
  selectedIcon,
  onIconChange,
  onAutoSuggest,
}: IconPickerProps) {
  const [filterCategory, setFilterCategory] = useState<string>("All");

  // Get unique categories
  const categories = ["All", ...new Set(serviceIcons.map((icon) => icon.category))];

  // Filter icons by category
  const filteredIcons =
    filterCategory === "All"
      ? serviceIcons
      : serviceIcons.filter((icon) => icon.category === filterCategory);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm text-white/60">Icon</label>
        {onAutoSuggest && (
          <button
            type="button"
            onClick={onAutoSuggest}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Auto-suggest
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setFilterCategory(category)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterCategory === category
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Icon Grid */}
      <div className="grid grid-cols-8 gap-2 max-h-[240px] overflow-y-auto p-2 bg-white/5 border border-white/10 rounded-lg scrollbar-thin">
        {filteredIcons.map((iconOption) => {
          const IconComponent = iconOption.icon;
          const isSelected = selectedIcon === iconOption.name;

          return (
            <button
              key={iconOption.name}
              type="button"
              onClick={() => onIconChange(iconOption.name)}
              className={`relative p-3 rounded-lg transition-all group ${
                isSelected
                  ? "bg-blue-500/20 border border-blue-500/50"
                  : "bg-white/5 hover:bg-white/10 border border-white/10"
              }`}
              title={iconOption.label}
            >
              <IconComponent
                className={`w-5 h-5 ${
                  isSelected ? "text-blue-400" : "text-white/60 group-hover:text-white"
                }`}
              />
              {isSelected && (
                <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Icon Preview */}
      <div className="flex items-center gap-2 p-2 bg-white/5 border border-white/10 rounded-lg">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          {(() => {
            const SelectedIconComponent = getIconByName(selectedIcon);
            return <SelectedIconComponent className="w-5 h-5 text-blue-400" />;
          })()}
        </div>
        <span className="text-sm text-white/80">
          {serviceIcons.find((i) => i.name === selectedIcon)?.label || selectedIcon}
        </span>
      </div>
    </div>
  );
}
