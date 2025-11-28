// @ts-nocheck
// deno-lint-ignore-file

/**
 * Calculate SHA-256 hash of data
 */
export async function calculateHash(data: string | Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  let buffer: ArrayBuffer;
  
  if (typeof data === "string") {
    buffer = encoder.encode(data).buffer;
  } else {
    const sliced = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    buffer = new ArrayBuffer(sliced.byteLength);
    new Uint8Array(buffer).set(new Uint8Array(sliced));
  }
  
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Calculate hash of a base64 encoded image
 */
export async function calculateImageHash(base64Image: string): Promise<string> {
  let base64Data = base64Image.trim();
  if (base64Data.includes(",")) {
    base64Data = base64Data.split(",")[1];
  }
  base64Data = base64Data.replace(/\s/g, "");
  
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
    throw new Error("Invalid base64 format");
  }
  
  const binaryString = atob(base64Data);
  const imageBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    imageBytes[i] = binaryString.charCodeAt(i);
  }
  
  return await calculateHash(imageBytes);
}

/**
 * Calculate hash of text content
 */
export async function calculateTextHash(ocrText: string): Promise<string> {
  const normalizedText = ocrText || "";
  return await calculateHash(normalizedText);
}

/**
 * Calculate combined hash key for multiple images
 */
export async function calculateImagesKey(images: string[]): Promise<string> {
  const imageHashes = await Promise.all(images.map((img) => calculateImageHash(img)));
  const combinedHashes = imageHashes.sort().join(":");
  return await calculateHash(combinedHashes);
}

/**
 * Generate cache key from request parameters
 */
export async function generateCacheKey(
  categoryId: string,
  adviceId: string,
  textHash: string,
  imagesKey: string,
  model: string
): Promise<string> {
  const keyString = `${categoryId}:${adviceId}:${textHash}:${imagesKey}:${model}`;
  return await calculateHash(keyString);
}

