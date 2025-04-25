use crate::GifCreationError;
use color_quant::NeuQuant;
use gif::{Encoder, Frame, Repeat};
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
        let mut encoder = Encoder::new(&mut buffer, width as u16, height as u16, &[]).unwrap();
        encoder.set_repeat(Repeat::Infinite).unwrap();

        let frame_size = (width * height * 4) as usize;
        let frame_count = frames.len() / frame_size;

        for frame_index in 0..frame_count {
            let frame_base = frame_index * frame_size;
            let frame_pixels = &frames[frame_base..frame_base + frame_size];

            // Step 1: Extract RGB values
            let mut rgb_pixels = Vec::new();
            for chunk in frame_pixels.chunks(4) {
                rgb_pixels.push(chunk[0]); // Red
                rgb_pixels.push(chunk[1]); // Green
                rgb_pixels.push(chunk[2]); // Blue
            }

            // Step 2: Quantize colors to 256 or fewer
            let quantizer = NeuQuant::new(10, 256, &rgb_pixels);
            let palette = quantizer.color_map_rgb(); // Get the quantized palette

            // Step 3: Map each pixel to the closest color in the palette
            let indexed_pixels = map_pixels_to_palette(&rgb_pixels, &palette);

            // Step 4: Handle transparency
            let mut transparent_index: Option<u8> = None;
            if let Some(transparent) = transparent_color {
                if let Some(index) = palette
                    .chunks(3)
                    .position(|color| color == &transparent[0..3])
                {
                    transparent_index = Some(index as u8);
                }
            }

            // Step 5: Create a GIF frame
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

fn map_pixels_to_palette(rgb_pixels: &[u8], palette: &[u8]) -> Vec<u8> {
    let mut indexed_pixels = Vec::new();

    for chunk in rgb_pixels.chunks(3) {
        let r = chunk[0];
        let g = chunk[1];
        let b = chunk[2];

        // Find the closest color in the palette
        let mut closest_index = 0;
        let mut closest_distance = u32::MAX;
        for (i, color) in palette.chunks(3).enumerate() {
            let pr = color[0];
            let pg = color[1];
            let pb = color[2];

            // Calculate squared Euclidean distance
            let distance = ((r as i32 - pr as i32).pow(2)
                + (g as i32 - pg as i32).pow(2)
                + (b as i32 - pb as i32).pow(2)) as u32;

            if distance < closest_distance {
                closest_distance = distance;
                closest_index = i;
            }
        }

        indexed_pixels.push(closest_index as u8);
    }

    indexed_pixels
}
