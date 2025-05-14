import styled from 'styled-components';
import React, { ReactElement } from 'react';
import { IconProps } from './Icon';

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  icon?: ReactElement<IconProps>;
  variant?: 'primary' | 'secondary' | 'warning';
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  icon,
  variant = 'primary',
  disabled = false,
  size = 'medium',
}) => (
  <StyledButton
    onClick={onClick}
    disabled={disabled}
    $variant={variant}
    $size={size}
    type="button"
  >
    {icon && <IconWrapper>{icon}</IconWrapper>}
    {children}
  </StyledButton>
);

const StyledButton = styled.button<{
  $variant: 'primary' | 'secondary' | 'warning';
  $size: 'small' | 'medium' | 'large';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 4px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  padding: ${({ $size }) => {
    switch ($size) {
      case 'small':
        return '6px 12px';
      case 'large':
        return '12px 24px';
      default:
        return '8px 16px';
    }
  }};

  background-color: ${({ $variant }) => {
    switch ($variant) {
      case 'secondary':
        return '#6c757d';
      case 'warning':
        return '#ed6c02';
      default:
        return '#007bff';
    }
  }};

  color: white;
  font-size: ${({ $size }) => {
    switch ($size) {
      case 'small':
        return '0.875rem';
      case 'large':
        return '1.25rem';
      default:
        return '1rem';
    }
  }};

  &:hover:not(:disabled) {
    filter: brightness(90%);
  }

  &:active:not(:disabled) {
    filter: brightness(80%);
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;
