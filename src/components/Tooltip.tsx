import React from 'react';
import {
  styled,
  Tooltip as MuiTooltip,
  tooltipClasses,
  TooltipProps as MuiTooltipProps,
} from '@mui/material';
import { Help, Info, Warning } from '@mui/icons-material';

const HtmlTooltip = styled(({ className, ...props }: MuiTooltipProps) => (
  <MuiTooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}));

type Kind = 'help' | 'info' | 'warning';

interface TooltipProps {
  kind: Kind;
  description?: React.ReactNode;
}

const COLOR_MAP: Record<Kind, string> = {
  help: '#666666',
  info: '#9c27b0',
  warning: '#ed6c02',
};

const ICON_COMPONENT_MAP = {
  help: Help,
  info: Info,
  warning: Warning,
} satisfies Record<Kind, any>;

export const Tooltip: React.FC<TooltipProps> = ({ kind, description }) => {
  if (!description) {
    return null;
  }

  const Component = typeof description == 'string' ? HtmlTooltip : MuiTooltip;
  const InnerIcon = ICON_COMPONENT_MAP[kind];
  return (
    <Component title={description as any}>
      <InnerIcon htmlColor={COLOR_MAP[kind]} />
    </Component>
  );
};
