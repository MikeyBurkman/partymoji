import React from 'react';
import {
  AlignItemsExtras,
  FlexContainer,
  JustifyContentExtras,
  type FlexContainerProps,
} from './FlexContainer';

type ColumnProps = Omit<
  FlexContainerProps,
  'direction' | 'justifyContent' | 'alignItems'
> & {
  horizontalAlign?: 'left' | 'center' | 'right' | AlignItemsExtras;
  verticalAlign?: 'top' | 'middle' | 'bottom' | JustifyContentExtras;
};

export const Column: React.FC<ColumnProps> = ({
  children,
  gap = 1,
  horizontalAlign = 'left',
  verticalAlign = 'middle',
  wrap = 'nowrap',
  width,
  padding,
  height,
  backgroundColor,
}) => {
  const alignItems = React.useMemo(() => {
    switch (horizontalAlign) {
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      default:
        return horizontalAlign;
    }
  }, [horizontalAlign]);

  const justifyContent = React.useMemo(() => {
    switch (verticalAlign) {
      case 'top':
        return 'flex-start';
      case 'bottom':
        return 'flex-end';
      case 'middle':
        return 'center';
      default:
        return verticalAlign;
    }
  }, [verticalAlign]);

  return (
    <FlexContainer
      $gap={gap}
      $alignItems={alignItems}
      $justifyContent={justifyContent}
      $wrap={wrap}
      $width={width}
      $padding={padding}
      $direction="column"
      $height={height}
      $backgroundColor={backgroundColor}
    >
      {children}
    </FlexContainer>
  );
};
