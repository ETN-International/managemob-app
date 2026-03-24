# Managemob — Operational Tutorial for Partners

**Version 1.0 — March 2026**
**Prepared by:** ETN International

---

## Before You Begin

You will need two things to use Managemob:

1. The **URL** of the platform (provided to you by ETN International).
2. Your **email** and **password** (provided to you by ETN International).

Managemob works in any modern browser (Chrome, Firefox, Safari, Edge). No installation is required.

---

## Tutorial 1 — Logging In and Choosing Your Language

### How to log in

1. Open the platform URL in your browser.
2. You will see a login card with the Managemob logo ("M") and two fields.
3. Type your **email address** in the first field (labelled "Email").
4. Type your **password** in the second field (labelled "Password").
5. Click the **"Sign in"** button.
6. If your credentials are correct, you will be redirected to the **Home** page. If not, a red error banner will appear — double-check your email and password and try again.

### How to change the language

You can change the interface language at any time. The platform supports: English, Italian, French, Spanish, German, Swedish, and Portuguese.

**From the login page:**

1. Look at the top of the login card — you will see a row of flag icons.
2. Click the flag of your preferred language.
3. The entire login page switches to that language immediately.

**From inside the app (after logging in):**

1. Look at the bottom of the left sidebar, just above your user profile.
2. Click on the current language flag/label — a pop-up menu opens.
3. Click the language you want.
4. The interface switches immediately. Your choice is saved automatically.

### How to log out

1. Look at the bottom-left corner of the screen — you will see your initials, name, and email.
2. Click the **arrow icon (↩)** to the right of your profile.
3. You are redirected to the login page.

---

## Tutorial 2 — Understanding the Navigation

When you log in, you will see a **sidebar on the left** and the **main content area on the right**. Here is how the sidebar is organised:

### Top-level items

- **Home** (house icon) — The guided wizard for quick data entry. This is your starting point for most tasks.
- **Dashboard** (chart icon) — Read-only overview with charts and KPI cards.
- **Calendar** (calendar icon) — Monthly view showing arrivals and departures.

### Expandable sections

- **Incoming** (globe icon) — Click to expand. Shows all sub-pages for incoming mobilities.
- **Outgoing** (plane icon) — Click to expand. Shows all sub-pages for outgoing mobilities.

### How to navigate

1. Click **"Incoming"** or **"Outgoing"** in the sidebar to expand the section. An arrow (▸ / ▾) indicates whether it is collapsed or expanded.
2. Once expanded, you see a list of sub-pages: Individuals, Travel Details, Transfer Providers, Sending Organisations, Accommodation, Financial Info, Mobility Providers, Groups & Participants, Host Companies, Insurance, Language Course Providers.
3. Click any sub-page to open it. The active page is **highlighted** in the sidebar.
4. Click the section header again to collapse it.

> **Important:** Incoming and Outgoing contain the same sub-pages, but each one only shows data relevant to that mobility direction. If you are looking for an incoming participant, always navigate via Incoming.

---

## Tutorial 3 — Understanding the Home Page Layout

The Home page is your central workspace. Before diving into the wizard, here is what you see on the page:

### Stats bar

At the very top, a row of **4 summary cards** gives you an instant overview:

- **Total** — total number of participants in the system.
- **Incoming** (teal) — number of incoming participants.
- **Outgoing** (blue) — number of outgoing participants.
- **Recent** (green) — number of participants added in the last 30 days.

### Quick navigation buttons

In the top-right corner, two shortcut buttons let you jump directly to:

- **Calendar** — opens the Calendar page.
- **Dashboard** — opens the Dashboard page.

### Mode selector and stepper

Below the stats bar:

1. **Mode tabs** — Two buttons: **"Individual"** (blue when active) and **"Group"** (purple when active). Click to switch mode.
2. **Stepper** — Three step circles connected by lines:
   - **Step 1** — Create Participants (icon: person or group, depending on mode)
   - **Step 2** — Assign Services (icon: link)
   - **Step 3** — Manage Providers (icon: building)
3. **Progress bar** — A horizontal bar fills up as you complete each step. A counter (e.g., "2/3") shows how many steps are done.

Click any step circle to jump directly to that step — you don't have to go through them in order.

