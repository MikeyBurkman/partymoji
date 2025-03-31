import { Icon, Tooltip } from '@mui/material';
import React from 'react';

interface TooltipProps {
  description?: string;
}

export const HelpTooltip: React.FC<TooltipProps> = ({ description }) =>
  description ? (
    <Tooltip title={description}>
      <Icon fontSize="small" color="action">
        help
      </Icon>
    </Tooltip>
  ) : null;
