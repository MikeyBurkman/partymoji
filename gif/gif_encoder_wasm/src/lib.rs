use std::collections::HashMap;

use base64::{Engine, engine::general_purpose::STANDARD as BASE64_STANDARD};
use console_error_panic_hook;
use js_sys::Uint8Array;
use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn create_gif_data_url(width: i32, height: i32, frames: Uint8Array, fps: i32) -> String {
    console::info_1(
        &format!(
            "WASM: create_gif_data_url called, width: {}, height: {}, fps: {}, frames length: {}",
            width,
            height,
            fps,
            frames.length()
        )
        .into(),
    );

    // Start timing
    console::time_with_label("WASM GIF Creation");
    let frames_vec = frames.to_vec();

    let color_count = count_colors_per_frame(width, height, &frames_vec);
    console::info_1(&format!("Color count per frame: {:#?}", color_count).into());

    // Create a GIF with optional transparency
    let gif_data = gif_encoder::image::create_gif(width, height, frames_vec, fps).unwrap();

    // Encode the GIF data as Base64 using the new Engine API
    let base64_encoded = BASE64_STANDARD.encode(&gif_data);

    // Create the data URL
    let data_url = format!("data:image/gif;base64,{}", base64_encoded);

    // End timing
    console::time_end_with_label("WASM GIF Creation");

    // Return the data URL as a String
    data_url
}

fn count_colors_per_frame(width: i32, height: i32, frames: &[u8]) -> Vec<usize> {
    let mut color_count = Vec::new();
    let pixels_per_frame = (width * height) as usize;

    for frame in frames.chunks(pixels_per_frame * 4) {
        let mut unique_colors = HashMap::new();

        for pixel in frame.chunks(4) {
            let color = u32::from_be_bytes([pixel[0], pixel[1], pixel[2], pixel[3]]);
            *unique_colors.entry(color).or_insert(0) += 1;
        }

        color_count.push(unique_colors.len());
    }

    color_count
}
