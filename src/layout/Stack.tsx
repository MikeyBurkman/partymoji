import styled from 'styled-components';
import React from 'react';
import { ReactNode } from 'react';

export interface StackProps {
  children: ReactNode;
  spacing?: number;
  direction?: 'row' | 'column';
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  divider?: ReactNode;
  width?: string;
  pt?: number;
}

export const Stack: React.FC<StackProps> = ({
  children,
  spacing = 1,
  direction = 'column',
  justifyContent,
  alignItems,
  divider,
  width,
  pt,
}) => {
  const childrenArray = Array.isArray(children) ? children : [children];
  const filteredChildren = childrenArray.filter(Boolean);

  return (
    <StyledStack
      $spacing={spacing}
      $direction={direction}
      $justifyContent={justifyContent}
      $alignItems={alignItems}
      $width={width}
      $pt={pt}
    >
      {filteredChildren.map((child, index) => (
        // eslint-disable-next-line react-x/no-array-index-key
        <React.Fragment key={index}>
          {child}
          {divider && index < childrenArray.length - 1 && divider}
        </React.Fragment>
      ))}
    </StyledStack>
  );
};

const StyledStack = styled.div<{
  $spacing?: number;
  $direction?: 'row' | 'column';
  $justifyContent?: string;
  $alignItems?: string;
  $width?: string;
  $pt?: number;
}>`
  display: flex;
  flex-direction: ${({ $direction }) => $direction};
  gap: ${({ $spacing }) => $spacing * 8}px;
  justify-content: ${({ $justifyContent }) => $justifyContent};
  align-items: ${({ $alignItems }) => $alignItems};
  width: ${({ $width }) => $width};
  padding-top: ${({ $pt }) => ($pt ? `${$pt * 8}px` : undefined)};
`;
