import { ImageValidationResult } from './types';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
]);

// 15 MB maximum payload
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
// 100 bytes minimum payload to prevent empty or 1-pixel placeholders
const MIN_IMAGE_BYTES = 100;

export function validateCropImage(imageBase64?: string): ImageValidationResult {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return {
      isValid: false,
      errorMessage: 'Image data is missing or not a valid string.'
    };
  }

  const trimmed = imageBase64.trim();
  if (!trimmed) {
    return {
      isValid: false,
      errorMessage: 'Image data is empty.'
    };
  }

  let mimeType = 'image/jpeg';
  let rawBase64 = trimmed;

  // Check if it's a data URI
  if (trimmed.startsWith('data:')) {
    const dataUriMatch = trimmed.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/s);
    if (!dataUriMatch) {
      return {
        isValid: false,
        errorMessage: 'Invalid image data URI format. Expected data:[mime];base64,[data].'
      };
    }

    mimeType = dataUriMatch[1].toLowerCase();
    rawBase64 = dataUriMatch[2];
  } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If a remote URL is passed (e.g. Unsplash sample), we validate as valid URL
    return {
      isValid: true,
      mimeType: 'image/jpeg',
      rawBase64: undefined,
      sizeBytes: 0
    };
  }

  // Validate supported image MIME type
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return {
      isValid: false,
      errorMessage: `Unsupported image format (${mimeType}). CropGuard accepts JPEG, PNG, WebP, and HEIC leaf photos.`
    };
  }

  // Calculate approximate byte size of base64
  // Standard formula: length * 3 / 4 - padding
  const padding = (rawBase64.endsWith('==') ? 2 : rawBase64.endsWith('=') ? 1 : 0);
  const sizeBytes = Math.floor((rawBase64.length * 3) / 4) - padding;

  if (sizeBytes < MIN_IMAGE_BYTES) {
    return {
      isValid: false,
      errorMessage: `Image payload is too small (${sizeBytes} bytes). Please provide a clear, high-resolution photo of the diseased plant leaf.`
    };
  }

  if (sizeBytes > MAX_IMAGE_BYTES) {
    return {
      isValid: false,
      errorMessage: `Image size (${(sizeBytes / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 15MB. Please compress or resize the leaf photo.`
    };
  }

  // Validate Base64 characters
  const base64Regex = /^[A-Za-z0-9+/= \r\n]+$/;
  // Test sample prefix to avoid slow regex on 10MB strings
  const sampleToCheck = rawBase64.length > 5000 ? rawBase64.slice(0, 5000) : rawBase64;
  if (!base64Regex.test(sampleToCheck)) {
    return {
      isValid: false,
      errorMessage: 'Image data contains invalid base64 characters.'
    };
  }

  return {
    isValid: true,
    mimeType,
    rawBase64: rawBase64.replace(/[\r\n\s]/g, ''),
    sizeBytes
  };
}
