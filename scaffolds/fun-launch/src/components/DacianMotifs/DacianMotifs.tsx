'use client';

import React from 'react';

interface DacianMotifsProps {
  type?: 'draco' | 'wolf' | 'castle' | 'heraldic';
  opacity?: number;
  className?: string;
}

/**
 * Dacian Motifs - Subtle SVG patterns inspired by Dacian heritage
 * - Draco: Wolf-headed serpent standard pattern
 * - Wolf: Minimalist geometric wolf silhouette
 * - Castle: Hunedoara Castle architectural elements
 * - Heraldic: Coats of arms inspired patterns
 */
export function DacianMotifs({ 
  type = 'draco', 
  opacity = 0.02,
  className = '' 
}: DacianMotifsProps) {
  const baseStyles = `pointer-events-none ${className}`;
  
  const patterns = {
    draco: (
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        className={baseStyles}
        style={{ opacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="draco-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            {/* Wolf head silhouette */}
            <circle cx="100" cy="50" r="12" fill="none" stroke="#8B6F47" strokeWidth="0.5" opacity="0.3" />
            <path d="M88 50 Q85 45 88 40" fill="none" stroke="#8B6F47" strokeWidth="0.5" opacity="0.3" />
            <path d="M112 50 Q115 45 112 40" fill="none" stroke="#8B6F47" strokeWidth="0.5" opacity="0.3" />
            {/* Serpent body flowing */}
            <path d="M100 62 Q120 80 140 100 T180 140" fill="none" stroke="#8B6F47" strokeWidth="0.8" opacity="0.2" />
            <path d="M100 62 Q80 80 60 100 T20 140" fill="none" stroke="#8B6F47" strokeWidth="0.8" opacity="0.2" />
            {/* Flowing tail elements */}
            <circle cx="180" cy="140" r="3" fill="#8B6F47" opacity="0.2" />
            <circle cx="20" cy="140" r="3" fill="#8B6F47" opacity="0.2" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#draco-pattern)" />
      </svg>
    ),
    wolf: (
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        className={baseStyles}
        style={{ opacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="wolf-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            {/* Minimalist wolf silhouette - geometric */}
            <path
              d="M100 40 L110 50 L115 65 L110 80 L100 85 L90 80 L85 65 L90 50 Z"
              fill="none"
              stroke="#5d4e37"
              strokeWidth="0.5"
              opacity="0.25"
            />
            {/* Ears */}
            <path d="M95 45 L92 35 L95 40" fill="none" stroke="#5d4e37" strokeWidth="0.5" opacity="0.25" />
            <path d="M105 45 L108 35 L105 40" fill="none" stroke="#5d4e37" strokeWidth="0.5" opacity="0.25" />
            {/* Body suggestion */}
            <ellipse cx="100" cy="120" rx="25" ry="15" fill="none" stroke="#5d4e37" strokeWidth="0.5" opacity="0.2" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#wolf-pattern)" />
      </svg>
    ),
    castle: (
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        className={baseStyles}
        style={{ opacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="castle-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            {/* Hunedoara Castle inspired - angular towers */}
            <rect x="30" y="100" width="20" height="60" fill="none" stroke="#252932" strokeWidth="0.5" opacity="0.3" />
            <rect x="80" y="80" width="20" height="80" fill="none" stroke="#252932" strokeWidth="0.5" opacity="0.3" />
            <rect x="130" y="90" width="20" height="70" fill="none" stroke="#252932" strokeWidth="0.5" opacity="0.3" />
            {/* Tower tops - angular */}
            <path d="M30 100 L40 90 L50 100" fill="none" stroke="#252932" strokeWidth="0.5" opacity="0.3" />
            <path d="M80 80 L90 70 L100 80" fill="none" stroke="#252932" strokeWidth="0.5" opacity="0.3" />
            <path d="M130 90 L140 80 L150 90" fill="none" stroke="#252932" strokeWidth="0.5" opacity="0.3" />
            {/* Connecting walls */}
            <line x1="50" y1="120" x2="80" y2="120" stroke="#252932" strokeWidth="0.3" opacity="0.2" />
            <line x1="100" y1="120" x2="130" y2="120" stroke="#252932" strokeWidth="0.3" opacity="0.2" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#castle-pattern)" />
      </svg>
    ),
    heraldic: (
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        className={baseStyles}
        style={{ opacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="heraldic-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            {/* Shield shape */}
            <path
              d="M100 40 L120 50 L120 90 Q120 120 100 140 Q80 120 80 90 L80 50 Z"
              fill="none"
              stroke="#8B6F47"
              strokeWidth="0.5"
              opacity="0.2"
            />
            {/* Divider line */}
            <line x1="100" y1="50" x2="100" y2="140" stroke="#8B6F47" strokeWidth="0.3" opacity="0.15" />
            {/* Decorative elements */}
            <circle cx="100" cy="70" r="4" fill="none" stroke="#8B6F47" strokeWidth="0.3" opacity="0.15" />
            <circle cx="100" cy="110" r="4" fill="none" stroke="#8B6F47" strokeWidth="0.3" opacity="0.15" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#heraldic-pattern)" />
      </svg>
    ),
  };

  return <div className="absolute inset-0">{patterns[type]}</div>;
}

/**
 * Background pattern component - can be used as overlay
 */
export function DacianPatternOverlay({ 
  type = 'draco',
  intensity = 'low'
}: {
  type?: 'draco' | 'wolf' | 'castle' | 'heraldic';
  intensity?: 'low' | 'medium' | 'high';
}) {
  const opacityMap = {
    low: 0.015,
    medium: 0.025,
    high: 0.04,
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-1">
      <DacianMotifs type={type} opacity={opacityMap[intensity]} />
    </div>
  );
}