A step is marked as **done** (green checkmark) when:

- Step 1: at least one participant exists.
- Step 2: a participant has at least one service assigned (sending org, host company, or accommodation).
- Step 3: at least 3 different provider categories have entries.

---

## Tutorial 4 — Registering a New Individual Participant (Home Wizard, Step 1)

The Home page uses a **3-step wizard**. Step 1 is for creating participants.

### Step-by-step

1. Go to the **Home** page (click the house icon in the sidebar).
2. At the top you will see two mode buttons: **"Individual"** and **"Group"**. Make sure **"Individual"** is selected (it is blue when active).
3. You will see a form with the following fields. Fill them in:
   - **First Name** (required)
   - **Last Name** (required)
   - **Sex** — select from the dropdown (Male / Female / Other)
   - **Date of Birth** — use the date picker
   - **Nationality** — type the country name
   - **Email** — participant's email address
   - **Phone** — participant's phone number
   - **Mobility Typology** — select **Incoming** or **Outgoing**
   - **Arrival Date** and **Departure Date** — use the date pickers
   - **Destination Country** and **Destination City**
   - **Programme** — e.g., Erasmus+, ESC
   - **Project Name**
   - **Group Name** — leave blank if this is a standalone individual
4. Click the **"Save"** button.
5. A green success confirmation appears for 3 seconds. The participant is now created.
6. The "Recently Added" section below the form updates to show the new entry.

> **Minimum required:** You must enter at least a **First Name** and **Last Name**. All other fields are optional but recommended.

---

## Tutorial 5 — Registering a Group of Participants (Home Wizard, Step 1)

Use this when you need to register several participants at once who share the same mobility details.

### Option A — Paste Names

1. Go to the **Home** page.
2. Click the **"Group"** button at the top (it turns purple when active).
3. You will see two tabs: **"Paste Names"** and **"CSV Upload"**. Select **"Paste Names"**.
4. Fill in the **shared group details** in the form:
   - **Group Name** (required — e.g., "Spring 2026 - Madrid")
   - **Mobility Typology** — Incoming or Outgoing
   - **Destination Country** and **City**
   - **Arrival Date** and **Departure Date**
   - **Programme** and **Project Name**
5. In the text area below, type or paste participant names, **one per line**. Format: `FirstName LastName`. For example:
   ```
   Maria Rossi
   Jean Dupont
   Anna Müller
   ```
6. Click **"Parse Names"**. A preview table appears showing the parsed first names and last names.
7. **Review the table carefully.** You can:
   - Edit any name by clicking directly in the cell.
   - Remove a row by clicking the **"✕"** button on that row.
8. When the list is correct, click **"Create Group"**.
9. A green success message shows how many participants were created. All of them share the group details you entered.

### Option B — Upload a CSV File

1. Go to the **Home** page and select **"Group"** mode.
2. Click the **"CSV Upload"** tab.
3. Fill in the **shared group details** (same fields as above).
4. Click **"Choose File"** and select a CSV file from your computer. The file should have column headers in the first row.
5. The system reads the file and shows:
   - A list of detected column headers.
   - A **mapping section** where you must tell the system which column contains: Name, Surname, Email, Date of Birth, Nationality.
6. The system tries to auto-detect the mapping. Verify it is correct. If a column is wrong, click the dropdown and select the right one. Set columns you don't have to **"—"** (skip).
7. A preview table shows the first 10 rows with the mapped data. Verify the data looks correct.
8. Click **"Create Group"**.
9. All participants are created with the shared group details plus their individual data from the CSV.

---

## Tutorial 6 — Assigning Services to a Participant (Home Wizard, Step 2)

After creating participants, you need to link them to their host company, accommodation, insurance, etc.

### Step-by-step

1. On the **Home** page, click the **"Step 2 — Assign Services"** indicator (or click **"Next"** after Step 1).
2. You will see a **search box** at the top. Type the participant's name to filter the list.
3. Click on the participant's name to select them. Their current service assignments (if any) load into the form below.
4. Use the **dropdown menus** to assign:
   - **Sending Organisation** — select from the list of registered organisations
   - **Host Company** — select from the list of registered host companies
   - **Accommodation** — select the facility, then enter **Start Date** and **End Date**
   - **Insurance Provider** — select from the list
   - **Transfer Provider** — select from the list
   - **Language Course Provider** — select from the list
   - **Mobility Service Provider** — select from the list
