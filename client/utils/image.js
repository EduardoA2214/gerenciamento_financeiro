const AVATAR_SIZE = 256;
const MAX_FILE_BYTES = 8 * 1024 * 1024;

export function isSupportedImage(file) {
  return file && file.type.startsWith('image/');
}

export function isWithinSizeLimit(file) {
  return file && file.size <= MAX_FILE_BYTES;
}

export function fileToAvatarDataUrl(file, size = AVATAR_SIZE) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo selecionado.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Arquivo de imagem inválido.'));
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
