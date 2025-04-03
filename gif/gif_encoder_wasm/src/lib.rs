use js_sys::Uint8Array;
use wasm_bindgen::prelude::*;
use base64::{engine::general_purpose::STANDARD as BASE64_STANDARD, Engine};

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
pub fn create_gif_blob(
    width: i32,
    height: i32,
    frames: Uint8Array,
    fps: i32,
    transparent_color: Option<Uint8Array>,
) -> String {
    info(&format!(
        "create_gif called, width: {}, height: {}, fps: {}, frames length: {}",
        width,
        height,
        fps,
        frames.length()
    ));
    // Convert Uint8Array to Vec<u8>
    let frames_vec = frames.to_vec();

    // Handle the optional transparent color
    let transparent_color_option = transparent_color.map(|color| {
        let color_vec = color.to_vec();
        [color_vec[0], color_vec[1], color_vec[2], color_vec[3]]
    });

    // Create a GIF with optional transparency
    let gif_data = gif_encoder::create_gif(
        width,
        height,
        frames_vec,
        fps,
        transparent_color_option,
    );

    // Convert the GIF data (Vec<u8>) into a JavaScript Blob
    let gif_array = js_sys::Uint8Array::from(&gif_data[..]);
    let blob = web_sys::Blob::new_with_u8_array_sequence(&gif_array.into()).unwrap();

    // Create a blob URL using URL.createObjectURL
    let url = web_sys::Url::create_object_url_with_blob(&blob).unwrap();

    // Return the blob URL as a String
    url
}

#[wasm_bindgen]
pub fn create_gif_data_url(
    width: i32,
    height: i32,
    frames: Uint8Array,
    fps: i32,
    transparent_color: Option<Uint8Array>,
) -> String {
    info(&format!(
        "create_gif_data_url called, width: {}, height: {}, fps: {}, frames length: {}",
        width,
        height,
        fps,
        frames.length()
    ));

    // Convert Uint8Array to Vec<u8>
    let frames_vec = frames.to_vec();

    // Handle the optional transparent color
    let transparent_color_option = transparent_color.map(|color| {
        let color_vec = color.to_vec();
        [color_vec[0], color_vec[1], color_vec[2], color_vec[3]]
    });

    // Create a GIF with optional transparency
    let gif_data = gif_encoder::create_gif(
        width,
        height,
        frames_vec,
        fps,
        transparent_color_option,
    );

    // Encode the GIF data as Base64 using the new Engine API
    let base64_encoded = BASE64_STANDARD.encode(&gif_data);

    // Create the data URL
    let data_url = format!("data:image/gif;base64,{}", base64_encoded);

    // Return the data URL as a String
    data_url
}
