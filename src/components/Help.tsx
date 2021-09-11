import React from 'react';
import { Divider, Stack, Typography } from '@material-ui/core';
import { Expandable } from './Expandable';

const HELP = [
  {
    header: 'Getting Started',
    data: [
      {
        header: 'Start by importing an image from your device',
        data: ['You may choose a png, jpg, or gif'],
      },
    ],
  },
  {
    header: 'Adding transforms',
    data: [
      {
        header: 'Transforms are effects that are applied to an image',
        data: [
          'Some may adjust the basic attributes of an image, such as size, or number of animation frames.',
          'Others may apply animated effects, such as making the image spin, or cycle through colors.',
        ],
      },
      {
        header: 'Animation transforms require multiple animaion frames',
        data: [
          'The "Adjust Image" transform has a "Frame Count" paramter.',
          'This controls how many frames are in the animation. Typically this is between 10 and 20',
          '',
        ],
      },
      {
        header: 'The order of transforms matters',
        data: [
          'The result of each transform is send to the next transform.',
          'Because of this, the order of transforms matter.',
          'Experiment with moving transforms around to see different effects.',
        ],
      },
    ],
  },
  {
    header: 'Build the final gif(s)',
    data: [
      {
        header: 'Set the frames per second (FPS)',
        data: ['The FPS determines how fast the animation will be'],
      },
    ],
  },
];

export const Help: React.FC = () => (
  <Expandable mainEle={<Typography variant="h5">Help</Typography>}>
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