5. **If the participant belongs to a group** and you want all group members to receive the same assignments, tick the checkbox **"Apply to entire group"**.
6. Click **"Save"**.
7. A green success confirmation appears. The participant's record is now linked to all the selected services.

> **What if a provider is not in the dropdown?** Go to Step 3 (Tutorial 7) to add it first, then come back to Step 2.

---

## Tutorial 7 — Adding a New Provider (Home Wizard, Step 3)

If you need to register a new organisation, company, or provider that isn't in the system yet, you can do it directly from Step 3 without leaving the Home page.

### Step-by-step

1. On the **Home** page, navigate to **Step 3 — Manage Providers**.
2. You will see a grid of provider categories, each with a counter showing how many are registered:
   - Sending Organisations
   - Host Companies
   - Accommodation
   - Insurance Providers
   - Transfer Providers
   - Language Course Providers
   - Mobility Service Providers
3. Click the **"+ Quick Add"** button next to the category you want.
4. A form expands below. Fill in the required fields:

   **Sending Organisation:** Name, Contact Person, Email, Phone, City, Country.

   **Host Company:** Name, Sector, City, Contact Person, Email.

   **Accommodation:** Name, Typology (choose from: Hostel, Hotel, B&B, Host Family, Shared Flat, Lodger), City, Contact Person, Email, Phone.

   **Insurance Provider:** Name, Contact Person, Email, Phone, City.

   **Transfer Provider:** Name, Contact Person, Email, Phone, Standard Price (in EUR).

   **Language Course Provider:** Name, City, Country, Contact Person, Email, Language Taught.

   **Mobility Service Provider:** Name, City, Country, Contact Person, Email, Website.

5. Click **"Save"**.
6. A green confirmation appears. The new entry is immediately available in all dropdown menus across the platform.

---

## Tutorial 8 — Viewing and Editing a Participant's Full Record

The Individuals page gives you complete control over every detail of a participant's profile.

### How to open a participant record

1. In the sidebar, expand **Incoming** (or **Outgoing**).
2. Click **"Individuals"**.
3. The page has two panels:
   - **Left panel:** a list of all participants, grouped under their sending organisation's name. A counter shows the total number. Each participant entry displays their initials, name, nationality, destination city, and a **colour-coded badge** indicating whether they are "Individual" (teal) or "Group" (purple).
   - **Right panel:** initially empty with a message "Select a participant".
4. Use the **search box** at the top-left to filter by name, nationality, or sending organisation.
5. Click on a participant's name in the list. Their full profile loads in the right panel.

### How to read the profile

The right panel shows the participant's details organised into sections. Each section has a header and a grid of fields:

- **Personal Information** — Name, surname, sex, status, date of birth, place of birth, nationality, marital status, driving licence.
- **Address** — Street, postcode, city, country.
- **Contacts** — Email, phone, mobile phone.
- **Passport & Identity** — Passport number, expiry date.
- **Languages** — Proficiency levels (A1–C2) for English, Spanish, French, German, Italian, other languages, plus test name, score, and certificate.
- **Education** — Last diploma, year obtained.
- **Bank Details** — SWIFT code, IBAN.
- **Mobility Details** — Typology, individual/group, destination, dates, programme, project, group name.
- **Organisations & Providers** — Linked sending organisation, host company, insurance, transfer, language course provider, mobility service provider.
- **Language Course** — Start date, end date, weeks (auto-calculated).
- **Internship** — Start date, end date, weeks (auto-calculated).
- **Accommodation** — Up to 2 entries, each with facility, dates, weeks, and cost.
- **Financials** — Grant, all cost categories, and margin.

### How to edit a participant

1. With a participant selected, look at the **action bar** at the top of the right panel.
2. Click the **"Edit"** button.
3. The action bar changes: it now shows **"Edit mode"** on the left, and **"Cancel"** / **"Save"** buttons on the right.
4. All fields become editable — text fields turn into input boxes, and dropdown fields show selection menus.
5. Make your changes. Note:
   - When you enter language course start/end dates, the **weeks** field calculates automatically.
   - When you enter internship start/end dates, the **weeks** field calculates automatically.
   - When you enter accommodation start/end dates, the **weeks** field calculates automatically.
