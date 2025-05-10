import React from 'react';
import { Fab, IconProps as MuiIconProps, SxProps } from '@mui/material';
import {
  Add,
  Clear,
  Delete,
  Edit,
  ExpandLess,
  ExpandMore,
  Image,
  PriorityHigh,
  Remove,
  SaveAlt,
  Settings,
  Warning,
} from '@mui/icons-material';

const iconImports = {
  Add,
  Clear,
  Delete,
  Edit,
  ExpandLess,
  ExpandMore,
  Image,
  PriorityHigh,
  Remove,
  SaveAlt,
  Settings,
  Warning,
};

export type IconName = keyof typeof iconImports;
export type IconColor = MuiIconProps['color'];

export interface ClickableIconProps {
  name: IconName;
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
  name: IconName;
  color?: IconColor;
  sx?: SxProps;
}

export const Icon: React.FC<IconProps> = ({ name, color, sx }) => {
  const IconComponent = iconImports[name];
  return <IconComponent htmlColor={color} sx={sx} />;
};
