import React from 'react';
import {
  Fab,
  styled,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  IconProps as MuiIconProps,
  SxProps,
} from '@mui/material';
import * as MuiIcons from '@mui/icons-material';
export type IconNames = keyof typeof MuiIcons;

const MuiIcon: React.FC<{
  name: IconNames;
  color?: string;
  sx?: SxProps;
}> = ({ name, color, sx }) => {
  const IconComponent = MuiIcons[name];

  return <IconComponent htmlColor={color} sx={sx} />;
};

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}));

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
      <MuiIcon name={name} sx={{ mr: 1 }} />
      {label}
    </Fab>
  );
};

export interface IconProps {
  name: IconNames;
  htmlTooltip?: boolean;
  tooltip?: React.ReactNode;
  color?: MuiIconProps['color'];
}

export const Icon: React.FC<IconProps> = ({
  name,
  tooltip,
  htmlTooltip,
  color,
}) => {
  const inner = <MuiIcon name={name} color={color} />;
  if (tooltip) {
    return htmlTooltip ? (
      <HtmlTooltip title={tooltip}>{inner}</HtmlTooltip>
    ) : (
      <Tooltip title={tooltip}>{inner}</Tooltip>
    );
  } else {
    return inner;
  }
};