6. Click **"Save"**. The button shows "Saving..." briefly, then the page returns to view mode with the updated data.
7. To discard all changes, click **"Cancel"** instead.

### How to create a new participant (from the Individuals page)

1. Click the **"+ New"** button next to the search box in the left panel.
2. A blank form appears in the right panel with the header "New Participant".
3. Fill in the fields (at minimum: first name and last name).
4. Click **"Save"**.
5. The new participant appears in the list on the left.

### How to delete a participant

1. Select the participant you want to delete.
2. Click the **"Delete"** button (red) in the action bar.
3. A confirmation dialog appears: "Are you sure? This action is irreversible."
4. Click **"Confirm"** to permanently delete the record, or **"Cancel"** to keep it.

> **Warning:** Deletion is permanent. There is no undo or recycle bin.

---

## Tutorial 9 — Generating PDF Documents

You can generate three types of PDF from any participant's profile.

### Step-by-step

1. Navigate to **Incoming > Individuals** (or Outgoing > Individuals).
2. Select the participant.
3. In the **action bar** at the top of the right panel, you will see three coloured buttons:
   - **"Info Voucher"** (teal) — Generates a summary document with the participant's key details (personal data, mobility info, accommodation, contacts).
   - **"Financial Report"** (blue) — Generates a detailed financial breakdown showing the grant, all costs, and the margin.
   - **"Certificate"** (grey) — Generates a participation certificate.
4. Click the button for the document you need.
5. The PDF opens in a **new browser tab**. From there you can view, print, or download it.

---

## Tutorial 10 — Managing Host Companies

### How to add a new host company

1. In the sidebar, go to **Incoming > Host Companies** (or Outgoing).
2. Click the **"+ New"** button next to the search box.
3. A blank form appears on the right panel with the header "New Host Company".
4. Fill in the fields:
   - **Company Name** (required)
   - **Address**
   - **City**
   - **Sector** — e.g., IT, Tourism, Marketing
   - **Contact Person** — name of your main contact
   - **Email**
   - **Phone**
5. Scroll down to the **Internship Tutor** section:
   - **Tutor Name** — the person who will supervise the intern
   - **Tutor Phone**
   - **Tutor Email**
6. Click **"Save"**.
7. The company now appears in the list on the left and is available in all participant form dropdowns.

### How to edit or delete a host company

1. Click on a company in the list to select it.
2. Click **"Edit"** to modify its details, then **"Save"** to confirm.
3. Click **"Delete"** (red button) to remove it. A confirmation dialog appears. Click **"Confirm"** to delete permanently.

---

## Tutorial 11 — Managing Accommodation

### How to add a new accommodation

1. Go to **Incoming > Accommodation** (or Outgoing).
2. Click **"+ New"**.
3. Fill in the fields:

   **Basic Information:**
   - **Name** (required) — e.g., "Casa Familia Lopez"
   - **Typology** — select from: Hostel, Hotel, B&B, Host Family, Shared Flat, Lodger
   - **Contact Person**, **Email**, **Phone**, **Mobile Phone**

   **Address:**
   - Street, Postcode, City, Country

   **Features (Yes/No toggles):**
   - Desk, Internet, Washing Machine, Pets Allowed, Air Conditioning, Heating, Wardrobe, Bed, Carpet, Sheets & Towels

   **Room Details:**
   - Number of Bedrooms, Size (m²), Bathroom Type (Private/Shared), Number of Toilets
   - Bedroom Sizes (up to 4)

   **Board Options (up to 3):**
   - Option 1: Name (e.g., "B&B") + Weekly Price (EUR)
   - Option 2: Name (e.g., "Half-Board") + Weekly Price (EUR)
   - Option 3: Name (e.g., "Full-Board") + Weekly Price (EUR)

   **Banking:**
   - IBAN, SWIFT, Bank Sort Code

   **Additional:**
   - Number of Inhabitants, Infants Present, Smokers Present
   - Family Rating (1–5), Last Contact Date
   - Family Rules (free text), Comments (free text)

