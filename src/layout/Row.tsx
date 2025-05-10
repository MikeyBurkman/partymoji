import React from 'react';
import {
  AlignItemsExtras,
  FlexContainer,
  JustifyContentExtras,
  type FlexContainerProps,
} from './FlexContainer';

type RowProps = Omit<
  FlexContainerProps,
  'direction' | 'justifyContent' | 'alignItems'
> & {
  horizontalAlign?: 'left' | 'center' | 'right' | JustifyContentExtras;
  verticalAlign?: 'top' | 'middle' | 'bottom' | AlignItemsExtras;
};

export const Row: React.FC<RowProps> = ({
  children,
  gap = 1,
  horizontalAlign = 'center',
  verticalAlign = 'middle',
  wrap = 'nowrap',
  width,
  padding,
  height,
}) => {
  const alignItems = (() => {
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
  })();

  const justifyContent = (() => {
    switch (horizontalAlign) {
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      default:
        return horizontalAlign;
    }
  })();

  return (
    <FlexContainer
      $gap={gap}
      $alignItems={alignItems}
      $justifyContent={justifyContent}
      $wrap={wrap}
      $width={width}
      $padding={padding}
      $direction="row"
      $height={height}
    >
      {children}
    </FlexContainer>
  );
};
