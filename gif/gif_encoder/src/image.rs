use crate::GifCreationError;
use image::RgbaImage;
use image::codecs::gif::{GifEncoder, Repeat};
use std::io::Cursor;

pub fn create_gif(
    width: i32,
    height: i32,
    frames: Vec<u8>,
    fps: i32,
    transparent_color: Option<[u8; 4]>,
) -> Result<Vec<u8>, GifCreationError> {
    let mut buffer = Cursor::new(Vec::new());
    {
        let mut encoder = GifEncoder::new_with_speed(&mut buffer, fps);
        encoder
            .set_repeat(Repeat::Infinite)
            .map_err(|e| GifCreationError::EncodingError(e.to_string()))?;

        let frame_size = (width * height * 4) as usize;
        let frame_count = frames.len() / frame_size;

        // convert transparent to an Option<u32> to speed up comparison
        let transparent = transparent_color.map(|c| u32::from_le_bytes([c[0], c[1], c[2], c[3]]));

        for frame_index in 0..frame_count {
            let frame_base = frame_index * frame_size;

            let mut frame_pixels = frames[frame_base..frame_base + frame_size].to_vec();

            if let Some(transparent) = transparent {
                for chunk in frame_pixels.chunks_exact_mut(4) {
                    let pixel = u32::from_le_bytes([chunk[0], chunk[1], chunk[2], chunk[3]]);
                    if pixel == transparent {
                        chunk.copy_from_slice(&[0, 0, 0, 0]);
                    }
                }
            }

            let image = RgbaImage::from_raw(width as u32, height as u32, frame_pixels).ok_or_else(
                || {
                    GifCreationError::InvalidImageData(
                        "Invalid image dimensions or data".to_string(),
                    )
                },
            )?;
            encoder
                .encode_frame(image::Frame::new(image))
                .map_err(|e| GifCreationError::EncodingError(e.to_string()))?;
        }
    }
    Ok(buffer.into_inner())
}
