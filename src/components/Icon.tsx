import React from 'react';
import {
  Icon as MuiIcon,
  styled,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  IconProps as MuiIconProps,
} from '@material-ui/core';

// From https://mui.com/material-ui/material-icons/
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
  | 'save_alt'
  | 'warning';

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
  const inner = <MuiIcon color={color}>{name}</MuiIcon>;
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
