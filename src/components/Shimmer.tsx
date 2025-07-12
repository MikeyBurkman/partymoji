import { styled, keyframes } from '@mui/material';

interface Props {
  width: number;
  height: number;
}

const shimmerAnimation = keyframes`
  to {
    background-position-x: 0%;
  }
`;

export const Shimmer = styled('div')<Props>`
  width: ${({ width }) => `${width}px`};
  height: ${({ height }) => `${height}px`};
  background: linear-gradient(-45deg, #eee 40%, #fafafa 50%, #eee 60%);
  background-size: 300%;
  background-position-x: 100%;
  animation: ${shimmerAnimation} 0.75s infinite ease;
`;
