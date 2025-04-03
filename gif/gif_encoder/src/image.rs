use image::codecs::gif::{GifEncoder, Repeat};
use image::{Rgba, RgbaImage};
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
        let mut encoder = GifEncoder::new_with_speed(&mut buffer, fps);
        encoder.set_repeat(Repeat::Infinite).unwrap();

        let frame_size = (width * height * 4) as usize;
        let frame_count = frames.len() / frame_size;

        let mut image = RgbaImage::new(width as u32, height as u32);

        for frame_index in 0..frame_count {
            let frame_base = frame_index * frame_size;

            for y in 0..height {
                let mut row_base = frame_base + (y * width * 4) as usize;
                for x in 0..width {
                    let r = frames[row_base];
                    let g = frames[row_base + 1];
                    let b = frames[row_base + 2];
                    let a = frames[row_base + 3];

                    if let Some(transparent) = transparent_color {
                        if [r, g, b, a] == transparent {
                            image.put_pixel(x as u32, y as u32, Rgba([0, 0, 0, 0]));
                        } else {
                            image.put_pixel(x as u32, y as u32, Rgba([r, g, b, a]));
                        }
                    } else {
                        image.put_pixel(x as u32, y as u32, Rgba([r, g, b, a]));
                    }

                    row_base += 4;
                }
            }

            encoder
                .encode_frame(image::Frame::new(image.clone()))
                .unwrap();
        }
    }
    buffer.into_inner()
}
