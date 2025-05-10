import styled from 'styled-components';
import React from 'react';

export type JustifyContentExtras =
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

export type AlignItemsExtras = 'stretch' | 'baseline';

export type JustifyContentType =
  | 'flex-start'
  | 'center'
  | 'flex-end'
  | JustifyContentExtras;

export type AlignItemsType =
  | 'flex-start'
  | 'center'
  | 'flex-end'
  | AlignItemsExtras;

export interface FlexContainerProps {
  children: React.ReactNode;
  gap?: number;
  alignItems?: AlignItemsType;
  justifyContent?: JustifyContentType;
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  width?: string;
  padding?: number;
  direction: 'row' | 'column';
  height?: string;
}

export const FlexContainer = styled.div<{
  $gap: number;
  $alignItems: AlignItemsType;
  $justifyContent: JustifyContentType;
  $wrap: string;
  $width?: string;
  $padding?: number;
  $direction: 'row' | 'column';
  $height?: string;
}>`
  display: flex;
  flex-direction: ${({ $direction }) => $direction};
  gap: ${({ $gap }) => $gap * 8}px;
  align-items: ${({ $alignItems }) => $alignItems};
  justify-content: ${({ $justifyContent }) => $justifyContent};
  flex-wrap: ${({ $wrap }) => $wrap};
  width: ${({ $width }) => $width};
  height: ${({ $height }) => $height};
  padding: ${({ $padding }) => ($padding ? `${$padding * 8}px` : undefined)};
`;
