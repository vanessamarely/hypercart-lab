// Product image management for HyperCart demo
// Uses local assets for reliable performance demonstrations

import { ALL_ASSETS } from './asset-verification';

const imageCache = new Map<number, string>();

function getLocalImagePath(productId: number): string {
  // Get available product images from our assets
  const webpImages = Object.values(ALL_ASSETS.products.webp);
  const jpgImages = Object.values(ALL_ASSETS.products.jpg);
  const allImages = [...webpImages, ...jpgImages];
  
  const imageIndex = productId % allImages.length;
  return allImages[imageIndex];
}

export async function getLocalProductImage(
  productId: number,
  category: string,
  productName: string
): Promise<string> {
  if (imageCache.has(productId)) {
    return imageCache.get(productId)!;
  }

  // Use local images for demo reliability - no external API dependencies
  const localImageUrl = getLocalImagePath(productId);
  imageCache.set(productId, localImageUrl);
  return localImageUrl;
}

export async function preloadLocalProductImages(products: Array<{ id: number; category: string; name: string }>): Promise<Map<number, string>> {
  const imageMap = new Map<number, string>();
  
  // Use local images for instant loading and demo reliability
  products.forEach((product) => {
    const localImageUrl = getLocalImagePath(product.id);
    imageMap.set(product.id, localImageUrl);
  });

  return imageMap;
}
