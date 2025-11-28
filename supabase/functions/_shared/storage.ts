// @ts-nocheck
// deno-lint-ignore-file

/**
 * Upload a single image to Supabase storage
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToStorage(
  supabaseAdmin: any,
  base64Image: string,
  userId: string,
  requestId: string,
  index: number
): Promise<string> {
  const mimeMatch = base64Image.match(/data:image\/(\w+);base64/);
  const extension = mimeMatch ? mimeMatch[1] : "png";
  const fileName = `${userId}/${requestId}_${index}.${extension}`;
  
  let base64Data = base64Image.trim();
  if (base64Data.includes(",")) {
    base64Data = base64Data.split(",")[1];
  }
  base64Data = base64Data.replace(/\s/g, "");
  
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
    throw new Error("Invalid base64 format for image upload");
  }
  
  const binaryString = atob(base64Data);
  const imageBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    imageBytes[i] = binaryString.charCodeAt(i);
  }
  
  const { error: uploadError } = await supabaseAdmin.storage
    .from("screenshots")
    .upload(fileName, imageBytes, {
      contentType: `image/${extension}`,
      upsert: false,
    });
  
  if (uploadError) {
    throw new Error("Failed to upload image: " + uploadError.message);
  }
  
  const { data: urlData } = supabaseAdmin.storage
    .from("screenshots")
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
}

/**
 * Upload multiple images to storage
 * @returns Array of public URLs
 */
export async function uploadAllImagesToStorage(
  supabaseAdmin: any,
  images: string[],
  userId: string,
  requestId: string
): Promise<string[]> {
  const uploadPromises = images.map((img, index) =>
    uploadImageToStorage(supabaseAdmin, img, userId, requestId, index)
  );
  return await Promise.all(uploadPromises);
}

/**
 * Delete images from storage by their URLs
 */
export async function deleteImagesFromStorage(
  supabaseAdmin: any,
  imageUrls: string[]
): Promise<void> {
  for (const imageUrl of imageUrls) {
    try {
      const urlParts = imageUrl.split("/screenshots/");
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        await supabaseAdmin.storage.from("screenshots").remove([filePath]);
      }
    } catch (error) {
      console.error("[storage] Error deleting image:", error);
    }
  }
}

