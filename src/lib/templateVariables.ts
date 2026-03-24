import type { Participant } from '../types'

export interface TemplateVariable {
  tag: string
  label: string
  category: string
}

export const TEMPLATE_CATEGORIES = [
  'personal',
  'contact',
  'passport',
  'mobility',
  'providers',
  'language_course',
  'internship',
  'accommodation',
  'financial',
  'banking',
  'education',
  'languages',
] as const

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number]

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  personal: 'Personal',
  contact: 'Contact',
  passport: 'Passport',
  mobility: 'Mobility',
  providers: 'Providers',
  language_course: 'Language Course',
  internship: 'Internship',
  accommodation: 'Accommodation',
  financial: 'Financial',
  banking: 'Banking',
  education: 'Education',
  languages: 'Languages',
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  // Personal
  { tag: 'name', label: 'First Name', category: 'personal' },
  { tag: 'surname', label: 'Last Name', category: 'personal' },
  { tag: 'sex', label: 'Sex', category: 'personal' },
  { tag: 'status', label: 'Status', category: 'personal' },
  { tag: 'date_of_birth', label: 'Date of Birth', category: 'personal' },
  { tag: 'place_of_birth', label: 'Place of Birth', category: 'personal' },
  { tag: 'nationality', label: 'Nationality', category: 'personal' },
  { tag: 'marital_status', label: 'Marital Status', category: 'personal' },
  { tag: 'driving_licence', label: 'Driving Licence', category: 'personal' },

  // Contact
  { tag: 'email', label: 'Email', category: 'contact' },
  { tag: 'phone', label: 'Phone', category: 'contact' },
  { tag: 'mobile_phone', label: 'Mobile', category: 'contact' },
  { tag: 'address', label: 'Address', category: 'contact' },
  { tag: 'postcode', label: 'Postcode', category: 'contact' },
  { tag: 'city', label: 'City', category: 'contact' },
  { tag: 'country', label: 'Country', category: 'contact' },

  // Passport
  { tag: 'passport_number', label: 'Passport No.', category: 'passport' },
  { tag: 'passport_expiring_date', label: 'Passport Expiry', category: 'passport' },

  // Mobility
  { tag: 'mobility_typology', label: 'Typology', category: 'mobility' },
  { tag: 'indiv_group', label: 'Individual/Group', category: 'mobility' },
  { tag: 'group_name', label: 'Group Name', category: 'mobility' },
  { tag: 'destination_country', label: 'Destination Country', category: 'mobility' },
  { tag: 'destination_city', label: 'Destination City', category: 'mobility' },
  { tag: 'arrival_date', label: 'Arrival Date', category: 'mobility' },
  { tag: 'departure_date', label: 'Departure Date', category: 'mobility' },
  { tag: 'program', label: 'Program', category: 'mobility' },
  { tag: 'project_name', label: 'Project', category: 'mobility' },

  // Providers (flattened from joined relations)
  { tag: 'sending_org_name', label: 'Sending Org — Name', category: 'providers' },
  { tag: 'host_company_name', label: 'Host Company — Name', category: 'providers' },
  { tag: 'host_company_city', label: 'Host Company — City', category: 'providers' },
  { tag: 'host_company_sector', label: 'Host Company — Sector', category: 'providers' },
  { tag: 'host_company_tutor', label: 'Host Company — Tutor', category: 'providers' },
  { tag: 'host_company_tutor_phone', label: 'Host Company — Tutor Phone', category: 'providers' },
  { tag: 'host_company_tutor_email', label: 'Host Company — Tutor Email', category: 'providers' },
  { tag: 'insurance_name', label: 'Insurance Provider', category: 'providers' },
  { tag: 'transfer_name', label: 'Transfer Provider', category: 'providers' },
  { tag: 'language_course_provider_name', label: 'Language Course Provider', category: 'providers' },
  { tag: 'accommodation_1_name', label: 'Accommodation 1 — Name', category: 'providers' },
  { tag: 'accommodation_1_city', label: 'Accommodation 1 — City', category: 'providers' },
  { tag: 'accommodation_1_typology', label: 'Accommodation 1 — Type', category: 'providers' },
  { tag: 'accommodation_2_name', label: 'Accommodation 2 — Name', category: 'providers' },
  { tag: 'accommodation_2_city', label: 'Accommodation 2 — City', category: 'providers' },
  { tag: 'accommodation_2_typology', label: 'Accommodation 2 — Type', category: 'providers' },
  { tag: 'mobility_provider_name', label: 'Mobility Provider', category: 'providers' },

  // Language Course
  { tag: 'language_course_start_date', label: 'Start Date', category: 'language_course' },
  { tag: 'language_course_end_date', label: 'End Date', category: 'language_course' },
  { tag: 'language_course_weeks', label: 'Weeks', category: 'language_course' },

  // Internship
  { tag: 'internship_start_date', label: 'Start Date', category: 'internship' },
  { tag: 'internship_end_date', label: 'End Date', category: 'internship' },
  { tag: 'internship_weeks', label: 'Weeks', category: 'internship' },

  // Accommodation dates
  { tag: 'accommodation_1_start_date', label: 'Acc. 1 Start', category: 'accommodation' },
  { tag: 'accommodation_1_end_date', label: 'Acc. 1 End', category: 'accommodation' },
  { tag: 'accommodation_1_weeks', label: 'Acc. 1 Weeks', category: 'accommodation' },
  { tag: 'accommodation_1_cost', label: 'Acc. 1 Cost', category: 'accommodation' },
  { tag: 'accommodation_2_start_date', label: 'Acc. 2 Start', category: 'accommodation' },
  { tag: 'accommodation_2_end_date', label: 'Acc. 2 End', category: 'accommodation' },
  { tag: 'accommodation_2_weeks', label: 'Acc. 2 Weeks', category: 'accommodation' },
  { tag: 'accommodation_2_cost', label: 'Acc. 2 Cost', category: 'accommodation' },

  // Financial
  { tag: 'grant_amount', label: 'Grant Amount', category: 'financial' },
  { tag: 'international_transport_cost', label: 'Intl. Transport', category: 'financial' },
  { tag: 'local_transport_cost', label: 'Local Transport', category: 'financial' },
  { tag: 'food_allowance_cost', label: 'Food Allowance', category: 'financial' },
  { tag: 'insurance_cost', label: 'Insurance Cost', category: 'financial' },
  { tag: 'transfer_cost', label: 'Transfer Cost', category: 'financial' },
  { tag: 'language_course_cost', label: 'Language Course Cost', category: 'financial' },
  { tag: 'cultural_activities_cost', label: 'Cultural Activities', category: 'financial' },
  { tag: 'other_expenses', label: 'Other Expenses', category: 'financial' },
  { tag: 'margin', label: 'Margin', category: 'financial' },

  // Banking
  { tag: 'iban', label: 'IBAN', category: 'banking' },
  { tag: 'swift_code', label: 'SWIFT', category: 'banking' },

  // Education
  { tag: 'last_diploma', label: 'Last Diploma', category: 'education' },
  { tag: 'year_obtained', label: 'Year Obtained', category: 'education' },

  // Languages
  { tag: 'lang_english', label: 'English', category: 'languages' },
  { tag: 'lang_spanish', label: 'Spanish', category: 'languages' },
  { tag: 'lang_french', label: 'French', category: 'languages' },
  { tag: 'lang_german', label: 'German', category: 'languages' },
  { tag: 'lang_italian', label: 'Italian', category: 'languages' },
  { tag: 'lang_other', label: 'Other Languages', category: 'languages' },
  { tag: 'language_test_score', label: 'Test Score', category: 'languages' },
]

