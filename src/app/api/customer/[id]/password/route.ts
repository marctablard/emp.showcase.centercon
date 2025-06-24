import { NextRequest, NextResponse } from 'next/server';
import { CustomerService, PasswordChangeDto } from '@/platform/services/customer/CustomerService';

/**
 * Change the password for a customer
 * Only works for the currently logged-in customer
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: customerId } = await params;

    // This endpoint should only be used for the current customer
    if (customerId !== 'current') {
      return NextResponse.json(
        { error: 'Password changes are only allowed for the current customer' },
        { status: 403 },
      );
    }

    // Get the password data from the request
    const passwordData: PasswordChangeDto = await request.json();

    // Validate the password data
    if (!passwordData || !passwordData.currentPassword || !passwordData.newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    // Get the customer service
    const customerService = globalThis.EMP.platform.server.get<CustomerService>('CustomerService');

    // Change the password
    await customerService.changePassword(passwordData);

    // Return success response
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error changing customer password:', error);

    // Handle specific error cases
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    return NextResponse.json(
      { error: `Failed to change password: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 },
    );
  }
}
