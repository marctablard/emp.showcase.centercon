import { NextRequest, NextResponse } from 'next/server';
import { getServerLogger } from '@/lib/logger/server-logger';
import server from '@/platform/server';
import { CompanyService } from '@/platform/services/company/CompanyService';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: companyId } = await params;

  try {
    const companyService = server.get<CompanyService>('CompanyService');
    const company = await companyService.getCompany(companyId === 'current' ? undefined : companyId);

    if (!company) {
      // Return 204 No Content if no company is found
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(company);
  } catch (error) {
    const logger = getServerLogger();
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: `/api/company/${companyId}`,
        method: 'GET',
        companyId,
      },
      'Error fetching company',
    );
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 });
  }
}
