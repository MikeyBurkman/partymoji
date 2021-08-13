import React from 'react';

interface ImagePickerProps {
  currentImageUrl?: string;
  width?: number;
  height?: number;
  onChange: (imageUrl: string) => void;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  currentImageUrl,
  width,
  height,
  onChange,
}) => (
  <>
    <div className="file block">
      <label className="file-label">
        <input
          className="file-input"
          type="file"
          accept="image/png,image/jpg"
          name="source-png"
          onChange={async (event) => {
            const files = Array.from(event.target.files ?? []);
            const file = files[0];
            const baseImage = await readFile(file);
            onChange(baseImage);
          }}
        />
        <span className="file-cta">
          <span className="file-icon">
            <i className="fas fa-upload"></i>
          </span>
          <span className="file-label">Choose a source image</span>
        </span>
      </label>
    </div>
    {currentImageUrl && (
      <img
        width={width}
        height={height}
        src={currentImageUrl}
        alt="Source"
      ></img>
    )}
  </>
);

const readFile = (file: File) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