4. Click **"Save"**.

> **Colour coding:** Each accommodation in the list is tagged with a colour based on its typology (e.g., green for Host Family, purple for Shared Flat). This helps you quickly distinguish types at a glance.

---

## Tutorial 12 — Managing Sending Organisations

1. Go to **Incoming > Sending Organisations** (or Outgoing).
2. Click **"+ New"** to add a new one.
3. Fill in: **Name**, **Contact Person**, **Email**, **Phone**, **Address**, **City**, **Country**.
4. Click **"Save"**.

Sending organisations serve a double purpose: they are selectable as dropdowns in participant forms, and they act as **group headers** in the participant list (participants are visually grouped under their sending organisation).

---

## Tutorial 13 — Using the Calendar

The Calendar helps you plan logistics by showing when participants arrive and depart.

### How to navigate the calendar

1. Click **"Calendar"** in the sidebar.
2. You see a monthly grid (Monday to Sunday). The current month is displayed by default, and **today's date** is highlighted.
3. Use the **left arrow (‹)** to go to the previous month.
4. Use the **right arrow (›)** to go to the next month.
5. Click the **"Today"** button to jump back to the current month at any time.

### How to read the calendar

Each day cell can contain coloured **event pills** — small labels showing participant names:

- **Green pill** (green left border) = participant **arrival** on that day.
- **Amber/yellow pill** (yellow left border) = participant **departure** on that day.

If a day has more than 3 events, you will see a **"+N others"** overflow indicator. Click on the day to see all events.

### How to filter events

Above the calendar grid, a **filters bar** lets you narrow down what is shown:

1. **Typology filter** — dropdown to show: All, Incoming only, or Outgoing only.
2. **Type filter** — dropdown to show: All, Individual only, or Group only.
3. **Group name filter** — dropdown listing all existing group names. Select one to see only that group's events.

A **legend** on the right reminds you what green (arrival) and amber (departure) dots mean.

### How to view event details (side panel)

1. Click on any day that has events.
2. A **side panel** opens on the right, showing the date and a list of all events for that day.
3. Each event card shows:
   - The participant's **full name**.
   - A coloured badge: **"Arrival"** (green) or **"Departure"** (amber).
   - A badge showing **"Incoming"** (blue) or **"Outgoing"** (purple).
   - A badge showing **"Individual"** or **"Group"** + the group name (if applicable).
4. **Click on an event card** to navigate directly to that participant's record on the Individuals page.
5. Click the **"✕"** button in the side panel header to close it. Alternatively, click the same day again to toggle it off.

> **Use case:** Check the Calendar at the start of each week to see who is arriving, so you can coordinate airport transfers, accommodation check-ins, and orientation sessions.

---

## Tutorial 14 — Reading the Dashboard

The Dashboard gives you a bird's-eye view of all mobility data. While you cannot edit data here, many elements are **clickable** and serve as shortcuts to the relevant pages.

### KPI cards

1. Click **"Dashboard"** in the sidebar.
2. At the top, you see **5 KPI cards**, each with an icon and a value:
   - **Total Participants** (teal, person icon) — combined count. Click to go to Incoming Individuals.
   - **Total Grant** (blue, euro icon) — sum of all grants in EUR. Click to go to Incoming Financial Info.
   - **Total Margin** (green, chart icon) — sum of all margins in EUR. Click to go to Incoming Financial Info.
   - **Host Companies** (amber, building icon) — number registered. Click to go to Host Companies page.
   - **Accommodations** (purple, house icon) — number registered. Click to go to Accommodation page.

### Charts

3. Below the KPI cards, two charts side by side:
   - **Pie chart — Mobility Typology:** Shows Incoming vs. Outgoing split with percentages. **Click on a pie slice** to navigate directly to the Individuals page for that typology (Incoming or Outgoing).
   - **Bar chart — Destination Countries:** Shows the top 8 countries by participant count. **Click on a bar** to navigate to the Individuals page filtered for that country.

   Below each chart, a small hint text reminds you that the chart is clickable.

### Summary row

4. At the bottom, three **clickable summary cards** show:
   - **Incoming** — number of incoming participants. Click to go to Incoming Individuals.
   - **Outgoing** — number of outgoing participants. Click to go to Outgoing Individuals.
   - **Average Grant** — average grant per participant. Click to go to Incoming Financial Info.

