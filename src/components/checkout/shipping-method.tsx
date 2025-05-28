'use client';

import React, { useState, useEffect } from 'react';
import { Shipping } from '@/platform/services/model/checkout';
import { useTranslations } from 'next-intl';
import { useCheckout } from '@/hooks/checkout/useCheckout';

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDelivery: string;
  zoneId: string;
}

interface ShippingMethodProps {
  initialMethod?: Shipping;
  isReadOnly?: boolean;
}

/**
 * Shipping method selection component
 * Allows users to select their preferred shipping method
 */
const ShippingMethod: React.FC<ShippingMethodProps> = ({
  isReadOnly = false
}) => {
  // Get the submitShippingMethod function from useCheckout
  // Note: This doesn't exist yet, we'll need to add it to the useCheckout hook
  const { shippingMethod, submitShippingMethod } = useCheckout();
  const t = useTranslations('Checkout');
  
  // Mock shipping options - in a real app, these would come from an API
  const shippingOptions: ShippingOption[] = [
    {
      id: 'de-standard',
      name: 'Standard Shipping',
      description: '3-5 business days',
      price: 4.95,
      estimatedDelivery: '3-5 business days',
      zoneId: 'de-default'
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: '1-2 business days',
      price: 9.99,
      estimatedDelivery: '1-2 business days',
      zoneId: 'de-default'
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Next business day',
      price: 19.99,
      estimatedDelivery: 'Next business day',
      zoneId: 'de-default'
    }
  ];

  const [selectedMethod, setSelectedMethod] = useState<string>(
    shippingMethod?.methodId || 'standard'
  );

  useEffect(() => {
    if (shippingMethod?.methodId) {
      setSelectedMethod(shippingMethod.methodId);
    }
  }, [shippingMethod]);

  const handleMethodChange = (methodId: string) => {
    if (isReadOnly) return;
    
    setSelectedMethod(methodId);
    const option = shippingOptions.find(opt => opt.id === methodId);
    
    if (option) {
      const shippingMethod: Shipping = {
        methodId: option.id,
        methodName: option.name,
        amount: option.price,
        zoneId: option.zoneId
      };
      
      // Use the submitShippingMethod function from useCheckout
      submitShippingMethod(shippingMethod);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('shippingMethod')}</h2>
      
      <div className="space-y-4">
        {shippingOptions.map((option) => (
          <div 
            key={option.id}
            className={`border rounded-md p-4 cursor-pointer transition-colors ${
              selectedMethod === option.id 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-200 hover:border-indigo-300'
            } ${isReadOnly ? 'opacity-75 pointer-events-none' : ''}`}
            onClick={() => handleMethodChange(option.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedMethod === option.id ? 'border-indigo-600' : 'border-gray-300'
                }`}>
                  {selectedMethod === option.id && (
                    <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{option.name}</h3>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-medium">
                  {option.price === 0 
                    ? t('freeShipping') 
                    : new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: 'USD' 
                      }).format(option.price)
                  }
                </span>
                <p className="text-xs text-gray-500">{option.estimatedDelivery}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShippingMethod;
