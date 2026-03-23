# Managemob — User Guide

Managemob is a web-based platform for managing international mobility programs. It handles both **incoming** (participants arriving) and **outgoing** (participants departing) mobilities, tracking participants, host companies, accommodation, finances, and travel.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Navigation](#2-navigation)
3. [Dashboard](#3-dashboard)
4. [Participants](#4-participants)
5. [Host Companies](#5-host-companies)
6. [Accommodation](#6-accommodation)
7. [Sending Organisations](#7-sending-organisations)
8. [Transfer Providers](#8-transfer-providers)
9. [Mobility Service Providers](#9-mobility-service-providers)
10. [Travel Details](#10-travel-details)
11. [Financial Info](#11-financial-info)
12. [Language Selection](#12-language-selection)

---

## 1. Getting Started

Open the app in your browser and sign in with your email address and password. Once authenticated, you will be taken directly to the **Dashboard**.

To sign out, click the **Sign out** button at the bottom of the sidebar.

---

## 2. Navigation

The left sidebar organises the app into three main areas:

| Section | Description |
|---|---|
| **Dashboard** | Overview and statistics |
| **Incoming** | Programs where participants arrive at your organisation |
| **Outgoing** | Programs where participants are sent abroad |

Both **Incoming** and **Outgoing** contain the same sub-sections:

- Individuals (participant records)
- Travel Details
- Transfer Providers
- Sending Organisations
- Accommodation
- Financial Info
- Mobility Providers
- Groups & Participants
- Host Companies

Click a section header to expand or collapse it. The currently active page is highlighted.

---

## 3. Dashboard

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

## 4. Participants

This is the main working area of the app. Each participant record stores all information related to a single mobility.

### Layout

The page uses a **split layout**:
- **Left panel** — searchable list of participants, grouped by sending organisation.
- **Right panel** — full detail view of the selected participant.

### Creating a Participant

Click the **+** button at the top of the list. A blank form opens in the right panel. Fill in the required fields and click **Save**.

### Editing a Participant

Select a participant from the list, then click **Edit**. Make your changes and click **Save**, or click **Cancel** to discard them.

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
| Individual / Group | Whether this is a solo or group mobility |
| Destination Country / City | Where the participant is going |
| Arrival / Departure Dates | Duration of the mobility |
| Program | Erasmus+, ESC, etc. |
| Project | Project reference |
| Group Name | If part of a group |

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

## 5. Host Companies

Registry of companies that host participants during their internship.

### Fields

**Company Details:** name, address, city, sector, contact person, email, phone.

**Internship Tutor:** tutor name, tutor phone, tutor email.

### Usage

Host companies appear as dropdown options in the participant form. Add a company here before assigning it to a participant.

---

## 6. Accommodation

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

## 7. Sending Organisations

Registry of organisations that send participants to your programs.

### Fields

Name, contact person, email, phone, street address, city, country.

Sending organisations appear as grouping headers in the participant list and as dropdown options in the participant form.

---

## 8. Transfer Providers

Registry of transport or transfer service providers.

### Fields

Name, contact person, phone, email, standard price (EUR), notes.

---

## 9. Mobility Service Providers

Registry of external agencies or intermediaries supporting the mobility programs.

### Fields

Name, contact person, email, phone, city, country.

---

## 10. Travel Details

A **read-only table** showing travel information derived from participant records.

| Column | Description |
|---|---|
| Participant | Name of the participant |
| Transport | Mode (Airplane ✈, Train 🚆, Car 🚗) |
| Flight/Train No. | Transport reference number |
| Departure | Date and time of departure |
| Arrival | Date and time of arrival |
| Ticket Price | Cost in EUR |

Use the search box to filter by participant name or transport number. The view automatically filters for incoming or outgoing based on the section you navigated from.

---

## 11. Financial Info

A **summary table** showing the financial breakdown for all participants.

### Summary Bar

Displays **Total Grant** and **Total Margin** for the currently filtered list.

### Table Columns

Grant, International Transport, Local Transport, Food Allowance, Insurance, Accommodation 1, Accommodation 2, Transfer, Other Expenses, and **Margin**.

The Margin column is colour-coded:
- **Green** — positive margin (grant exceeds costs)
- **Red** — negative margin (costs exceed grant)

Use the search box to filter by participant name.

---

## 12. Language Selection

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

- **Workflow order** — Before creating participants, populate the registries first: Sending Organisations, Host Companies, Accommodation, Transfer Providers, and Mobility Providers. This ensures all dropdown options are available when filling in participant forms.
- **Margin tracking** — Monitor the Financial Info page regularly to spot participants with a negative margin before the program ends.
- **Search is global within a page** — The search box filters only the list visible on the current page; it does not search across sections.
- **Deletions are permanent** — There is no undo. Always confirm before deleting a record.
