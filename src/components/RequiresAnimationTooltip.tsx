import { Tooltip } from './Tooltip';
import { Column } from '~/layout';

const TooltipInner: React.FC = () => (
  <Column>
    <p>
      This is a static image.
      <br />
      This effect requires an animation in order to have any effect.
      <br />
      Be sure to add a "Set Animation Length" effect before this, so there are
      multiple animation frames.
    </p>
  </Column>
);

export const RequiresAnimationTooltip: React.FC = () => {
  return <Tooltip kind="warning" description={<TooltipInner />} />;
};
