import { Stack, Typography } from '@mui/material';
import { Tooltip } from './Tooltip';

const TooltipInner: React.FC = () => (
  <Stack spacing={1}>
    <Typography>This is a static image</Typography>
    <Typography variant="caption">
      This effect requires an animation in order to have any effect.
    </Typography>
    <Typography variant="caption">
      Be sure to add a "Set Animation Length" effect before this, so there are
      multiple animation frames.
    </Typography>
  </Stack>
);

export const RequiresAnimationTooltip: React.FC = () => {
  return <Tooltip kind="warning" description={<TooltipInner />} />;
};
