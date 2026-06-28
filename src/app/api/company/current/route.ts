import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import server from '@/platform/server';
import type { CompanyService } from '@/platform/services/company/CompanyService';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { CompanyUpdateDto } from '@/platform/services/model/company/company';

export const dynamic = 'force-dynamic';

/**
 * GET /api/company/current
 * Full details of the currently selected company (legal entity).
 */
export async function GET() {
  try {
    const companyService = server.get<CompanyService>('CompanyService');
    const company = await companyService.getCompanyDetails();

    if (!company) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(company);
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        path: '/api/company/current',
        method: 'GET',
      },
      'Error fetching company details',
    );
    return NextResponse.json({ error: 'Failed to fetch company details' }, { status: 500 });
  }
}

/**
 * PUT /api/company/current
 * Update the currently selected company (legal entity).
 */
export async function PUT(request: NextRequest) {
  try {
    const update = (await request.json()) as CompanyUpdateDto;
    const companyService = server.get<CompanyService>('CompanyService');
    const company = await companyService.updateCompany(update);
    return NextResponse.json(company);
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        path: '/api/company/current',
        method: 'PUT',
      },
      'Error updating company details',
    );
    return NextResponse.json({ error: 'Failed to update company details' }, { status: 500 });
  }
}
