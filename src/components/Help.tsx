import { Divider, Stack, Typography } from '@material-ui/core';
import React from 'react';
import { Expandable } from './Expandable';

const HELP = [
  {
    header: 'Getting Started',
    data: [
      {
        header: 'Start by importing an image from your device',
        data: [
          'You may choose a png, jpg, or gif',
          'The frames per second controls how fast the final gif will animate',
        ],
      },
    ],
  },
  {
    header: 'Adding effects',
    data: [
      {
        header: 'Effects are applied to an image to manipulate it',
        data: [
          'Some may adjust the basic attributes of an image, such as size, or number of animation frames.',
          'Others may apply animated effects, such as making the image spin, or cycle through colors.',
        ],
      },
      {
        header: 'Animation effects require multiple animaion frames',
        data: [
          'The "Adjust Image" effect has a "Frame Count" paramter.',
          'This controls how many frames are in the animation. Typically this is between 10 and 20',
          'More frames will increase both the time to compute the image, and the final file size',
          'Remember that some places (like Slack and Discord) have strict limits on the size of emojis.',
        ],
      },
      {
        header: 'The order of effects matters',
        data: [
          'The result of each effect is send to the next effect.',
          'Because of this, the order of effects matter.',
          'Experiment with moving effects around to see different effects.',
          'For instance, applying a background color before rotating the image will have a very different effect than rotating before setting a background color',
        ],
      },
    ],
  },
  {
    header: 'Creating Gifs',
    data: [
      {
        header: 'Gifs will compute automatically',
        data: [
          'Whenever you add or change an effect, it will compute a new gif next to that effect',
          'The gif next to each effect shows what the results of that effect on the previous gif were',
        ],
      },
      {
        header: 'Exporting a GIF',
        data: [
          'To export a gif, just right click on the gif next to an effect, and click "Save Image As..."',
          'Importing/exporting further down on the page is used if you want to share your Partymoji steps with someone else!',
        ],
      },
    ],
  },
];

export const Help: React.FC = () => (
  <Expandable
    mainEle={<Typography variant="h5">Click here for Help</Typography>}
  >
    <Stack spacing={1}>
      {HELP.map((section, sectionIdx) => (
        <>
          {sectionIdx > 0 && <Divider />}
          <Typography variant="h6">{section.header}</Typography>
          {section.data.map((subsection) => (
            <>
              <Typography variant="body1" paddingLeft="0.5rem">
                {subsection.header}
              </Typography>
              {subsection.data.map((subsectionData) => (
                <Typography variant="caption" paddingLeft="1.0rem">
                  * {subsectionData}
                </Typography>
              ))}
            </>
          ))}
        </>
      ))}
    </Stack>
  </Expandable>
);
