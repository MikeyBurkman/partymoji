import { AppState } from '~/domain/types';
import { Help } from '~/components/Help';
import { Column } from '../layout/Column';
import { SourceImage } from '~/components/SourceImage';
import { logger } from '~/domain/utils';

export const Header: React.FC<{
  state: AppState;
  setState: (
    fn: (oldState: AppState) => AppState,
    {
      compute,
    }: {
      compute: 'no' | 'now' | 'later';
    },
  ) => void;
  setAlert: (alert: { severity: 'error' | 'warning'; message: string }) => void;
}> = ({ state, setState, setAlert }) => {
  return (
    <>
      <Column horizontalAlign="center">
        <Help />
        <SourceImage
          baseImage={state.baseImage}
          fps={state.fps}
          frameCount={state.frameCount}
          onImageChange={(baseImage, fname, fps) => {
            setState(
              (prevState) => ({
                ...prevState,
                baseImage,
                fname,
                fps,
                frameCount: baseImage.image.frames.length,
              }),
              { compute: 'now' },
            );
          }}
          onFpsChange={(fps) => {
            setState(
              (prevState) => ({
                ...prevState,
                fps,
              }),
              { compute: 'later' },
            );
          }}
          onFrameCountChange={(frameCount) => {
            logger.info('Frame count changed', { frameCount });
            setState(
              (prevState) => ({
                ...prevState,
                frameCount,
              }),
              { compute: 'later' },
            );
          }}
          setAlert={setAlert}
        />
      </Column>
    </>
  );
};
