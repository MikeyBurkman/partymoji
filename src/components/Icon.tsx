import React from 'react';
import { Fab, Icon as MuiIcon } from '@material-ui/core';

export type Icons =
  | 'add'
  | 'remove'
  | 'clear'
  | 'circle'
  | 'delete'
  | 'arrow_upward'
  | 'arrow_downward'
  | 'arrow_right'
  | 'arrow_left'
  | 'arrow_circle_right'
  | 'arrow_circle_left'
  | 'keyboard_double_arrow_right'
  | 'keyboard_double_arrow_left'
  | 'edit'
  | 'image'
  | 'priority_high'
  | 'list'
  | 'settings'
  | 'save_alt';

export interface ClickableIconProps {
  name: Icons;
  onClick?: () => void;
  isDisabled?: boolean;
  label: string;
}

export const ClickableIcon: React.FC<ClickableIconProps> = ({
  name,
  onClick,
  isDisabled,
  label,
}) => {
  const [hover, setHover] = React.useState(false);

  const onMouseEnter = React.useCallback(() => {
    if (onClick) {
      setHover(true);
    }
  }, [onClick]);

  const onMouseLeave = React.useCallback(() => {
    if (onClick) {
      setHover(false);
    }
  }, [onClick]);

  return (
    <Fab
      variant="extended"
      disabled={isDisabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      color={hover ? 'secondary' : 'primary'}
    >
      <MuiIcon sx={{ mr: 1 }}>{name}</MuiIcon>
      {label}
    </Fab>
  );
};

export interface IconProps {
  name: Icons;
}

export const Icon: React.FC<IconProps> = ({ name }) => (
  <MuiIcon>{name}</MuiIcon>
);
