use image::codecs::gif::{GifEncoder, Repeat};
use image::{Rgba, RgbaImage};
use js_sys::Uint8Array;
use std::io::Cursor;
use wasm_bindgen::prelude::*;

#[wasm_bindgen] // this macro is required for wasm-bindgen to work, must be added to the top of the file
extern "C" {
    // to call `console.log()` of js in rust, for debugging
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn info(s: &str);
}

// This function creates a GIF from the provided frames and returns the GIF data as a byte vector.
#[wasm_bindgen]
pub fn create_gif(width: i32, height: i32, frames: Uint8Array, fps: i32) -> Vec<u8> {
    info(&format!(
        "create_gif called, width: {}, height: {}, fps: {}, frames length: {}",
        width,
        height,
        fps,
        frames.length()
    ));

    let mut buffer = Cursor::new(Vec::new());
    {
        // scope the encoder to ensure it is dropped before buffer is used
        let mut encoder = GifEncoder::new_with_speed(&mut buffer, fps);
        encoder.set_repeat(Repeat::Infinite).unwrap();

        // Convert Uint8Array to a Vec<u8>
        let frames_vec = frames.to_vec();

        // Each frame is assumed to be width * height * 4 (RGBA)
        let frame_size = (width * height * 4) as usize;
        let frame_count = frames_vec.len() / frame_size;

        log(&format!(
            "frame_size: {}, frame_count: {}",
            frame_size, frame_count
        ));

        for frame_index in 0..frame_count {
            let mut image = RgbaImage::new(width as u32, height as u32);

            // Extract the current frame's pixel data
            let start = (frame_index as usize) * frame_size;
            let end = start + frame_size;
            let frame_data = &frames_vec[start..end];

            for x in 0..width {
                for y in 0..height {
                    let pixel_index = ((y * width + x) * 4) as usize;
                    let r = frame_data[pixel_index];
                    let g = frame_data[pixel_index + 1];
                    let b = frame_data[pixel_index + 2];
                    let a = frame_data[pixel_index + 3];
                    image.put_pixel(x as u32, y as u32, Rgba([r, g, b, a]));
                }
            }

            encoder.encode_frame(image::Frame::new(image)).unwrap();
        }
    }
    buffer.into_inner()

    // TODO: return a blob url from here
}

// #[wasm_bindgen]
// pub fn create_gif_with_transparency(
//     width: i32,
//     height: i32,
//     frames: Uint8Array,
//     fps: i32,
//     transparent_color: Uint8Array,
// ) -> Vec<u8> {
//     log(&format!(
//         "create_gif_with_transparency called, width: {}, height: {}, fps: {}, transparent_color: {:?}, frames length: {}",
//         width,
//         height,
//         fps,
//         transparent_color.to_vec(),
//         frames.length()
//     ));

//     let mut buffer = Cursor::new(Vec::new());
//     {
//         // scope the encoder to ensure it is dropped before buffer is used
//         let mut encoder = GifEncoder::new_with_speed(&mut buffer, fps);
//         encoder.set_repeat(Repeat::Infinite).unwrap();

//         // Convert Uint8Array to a Vec<u8>
//         let frames_vec = frames.to_vec();
//         let transparent_color_vec = transparent_color.to_vec();

//         // Each frame is assumed to be width * height * 4 (RGBA)
//         let frame_size = (width * height * 4) as usize;
//         let frame_count = frames_vec.len() / frame_size;

//         for frame_index in 0..frame_count {
//             let mut image = RgbaImage::new(width as u32, height as u32);

//             // Extract the current frame's pixel data
//             let start = (frame_index as usize) * frame_size;
//             let end = start + frame_size;
//             let frame_data = &frames_vec[start..end];

//             for x in 0..width {
//                 for y in 0..height {
//                     let pixel_index = ((y * width + x) * 4) as usize;
//                     let r = frame_data[pixel_index];
//                     let g = frame_data[pixel_index + 1];
//                     let b = frame_data[pixel_index + 2];
//                     let a = frame_data[pixel_index + 3];

//                     // Check if the pixel matches the transparent color
//                     if [r, g, b, a] == *transparent_color_vec {
//                         image.put_pixel(x as u32, y as u32, Rgba([0, 0, 0, 0]));
//                     // Transparent pixel
//                     } else {
//                         image.put_pixel(x as u32, y as u32, Rgba([r, g, b, a]));
//                     }
//                 }
//             }

//             encoder.encode_frame(image::Frame::new(image)).unwrap();
//         }
//     }
//     buffer.into_inner()
// }

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {}
}
