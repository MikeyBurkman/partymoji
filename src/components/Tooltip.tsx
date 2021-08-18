import React from 'react';

export const Tooltip: React.FC<{ text: string }> = ({ text }) => {
  return (
    <span className="icon column">
      <i className="fas fa-question-circle" aria-hidden="true" title={text}></i>
    </span>
  );
};