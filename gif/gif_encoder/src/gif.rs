use gif::{Encoder, Frame, Repeat};
use std::collections::HashMap;
use std::io::Cursor;

pub fn create_gif(
    width: i32,
    height: i32,
    frames: Vec<u8>,
    fps: i32,
    transparent_color: Option<[u8; 4]>,
) -> Vec<u8> {
    let mut buffer = Cursor::new(Vec::new());

    {
        // Create a GIF encoder
        let mut encoder = Encoder::new(&mut buffer, width as u16, height as u16, &[]).unwrap();
        encoder.set_repeat(Repeat::Infinite).unwrap();

        let frame_size = (width * height * 4) as usize;
        let frame_count = frames.len() / frame_size;

        // Create a palette and indexed pixel buffer
        let mut palette = vec![0; 256 * 3]; // RGB palette for GIF (256 colors max)
        let mut palette_map = HashMap::new();
        let mut next_color_index = 0;

        for frame_index in 0..frame_count {
            let frame_base = frame_index * frame_size;
            let mut indexed_pixels = Vec::with_capacity((width * height) as usize);

            for y in 0..height {
                for x in 0..width {
                    let pixel_index = frame_base + ((y * width + x) * 4) as usize;

                    let r = frames[pixel_index];
                    let g = frames[pixel_index + 1];
                    let b = frames[pixel_index + 2];
                    let a = frames[pixel_index + 3];

                    // Handle transparency
                    if let Some(transparent) = transparent_color {
                        if [r, g, b, a] == transparent {
                            indexed_pixels.push(0); // Transparent index
                            continue;
                        }
                    }

                    // Map the color to an index in the palette
                    let color = (r, g, b);
                    let color_index = *palette_map.entry(color).or_insert_with(|| {
                        let index = next_color_index;
                        if index < 256 {
                            palette[index * 3] = r;
                            palette[index * 3 + 1] = g;
                            palette[index * 3 + 2] = b;
                            next_color_index += 1;
                            index
                        } else {
                            0 // Fallback to the first color if the palette is full
                        }
                    });

                    indexed_pixels.push(color_index as u8);
                }
            }

            // Create a GIF frame
            let mut frame = Frame::from_indexed_pixels(
                width as u16,
                height as u16,
                indexed_pixels,
                Some(0), // Index 0 is reserved for transparency
            );
            frame.delay = (100 / fps) as u16; // Frame delay in hundredths of a second

            frame.palette = Some(palette.clone());

            // Add the frame to the GIF
            encoder.write_frame(&frame).expect("Failed to write frame");
        }
    } // The encoder is dropped here, releasing the borrow on `buffer`

    buffer.into_inner()
}
