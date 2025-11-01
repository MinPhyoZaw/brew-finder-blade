import React from "react";
import { Heart, Camera, Coffee, Music, Sun } from "lucide-react";

interface TagFilterProps {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

const tags = [
  { name: "First Date", color: "bg-pink-200 text-pink-800", icon: <Heart size={14} /> },
  { name: "Photograph", color: "bg-blue-200 text-blue-800", icon: <Camera size={14} /> },
  { name: "Relax & Chill", color: "bg-green-200 text-green-800", icon: <Coffee size={14} /> },
  { name: "Music Vibe", color: "bg-yellow-200 text-yellow-800", icon: <Music size={14} /> },
  { name: "Outdoor", color: "bg-purple-200 text-purple-800", icon: <Sun size={14} /> },
];

export const TagFilter: React.FC<TagFilterProps> = ({ selectedTags, onTagToggle }) => {
  return (
    <div className="flex overflow-x-auto space-x-2 p-2 no-scrollbar">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag.name);
        return (
          <button
            key={tag.name}
            onClick={() => onTagToggle(tag.name)}
            className={`
              flex items-center space-x-1 px-3 py-1 rounded-full border transition-all duration-200
              ${isSelected ? `${tag.color} border-transparent` : "bg-gray-100 text-gray-700 border-gray-300"}
              flex-shrink-0
            `}
          >
            {tag.icon}
            <span className="text-sm font-medium whitespace-nowrap">{tag.name}</span>
          </button>
        );
      })}
    </div>
  );
};
