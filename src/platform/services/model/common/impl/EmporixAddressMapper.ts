import { injectable } from '@/platform/core/di/injectable';
import { EmporixAddress, Mixins } from '@/platform/integrations/emporix/model/common';
import { Address, AddressType, GeoLocation } from '@/platform/services/model/common';
import { AddressMapper } from '../AddressMapper';

/**
 * Implementation of AddressMapper for Emporix address data.
 * Maps between Emporix API address format and internal Address model.
 */
@injectable('EmporixAddressMapper', 'Singleton')
export class EmporixAddressMapper implements AddressMapper<EmporixAddress> {
  /**
   * Maps an Emporix address to the internal Address model.
   *
   * @param source - The Emporix address data
   * @returns The internal Address model
   */
  mapToService(source: EmporixAddress): Address {
    const geoLocation = source.mixins?.['geolocation'] as GeoLocation;
    const addressTypes: AddressType[] =
      source?.tags?.map((tag) => {
        switch (tag) {
          default:
          case 'shipping':
            return 'SHIPPING';
          case 'billing':
            return 'BILLING';
        }
      }) || [];

    return {
      contactName: source.contactName || '',
      companyName: source.companyName || '',
      street: source.street || '',
      streetNumber: source.streetNumber || '',
      streetAppendix: source.streetAppendix || '',
      zipCode: source.zipCode || '',
      city: source.city,
      country: source.country,
      state: source.state,
      contactPhone: source.contactPhone,
      geoLocation,
      types: addressTypes,
    };
  }

  /**
   * Maps an internal Address model back to Emporix address format.
   *
   * @param service - The internal Address model
   * @returns The Emporix address data
   */
  mapToSource(service: Address): EmporixAddress {
    const mixins: Mixins = {};
    if (service.geoLocation) {
      mixins['geolocation'] = service.geoLocation;
    }
    const tags: string[] =
      service.types?.map((type) => {
        switch (type) {
          default:
          case 'SHIPPING':
            return 'shipping';
          case 'BILLING':
            return 'billing';
        }
      }) || [];
    return {
      contactName: service.contactName,
      companyName: service.companyName,
      street: service.street,
      streetNumber: service.streetNumber,
      streetAppendix: service.streetAppendix,
      zipCode: service.zipCode,
      city: service.city,
      country: service.country,
      state: service.state,
      contactPhone: service.contactPhone,
      mixins,
      tags,
    };
  }
}

export default EmporixAddressMapper;
