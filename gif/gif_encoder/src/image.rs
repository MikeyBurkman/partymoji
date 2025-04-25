use crate::GifCreationError;
use image::RgbaImage;
use image::codecs::gif::{GifEncoder, Repeat};
use std::io::Cursor;

pub fn create_gif(
    width: i32,
    height: i32,
    frames: Vec<u8>,
    fps: i32,
) -> Result<Vec<u8>, GifCreationError> {
    let mut buffer = Cursor::new(Vec::new());
    {
        let mut encoder = GifEncoder::new_with_speed(&mut buffer, 20);
        encoder
            .set_repeat(Repeat::Infinite)
            .map_err(|e| GifCreationError::EncodingError(e.to_string()))?;

        let frame_size = (width * height * 4) as usize;
        let frame_count = frames.len() / frame_size;
        let frame_delay = image::Delay::from_numer_denom_ms(1000, fps as u32);

        for frame_index in 0..frame_count {
            let frame_base = frame_index * frame_size;

            let frame_pixels = frames[frame_base..frame_base + frame_size].to_vec();

            let image = RgbaImage::from_raw(width as u32, height as u32, frame_pixels).ok_or_else(
                || {
                    GifCreationError::InvalidImageData(
                        "Invalid image dimensions or data".to_string(),
                    )
                },
            )?;
            let frame = image::Frame::from_parts(image, 0, 0, frame_delay);
            encoder
                .encode_frame(frame)
                .map_err(|e| GifCreationError::EncodingError(e.to_string()))?;
        }
    }
    Ok(buffer.into_inner())
}