const KNOWN_TAGS = new Set(TEMPLATE_VARIABLES.map(v => v.tag))

/** Check if a tag is recognized */
export function isKnownTag(tag: string): boolean {
  return KNOWN_TAGS.has(tag)
}

/** Format a number as EUR */
function fmtNum(v: number | null | undefined): string {
  if (v == null) return ''
  return v.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Format a value to string */
function str(v: string | number | boolean | null | undefined): string {
  if (v == null) return ''
  return String(v)
}

/**
 * Flatten a Participant (with joined relations) into a Record<string, string>
 * for use as docxtemplater data.
 */
export function flattenParticipant(p: Participant): Record<string, string> {
  // Calculate margin
  const grant = p.grant_amount || 0
  const costs = (p.international_transport_cost || 0) + (p.local_transport_cost || 0) +
    (p.food_allowance_cost || 0) + (p.insurance_cost || 0) +
    (p.accommodation_1_cost || 0) + (p.accommodation_2_cost || 0) +
    (p.transfer_cost || 0) + (p.language_course_cost || 0) +
    (p.cultural_activities_cost || 0) + (p.other_expenses || 0)
  const margin = grant - costs

  return {
    // Personal
    name: str(p.name),
    surname: str(p.surname),
    sex: str(p.sex),
    status: str(p.status),
    date_of_birth: str(p.date_of_birth),
    place_of_birth: str(p.place_of_birth),
    nationality: str(p.nationality),
    marital_status: str(p.marital_status),
    driving_licence: str(p.driving_licence),

    // Contact
    email: str(p.email),
    phone: str(p.phone),
    mobile_phone: str(p.mobile_phone),
    address: str(p.address),
    postcode: str(p.postcode),
    city: str(p.city),
    country: str(p.country),

    // Passport
    passport_number: str(p.passport_number),
    passport_expiring_date: str(p.passport_expiring_date),

    // Mobility
    mobility_typology: str(p.mobility_typology),
    indiv_group: str(p.indiv_group),
    group_name: str(p.group_name),
    destination_country: str(p.destination_country),
    destination_city: str(p.destination_city),
    arrival_date: str(p.arrival_date),
    departure_date: str(p.departure_date),
    program: str(p.program),
    project_name: str(p.project_name),

    // Providers (flattened)
    sending_org_name: str(p.sending_organisations?.name),
    host_company_name: str(p.host_companies?.name),
    host_company_city: str(p.host_companies?.city),
    host_company_sector: str(p.host_companies?.sector),
    host_company_tutor: str(p.host_companies?.tutor),
    host_company_tutor_phone: str(p.host_companies?.tutor_phone),
    host_company_tutor_email: str(p.host_companies?.tutor_email),
    insurance_name: str(p.insurance_providers?.name),
    transfer_name: str(p.transfer_providers?.name),
    language_course_provider_name: str(p.language_course_providers?.name),
    accommodation_1_name: str(p.accommodation_1?.name),
    accommodation_1_city: str(p.accommodation_1?.city),
    accommodation_1_typology: str(p.accommodation_1?.typology),
    accommodation_2_name: str(p.accommodation_2?.name),
    accommodation_2_city: str(p.accommodation_2?.city),
    accommodation_2_typology: str(p.accommodation_2?.typology),
    mobility_provider_name: str((p as any).mobility_service_providers?.name),

    // Language Course
    language_course_start_date: str(p.language_course_start_date),
    language_course_end_date: str(p.language_course_end_date),
    language_course_weeks: str(p.language_course_weeks),

    // Internship
    internship_start_date: str(p.internship_start_date),
    internship_end_date: str(p.internship_end_date),
    internship_weeks: str(p.internship_weeks),

    // Accommodation dates/costs
    accommodation_1_start_date: str(p.accommodation_1_start_date),
    accommodation_1_end_date: str(p.accommodation_1_end_date),
    accommodation_1_weeks: str(p.accommodation_1_weeks),
    accommodation_1_cost: fmtNum(p.accommodation_1_cost),
    accommodation_2_start_date: str(p.accommodation_2_start_date),
    accommodation_2_end_date: str(p.accommodation_2_end_date),
    accommodation_2_weeks: str(p.accommodation_2_weeks),
    accommodation_2_cost: fmtNum(p.accommodation_2_cost),

    // Financial
    grant_amount: fmtNum(p.grant_amount),
    international_transport_cost: fmtNum(p.international_transport_cost),
    local_transport_cost: fmtNum(p.local_transport_cost),
    food_allowance_cost: fmtNum(p.food_allowance_cost),
    insurance_cost: fmtNum(p.insurance_cost),
    transfer_cost: fmtNum(p.transfer_cost),
    language_course_cost: fmtNum(p.language_course_cost),
    cultural_activities_cost: fmtNum(p.cultural_activities_cost),
    other_expenses: fmtNum(p.other_expenses),
    margin: fmtNum(margin),

    // Banking
    iban: str(p.iban),
    swift_code: str(p.swift_code),

    // Education
    last_diploma: str(p.last_diploma),
    year_obtained: str(p.year_obtained),

    // Languages
    lang_english: str(p.lang_english),
    lang_spanish: str(p.lang_spanish),
    lang_french: str(p.lang_french),
    lang_german: str(p.lang_german),
    lang_italian: str(p.lang_italian),
    lang_other: str(p.lang_other),
    language_test_score: str(p.language_test_score),
  }
}
