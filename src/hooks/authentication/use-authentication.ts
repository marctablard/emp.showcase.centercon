import { useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthenticationHook {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

/**
 * Hook for authentication functionality
 * @returns Authentication state and functions
 */
export const useAuthentication = (): AuthenticationHook => {
  // Mock user data
  const mockUser: User = {
    id: '1',
    username: 'user',
    email: 'test@example.com',
  };

  // State for authentication status and user data
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Mock login function
   * @param username Username for login
   * @param password Password for login
   * @returns Promise resolving to success status
   */
  const login = async (username: string, password: string): Promise<boolean> => {
    // Set loading state to true at the beginning of the login process
    setIsLoading(true);
    
    try {
      // Mock authentication logic - in a real app, this would call an API
      return new Promise((resolve) => {
        // Simulate API call delay
        setTimeout(() => {
          // Simple mock validation (accept any non-empty username/password)
          if (username && password) {
            setIsAuthenticated(true);
            setUser(mockUser);
            resolve(true);
          } else {
            setIsAuthenticated(false);
            setUser(null);
            resolve(false);
          }
          // Set loading state to false when the login process is complete
          setIsLoading(false);
        }, 500); // 500ms delay to simulate network request
      });
    } catch (error) {
      // Set loading state to false in case of error
      setIsLoading(false);
      throw error;
    }
  };

  /**
   * Logout function
   */
  const logout = (): void => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
  };
};

export default useAuthentication;
