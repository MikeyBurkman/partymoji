import React from 'react';
import {
  Collapse,
  Grid,
  Icon,
  IconButton,
  Box,
  Button,
  ClickAwayListener,
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
      <Box sx={{ flexGrow: 1 }}>
        <Button
          onClick={() => setCollapsed(!collapsed)}
          style={{ textTransform: 'none' }}
        >
          <Grid container spacing={6}>
            <Grid item>{mainEle}</Grid>
            <Grid item>
              <Icon>{collapsed ? 'expand_less' : 'expand_more'}</Icon>
            </Grid>
          </Grid>
        </Button>
        <Collapse in={!collapsed}>{children}</Collapse>
      </Box>
    </ClickAwayListener>
  );
};
