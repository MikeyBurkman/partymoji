use crate::GifCreationError;
use gif::{Encoder, Frame, Repeat};
use std::collections::HashMap;
use std::io::Cursor;

pub fn create_gif(
    width: i32,
    height: i32,
    frames: Vec<u8>,
    fps: i32,
    transparent_color: Option<[u8; 4]>,
    log: fn(String),
) -> Result<Vec<u8>, GifCreationError> {
    let mut buffer = Cursor::new(Vec::new());
    {
        // Create a GIF encoder
        let mut encoder = Encoder::new(&mut buffer, width as u16, height as u16, &[]).unwrap();
        encoder.set_repeat(Repeat::Infinite).unwrap();

        let frame_size = (width * height * 4) as usize;
        let frame_count = frames.len() / frame_size;

        let mut transparent_color_arr: [u8; 3] = [0; 3];
        let mut transparent_index: Option<u8> = None;
        if let Some(transparent) = transparent_color {
            let transparent_rgb = [transparent[0], transparent[1], transparent[2]];
            transparent_color_arr = transparent_rgb;
            transparent_index = Some(0);
            log(format!("Transparent color: {:?}", transparent_color_arr));
        }

        for frame_index in 0..frame_count {
            let frame_base = frame_index * frame_size;
            let mut indexed_pixels = Vec::with_capacity((width * height) as usize);

            // Create a palette and indexed pixel buffer
            let mut palette = vec![0; 256 * 3]; // RGB palette for GIF (256 colors max)
            let mut palette_map = HashMap::new();
            let mut next_color_index = 0;

            if (transparent_color.is_some()) && (next_color_index == 0) {
                // If we have a transparent color, we need to add it to the palette
                palette[0..3].copy_from_slice(&transparent_color_arr);
                next_color_index += 1;
            }

            for y in 0..height {
                for x in 0..width {
                    let pixel_index = frame_base + ((y * width + x) * 4) as usize;

                    let pixel_color = [
                        frames[pixel_index],
                        frames[pixel_index + 1],
                        frames[pixel_index + 2],
                    ];

                    // Handle transparency
                    if let Some(transparent_index) = transparent_index {
                        if pixel_color == transparent_color_arr {
                            indexed_pixels.push(transparent_index); // Transparent index
                            continue;
                        }
                    }

                    // Map the color to an index in the palette
                    let color = (pixel_color[0], pixel_color[1], pixel_color[2]);
                    let color_index = *palette_map.entry(color).or_insert_with(|| {
                        let index = next_color_index;
                        if index < 256 {
                            palette[index * 3..index * 3 + 3].copy_from_slice(&pixel_color);
                            next_color_index += 1;
                            index
                        } else {
                            log(format!(
                                "Palette overflow: color {:?}, frame_index: {}",
                                pixel_color, frame_index
                            ));
                            // Handle palette overflow gracefully
                            0
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
                transparent_index,
            );
            frame.delay = (100 / fps) as u16; // Frame delay in hundredths of a second

            frame.palette = Some(palette);

            // Add the frame to the GIF
            encoder.write_frame(&frame).expect("Failed to write frame");
        }
    } // The encoder is dropped here, releasing the borrow on `buffer`

    Ok(buffer.into_inner())
}
