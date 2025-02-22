import React from 'react';
import { Section } from '../App';

interface NavbarProps {
  section: Section;
  selectedTags: string[];
  onTagClick: (tag: string) => void;
}

export default function Navbar({ section, selectedTags, onTagClick }: NavbarProps) {
  return (
    <div className="fixed top-0 left-64 right-0 bg-white border-b z-10">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
        <div className="flex flex-wrap gap-3 max-h-[220px] overflow-y-auto p-4 bg-gray-50 rounded-lg">
          {section.tags.map((tag, index) => {
            // Calculate dynamic styles based on tag properties
            const fontSizes = ["text-sm", "text-base", "text-lg", "text-xl", "text-2xl"];
            const rotations = ["rotate-0", "rotate-2", "-rotate-2", "rotate-1", "-rotate-1"];
            const opacities = ["opacity-80", "opacity-90", "opacity-100"];
            
            // Use modulo to cycle through arrays and create variation
            const fontSize = fontSizes[Math.floor((index * 7) % fontSizes.length)];
            const rotation = rotations[Math.floor((index * 3) % rotations.length)];
            const opacity = opacities[Math.floor((index * 5) % opacities.length)];
            
            // Add hover and selection effects
            const baseClasses = `
              inline-block
              ${fontSize}
              ${rotation}
              ${opacity}
              ${tag.color}
              font-medium
              px-3
              py-1.5
              rounded-md
              cursor-pointer
              transform
              transition-all
              duration-300
              ease-in-out
              hover:scale-110
              hover:-translate-y-0.5
              hover:shadow-lg
            `;

            const selectedClasses = selectedTags.includes(tag.text)
              ? "ring-2 ring-blue-500 ring-offset-2 shadow-md bg-white"
              : "hover:bg-white/80";

            return (
              <span
                key={index}
                className={`${baseClasses} ${selectedClasses}`}
                onClick={() => onTagClick(tag.text)}
                style={{
                  // Add subtle random positioning
                  transform: `translate(${Math.sin(index) * 4}px, ${Math.cos(index) * 4}px)`,
                }}
              >
                {tag.text}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
