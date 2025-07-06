import { Container, Divider, Paper, Stack, Typography } from '@mui/material';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import React from 'react';
import { Help } from '~/components/Help';
import { ImageEffectList } from '~/components/ImageEffectList';
import type { AppState } from '~/domain/types';
import { POSSIBLE_EFFECTS } from '~/effects';
import { SourceImage } from './components/SourceImage';
import {
  AlertProvider,
  AlertSnackbar,
  useSetAlert,
} from './context/AlertContext';
import { logger } from './domain/utils';
import { IS_MOBILE } from './domain/utils/isMobile';
import './App.css';
import {
  AppStateContext,
  AppStateContextProps,
  AppStateProvider,
} from './context/stateContext';

// Contains the "help" and Image Source sections.
const Header: React.FC<{
  state: AppState;
  setState: AppStateContextProps['setState'];
  setAlert: (alert: { severity: 'error' | 'warning'; message: string }) => void;
}> = ({ state, setState, setAlert }) => {
  return (
    <>
      <Section>
        <Help />
      </Section>
      <Section>
        <SourceImage
          baseImage={state.baseImage}
          fps={state.fps}
          frameCount={state.frameCount}
          onImageChange={(baseImage, fname, fps) => {
            setState((prevState) => ({
              ...prevState,
              baseImage,
              fname,
              fps,
              frameCount: baseImage.image.frames.length,
            }));
          }}
          onFpsChange={(fps) => {
            setState(
              (prevState) => ({
                ...prevState,
                fps,
              }),
              'debounce',
            );
          }}
          onFrameCountChange={(frameCount) => {
            logger.info('Frame count changed', { frameCount });
            setState(
              (prevState) => ({
                ...prevState,
                frameCount,
              }),
              'debounce',
            );
          }}
          setAlert={setAlert}
        />
      </Section>
    </>
  );
};

// The main body component of the whole app.
const Inner: React.FC = () => {
  const setAlert = useSetAlert();
  const { state, setState } = React.use(AppStateContext);

  React.useEffect(() => {
    if (IS_MOBILE) {
      setAlert({
        severity: 'warning',
        message:
          'This app is not well optimized for mobile. Your experience may not be great.',
      });
    }
  }, [setAlert]);

  return (
    <>
      <ScopedCssBaseline />
      <Container maxWidth={IS_MOBILE ? 'sm' : 'md'}>
        <Stack
          spacing={4}
          justifyContent="space-evenly"
          alignItems="center"
          width={IS_MOBILE ? 'sm' : undefined}
          divider={<Divider />}
        >
          <Typography variant="h2" pt={4}>
            Partymoji
          </Typography>
          <Stack spacing={4} divider={<Divider />}>
            <Header state={state} setState={setState} setAlert={setAlert} />
            {state.baseImage != null && (
              <>
                <Section>
                  <ImageEffectList
                    appState={state}
                    possibleEffects={POSSIBLE_EFFECTS}
                    onEffectsChange={(effects) => {
                      setState((prevState) => ({
                        ...prevState,
                        effects,
                      }));
                    }}
                  />
                </Section>
                {/* {state.effects.length > 0 && (
                  <Section>
                    <Stack spacing={3}>
                      <Typography variant="h5">Clear Effects</Typography>
                      <Typography variant="body1">
                        <Icon name="Warning" color="warning" /> Clicking this
                        button will clear all effects for the image
                      </Typography>
                      <Button
                        startIcon={<Icon name="Clear" />}
                        sx={{ maxWidth: '300px' }}
                        variant="contained"
                        color="warning"
                        onClick={() => {

                          const newState: AppState = {
                            ...DEFAULT_STATE,
                            baseImage: state.baseImage,
                          };
                          setStateRaw(newState);
                          localStorage.saveAppState(newState);
                        }}
                      >
                        Clear Effects
                      </Button>
                    </Stack>
                  </Section>
                )} */}
              </>
            )}
            <a
              href="https://github.com/MikeyBurkman/partymoji"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
                width={64}
                height={64}
                alt="Github Link"
              ></img>
            </a>
          </Stack>
        </Stack>
      </Container>

      <Stack pt={8}>
        <AlertSnackbar />
      </Stack>
    </>
  );
};

const Section: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Paper style={{ padding: 16, maxWidth: IS_MOBILE ? '300px' : undefined }}>
    {children}
  </Paper>
);

export const App: React.FC = () => {
  return (
    <AppStateProvider>
      <AlertProvider>
        <Inner />
      </AlertProvider>
    </AppStateProvider>
  );
};
