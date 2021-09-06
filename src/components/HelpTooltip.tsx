import React from 'react';
import { Tooltip, Icon } from '@material-ui/core';

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
