import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import server from '@/platform/server';
import type { CompanyService } from '@/platform/services/company/CompanyService';
import type { LoggerService } from '@/platform/services/logger/LoggerService';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/company/current/team/{customerId}
 * Set a member's company group memberships. Body: { groupIds: string[] }.
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  try {
    const { groupIds } = (await request.json()) as { groupIds?: string[] };
    if (!Array.isArray(groupIds)) {
      return NextResponse.json({ error: 'groupIds (array) is required' }, { status: 400 });
    }

    const companyService = server.get<CompanyService>('CompanyService');
    const member = await companyService.updateTeamMemberGroups(customerId, groupIds);
    return NextResponse.json(member);
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        path: `/api/company/current/team/${customerId}`,
        method: 'PUT',
        customerId,
      },
      'Error updating team member groups',
    );
    return NextResponse.json({ error: 'Failed to update team member groups' }, { status: 500 });
  }
}

/**
 * DELETE /api/company/current/team/{customerId}
 * Remove a member from the currently selected company.
 */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  try {
    const companyService = server.get<CompanyService>('CompanyService');
    await companyService.removeTeamMember(customerId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        path: `/api/company/current/team/${customerId}`,
        method: 'DELETE',
        customerId,
      },
      'Error removing team member',
    );
    return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 });
  }
}
