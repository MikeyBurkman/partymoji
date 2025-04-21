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
pub fn create_gif_data_url(
    width: i32,
    height: i32,
    frames: Uint8Array,
    fps: i32,
    transparent_color: Option<Uint8Array>,
) -> String {
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

    // Handle the optional transparent color
    let transparent_color_option = transparent_color.map(|color| {
        let color_vec = color.to_vec();
        [color_vec[0], color_vec[1], color_vec[2], color_vec[3]]
    });

    // Create a GIF with optional transparency
    let gif_data =
        gif_encoder::image::create_gif(width, height, frames_vec, fps, transparent_color_option)
            .unwrap();

    // Encode the GIF data as Base64 using the new Engine API
    let base64_encoded = BASE64_STANDARD.encode(&gif_data);

    // Create the data URL
    let data_url = format!("data:image/gif;base64,{}", base64_encoded);

    // End timing
    console::time_end_with_label("WASM GIF Creation");

    // Return the data URL as a String
    data_url
}

#[wasm_bindgen]
pub fn create_gif_data_url2(
    width: i32,
    height: i32,
    frames: Uint8Array,
    fps: i32,
    transparent_color: Option<Uint8Array>,
) -> String {
    console::info_1(
        &format!(
            "WASM: create_gif_data_url2 called, width: {}, height: {}, fps: {}, frames length: {}",
            width,
            height,
            fps,
            frames.length()
        )
        .into(),
    );

    // Start timing
    console::time_with_label("WASM Faster GIF Creation");
    let frames_vec = frames.to_vec();
    
    // Handle the optional transparent color
    let transparent_color_option = transparent_color.map(|color| {
        let color_vec = color.to_vec();
        [color_vec[0], color_vec[1], color_vec[2], color_vec[3]]
    });

    // Create a GIF with optional transparency
    let gif_data = gif_encoder::gif::create_gif(
        width,
        height,
        frames_vec,
        fps,
        transparent_color_option,
        |msg: String| console::warn_1(&JsValue::from(msg)),
    )
    .unwrap();

    // Encode the GIF data as Base64 using the new Engine API
    let base64_encoded = BASE64_STANDARD.encode(&gif_data);

    // Create the data URL
    let data_url = format!("data:image/gif;base64,{}", base64_encoded);

    // End timing
    console::time_end_with_label("WASM Faster GIF Creation");

    // Return the data URL as a String
    data_url
}
