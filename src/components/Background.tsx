import React from 'react';

/**
 * Modern, clean, sleek professional background.
 * Replaces the old canvas particles/discs with a subtle mesh gradient & delicate geometric grid.
 */
const Background: React.FC = () => {
  return (
    <div className="enterprise-bg" aria-hidden="true">
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-glow bg-glow-3" />
      <div className="bg-grid-overlay" />
    </div>
  );
};

export default Background;
