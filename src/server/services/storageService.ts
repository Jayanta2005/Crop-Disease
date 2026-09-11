import crypto from 'crypto';

export interface StoredImageMetadata {
  storageKey: string;
  imageRef: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  dimensions?: { width: number; height: number };
  publicUrl: string;
  uploadedAt: string;
  farmerId?: string;
  cropId?: string;
  isMock: boolean;
}

/**
 * Storage Service
 * Abstraction for cloud object storage (e.g., Google Cloud Storage / S3)
 * Avoids storing large base64 strings directly in relational database rows.
 * Handles deduplication via SHA-256 and metadata management.
 */
class StorageService {
  private imageStore: Map<string, { metadata: StoredImageMetadata; dataBuffer?: Buffer }> = new Map();

  constructor() {
    this.seedDemoImages();
  }

  private seedDemoImages() {
    const demoImages = [
      {
        ref: 'img_ref_rice_blast_01',
        url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
        mimeType: 'image/jpeg',
        sizeBytes: 142800,
        cropId: 'rice'
      },
      {
        ref: 'img_ref_wheat_rust_01',
        url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
        mimeType: 'image/jpeg',
        sizeBytes: 156400,
        cropId: 'wheat'
      },
      {
        ref: 'img_ref_cotton_bollworm_01',
        url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&auto=format&fit=crop&q=80',
        mimeType: 'image/jpeg',
        sizeBytes: 168200,
        cropId: 'cotton'
      },
      {
        ref: 'img_ref_potato_blight_01',
        url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
        mimeType: 'image/jpeg',
        sizeBytes: 139100,
        cropId: 'potato'
      }
    ];

    for (const img of demoImages) {
      this.imageStore.set(img.ref, {
        metadata: {
          storageKey: `crops/${img.cropId}/${img.ref}.jpg`,
          imageRef: img.ref,
          mimeType: img.mimeType,
          sizeBytes: img.sizeBytes,
          sha256: crypto.createHash('sha256').update(img.ref).digest('hex'),
          publicUrl: img.url,
          uploadedAt: new Date().toISOString(),
          cropId: img.cropId,
          isMock: true
        }
      });
    }
  }

  /**
   * Stores an image payload (base64 data URI, raw base64, or URL)
   * and returns structured metadata reference.
   */
  public async storeImage(
    imageDataOrUrl: string,
    context?: { farmerId?: string; cropId?: string; originalFilename?: string }
  ): Promise<StoredImageMetadata> {
    if (!imageDataOrUrl) {
      throw new Error('Image data or URL is required for storage');
    }

    // If it's already an external URL
    if (imageDataOrUrl.startsWith('http://') || imageDataOrUrl.startsWith('https://')) {
      const sha256 = crypto.createHash('sha256').update(imageDataOrUrl).digest('hex');
      const imageRef = `img_ref_${sha256.substring(0, 16)}`;

      if (this.imageStore.has(imageRef)) {
        return this.imageStore.get(imageRef)!.metadata;
      }

      const metadata: StoredImageMetadata = {
        storageKey: `external/${context?.cropId || 'crops'}/${imageRef}.jpg`,
        imageRef,
        mimeType: 'image/jpeg',
        sizeBytes: 250000,
        sha256,
        publicUrl: imageDataOrUrl,
        uploadedAt: new Date().toISOString(),
        farmerId: context?.farmerId,
        cropId: context?.cropId,
        isMock: false
      };

      this.imageStore.set(imageRef, { metadata });
      return metadata;
    }

    // Base64 Data URI parsing
    let mimeType = 'image/jpeg';
    let base64Content = imageDataOrUrl;

    const dataUriMatch = imageDataOrUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (dataUriMatch) {
      mimeType = dataUriMatch[1];
      base64Content = dataUriMatch[2];
    }

    const buffer = Buffer.from(base64Content, 'base64');
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const imageRef = `img_ref_${sha256.substring(0, 16)}`;

    // Deduplication check
    if (this.imageStore.has(imageRef)) {
      return this.imageStore.get(imageRef)!.metadata;
    }

    const extension = mimeType.split('/')[1] || 'jpg';
    const storageKey = `scans/${context?.cropId || 'crops'}/${new Date().toISOString().split('T')[0]}/${imageRef}.${extension}`;

    // For local dev, generate a data URI or local serving URL
    const publicUrl = `data:${mimeType};base64,${base64Content}`;

    const metadata: StoredImageMetadata = {
      storageKey,
      imageRef,
      mimeType,
      sizeBytes: buffer.length,
      sha256,
      publicUrl,
      uploadedAt: new Date().toISOString(),
      farmerId: context?.farmerId,
      cropId: context?.cropId,
      isMock: false
    };

    this.imageStore.set(imageRef, { metadata, dataBuffer: buffer });
    return metadata;
  }

  /**
   * Retrieves image metadata by its reference ID
   */
  public getImageMetadata(imageRef: string): StoredImageMetadata | null {
    const entry = this.imageStore.get(imageRef);
    return entry ? entry.metadata : null;
  }

  /**
   * Resolves public URL for an image reference or returns the string if already a URL
   */
  public resolveImageUrl(imageRefOrUrl?: string): string {
    if (!imageRefOrUrl) {
      return 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80';
    }
    if (imageRefOrUrl.startsWith('http://') || imageRefOrUrl.startsWith('https://') || imageRefOrUrl.startsWith('data:')) {
      return imageRefOrUrl;
    }
    const meta = this.getImageMetadata(imageRefOrUrl);
    return meta ? meta.publicUrl : imageRefOrUrl;
  }
}

export const storageService = new StorageService();
