import { NextResponse } from 'next/server';
import server from '@/platform/server';
import type { CompanyService } from '@/platform/services/company/CompanyService';
import type { LoggerService } from '@/platform/services/logger/LoggerService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/company/current/team/groups
 * The predefined company groups (Admin / Buyer / Requester / Contact) that
 * members can be assigned to.
 */
export async function GET() {
  try {
    const companyService = server.get<CompanyService>('CompanyService');
    const groups = await companyService.getCompanyGroups();
    return NextResponse.json(groups);
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        path: '/api/company/current/team/groups',
        method: 'GET',
      },
      'Error fetching company groups',
    );
    return NextResponse.json({ error: 'Failed to fetch company groups' }, { status: 500 });
  }
}
