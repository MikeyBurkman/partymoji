use image::RgbaImage;
use image::codecs::gif::{GifEncoder, Repeat};
use std::fmt;
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

// Define a custom error type
#[derive(Debug)]
pub enum GifCreationError {
    InvalidImageData(String),
    EncodingError(String),
    IoError(std::io::Error),
}

// Implement `std::fmt::Display` for the custom error
impl fmt::Display for GifCreationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            GifCreationError::InvalidImageData(msg) => write!(f, "Invalid image data: {}", msg),
            GifCreationError::EncodingError(msg) => write!(f, "Encoding error: {}", msg),
            GifCreationError::IoError(err) => write!(f, "IO error: {}", err),
        }
    }
}

// Implement `std::error::Error` for the custom error
impl std::error::Error for GifCreationError {}

// Convert `std::io::Error` to `GifCreationError`
impl From<std::io::Error> for GifCreationError {
    fn from(err: std::io::Error) -> Self {
        GifCreationError::IoError(err)
    }
}
