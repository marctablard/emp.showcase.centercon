import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import server from '@/platform/server';
import type { CompanyService } from '@/platform/services/company/CompanyService';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { CreateTeamMemberInput } from '@/platform/services/model/team/team';

export const dynamic = 'force-dynamic';

/**
 * GET /api/company/current/team
 * List the members of the currently selected company with their roles.
 */
export async function GET() {
  try {
    const companyService = server.get<CompanyService>('CompanyService');
    const members = await companyService.getTeamMembers();
    return NextResponse.json(members);
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        path: '/api/company/current/team',
        method: 'GET',
      },
      'Error fetching team members',
    );
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

/**
 * POST /api/company/current/team
 * Create (invite) a new team member and assign them to a company group.
 */
export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as CreateTeamMemberInput;

    if (!input?.email || !input?.firstName || !input?.lastName || !Array.isArray(input?.groupIds)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const companyService = server.get<CompanyService>('CompanyService');
    const member = await companyService.createTeamMember(input);
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        path: '/api/company/current/team',
        method: 'POST',
      },
      'Error creating team member',
    );
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
  }
}