> **Use case:** Open the Dashboard at the start of each day to get a quick snapshot of programme health. Pay attention to the Total Margin — if it is trending negative, click it to jump directly to the Financial Info page and identify which participants have negative margins.

---

## Tutorial 15 — Monitoring Financial Data

### How to check the financial overview

1. Go to **Incoming > Financial Info** (or Outgoing > Financial Info).
2. At the top, two summary cards show:
   - **Total Grant** — sum of all grants for participants in this section
   - **Total Margin** — sum of all margins
3. Below is a searchable table with one row per participant. The table has **13 columns**: Participant Name, Grant, International Transport, Local Transport, Food Allowance, Insurance, Accommodation 1, Accommodation 2, Transfer, Language Course, Cultural Activities, Other Expenses, and **Margin**.
4. Use the **search box** to filter by participant name. The counter next to the page title updates to show how many participants match your filter.

### How to read the margin column

- **Green text** = positive margin. The grant covers all costs. No action needed.
- **Red text** = negative margin. Costs exceed the grant. You need to review the budget.

### How to update financial data

Financial data is edited from the participant's own record:

1. Go to **Incoming > Individuals** (or Outgoing).
2. Select the participant.
3. Click **"Edit"**.
4. Scroll down to the **Financials** section.
5. Enter or update: Grant Amount, International Transport Cost, Local Transport Cost, Food Allowance, Insurance Cost, Transfer Cost, Language Course Cost, Cultural Activities Cost, Other Expenses, and Notes.
6. The **Margin** is calculated automatically (Grant − sum of all costs).
7. Click **"Save"**.
8. The updated margin is now reflected in the Financial Info table.

---

## Tutorial 16 — Managing Transfer Providers

1. Go to **Incoming > Transfer Providers** (or Outgoing).
2. The page has the standard split layout: list on the left, detail on the right.
3. Click **"+ New"** to create a new provider.
4. Fill in the fields:
   - **Name** (required)
   - **Contact Person**
   - **Phone**
   - **Email**
   - **Standard Price** (in EUR) — a numeric field for the normal transfer price
   - **Notes** — free-text field for any additional information
5. Click **"Save"**.
6. To **edit**: select a provider from the list, click "Edit", make changes, click "Save".
7. To **delete**: select a provider, click the red "Delete" button, confirm in the dialog.

---

## Tutorial 17 — Managing Insurance Providers

1. Go to **Incoming > Insurance** (or Outgoing).
2. Click **"+ New"** to create a new provider.
3. Fill in the **Details** section:
   - **Name** (required)
   - **Status** — select from dropdown: **Active**, **Inactive**, or **Pending**
   - **Contact Person**
   - **Phone**
   - **Email**
4. Fill in the **Address** section:
   - **Address**
   - **City**
5. Optionally fill in the **Notes** section:
   - A multi-line text area for any additional information. This section only appears if there are existing notes or if you are in edit mode.
6. Click **"Save"**.

> **Status colour-coding:** In the list on the left, each insurance provider shows a coloured status badge next to the city:
> - **Green** = Active
> - **Red** = Inactive
> - **Yellow** = Pending
>
> This same colour-coded status also appears in the detail header when you select a provider.

---

## Tutorial 18 — Managing Language Course Providers

1. Go to **Incoming > Language Course Providers** (or Outgoing).
2. Click **"+ New"** to create a new provider.
3. Fill in the **Details** section:
   - **Name** (required)
   - **Language Taught** — e.g., English, Spanish, German
   - **Contact Person**
   - **Email**
   - **Phone**
   - **Website**
4. Fill in the **Address** section:
   - **Address**
   - **City**
   - **Country** — a dropdown with a pre-defined list of European countries (Albania through United Kingdom, plus "Other")
5. Click **"Save"**.

> **Searching:** The search box filters by provider name, city, or language taught — useful when you have many providers and need to find one quickly.

---

## Tutorial 19 — Managing Mobility Service Providers

This registry is the most detailed, with four sections.

