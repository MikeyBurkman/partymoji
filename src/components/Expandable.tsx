import React from 'react';
import {
  Collapse,
  Icon,
  Box,
  Button,
  ClickAwayListener,
  Stack,
} from '@material-ui/core';

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
          style={{ textTransform: 'none' }}
        >
          <Stack direction="row" spacing={4}>
            <div>{mainEle}</div>
            <Icon>{collapsed ? 'expand_less' : 'expand_more'}</Icon>
          </Stack>
        </Button>
        <Collapse in={!collapsed}>{children}</Collapse>
      </Box>
    </ClickAwayListener>
  );
};
