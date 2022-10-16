/** Given a URL to an image, try to load it and return the data URL for it */
export const getImageFromUrl = async (url: string) => {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = (...args) => {
      console.log('OnLoad', { args });
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas not supported');
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL());
    };

    img.onerror = (...args) => {
      console.log('Error loading url', { args });
      reject(new Error('Error loading url'));
    };

    img.src = url;
  });
};
