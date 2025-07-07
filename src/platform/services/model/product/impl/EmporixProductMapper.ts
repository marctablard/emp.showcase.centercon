import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import { EmporixMixins } from '@/platform/integrations/emporix/model';
import { EmporixProduct } from '@/platform/integrations/emporix/model/product';
import { LocalizedString } from '@/platform/services/model/common';
import { GroupedSpecification, Product, ProductSpecification } from '@/platform/services/model/product';
import type { SessionService } from '@/platform/services/session';
import { ProductMapper } from '../ProductMapper';

/**
 * Implementation of ProductMapper for Emporix product data.
 * Maps between Emporix API product format and internal Product model.
 */
@injectable('EmporixProductMapper', 'Singleton')
export class EmporixProductMapper implements ProductMapper<EmporixProduct> {
  constructor(
    @inject('SessionService')
    private readonly sessionService: SessionService,
  ) {}
  /**
   * Maps an Emporix product to the internal Product model.
   *
   * @param source - The Emporix product data
   * @returns The internal Product model
   */
  mapToService(source: EmporixProduct): Product {
    // Extract images from media array
    const images = source.media
      ? source.media.map((media) => ({
          url: media.url,
          altText: source.name,
          contentType: media.contentType,
        }))
      : [];

    const primaryImage = source.media ? source.media[0] : undefined;

    // Extract localized name and description
    const name = this.extractLocalizedText(source.name);
    const description = source.description ? this.extractLocalizedText(source.description) : '';
    const mixins = source.mixins ? (source.mixins as EmporixMixins) : [];

    const mappedSpecs =
      Array.isArray(mixins) || !mixins.specifications?.specifications
        ? []
        : mixins.specifications.specifications.map((spec: any) => ({
            key: spec.key,
            group: spec.group,
            groupLabel: spec.groupLabel
              ? spec.groupLabel.reduce((acc: LocalizedString, item: any) => {
                  acc[item.language] = item.value;
                  return acc;
                }, {} as any)
              : {},
            label:
              spec.label && Array.isArray(spec.label)
                ? spec.label.reduce((acc: LocalizedString, item: any) => {
                    acc[item.language] = item.value;
                    return acc;
                  }, {} as any)
                : { en: spec.key || '' },
            value:
              spec.value && Array.isArray(spec.value)
                ? spec.value.reduce((acc: LocalizedString, item: any) => {
                    acc[item.language] = item.value;
                    return acc;
                  }, {} as any)
                : { en: '' },
            ...(spec.unit &&
              Array.isArray(spec.unit) && {
                unit: spec.unit.reduce((acc: LocalizedString, item: any) => {
                  acc[item.language] = item.value;
                  return acc;
                }, {} as any),
              }),
          }));

    // Also create a grouped version of specifications
    const groupedSpecifications = mappedSpecs.length > 0 ? this.groupSpecificationsByGroup(mappedSpecs) : [];

    return {
      id: source.id || source.code,
      name,
      description,
      primaryImage,
      images,
      specifications: mappedSpecs,
      groupedSpecifications: groupedSpecifications,
      mixins,
    };
  }

  /**
   * Groups specifications by their group property
   * @param specifications - Array of product specifications
   * @returns Array of grouped specifications
   */
  groupSpecificationsByGroup(specifications: ProductSpecification[]): GroupedSpecification[] {
    const groupedByKey: Record<string, ProductSpecification[]> = {};

    specifications.forEach((spec) => {
      const group = spec.group || 'other';
      if (!groupedByKey[group]) {
        groupedByKey[group] = [];
      }
      groupedByKey[group].push(spec);
    });

    return Object.entries(groupedByKey).map(([group, specs]) => {
      const firstSpec = specs[0];
      const groupName =
        firstSpec.groupLabel?.['en'] || firstSpec.groupLabel?.['de'] || group.charAt(0).toUpperCase() + group.slice(1);

      const items = specs.map((spec) => {
        const label = spec.label['en'] || spec.label['de'] || spec.key;
        let value = spec.value['en'] || spec.value['de'] || '';

        if (spec.unit) {
          const unit = spec.unit['en'] || spec.unit['de'] || '';
          if (unit) {
            value = `${value} ${unit}`;
          }
        }

        return { label, value };
      });

      return {
        groupName,
        item: items,
      };
    });
  }

  /**
   * Maps an internal Product model back to Emporix product format.
   *
   * @param service - The internal Product model
   * @returns The Emporix product data
   */
  mapToSource(service: Product): EmporixProduct {
    // Convert images array to media objects
    const media = service.images
      ? service.images.map((image, ix) => ({
          id: service.id + '-' + ix,
          url: image.url,
          altText: image.altText,
          tags: [],
          contentType: 'image/jpeg', // Assuming JPEG format, adjust as needed
        }))
      : [];

    return {
      id: service.id,
      code: service.id, // Using id as code since it's required
      name: service.name,
      description: service.description,
      media: media,
      published: true,
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
    if (!localizedText) {
      return '';
    }
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
