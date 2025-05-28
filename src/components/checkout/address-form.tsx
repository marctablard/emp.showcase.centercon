'use client';

import React from 'react';
import { CheckoutAddress } from '@/platform/services/model/checkout';

interface AddressFormProps {
  initialData?: Partial<Omit<CheckoutAddress, 'type'>>;
  onDataChange: (data: Omit<CheckoutAddress, 'type'>) => void;
  isReadOnly?: boolean;
}

/**
 * Reusable address form component for checkout
 * Can be used for both shipping and billing addresses
 */
const AddressForm: React.FC<AddressFormProps> = ({ 
  initialData = {}, 
  onDataChange,
  isReadOnly = false
}) => {
  const [formData, setFormData] = React.useState<Omit<CheckoutAddress, 'type'>>({
    contactName: '',
    street: '',
    streetNumber: '',
    zipCode: '',
    city: '',
    country: '',
    ...initialData
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onDataChange(updatedData);
  };

  // Common countries list - can be expanded or fetched from an API
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'JP', name: 'Japan' },
    { code: 'AU', name: 'Australia' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          id="contactName"
          name="contactName"
          value={formData.contactName}
          onChange={handleChange}
          disabled={isReadOnly}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="John Doe"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
            Street *
          </label>
          <input
            type="text"
            id="street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            disabled={isReadOnly}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="123 Main St"
          />
        </div>
        
        <div>
          <label htmlFor="streetNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Street Number
          </label>
          <input
            type="text"
            id="streetNumber"
            name="streetNumber"
            value={formData.streetNumber || ''}
            onChange={handleChange}
            disabled={isReadOnly}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Apt 4B"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
            Zip/Postal Code *
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            disabled={isReadOnly}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="10001"
          />
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            disabled={isReadOnly}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="New York"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            disabled={isReadOnly}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select a country</option>
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            State/Province
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state || ''}
            onChange={handleChange}
            disabled={isReadOnly}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="NY"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          id="contactPhone"
          name="contactPhone"
          value={formData.contactPhone || ''}
          onChange={handleChange}
          disabled={isReadOnly}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
          Company (Optional)
        </label>
        <input
          type="text"
          id="companyName"
          name="companyName"
          value={formData.companyName || ''}
          onChange={handleChange}
          disabled={isReadOnly}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Company Name"
        />
      </div>
    </div>
  );
};

export default AddressForm;
