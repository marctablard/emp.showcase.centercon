import { Product } from '@/platform/services/model/product';
import { ProductMapper } from '../ProductMapper';
import { Product as EmporixProduct } from '@/platform/integrations/emporix/model/product';
import { LocalizedString } from '@/platform/services/model/common';
import { injectable } from '@/platform/core/di/injectable';

/**
 * Implementation of ProductMapper for Emporix product data.
 * Maps between Emporix API product format and internal Product model.
 */
@injectable('EmporixProductMapper', 'Singleton')
export class EmporixProductMapper implements ProductMapper<EmporixProduct> {
  /**
   * Maps an Emporix product to the internal Product model.
   * 
   * @param source - The Emporix product data
   * @returns The internal Product model
   */
  mapToService(source: EmporixProduct): Product {
    // Extract images from media array
    const images = source.media ? 
      source.media.map(media => media.url) : 
      [];
    
    // Extract localized name and description
    const name = this.extractLocalizedText(source.name);
    const description = source.description ? 
      this.extractLocalizedText(source.description) : 
      '';
    
    return {
      id: source.id || source.code,
      name,
      description,
      images
    };
  }

  /**
   * Maps an internal Product model back to Emporix product format.
   * 
   * @param service - The internal Product model
   * @returns The Emporix product data
   */
  mapToSource(service: Product): EmporixProduct {
    // Convert images array to media objects
    const media = service.images ? service.images.map(url => ({
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      url,
      contentType: 'image/jpeg', // Assuming JPEG format, adjust as needed
      tags: [],
      createdAt: new Date().toISOString()
    })) : [];
    
    
    return {
      id: service.id,
      code: service.id, // Using id as code since it's required
      name: service.name,
      description: service.description,
      media,
      published: true
    };
  }

  /**
   * Helper method to extract text from a localized string object.
   * Tries to get the English text first, then falls back to any available language.
   * 
   * @param localizedText - The localized text object
   * @returns The extracted text string
   */
  private extractLocalizedText(localizedText: string | LocalizedString): string {
    if (typeof localizedText === 'string') {
      return localizedText;
    }
    
    // Try to get English text first
    if (localizedText.en) {
      return localizedText.en;
    }
    
    // Fall back to any available language
    const availableLanguages = Object.keys(localizedText) as Array<keyof LocalizedString>;
    if (availableLanguages.length > 0) {
      const firstKey = availableLanguages[0];
      return localizedText[firstKey];
    }
    
    return '';
  }
}

export default EmporixProductMapper;