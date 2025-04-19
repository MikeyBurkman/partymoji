import { Button, ClickAwayListener, Collapse, Stack } from '@mui/material';
import React, { JSX } from 'react';
import { Icon } from './Icon';

interface ExpandableProps {
  mainEle: JSX.Element;
  children?: React.ReactNode;
}

export const Expandable: React.FC<ExpandableProps> = ({
  mainEle,
  children,
}) => {
  const [collapsed, setCollapsed] = React.useState(true);

  return (
    <ClickAwayListener onClickAway={() => { setCollapsed(true); }}>
      <Stack>
        <Button
          variant="text"
          onClick={() => { setCollapsed(!collapsed); }}
          style={{ color: 'black' }}
          size="small"
        >
          <Stack direction="row" alignItems="center" spacing={4}>
            <div>{mainEle}</div>
            <Icon name={collapsed ? 'Add' : 'Remove'} />
          </Stack>
        </Button>
        <Collapse in={!collapsed}>{children}</Collapse>
      </Stack>
    </ClickAwayListener>
  );
};
