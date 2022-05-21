import { Divider, Icon, Stack, Typography } from '@material-ui/core';
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
          <SectionHeader>
            Start by importing an image from your device
          </SectionHeader>
          <SectionText>You may choose a png, jpg, or gif</SectionText>
          <SectionText>
            The frames per second controls how fast the final gif will animate
          </SectionText>
        </Section>
      </Expandable>

      <Expandable
        mainEle={<Typography variant="h6">Adding effects</Typography>}
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
                thers may apply animated effects, such as making the image spin,
                or cycle through colors.
              </SectionText>
            </Section>
          </Section>

          <Divider />

          <Section>
            <SectionHeader>
              Animation effects require multiple animaion frames
            </SectionHeader>
            <SectionText>
              The "Adjust Image" effect has a "Frame Count" paramter.
            </SectionText>
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
              limits on the size of emojis.
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
              Whenever you add or change an effect, it will compute a new gif
              next to that effect.
            </SectionText>
            <SectionText>
              The gif next to each effect shows what the results of that effect
              on the previous gif were.
            </SectionText>
          </Section>

          <Divider />

          <Section>
            <SectionHeader>Exporting a GIF</SectionHeader>
            <SectionText>
              To export a gif, just right click on the gif next to an effect,
              and click "Save Image As...".
            </SectionText>
            <SectionText>
              Importing/exporting further down on the page is used if you want
              to share your Partymoji steps with someone else!
            </SectionText>
          </Section>
        </Group>
      </Expandable>
    </Group>
  </Expandable>
);

const Group: React.FC = ({ children }) => <Stack spacing={2}>{children}</Stack>;

const Section: React.FC = ({ children }) => (
  <Stack spacing={1}>{children}</Stack>
);

const SectionHeader: React.FC = ({ children }) => (
  <Typography variant="body1" paddingLeft="0.5rem">
    {children}
  </Typography>
);

const SectionText: React.FC = ({ children }) => (
  <Typography variant="caption" paddingLeft="1.0rem">
    <Icon sx={{ fontSize: 8, marginRight: 2 }}>circle</Icon> {children}
  </Typography>
);
