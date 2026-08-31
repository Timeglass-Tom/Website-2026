/**
 * Countries offered at signup. Southeast Asia sits at the top of the list
 * because that is where the overwhelming majority of signups come from and a VA
 * on a phone should not scroll past Argentina to find the Philippines.
 */
export const PRIORITY_COUNTRIES = [
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'IN', name: 'India' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'BD', name: 'Bangladesh' },
] as const;

export const OTHER_COUNTRIES = [
  { code: 'AR', name: 'Argentina' },
  { code: 'AU', name: 'Australia' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CA', name: 'Canada' },
  { code: 'CO', name: 'Colombia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'MX', name: 'Mexico' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NP', name: 'Nepal' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'US', name: 'United States' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'OTHER', name: 'Somewhere else' },
] as const;

export const COMPANY_SIZES = [
  { value: '1', label: 'Just them (solo operator)' },
  { value: '2-10', label: '2–10 people' },
  { value: '11-50', label: '11–50 people' },
  { value: '51-200', label: '51–200 people' },
  { value: '200+', label: '200+ people' },
  { value: 'unknown', label: 'Not sure' },
] as const;

export const PITCH_CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'in_person', label: 'In person' },
  { value: 'chat', label: 'Chat (Slack, WhatsApp, Teams…)' },
  { value: 'other', label: 'Some other way' },
] as const;
