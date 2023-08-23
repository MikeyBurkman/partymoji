import React from 'react';
import { Icon as MuiIcon, Tooltip } from '@material-ui/core';

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
  tooltip?: string;
}

export const ClickableIcon: React.FC<ClickableIconProps> = ({
  name,
  onClick,
  isDisabled,
  tooltip,
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
  const onClickAction = React.useCallback(() => {
    if (isDisabled === true) {
      return;
    }
    onClick?.();
  }, [onClick, isDisabled]);

  const color = React.useMemo(() => {
    if (isDisabled) {
      return 'disabled';
    }
    return hover ? 'secondary' : 'primary';
  }, [isDisabled, hover]);

  const icon = (
    <MuiIcon
      onClick={onClickAction}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      color={color}
      style={{ cursor: isDisabled ? undefined : 'pointer' }}
    >
      {name}
    </MuiIcon>
  );

  if (tooltip) {
    return <Tooltip title={tooltip}>{icon}</Tooltip>;
  }

  return icon;
};

export interface IconProps {
  name: Icons;
}

export const Icon: React.FC<IconProps> = ({ name }) => (
  <MuiIcon>{name}</MuiIcon>
);
