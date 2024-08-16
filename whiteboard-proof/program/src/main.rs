#![no_main]

use std::io::Cursor;

use image::{ImageReader, Rgb, RgbImage};
use imageproc::drawing::draw_line_segment_mut;
use serde::Deserialize;
sp1_zkvm::entrypoint!(main);

#[derive(Deserialize, Debug)]
enum StrokeType {
    Begin,
    Draw,
}

#[derive(Deserialize, Debug)]
struct Stroke {
    stroke_type: StrokeType,
    x: f32,
    y: f32,
    color: (u8, u8, u8),
}

fn main() {
    let output_image_data = include_bytes!("../../output.png").to_vec();
    let cursor = Cursor::new(output_image_data);
    let output_image = ImageReader::new(cursor)
        .with_guessed_format()
        .expect("Cursor format couldn't be guessed")
        .decode()
        .expect("Image decoding failed")
        .to_rgb8();

    let dimensions = output_image.dimensions();

    let strokes_string = include_str!("../../fake_strokes");

    let strokes = serde_json::from_str::<Vec<Stroke>>(&strokes_string).unwrap();

    let mut img = RgbImage::new(dimensions.0, dimensions.1);
    let mut last_point: Option<(f32, f32)> = None;

    for stroke in &strokes {
        match stroke.stroke_type {
            StrokeType::Begin => {
                last_point = Some((stroke.x, stroke.y));
            }
            StrokeType::Draw => {
                if let Some((lx, ly)) = last_point {
                    draw_line_segment_mut(
                        &mut img,
                        (lx, ly),
                        (stroke.x, stroke.y),
                        Rgb([stroke.color.0, stroke.color.1, stroke.color.2]),
                    );
                }
                last_point = Some((stroke.x, stroke.y));
            }
        }
    }

    let generated_output = img.to_vec();
    println!("{:?}", img.to_vec());
    let equal = output_image.to_vec().eq(&generated_output);

    println!("same image? {:?}", equal);
    sp1_zkvm::io::commit(&equal);
}
