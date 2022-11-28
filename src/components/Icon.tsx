import React from 'react';
import { Icon as MuiIcon } from '@material-ui/core';

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
  | 'edit'
  | 'image'
  | 'priority_high'
  | 'list'
  | 'settings'
  | 'save_alt';

export interface IconProps {
  name: Icons;
}

export const Icon: React.FC<IconProps> = ({ name }) => (
  <MuiIcon>{name}</MuiIcon>
);
