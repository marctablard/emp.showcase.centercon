export interface CompanyOnboardingStatus {
  status: 'approved' | 'pending' | 'rejected';
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  onboarding?: CompanyOnboardingStatus;
}
