import React from 'react';
import cn from 'classnames';

interface InlineIconProps {
  iconClassName: string;
  onClick?: () => void;
}

export const InlineIcon: React.FC<InlineIconProps> = ({
  iconClassName,
  onClick,
}) => {
  return (
    <span
      className={cn('icon', 'column', onClick ? 'is-clickable' : undefined)}
      style={{ display: 'revert' }}
      onClick={onClick}
    >
      <i className={cn('fas', iconClassName)} aria-hidden="true"></i>
    </span>
  );
};
