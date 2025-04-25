use std::fmt;

pub mod image;

// Define a custom error type
#[derive(Debug)]
pub enum GifCreationError {
    InvalidImageData(String),
    EncodingError(String),
    IoError(std::io::Error),
    Overflow(String),
}

// Implement `std::fmt::Display` for the custom error
impl fmt::Display for GifCreationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            GifCreationError::InvalidImageData(msg) => write!(f, "Invalid image data: {}", msg),
            GifCreationError::EncodingError(msg) => write!(f, "Encoding error: {}", msg),
            GifCreationError::IoError(err) => write!(f, "IO error: {}", err),
            GifCreationError::Overflow(msg) => write!(f, "Overflow error: {}", msg),
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
