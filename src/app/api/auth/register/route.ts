import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/platform/services/auth/AuthService';
import { Registration } from '@/platform/services/model/auth/auth';

const AUTH_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'emp-auth-session';

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

    // Create response with session data
    const response = NextResponse.json(session);

    // Set session cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: JSON.stringify({
        sessionId: session.sessionId,
        customerId: session.customerId,
      }),
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
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
