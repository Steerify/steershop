import axios from 'axios';

/**
 * Downloads an image from a URL and returns it as a Buffer.
 * Returns null if the download fails or URL is invalid.
 */
export async function downloadImage(url: string | null | undefined): Promise<Buffer | null> {
  if (!url) return null;
  try {
    const response = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
      timeout: 15_000,
      headers: {
        'User-Agent': 'SteerSolo-Bot/1.0',
      },
    });
    return Buffer.from(response.data);
  } catch (err: any) {
    console.warn('[images] Failed to download image:', url, '—', err.message);
    return null;
  }
}

/** Picks the best available image URL from a product. */
export function pickProductImage(product: {
  image_url: string | null;
  image_urls: string[] | null;
}): string | null {
  if (product.image_urls?.length) return product.image_urls[0];
  return product.image_url ?? null;
}
