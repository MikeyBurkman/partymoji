import {
  Box,
  Button,
  ClickAwayListener,
  Collapse,
  Icon,
  Stack,
} from '@material-ui/core';
import React from 'react';

interface ExpandableProps {
  mainEle: JSX.Element;
}

export const Expandable: React.FC<ExpandableProps> = ({
  mainEle,
  children,
}) => {
  const [collapsed, setCollapsed] = React.useState(true);

  return (
    <ClickAwayListener onClickAway={() => setCollapsed(true)}>
      <Box>
        <Button
          onClick={() => setCollapsed(!collapsed)}
          style={{ textTransform: 'none', color: 'black' }}
        >
          <Stack direction="row" spacing={4}>
            <div>{mainEle}</div>
            <Icon>{collapsed ? 'add' : 'remove'}</Icon>
          </Stack>
        </Button>
        <Collapse in={!collapsed}>{children}</Collapse>
      </Box>
    </ClickAwayListener>
  );
};
