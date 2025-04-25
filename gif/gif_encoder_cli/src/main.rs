use base64::{Engine, engine::general_purpose::STANDARD as BASE64_STANDARD};
use clipboard::{ClipboardContext, ClipboardProvider};
use std::time::Instant;

fn main() {
    let width = 100;
    let height = 100;
    let fps = 2;
    let frame_count = 20;

    // Define a list of colors to alternate between (RGBA format)
    let colors = [
        [255, 0, 0, 255],   // Red
        [0, 255, 0, 255],   // Green
        [0, 0, 255, 255],   // Blue
        [255, 255, 0, 255], // Yellow
        [255, 0, 255, 255], // Magenta
        [0, 255, 255, 255], // Cyan
    ];

    let frame_size = width as usize * height as usize * 4; // Each frame is width * height * 4 (RGBA)
    let mut frames = vec![0u8; frame_size * frame_count];

    // Fill the frames with alternating colors
    for frame_index in 0..frame_count {
        // Cycle through the colors using modulo
        let color = colors[frame_index % colors.len()];

        for y in 0..height {
            for x in 0..width {
                let pixel_index = (frame_index * frame_size) + ((y * width + x) * 4);
                frames[pixel_index..pixel_index + 4].copy_from_slice(&color);
            }
        }
    }

    // Measure the execution time of the create_gif function
    let start = Instant::now();
    let gif_result = gif_encoder::create_gif(width as i32, height as i32, frames, fps);

    // let gif_result = gif_encoder::gif::create_gif(width as i32, height as i32, frames, fps, transparent_color);
    let duration = start.elapsed();

    println!("create_gif executed in: {:?}", duration);

    match gif_result {
        Ok(data) => {
            // Save the GIF to a file (optional)
            std::fs::write("output.gif", data.clone()).expect("Failed to write GIF");

            // Encode the GIF data as Base64 using the new Engine API
            let base64_encoded = BASE64_STANDARD.encode(&data); // Clone gif_data here

            let mut clipboard: ClipboardContext =
                ClipboardProvider::new().expect("Failed to access clipboard");
            // Create the data URL
            let data_url = format!("data:image/gif;base64,{}", base64_encoded);

            clipboard
                .set_contents(data_url.clone())
                .expect("Failed to copy to clipboard");

            println!("Data URL copied to clipboard!");
        }
        Err(e) => {
            eprintln!("Error creating GIF: {:?}", e);
            return;
        }
    }
}
