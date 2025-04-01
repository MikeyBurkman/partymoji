import { Divider, Icon, Stack, Typography } from '@mui/material';
import React from 'react';
import { Expandable } from './Expandable';

export const Help: React.FC = () => (
  <Expandable
    mainEle={<Typography variant="h5">Click here for Help</Typography>}
  >
    <Group>
      <Expandable
        mainEle={<Typography variant="h6">Getting Started</Typography>}
      >
        <Section>
          <SectionHeader>Start by importing an image.</SectionHeader>
          <SectionText>
            You may upload a png, jpg, or gif from your device.
          </SectionText>
          <SectionText>
            Alternatively, you can post a URL to a png, jpg, or gif, though this
            can be a little flaky, and does not support animated images.
          </SectionText>
          <SectionText>
            The frames per second controls how fast the final gif will animate.
          </SectionText>
          <SectionText>
            Remember that gifs do not support partial transparency. A pixel will
            be either completely transparent, or not transparent at all. Some
            effects will create partially transparent pixels. When your gif has
            partially transparent pixels, you'll see a fake background applied
            behind it in the preview.
          </SectionText>
        </Section>
      </Expandable>

      <Expandable
        mainEle={<Typography variant="h6">Adding Effects</Typography>}
      >
        <Group>
          <Section>
            <Section>
              <SectionHeader>
                Effects are applied to an image to manipulate it
              </SectionHeader>
              <SectionText>
                Some may adjust the basic attributes of an image, such as size,
                or number of animation frames.
              </SectionText>
              <SectionText>
                Others may apply animated effects, such as making the image
                spin, or cycle through colors.
              </SectionText>
            </Section>
          </Section>

          <Divider />

          <Section>
            <SectionHeader>
              For static images, you'll likely want to first "Set Animation
              Length".
            </SectionHeader>
            <SectionText>
              This controls how many frames are in the animation. Typically this
              is between 10 and 20.
            </SectionText>
            <SectionText>
              More frames will increase both the time to compute the image, and
              the final file size.
            </SectionText>
            <SectionText>
              Remember that some places (like Slack and Discord) have strict
              limits on the file size of emojis, so you may need to reduce the
              number of frames in order to meet those requirements. Slack has a
              limit of 128kb, and Discord has a limit of 256kb.
            </SectionText>
          </Section>

          <Divider />

          <Section>
            <SectionHeader>
              If uploading to Slack or Discord, you will probably want to use
              "Adjust Image" to set the width and height.
            </SectionHeader>
            <SectionText>
              Slack has a limit of 128x128 pixels. Discord has a limit of
              256x256.
            </SectionText>
            <SectionText>
              Making images smaller will also decrease how long it takes to
              apply effects.
            </SectionText>
          </Section>

          <Divider />

          <Section>
            <SectionHeader>The order of effects matters</SectionHeader>
            <SectionText>
              The result of each effect is send to the next effect.
            </SectionText>
            <SectionText>
              Because of this, the order of effects matter.
            </SectionText>
            <SectionText>
              Experiment with moving effects around to see different effects.
            </SectionText>
            <SectionText>
              For instance, applying a background color before rotating the
              image will have a very different effect than rotating before
              setting a background color.
            </SectionText>
          </Section>
        </Group>
      </Expandable>

      <Expandable mainEle={<Typography variant="h6">Creating Gifs</Typography>}>
        <Group>
          <Section>
            <SectionHeader>Gifs will compute automatically</SectionHeader>
            <SectionText>
              Whenever you add an effect, it will automatically compute a new
              gif with that effect.
            </SectionText>
            <SectionText>
              The gif below each effect shows the results of that effect.
            </SectionText>
            <SectionText>
              Click on "Save Gif" at the bottom to export the final version of
              the gif after all effects have been applied.
            </SectionText>
          </Section>
        </Group>
      </Expandable>
    </Group>
  </Expandable>
);

const Group: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Stack spacing={2}>{children}</Stack>
);

const Section: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Stack width="sm" spacing={1}>
    {children}
  </Stack>
);

const SectionHeader: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <Typography variant="body1" paddingLeft="0.5rem">
    {children}
  </Typography>
);

const SectionText: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <Typography variant="body2" paddingLeft="1.0rem">
    <Icon sx={{ fontSize: 8, marginRight: 1 }}>circle</Icon> {children}
  </Typography>
);
