import styled from 'styled-components';
import React from 'react';

interface DividerProps {
  children?: React.ReactNode;
  py?: number;
}

export const Divider: React.FC<DividerProps> = ({ children, py = 0 }) => {
  if (!children) {
    return <StyledDivider $py={py} />;
  }

  return (
    <DividerWithContent $py={py}>
      <Line />
      <Content>{children}</Content>
      <Line />
    </DividerWithContent>
  );
};

const StyledDivider = styled.hr<{ $py: number }>`
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  margin: 0;
  padding: ${({ $py }) => $py * 8}px 0;
`;

const DividerWithContent = styled.div<{ $py: number }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: ${({ $py }) => $py * 8}px 0;
`;

const Line = styled.div`
  flex: 1;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.12);
`;

const Content = styled.div`
  padding: 0 16px;
`;
