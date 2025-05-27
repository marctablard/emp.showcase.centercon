import { useState } from 'react';

// Define the registration data interface based on the form in registration-card.tsx
export interface RegistrationData {
  registrationType: string;
  firstName: string;
  lastName: string;
  email: string;
  emailConfirmation: string;
  companyName?: string;
  businessType?: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
  vatNumber?: string;
  shippingSameAsBilling: boolean;
  username: string;
  password: string;
  passwordConfirmation: string;
  newsletter: boolean;
  dealsAlerts: boolean;
}

interface RegistrationResult {
  success: boolean;
  userId?: string;
  error?: string;
}

interface RegistrationHook {
  isRegistering: boolean;
  register: (data: RegistrationData) => Promise<RegistrationResult>;
  registrationError: string | null;
  isSuccess: boolean;
}

/**
 * Hook for user registration functionality
 * @returns Registration state and functions
 */
export const useRegistration = (): RegistrationHook => {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  /**
   * Mock registration function
   * @param data Registration data from form
   * @returns Promise resolving to registration result
   */
  const register = async (data: RegistrationData): Promise<RegistrationResult> => {
    // Reset states at the beginning
    setIsRegistering(true);
    setRegistrationError(null);
    setIsSuccess(false);
    
    try {
      // Special case 3: Email "error@example.com" simulates a server error
      // Handle this outside the Promise to ensure the error is properly caught
      if (data.email === 'error@example.com') {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsRegistering(false);
        throw new Error('SERVER_ERROR');
      }
      
      // Mock registration logic - in a real app, this would call an API
      return await new Promise((resolve) => {
        // Simulate API call delay
        setTimeout(() => {
          // Special cases to trigger different registration scenarios
          
          // Case 1: Username "taken" simulates a username already in use
          if (data.username === 'taken') {
            setIsRegistering(false);
            setRegistrationError('Username already taken');
            setIsSuccess(false);
            resolve({
              success: false,
              error: 'USERNAME_TAKEN'
            });
            return;
          }
          
          // Case 2: Email "exists@example.com" simulates an email already in use
          if (data.email === 'exists@example.com') {
            setIsRegistering(false);
            setRegistrationError('Email already registered');
            setIsSuccess(false);
            resolve({
              success: false,
              error: 'EMAIL_EXISTS'
            });
            return;
          }
          
          // Default case: successful registration
          const mockUserId = `user_${Math.random().toString(36).substring(2, 11)}`;
          setIsSuccess(true);
          setIsRegistering(false);
          resolve({
            success: true,
            userId: mockUserId
          });
        }, 1000); // 1000ms delay to simulate network request
      });
    } catch (error) {
      setIsRegistering(false);
      if (error instanceof Error && error.message === 'SERVER_ERROR') {
        setRegistrationError('Server error occurred');
        return {
          success: false,
          error: 'SERVER_ERROR'
        };
      }
      setRegistrationError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };

  return {
    isRegistering,
    register,
    registrationError,
    isSuccess
  };
};

export default useRegistration;