1. Go to **Incoming > Mobility Providers** (or Outgoing).
2. Click **"+ New"** to create a new provider.
3. Fill in the **Organisation** section:
   - **Name** (required)
   - **PIC Number** — the Participant Identification Code (used in EU programmes)
   - **Geographic Area** — the region the provider covers
   - **Website**
   - **Email**
   - **Phone**
4. Fill in the **Address** section:
   - **Address**, **Postcode**, **City**, **Country**
5. Fill in the **Contact** section:
   - **Contact Person**
   - **Contact Email**
   - **Contact Phone**
   - **Contact Comments** — free text for notes about the contact
6. Fill in the **Capacity & Specialties** section:
   - **Number of Offices**
   - **Number of Employees**
   - **Placement Capacity** — how many participants they can host
   - **Placement Fees** — their fee structure
   - **Specialty 1**, **Specialty 2**, **Specialty 3** — the provider's areas of expertise
7. Optionally fill in the **Notes** section:
   - A multi-line text area. This section only appears if there are existing notes or if you are in edit mode.
8. Click **"Save"**.

For all registries above: **edit** by selecting an item and clicking "Edit"; **delete** by clicking the red "Delete" button and confirming in the dialog.

---

## Tutorial 20 — Viewing Travel Details

1. Go to **Incoming > Travel Details** (or Outgoing).
2. You see a **read-only table** with 6 columns: Participant, Transport Type (shown with icons: ✈ Airplane, 🚆 Train, 🚗 Car), Flight/Train Number, Departure Date & Time, Arrival Date & Time, and Ticket Price (EUR).
3. Use the **search box** to filter by participant name or transport number.
4. This page pulls data from participant records — to update travel details, edit the participant's record directly.

---

## Recommended Workflow — End-to-End Setup of a New Mobility

Here is the recommended order of operations when setting up a brand new mobility from scratch:

| Step | What to do | Where |
|------|-----------|-------|
| 1 | Register all providers (sending org, host company, accommodation, insurance, transfer, language course, mobility provider) | Home → Step 3 (or individual registry pages) |
| 2 | Create participants (individual or group) | Home → Step 1 |
| 3 | Assign services to each participant | Home → Step 2 |
| 4 | Complete participant profiles (passport, languages, education, bank details) | Incoming/Outgoing → Individuals → Edit |
| 5 | Enter financial data (grant, costs) | Incoming/Outgoing → Individuals → Edit → Financials section |
| 6 | Add travel details | Incoming/Outgoing → Individuals → Edit → Travel section |
| 7 | Monitor budget health | Incoming/Outgoing → Financial Info |
| 8 | Check arrival/departure logistics | Calendar |
| 9 | Generate PDF documents (vouchers, reports, certificates) | Incoming/Outgoing → Individuals → select participant → PDF buttons |

---

## Quick Reference — Common Tasks

| I want to... | Go to... | Then... | Tutorial |
|---------------|----------|---------|----------|
| Add a participant quickly | Home (Step 1) | Fill form, click Save | 4 |
| Add 20 participants at once | Home (Step 1, Group mode) | Paste names or upload CSV | 5 |
| Assign a host company to a participant | Home (Step 2) | Search participant, select host company, Save | 6 |
| Add a provider not yet in the system | Home (Step 3) | Click Quick Add, fill form, Save | 7 |
| See who arrives this week | Calendar | Navigate to current month, check green pills | 13 |
| Filter calendar by group | Calendar | Use the group name dropdown filter | 13 |
| Check if budget is on track | Incoming/Outgoing → Financial Info | Look for red margins | 15 |
| Generate a voucher PDF | Incoming/Outgoing → Individuals | Select participant, click "Info Voucher" | 9 |
| Add a new accommodation | Incoming/Outgoing → Accommodation | Click "+ New", fill form, Save | 11 |
| Edit a participant's passport data | Incoming/Outgoing → Individuals | Select participant, Edit, scroll to Passport section | 8 |
| Check Insurance provider status | Incoming/Outgoing → Insurance | Look at colour-coded status badges in the list | 17 |
| Jump from Dashboard to participants | Dashboard | Click any KPI card or chart element | 14 |

---

## Support

If you need help or encounter any issue, contact ETN International:

**Email:** claudio@etninternational.com

---

*This guide is intended for external partners of ETN International.*
