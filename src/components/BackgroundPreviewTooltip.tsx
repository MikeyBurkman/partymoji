import { Stack, Typography } from '@mui/material';
import { Icon } from './Icon';

const TooltipInner: React.FC = () => (
  <Stack spacing={1}>
    <Typography>This resulting image contains partial transparency</Typography>
    <Typography variant="caption">
      Gifs do not handle partial transparency, so a fake background has been
      applied to the preview.
    </Typography>
    <Typography variant="caption">
      Be sure to add some effect after this that affects the "background", or
      else anything that is partially transparent will be made either fully
      transparent, or fully opaque.
    </Typography>
  </Stack>
);

export const BackgroundPreviewTooltip: React.FC = () => {
  return (
    <Icon
      name="Info"
      color="secondary"
      tooltip={<TooltipInner />}
      htmlTooltip
    />
  );
};
