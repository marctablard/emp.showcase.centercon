'use client';

import React, { useEffect, useState } from 'react';
import { Customer, ContactData } from '@/platform/services/model/checkout';
import { useCheckout } from '@/hooks/checkout/useCheckout';

interface CustomerDataProps {
  initialData?: Partial<Customer>;
  isReadOnly?: boolean;
}

/**
 * Customer data form component for checkout
 * Collects basic customer information (email, name)
 */
const ContactDataComponent: React.FC<CustomerDataProps> = ({ 
  initialData = {}, 
  isReadOnly = false
}) => {
  const { contactData, submitContactData } = useCheckout();
  
  const [formData, setFormData] = useState<Customer>({
    email: contactData?.email || '',
    firstName: contactData?.firstName || '',
    lastName: contactData?.lastName || '',
    phone: contactData?.phone || '',
    company: contactData?.company || '',
    ...initialData
  });

  useEffect(() => {
    if (formData.email && formData.firstName && formData.lastName) {
      // Submit contact data to the checkout store
      const contactData: ContactData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName
      };
      
      // Only add optional fields if they have values
      if (formData.phone) contactData.phone = formData.phone;
      if (formData.company) contactData.company = formData.company;
      
      submitContactData(contactData);
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800">Contact Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isReadOnly}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            disabled={isReadOnly}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>
        
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleChange}
            disabled={isReadOnly}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="John"
          />
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleChange}
            disabled={isReadOnly}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Doe"
          />
        </div>
        
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company (Optional)
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company || ''}
            onChange={handleChange}
            disabled={isReadOnly}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Your Company"
          />
        </div>
      </div>
      
      {isReadOnly && (
        <div className="mt-4 text-right">
          <button 
            type="button"
            className="text-indigo-600 hover:text-indigo-800"
            onClick={() => {/* Add edit functionality here */}}
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactDataComponent;
