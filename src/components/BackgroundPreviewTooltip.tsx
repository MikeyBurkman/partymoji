import { HelpTooltip } from './HelpTooltip';

const TOOLTIP = [
  'The resulting image contains partial transparency, which gifs do not handle.',
  'A fake background has been applied to preview the gif better.',
].join(' ');

export const BackgroundPreviewTooltip: React.FC = () => {
  return <HelpTooltip description={TOOLTIP} />;
};
