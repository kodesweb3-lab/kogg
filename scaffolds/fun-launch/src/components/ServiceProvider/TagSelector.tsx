'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PREDEFINED_TAGS } from '@/lib/service-provider-tags';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagSelector({ selectedTags, onTagsChange, maxTags = 10 }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customTag, setCustomTag] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter predefined tags based on search
  const filteredTags = PREDEFINED_TAGS.filter((tag) =>
    tag.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedTags.includes(tag)
  );

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setCustomTag('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTagSelect = (tag: string) => {
    if (selectedTags.length >= maxTags) return;
    if (selectedTags.includes(tag)) return;
    onTagsChange([...selectedTags, tag]);
    setSearchQuery('');
  };

  const handleTagRemove = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleCustomTagAdd = () => {
    const trimmed = customTag.trim();
    if (!trimmed) return;
    if (selectedTags.length >= maxTags) return;
    if (selectedTags.includes(trimmed)) return;
    if (trimmed.length > 50) return;

    // Validate format (alphanumeric, spaces, hyphens only)
    const tagRegex = /^[a-zA-Z0-9\s-]+$/;
    if (!tagRegex.test(trimmed)) {
      alert('Tag can only contain letters, numbers, spaces, and hyphens');
      return;
    }

    onTagsChange([...selectedTags, trimmed]);
    setCustomTag('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 bg-dacian-steel-steel text-mystic-steam-parchment rounded-full text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleTagRemove(tag)}
              className="hover:text-mystic-steam-copper transition-colors"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {selectedTags.length < maxTags && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-2 bg-dacian-steel-gunmetal border border-dacian-steel-steel/30 rounded-lg text-mystic-steam-parchment text-left focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
          >
            {isOpen ? 'Select tags...' : '+ Add Tag'}
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-2 steel-panel rounded-lg shadow-lg max-h-96 overflow-y-auto"
              >
                {/* Search input */}
                <div className="p-2 border-b border-dacian-steel-steel/30">
                  <input
                    type="text"
                    placeholder="Search tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-dacian-steel-dark border border-dacian-steel-steel/30 rounded text-mystic-steam-parchment focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                  />
                </div>

                {/* Predefined tags list */}
                {filteredTags.length > 0 && (
                  <div className="p-2">
                    <div className="text-xs text-mystic-steam-parchment/60 mb-2 px-2 sticky top-0 bg-dacian-steel-gunmetal py-1 rounded">
                      Predefined Tags ({filteredTags.length} available)
                    </div>
                    <div className="space-y-1">
                      {filteredTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagSelect(tag)}
                          className="w-full text-left px-3 py-2 hover:bg-dacian-steel-steel rounded text-sm text-mystic-steam-parchment transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom tag input */}
                <div className="p-2 border-t border-dacian-steel-steel/30">
                  <div className="text-xs text-mystic-steam-parchment/60 mb-2 px-2">Custom Tag</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter custom tag..."
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCustomTagAdd();
                        }
                      }}
                      maxLength={50}
                      className="flex-1 px-3 py-2 bg-dacian-steel-dark border border-dacian-steel-steel/30 rounded text-mystic-steam-parchment focus:outline-none focus:ring-2 focus:ring-dacian-steel-copper"
                    />
                    <button
                      type="button"
                      onClick={handleCustomTagAdd}
                      className="px-4 py-2 bg-dacian-steel-copper hover:bg-dacian-steel-copper/90 text-mystic-steam-charcoal rounded font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {selectedTags.length > 0 && (
        <p className="text-xs text-mystic-steam-parchment/50 mt-1">
          {selectedTags.length} / {maxTags} tags selected
        </p>
      )}
    </div>
  );
}
