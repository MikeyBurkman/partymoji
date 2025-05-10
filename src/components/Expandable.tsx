import { Button, ClickAwayListener, Collapse } from '@mui/material';
import React, { JSX } from 'react';
import { Icon } from './Icon';
import { Column, Row } from '~/layout';

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
    <ClickAwayListener
      onClickAway={() => {
        setCollapsed(true);
      }}
    >
      <Column horizontalAlign="center">
        <Button
          variant="text"
          onClick={() => {
            setCollapsed(!collapsed);
          }}
          style={{ color: 'black' }}
          size="small"
        >
          <Row verticalAlign="middle">
            <div>{mainEle}</div>
            <Icon name={collapsed ? 'ExpandMore' : 'ExpandLess'} />
          </Row>
        </Button>
        <Collapse in={!collapsed}>{children}</Collapse>
      </Column>
    </ClickAwayListener>
  );
};
