import React from 'react';
import { Fab, IconProps as MuiIconProps, SxProps } from '@mui/material';
import * as MuiIcons from '@mui/icons-material';
export type IconNames = keyof typeof MuiIcons;

export interface ClickableIconProps {
  name: IconNames;
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
      size="small"
      disabled={isDisabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      color={hover ? 'secondary' : 'primary'}
    >
      <Icon name={name} sx={{ mr: 1 }} />
      {label}
    </Fab>
  );
};

export interface IconProps {
  name: IconNames;
  color?: MuiIconProps['color'];
  sx?: SxProps;
}

export const Icon: React.FC<IconProps> = ({ name, color, sx }) => {
  const IconComponent = MuiIcons[name];
  return <IconComponent htmlColor={color} sx={sx} />;
};
