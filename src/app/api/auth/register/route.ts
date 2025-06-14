import { signIn } from 'next-auth/react';
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/platform/services/auth/AuthService';
import { Registration } from '@/platform/services/model/auth/auth';

/**
 * POST /api/auth/register
 * Register a new customer
 */
export async function POST(request: NextRequest) {
  try {
    // Get the auth service from the global registry
    const authService = globalThis.EMP.platform.server.get<AuthService>('AuthService');

    // Get registration data from request body
    const registrationData: Registration = await request.json();

    // Validate registration data
    if (!registrationData.credentials?.username || !registrationData.credentials?.password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Register the new customer
    const session = await authService.register(registrationData);
    if (!session) {
      return NextResponse.json({ error: 'Failed to register customer' }, { status: 401 });
    }
    const signInResponse = await signIn('credentials', {
      username: registrationData.credentials?.username,
      password: registrationData.credentials?.password,
      redirect: true,
    });
    if (!signInResponse || !signInResponse.url) {
      return NextResponse.json({ error: 'Failed to sign in' }, { status: 401 });
    }
    return NextResponse.redirect(signInResponse.url);
  } catch (error) {
    console.error('Registration error:', error);

    // Determine appropriate status code based on error
    let status = 500;
    let message = 'An unexpected error occurred during registration';

    if (error instanceof Error) {
      if (error.message.includes('already exists') || error.message.includes('already registered')) {
        status = 409; // Conflict
        message = error.message;
      } else if (error.message.includes('validation')) {
        status = 400; // Bad Request
        message = error.message;
      }
    }

    return NextResponse.json({ error: message }, { status });
  }
}
