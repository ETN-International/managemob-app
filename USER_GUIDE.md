# Managemob — User Guide

Managemob is a web-based platform for managing international mobility programs. It handles both **incoming** (participants arriving) and **outgoing** (participants departing) mobilities, tracking participants, host companies, accommodation, finances, and travel.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Navigation](#2-navigation)
3. [Home](#3-home)
4. [Dashboard](#4-dashboard)
5. [Participants](#5-participants)
6. [Calendar](#6-calendar)
7. [Documents](#7-documents)
8. [Host Companies](#8-host-companies)
9. [Accommodation](#9-accommodation)
10. [Sending Organisations](#10-sending-organisations)
11. [Transfer Providers](#11-transfer-providers)
12. [Insurance Providers](#12-insurance-providers)
13. [Language Course Providers](#13-language-course-providers)
14. [Mobility Service Providers](#14-mobility-service-providers)
15. [Travel Details](#15-travel-details)
16. [Financial Info](#16-financial-info)
17. [Language Selection](#17-language-selection)

---

## 1. Getting Started

Open the app in your browser and sign in with your email address and password. Once authenticated, you will be taken to the **Home** page.

To sign out, click the **Sign out** button at the bottom of the sidebar.

---

## 2. Navigation

The left sidebar organises the app into three main areas:

| Section | Description |
|---|---|
| **Home** | Welcome page with quick actions |
| **Dashboard** | Overview and statistics |
| **Calendar** | Monthly view of arrivals and departures |
| **Incoming** | Programs where participants arrive at your organisation |
| **Outgoing** | Programs where participants are sent abroad |

Both **Incoming** and **Outgoing** contain the same sub-sections:

- Participants
- Travel Details
- Transfer Providers
- Sending Organisations
- Accommodation
- Financial Info
- Mobility Providers
- Groups and Individuals
- Host Companies
- Insurance
- Language Course Providers

Click a section header to expand or collapse it. The currently active page is highlighted.

---

## 3. Home

The Home page is the main entry point of the application. It provides a quick overview and four action cards to perform the most common operations.

### Hero Section

At the top, a welcome banner displays four key statistics at a glance:

| Stat | Description |
|---|---|
| Total | Total number of participants |
| Incoming | Participants arriving for the program |
| Outgoing | Participants going abroad |
| Last 30 days | Participants created in the last 30 days |

Quick-access buttons to the **Dashboard** and **Calendar** are available on the right side of the hero.

### Quick Actions

Four cards provide direct access to the main operations:

| Card | What it does |
|---|---|
| **Add Participant** | Opens a modal to create a new individual participant with personal and mobility data |
| **Add Group** | Opens a modal to create multiple participants at once (paste names or import CSV) |
| **Assign Services** | Opens a modal to link providers (sending org, host company, accommodation, insurance, transfer, language course, mobility provider) to an existing participant |
| **Manage Providers** | Opens a modal showing all 7 provider types with record counts, links to detail pages, and the ability to add new providers via dedicated sub-modals with full forms |

### Adding a Provider from Home

Inside the **Manage Providers** modal, each provider card shows a record count and two buttons:
- **Go to Page** — navigates to the full provider page.
- **+ Add** — opens a dedicated sub-modal with the complete form for that provider type (all fields, organised in sections).

---

## 4. Dashboard

The dashboard provides a real-time snapshot of all mobility programs.

### Key Metrics

| Card | What it shows |
|---|---|
| Total Participants | Combined count of incoming and outgoing participants |
| Total Grant | Sum of all grant amounts (EUR) |
| Total Margin | Sum of all calculated margins (EUR) |
| Financial Records | Number of financial entries |
| Host Companies | Number of registered host companies |
| Accommodations | Number of registered accommodation facilities |

### Charts

- **Mobility Typology** — Pie chart comparing incoming vs. outgoing participant counts.
- **Destination Countries** — Bar chart showing the top 8 destination countries by number of participants.

### Summary Row

Displays incoming count, outgoing count, and average grant per participant at a glance.

---

## 5. Participants

This is the main working area of the app. Each participant record stores all information related to a single mobility. Participants can arrive as **individuals** (solo) or as part of a **group**.

### Individual vs. Group

The distinction is determined automatically by the **Group Name** field:
- If the Group Name is **empty**, the participant is classified as **Individual**.
- If the Group Name is **filled in**, the participant is classified as **Group** member.

This is calculated automatically when saving — there is no manual selection needed. The Group Name field is prominently highlighted in the editing form with a visual indicator that updates in real time.

### Views

The page offers two views, toggled by the button in the toolbar:

**List View** (default) — A full-width table showing:

| Column | Description |
|---|---|
| Surname | Participant's last name |
| Name | Participant's first name |
| Nationality | Country of citizenship |
| Destination City | Where the participant is going |
| Arrival / Departure | Mobility dates |
| Sending Organisation | Organisation that sent the participant |
| Host Company | Company hosting the participant |
| Individual / Group | Shows the group name (purple badge) or "Individual" (teal badge) |

Click any row to open the **Detail View** for that participant.

**Group By** — A toggle button in the toolbar groups participants by their group name. Named groups appear first (with purple headers and member count), followed by individual participants (with a teal header).

**Detail View** — A split layout with:
- **Left panel** — searchable list of participants, grouped by sending organisation.
- **Right panel** — full detail view with a group banner, all sections, and edit/delete capabilities.

### Creating a Participant

Click **+ New Participant** in the toolbar. A blank form opens in the detail view. Fill in the required fields and click **Save**.

### Editing a Participant

Select a participant, then click **Edit**. Make your changes and click **Save**, or click **Cancel** to discard them.

### Deleting a Participant

Click **Delete** while viewing a participant record. A confirmation dialog will appear. This action cannot be undone.

### Searching

Type in the search box to filter the list in real time. The search covers name, sending organisation, and nationality.

---

### Participant Fields

#### Personal Information

| Field | Description |
|---|---|
| First Name / Last Name | Participant's full name |
| Sex | Male, Female, or Other |
| Status | Student, Teacher, Job seeker, Worker, or Other |
| Date of Birth | dd/mm/yyyy |
| Place of Birth | City or town |
| Nationality | Country of citizenship |
| Marital Status | Single, Married, Divorced, or Widowed |
| Driving Licence | Yes or No |

#### Address

Street address, postcode, city, and country of residence.

#### Contacts

Email address, phone number, and mobile number.

#### Passport & Identity

Passport number and expiry date.

#### Languages

Proficiency level (A1–C2) for English, Spanish, French, German, and Italian, plus a free-text field for other languages. Optional fields for validated test name, score, and certificate.

#### Education

Last diploma obtained and year of issue.

#### Bank Details

SWIFT/BIC code and IBAN.

#### Mobility Details

| Field | Description |
|---|---|
| Typology | Incoming or Outgoing |
| Group Name | Leave empty for Individual, fill in for Group (auto-determines Individual/Group status) |
| Destination Country / City | Where the participant is going |
| Arrival / Departure Dates | Duration of the mobility |
| Program | Erasmus+, ESC, etc. |
| Project | Project reference |

#### Organisations & Providers

Links this participant to registered entities:

- Sending Organisation
- Host Company
- Insurance Provider
- Transfer Provider
- Language Course Provider
- Mobility Service Provider

#### Language Course

Start date, end date, and duration in weeks.

#### Internship

Start date, end date, and duration in weeks.

#### Accommodation

Up to **two** accommodation entries. Each includes the accommodation facility (selected from the Accommodation registry), start/end dates, number of weeks, and cost.

#### Financials

| Field | Description |
|---|---|
| Grant Amount | Total grant awarded (EUR) |
| Intl. Transport | International travel cost |
| Local Transport | Local transport cost |
| Food Allowance | Subsistence allowance |
| Insurance Cost | Insurance premium |
| Transfer | Transfer service cost |
| Language Course Cost | Cost of the language course |
| Cultural Activities | Cost of cultural activities |
| Other Expenses | Any additional costs |
| Notes (other) | Free-text notes |
| Margin | Calculated automatically: Grant − all expenses |

#### PDF Documents

From the participant detail view you can generate:

- **Info Voucher** — participant summary document
- **Financial Report** — financial breakdown
- **Certificate** — participation certificate

---

## 6. Calendar

A monthly calendar view showing participant arrivals and departures.

### Features

- Navigate between months with the arrow buttons. Click **Today** to return to the current month.
- Filter by **typology** (Incoming/Outgoing), **Individual/Group**, and **Group Name**.
- Arrival events are shown in **green**, departure events in **orange**.
- Click a day to open a **side panel** listing all events for that date.
- Click a participant name in the side panel to open a **detail modal** showing:
  - Arrival and departure dates (prominent cards)
  - Provider details (sending org, host company, transfer provider with phone, accommodation, insurance)
  - Travel details (transport type, flight/train number, departure/arrival times, ticket price) — loaded from the Travel Details table
  - Mobility info (destination, nationality, program, contact details)
- From the modal, two buttons allow you to:
  - **+ Travel Details** — navigate to the Travel Details page with the participant pre-selected to add flight/train info
  - **Open Profile** — navigate directly to the participant's detail page in the Participants view

A **Home** button in the calendar header returns to the Home page.

---

## 7. Documents

The Documents page allows you to upload Word (.docx) templates with placeholder tags and generate filled documents automatically using participant data. This works like a mail merge between Word and Excel.

**Important:** This feature works only with **.docx** (Word) files. PDF templates are not supported because PDFs cannot be edited programmatically. If you only have a PDF, ask the client for the original .docx file.

### Accessing Documents

Click **Documents** in the sidebar, or use the quick-access card from the Home page.

### Uploading a Template

1. Click **Upload Template**.
2. Enter a name for the template (e.g., "Europass Mobility", "Acceptance Letter").
3. Optionally add a description.
4. Select the .docx file.
5. Click **Save**.

The template is stored in the cloud and available for all users.

### Preparing a Template

Before uploading, the .docx file must contain **placeholder tags** — special markers that Managemob recognises and replaces with participant data. Tags use curly braces: `{tag_name}`.

**Example:** In the Word document, instead of writing a participant's name, write `{name} {surname}`. When you generate the document, Managemob replaces `{name}` with "Mario" and `{surname}` with "Rossi".

#### Key Rules

- Tags are **case-sensitive**: `{name}` works, `{Name}` and `{NAME}` do not.
- No spaces inside braces: `{name}` is correct, `{ name }` is not.
- **Formatting is preserved**: if `{name}` is bold in the template, the output will be bold.
- If a field has no value in the database, the tag is replaced with empty text.
- Tags work everywhere: body text, tables, headers, footers.

#### Common Tags

| Tag | What it produces |
|---|---|
| `{name}` | Participant's first name |
| `{surname}` | Last name |
| `{arrival_date}` | Arrival date |
| `{departure_date}` | Departure date |
| `{destination_city}` | Destination city |
| `{program}` | Program name (Erasmus+, etc.) |
| `{sending_org_name}` | Sending organisation name |
| `{host_company_name}` | Host company name |
| `{host_company_tutor}` | Tutor name |
| `{email}` | Participant email |
| `{phone}` | Participant phone |
| `{grant_amount}` | Grant amount in EUR |

There are approximately **80 tags** available covering personal data, contacts, mobility, providers, financials, education, languages, and more.

### Template Guide

Click **Template Guide** in the Documents page header to access a full interactive guide with:
- Step-by-step instructions for preparing templates
- A live example showing template input and generated output
- A specific mapping example for the Europass Mobility template
- The complete tag reference organised by category

### Exporting the Placeholder List

Click **Export Placeholders (CSV)** to download a CSV file with all available tags, descriptions, and categories. You can open this in Excel and use it as a reference while editing templates in Word.

### Generating Documents

1. Select a template from the list on the left.
2. On the right panel, search and select one or more participants using checkboxes.
3. Click **Generate**:
   - **1 participant** — downloads a single .docx file.
   - **Multiple participants** — downloads a .zip archive containing one .docx per participant, named `TemplateName_Surname_Name.docx`.

### Deleting a Template

Click the delete button on a template card. A confirmation dialog will appear. The template file is removed from storage.

### Tips for Templates

- **Always test** with one participant before generating a batch.
- **Combine tags** freely: `Dear {name} {surname}, your internship at {host_company_name} in {host_company_city} starts on {arrival_date}.`
- **Check data completeness** before generating — missing data produces blank spaces.
- If the original template has **underlined** placeholder text (common in Europass), remove the underline from the tag before saving; otherwise the generated text will be underlined too.
- If you need a PDF, generate the .docx first, then open it in Word and save as PDF.

---

## 8. Host Companies

Registry of companies that host participants during their internship.

### Fields

**Company Details:** name, address, city, sector, contact person, email, phone.

**Internship Tutor:** tutor name, tutor phone, tutor email.

### Usage

Host companies appear as dropdown options in the participant form. Add a company here before assigning it to a participant.

---

## 9. Accommodation

Registry of accommodation facilities available for participants.

### Fields

**Basic Information:** name, typology (Hostel, Hotel, B&B, Host Family, Shared Flat, Lodger), contact person, email, phone, mobile.

**Address:** street, postcode, city, country.

**Features:** number of bedrooms, size (m²), and yes/no toggles for: desk, internet, washing machine, pets allowed, air conditioning, heating, bathrooms (private or shared).

**Board Options:** up to three pricing options (e.g. B&B, Half-Board, Full-Board, Self-catering), each with a name and weekly price.

**Banking:** IBAN and SWIFT for payment purposes.

**House Rules:** free-text field for any rules or notes.

Accommodation records are colour-coded by typology for quick identification.

---

## 10. Sending Organisations

Registry of organisations that send participants to your programs.

### Fields

Name, contact person, email, phone, street address, city, country.

Sending organisations appear as grouping headers in the participant list and as dropdown options in the participant form.

---

## 11. Transfer Providers

Registry of transport or transfer service providers.

### Fields

Name, contact person, phone, email, standard price (EUR), notes.

---

## 12. Insurance Providers

Registry of insurance providers for participant coverage.

### Fields

Name, contact person, phone, email, address, city, notes, status.

---

## 13. Language Course Providers

Registry of language schools and course providers.

### Fields

Name, address, city, country, contact person, email, phone, website, language taught.

---

## 14. Mobility Service Providers

Registry of external agencies or intermediaries supporting the mobility programs.

### Fields

Name, PIC code, address, city, country, website, email, phone, contact person, contact details, number of offices, number of employees, placement capacity, placement fees, geographic area, specialties, notes.

---

## 15. Travel Details

A table showing travel information for participants, now with **full CRUD capabilities**.

### Table Columns

| Column | Description |
|---|---|
| Participant | Name of the participant |
| Transport | Mode (Airplane, Train, Bus, Car) |
| Flight/Train No. | Transport reference number |
| Departure | Date and time of departure |
| Arrival | Date and time of arrival |
| Ticket Price | Cost in EUR |

### Creating a Travel Detail

Click **+ New Travel Detail** in the toolbar. A modal opens where you can:
1. Select the participant from a dropdown.
2. Choose the transport type (Airplane, Train, Bus, Car, Other).
3. Enter the flight/train number, departure and arrival date/time, and ticket price.
4. Click **Save**.

### Editing

Each row has an **Edit** button that reopens the modal with the existing values pre-filled.

### Deleting

Each row has a **Delete** button with a confirmation dialog.

### Navigation from Calendar

When accessing Travel Details from the Calendar modal's **+ Travel Details** button, the modal opens automatically with the participant pre-selected.

Use the search box to filter by participant name or transport number. The view automatically filters for incoming or outgoing based on the section you navigated from.

---

## 16. Financial Info

A **summary table** showing the financial breakdown for all participants, now with **inline editing**.

### Summary Bar

Displays **Total Grant** and **Total Margin** for the currently filtered list. Totals update automatically after editing.

### Table Columns

Participant, Grant, International Transport, Local Transport, Food Allowance, Insurance, Accommodation 1, Accommodation 2, Transfer, Language Course, Cultural Activities, Other Expenses, and **Margin**.

### Editing

Each row has an **Edit** button. Clicking it converts all financial fields in that row into editable number inputs (highlighted with a green background). The **Margin recalculates in real time** as you change values. Click **Save** to persist changes or the **close button** to cancel.

### Margin Colour Coding

The Margin column is colour-coded:
- **Green** — positive margin (grant exceeds costs)
- **Red** — negative margin (costs exceed grant)

Use the search box to filter by participant name.

---

## 17. Language Selection

The interface is available in multiple languages. Click the language selector at the bottom of the sidebar to switch:

| Flag | Language |
|---|---|
| 🇮🇹 | Italiano |
| 🇬🇧 | English |
| 🇫🇷 | Français |
| 🇪🇸 | Español |
| 🇩🇪 | Deutsch |
| 🇸🇪 | Svenska |
| 🇵🇹 | Português |

Your language preference is saved automatically and restored the next time you open the app.

---

## Tips

- **Start from Home** — Use the four quick-action cards on the Home page to perform the most common operations without navigating through the sidebar.
- **Group Name matters** — The Group Name field determines whether a participant is classified as Individual or Group. Leave it empty for individuals, fill it in for group members.
- **Providers first** — Before creating participants, populate the registries (Sending Organisations, Host Companies, Accommodation, Transfer Providers, Mobility Providers) from the Home page's Manage Providers card. This ensures all dropdown options are available when filling in participant forms.
- **Calendar for logistics** — Use the Calendar to see who is arriving or departing on a given day. Click a name to see their full travel and provider details, or jump directly to their profile.
- **Add travel details from Calendar** — When viewing a participant in the Calendar modal, click **+ Travel Details** to go directly to the Travel Details page with that participant pre-selected for adding flight/train information.
- **Margin tracking** — Monitor the Financial Info page regularly. Edit financial values inline and watch the margin update in real time to spot participants with a negative margin before the program ends.
- **Two views for Participants** — Use the **List View** for a quick overview of all participants with key data. Use the **Detail View** for editing and viewing the full record. Toggle between them with the toolbar button.
- **Documents are .docx only** — The template system works with Word files (.docx). If a client sends a PDF, ask for the original Word file. You can convert the generated .docx to PDF by opening it in Word and saving as PDF.
- **Export placeholders** — Use the "Export Placeholders (CSV)" button on the Documents page to get a spreadsheet of all available tags as reference while preparing templates.
- **Search is per-page** — The search box filters only the list visible on the current page; it does not search across sections.
- **Deletions are permanent** — There is no undo. Always confirm before deleting a record.
