// Larguras precisam existir em `images.sizes` no vercel.json.
export const IMAGE_SIZES = [160, 384, 640, 768, 960, 1080, 1280, 1600, 1920] as const;

const OPTIMIZABLE_HOSTS = ['.supabase.co', 'lh3.googleusercontent.com'];

const isOptimizable = (url: string): boolean => {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'https:' && OPTIMIZABLE_HOSTS.some(host =>
      host.startsWith('.') ? hostname.endsWith(host) : hostname === host
    );
  } catch {
    return false;
  }
};

const nearestSize = (width: number): number =>
  IMAGE_SIZES.find(size => size >= width) ?? IMAGE_SIZES[IMAGE_SIZES.length - 1];

/**
 * Redireciona a imagem pelo otimizador da Vercel (/_vercel/image), que
 * redimensiona, converte para WebP/AVIF e faz cache na CDN. Em dev (vite)
 * o endpoint não existe, então devolve a URL original.
 */
export const optimizedImageUrl = (url: string, width: number, quality = 75): string => {
  if (!import.meta.env.PROD || !isOptimizable(url)) {
    return url;
  }
  return `/_vercel/image?url=${encodeURIComponent(url)}&w=${nearestSize(width)}&q=${quality}`;
};

/** srcset com variantes 1x/1.5x/2x para a largura de exibição indicada. */
export const optimizedSrcSet = (url: string, displayWidth: number, quality = 75): string | undefined => {
  if (!import.meta.env.PROD || !isOptimizable(url)) {
    return undefined;
  }
  const widths = [...new Set([1, 1.5, 2].map(dpr => nearestSize(displayWidth * dpr)))];
  return widths
    .map(w => `${optimizedImageUrl(url, w, quality)} ${w}w`)
    .join(', ');
};

interface CompressOptions {
  maxDimension: number;
  quality?: number;
}

/**
 * Comprime a imagem no navegador antes do upload: redimensiona para caber em
 * `maxDimension` e converte para WebP. Se algo falhar (formato não suportado,
 * canvas bloqueado), devolve o arquivo original para não travar o upload.
 */
export const compressImage = async (file: File, { maxDimension, quality = 0.82 }: CompressOptions): Promise<Blob> => {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      return file;
    }
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>(resolve => {
      canvas.toBlob(resolve, 'image/webp', quality);
    });

    // Usa a versão comprimida apenas se realmente ficou menor.
    if (blob && blob.size < file.size) {
      return blob;
    }
    return file;
  } catch {
    return file;
  }
};

/**
 * Cor média da imagem (hex), usada como `background-color` do card enquanto
 * a foto real carrega — reduz o "flash" cinza percebido no primeiro paint.
 * Decodifica em resolução mínima (16x16) só para amostrar a cor.
 */
export const dominantColorOf = async (file: File | Blob): Promise<string | undefined> => {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const context = canvas.getContext('2d');
    if (!context) {
      bitmap.close();
      return undefined;
    }
    context.drawImage(bitmap, 0, 0, 16, 16);
    bitmap.close();

    const { data } = context.getImageData(0, 0, 16, 16);
    let r = 0, g = 0, b = 0;
    const pixelCount = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    r = Math.round(r / pixelCount);
    g = Math.round(g / pixelCount);
    b = Math.round(b / pixelCount);

    return `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`;
  } catch {
    return undefined;
  }
};
