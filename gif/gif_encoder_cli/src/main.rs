fn main() {
    let width = 100;
    let height = 100;
    let fps = 10;

    // Example: Create a flat Vec<u8> for 2 frames (RGBA format)
    let mut frames = vec![0u8; width as usize * height as usize * 4 * 2];
    for i in 0..frames.len() {
        frames[i] = (i % 256) as u8; // Example pixel data
    }

    // Optional transparency color (e.g., fully transparent black)
    let transparent_color = Some([0, 0, 0, 0]);

    let gif_data = gif_encoder::gif::create_gif(width, height, frames, fps, transparent_color);

    // Save the GIF to a file (optional)
    std::fs::write("output.gif", gif_data).expect("Failed to write GIF");
}
