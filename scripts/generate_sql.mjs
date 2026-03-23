import { parse } from 'csv-parse/sync'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'datiAirtable')

function readCSV(filename) {
  const content = readFileSync(join(DATA_DIR, filename), 'utf-8').replace(/^\uFEFF/, '')
  return parse(content, { columns: true, skip_empty_lines: true, relax_quotes: true, trim: true })
}

function esc(val) {
  if (!val || String(val).trim() === '') return 'NULL'
  return "'" + String(val).trim().replace(/'/g, "''") + "'"
}
function num(val) {
  if (!val || String(val).trim() === '') return 'NULL'
  const n = parseFloat(String(val).replace(/[^0-9.-]/g, ''))
  return isNaN(n) ? 'NULL' : String(n)
}
function bool(val) {
  if (!val || String(val).trim() === '') return 'NULL'
  const v = String(val).trim().toLowerCase()
  if (v === 'true' || v === 'yes' || v === '1' || v === 'checked') return 'TRUE'
  if (v === 'false' || v === 'no' || v === '0') return 'FALSE'
  return 'NULL'
}

let sql = '-- Managemob Data Import\n-- Run in Supabase SQL Editor\n\n'

// Sending Organisations
sql += '-- SENDING ORGANISATIONS\n'
for (const r of readCSV('Sending Organisations.csv')) {
  if (!r['_id']) continue
  const v = [esc(r['_id']), esc(r['Name']) || "'(no name)'", esc(r['Contact Person']), esc(r['E-mail']), esc(r['Tel']), esc(r['Address']), esc(r['City']), esc(r['Country'])]
  sql += `INSERT INTO sending_organisations (id,name,contact_person,email,phone,address,city,country) VALUES (${v.join(',')}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,contact_person=EXCLUDED.contact_person,email=EXCLUDED.email,phone=EXCLUDED.phone,address=EXCLUDED.address,city=EXCLUDED.city,country=EXCLUDED.country;\n`
}

// Mobility Service Providers
sql += '\n-- MOBILITY SERVICE PROVIDERS\n'
for (const r of readCSV('Mobility Service Providers.csv')) {
  if (!r['_id']) continue
  const v = [esc(r['_id']), esc(r['Name of the organisation']) || "'(no name)'", esc(r['PIC number']), esc(r['Address']), esc(r['Postcode']), esc(r['City']), esc(r['Website']), esc(r['Email']), esc(r['Phone']), esc(r['Contact Person']), esc(r['Contact Email Address']), esc(r['Contact Phone']), esc(r['Contact Comments']), num(r['Number of offices']), num(r['Number of Employees']), num(r['Placement Capacity']), esc(r['Placement Fees']), esc(r['Geographic Area Covered']), esc(r['Specialty 1']), esc(r['Specialty 2']), esc(r['Specialty 3']), esc(r['Notes'])]
  sql += `INSERT INTO mobility_service_providers (id,name,pic_number,address,postcode,city,website,email,phone,contact_person,contact_email,contact_phone,contact_comments,num_offices,num_employees,placement_capacity,placement_fees,geographic_area,specialty_1,specialty_2,specialty_3,notes) VALUES (${v.join(',')}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,pic_number=EXCLUDED.pic_number,address=EXCLUDED.address,postcode=EXCLUDED.postcode,city=EXCLUDED.city,website=EXCLUDED.website,email=EXCLUDED.email,phone=EXCLUDED.phone,contact_person=EXCLUDED.contact_person,contact_email=EXCLUDED.contact_email,contact_phone=EXCLUDED.contact_phone,geographic_area=EXCLUDED.geographic_area,specialty_1=EXCLUDED.specialty_1,specialty_2=EXCLUDED.specialty_2,specialty_3=EXCLUDED.specialty_3,notes=EXCLUDED.notes;\n`
}

// Language Course Providers
sql += '\n-- LANGUAGE COURSE PROVIDERS\n'
for (const r of readCSV('Language Course Provider.csv')) {
  if (!r['_id']) continue
  const v = [esc(r['_id']), esc(r['Provider Name']) || "'(no name)'", esc(r['Address']), esc(r['City']), esc(r['Country']), esc(r['Contact Person']), esc(r['E-mail']), esc(r['Phone']), esc(r['Language Teach'])]
  sql += `INSERT INTO language_course_providers (id,name,address,city,country,contact_person,email,phone,language_taught) VALUES (${v.join(',')}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,address=EXCLUDED.address,city=EXCLUDED.city,country=EXCLUDED.country,contact_person=EXCLUDED.contact_person,email=EXCLUDED.email,phone=EXCLUDED.phone,language_taught=EXCLUDED.language_taught;\n`
}

// Insurance Providers
sql += '\n-- INSURANCE PROVIDERS\n'
for (const r of readCSV('Insurance.csv')) {
  if (!r['_id']) continue
  const v = [esc(r['_id']), esc(r['Insurance Provider']) || "'(no name)'", esc(r['Contact Person']), esc(r['Phone']), esc(r['Email']), esc(r['Address']), esc(r['City']), esc(r['Notes']), esc(r['Status'])]
  sql += `INSERT INTO insurance_providers (id,name,contact_person,phone,email,address,city,notes,status) VALUES (${v.join(',')}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,contact_person=EXCLUDED.contact_person,phone=EXCLUDED.phone,email=EXCLUDED.email,address=EXCLUDED.address,city=EXCLUDED.city,notes=EXCLUDED.notes,status=EXCLUDED.status;\n`
}

// Host Companies
sql += '\n-- HOST COMPANIES\n'
for (const r of readCSV('Host companies.csv')) {
  if (!r['_id']) continue
  const v = [esc(r['_id']), esc(r['Host Company']) || "'(no name)'", esc(r['Address']), esc(r['City']), esc(r['Sector']), esc(r['Contact Person']), esc(r['E-mail']), esc(r['Phone']), esc(r['HC Tutor']), esc(r['Tutor Mobile Phone']), esc(r['Tutor E-mail'])]
  sql += `INSERT INTO host_companies (id,name,address,city,sector,contact_person,email,phone,tutor,tutor_phone,tutor_email) VALUES (${v.join(',')}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,address=EXCLUDED.address,city=EXCLUDED.city,sector=EXCLUDED.sector,contact_person=EXCLUDED.contact_person,email=EXCLUDED.email,phone=EXCLUDED.phone,tutor=EXCLUDED.tutor,tutor_phone=EXCLUDED.tutor_phone,tutor_email=EXCLUDED.tutor_email;\n`
}

// Transfer Providers
sql += '\n-- TRANSFER PROVIDERS\n'
for (const r of readCSV('Transfer.csv')) {
  if (!r['_id']) continue
  const v = [esc(r['_id']), esc(r['Transfer Provider']) || "'(no name)'", esc(r['Contact Person']), esc(r['Phone']), esc(r['E-mail']), num(r['Transfer Normal Price']), esc(r['Notes'])]
  sql += `INSERT INTO transfer_providers (id,name,contact_person,phone,email,normal_price,notes) VALUES (${v.join(',')}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,contact_person=EXCLUDED.contact_person,phone=EXCLUDED.phone,email=EXCLUDED.email,normal_price=EXCLUDED.normal_price,notes=EXCLUDED.notes;\n`
}

// Accommodation
sql += '\n-- ACCOMMODATION\n'
for (const r of readCSV('Accommodation.csv')) {
  if (!r['_id'] || !r['Accommodation 1']?.trim()) continue
  const v = [esc(r['_id']), esc(r['Accommodation 1']) || "'(no name)'", esc(r['Accommodation Typology']), esc(r['Contact Person']), esc(r['E-mail']), esc(r['Phone']), esc(r['Mobile phone']), esc(r['Address']), esc(r['Postcode']), esc(r['City']), esc(r['Country']), num(r['Number of bedrooms']), num(r['Size unit (m²)']), bool(r['Desk']), bool(r['Internet access']), bool(r['Access to a washing machine']), esc(r['Private or shared bathrooms']), bool(r['Pets present in the household']), bool(r['Air conditioning']), bool(r['Heating']), esc(r['Board basis option 1']), num(r['Price p/w option 1']), esc(r['Board basis option 2']), num(r['Price p/w option 2']), esc(r['Board basis option 3']), num(r['Price p/w option 3']), esc(r['Bank details IBAN']), esc(r['Bank details SWIFT']), esc(r['Internal Rules of the host family or host']), esc(r['Comment'])]
  sql += `INSERT INTO accommodation (id,name,typology,contact_person,email,phone,mobile_phone,address,postcode,city,country,num_bedrooms,size_m2,has_desk,has_internet,has_washing_machine,bathrooms_type,has_pets,has_air_conditioning,has_heating,board_option_1,price_week_option_1,board_option_2,price_week_option_2,board_option_3,price_week_option_3,iban,swift,family_rules,comments) VALUES (${v.join(',')}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,typology=EXCLUDED.typology,contact_person=EXCLUDED.contact_person,email=EXCLUDED.email,phone=EXCLUDED.phone,city=EXCLUDED.city,country=EXCLUDED.country;\n`
}

// Participants
sql += '\n-- PARTICIPANTS\n'
for (const r of readCSV('Participants.csv')) {
  if (!r['_id']) continue
  const v = [esc(r['_id']), esc(r['ID Name']), esc(r['ID Formattato']), num(r['Record Number']), esc(r['Mobility Typology']), esc(r['Arrival/Departure']), esc(r['Indiv./Group']), esc(r['Name']), esc(r['Surname']), esc(r['Sex']), esc(r['Status']), esc(r['Date of birth']), esc(r['Place of Birth']), esc(r['Nationality']), esc(r['Marital Status']), esc(r['Address']), esc(r['Postcode']), esc(r['City']), esc(r['Country']), esc(r['Email']), esc(r['Phone']), esc(r['Mobile Phone']), esc(r['Passport Number']), esc(r['Passport Expiring Date']), esc(r['Driving Licence']), esc(r['Language: English']), esc(r['Language: Spanish']), esc(r['Language: French']), esc(r['Language: German']), esc(r['Language: Italian']), esc(r['Language: Other']), esc(r['Language Test Validated']), esc(r['Language Test Score']), esc(r['Last Validated Diploma']), esc(r['Year Obtained']), esc(r['Bank details - SWIFT CODE']), esc(r['Bank Details - IBAN']), esc(r['Destination Country']), esc(r['Destination_City']), esc(r['Arrivals Date']), esc(r['Departure Date']), esc(r['Language Course Start Date']), esc(r['Language Course End Date']), num(r['Language Course Weeks']), esc(r['Internship Start Date']), esc(r['Internship End Date']), num(r['Internship Weeks']), esc(r['Group Name']), esc(r['Project Name']), esc(r['Program']), num(r['Grant Amount']), num(r['International Transport Cost']), num(r['Local Transport Cost']), num(r['Food Allowance Cost']), num(r['Insurance Cost']), num(r['Other Expenses']), esc(r['Note for other expences']), num(r['Accommodation 1 Cost']), num(r['Accommodation 2 Cost']), num(r['Transfer Cost']), esc(r['Accommodation Start Date 1']), esc(r['Accommodation End Date 1']), num(r['Accommodation/Week']), esc(r['Accommodation Start Date 2']), esc(r['Accommodation End Date 2']), num(r['Accommodation 2 Week'])]
  sql += `INSERT INTO participants (id,id_name,id_formattato,record_number,mobility_typology,arrival_departure,indiv_group,name,surname,sex,status,date_of_birth,place_of_birth,nationality,marital_status,address,postcode,city,country,email,phone,mobile_phone,passport_number,passport_expiring_date,driving_licence,lang_english,lang_spanish,lang_french,lang_german,lang_italian,lang_other,language_test_validated,language_test_score,last_diploma,year_obtained,swift_code,iban,destination_country,destination_city,arrival_date,departure_date,language_course_start_date,language_course_end_date,language_course_weeks,internship_start_date,internship_end_date,internship_weeks,group_name,project_name,program,grant_amount,international_transport_cost,local_transport_cost,food_allowance_cost,insurance_cost,other_expenses,note_other_expenses,accommodation_1_cost,accommodation_2_cost,transfer_cost,accommodation_1_start_date,accommodation_1_end_date,accommodation_1_weeks,accommodation_2_start_date,accommodation_2_end_date,accommodation_2_weeks) VALUES (${v.join(',')}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,surname=EXCLUDED.surname,mobility_typology=EXCLUDED.mobility_typology,arrival_departure=EXCLUDED.arrival_departure,status=EXCLUDED.status,destination_country=EXCLUDED.destination_country,destination_city=EXCLUDED.destination_city;\n`
}

// Financial Info
sql += '\n-- FINANCIAL INFO\n'
for (const r of readCSV('Financial info.csv')) {
  if (!r['_id']) continue
  const v = [esc(r['_id']), num(r['International Transport Cost']), num(r['Local Transport Cost']), num(r['Food Allowance Cost']), num(r['Insurance Cost']), num(r['Other Exepences Cost']), esc(r['Note for Other Experiences Cost']), num(r['Accommodation']), num(r['Accommodation 2']), num(r['Transfer Cost']), num(r['Grant']), num(r['Margin']), num(r['Language Course Cost']), num(r['Cultural Activities Cost'])]
  sql += `INSERT INTO financial_info (id,international_transport_cost,local_transport_cost,food_allowance_cost,insurance_cost,other_expenses,note_other_expenses,accommodation_cost,accommodation_2_cost,transfer_cost,grant_amount,margin,language_course_cost,cultural_activities_cost) VALUES (${v.join(',')}) ON CONFLICT (id) DO UPDATE SET grant_amount=EXCLUDED.grant_amount,margin=EXCLUDED.margin,international_transport_cost=EXCLUDED.international_transport_cost;\n`
}

writeFileSync(join(__dirname, '..', 'import_data.sql'), sql)
console.log('Generato import_data.sql — righe: ' + sql.split('\n').length)
