import styled from 'styled-components';
import { IS_MOBILE } from '~/domain/utils/isMobile';

// Styled-components
export const Section = styled.div`
  padding: 16px;
  max-width: ${IS_MOBILE ? '300px' : 'none'};
  background-color: #fff;
  box-shadow:
    0px 1px 3px rgba(0, 0, 0, 0.2),
    0px 1px 1px rgba(0, 0, 0, 0.14),
    0px 2px 1px rgba(0, 0, 0, 0.12);
  border-radius: 4px;
`;
