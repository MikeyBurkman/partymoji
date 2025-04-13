import React from 'react';
import {
  Fab,
  IconProps as MuiIconProps,
  SxProps,
  SvgIcon,
} from '@mui/material';
import {
  Add,
  Clear,
  Delete,
  Image,
  PriorityHigh,
  Remove,
  SaveAlt,
  Settings,
  Warning,
} from '@mui/icons-material';

export type IconName =
  | 'Add'
  | 'Clear'
  | 'Delete'
  | 'Image'
  | 'PriorityHigh'
  | 'Remove'
  | 'SaveAlt'
  | 'Settings'
  | 'Warning';

const iconNameMap: { [key in IconName]: typeof SvgIcon } = {
  Add: Add,
  Clear: Clear,
  Delete: Delete,
  Image: Image,
  PriorityHigh: PriorityHigh,
  Remove: Remove,
  SaveAlt: SaveAlt,
  Settings: Settings,
  Warning: Warning,
};

const MuiIconByName = (name: IconName) => {
  const IconComponent = iconNameMap[name];
  if (!IconComponent) {
    throw new Error(`Icon ${name} not found`);
  }
  return IconComponent;
};

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
  color?: MuiIconProps['color'];
  sx?: SxProps;
}

export const Icon: React.FC<IconProps> = ({ name, color, sx }) => {
  const IconComponent = MuiIconByName(name);
  return <IconComponent htmlColor={color} sx={sx} />;
};
