# Guida alla Preparazione dei Template — Managemob

## Come funziona

Managemob genera documenti Word (.docx) compilati automaticamente con i dati dei partecipanti. Per farlo, il template deve contenere dei **segnaposto** (tag) che il sistema riconosce e sostituisce con i dati reali.

I tag usano la sintassi `{nome_campo}` — parentesi graffe con il nome del campo all'interno.

---

## Preparazione passo per passo

### 1. Parti dal template originale

Apri il template Word fornito dal cliente (es. Europass Mobility, Learning Agreement, lettera di accettazione, contratto, ecc.).

### 2. Individua i campi da compilare

Cerca nel documento tutte le zone dove vanno inseriti dati variabili. Tipicamente sono:
- Testi generici come "Remplacer par du texte", "Replace with text", "XXXX"
- Segnaposto tra parentesi quadre come `[Prénom(s)]`, `[Nom(s)]`, `[JJ/MM/AAAA]`
- Campi vuoti o sottolineati da riempire

### 3. Sostituisci con i tag Managemob

Seleziona il testo generico e sostituiscilo con il tag corrispondente dalla tabella sotto.

**Esempio pratico:**

| Nel template originale | Sostituisci con |
|---|---|
| `[Prénom(s)] [Nom(s)]` | `{name} {surname}` |
| `Remplacer par du texte` (nome azienda) | `{host_company_name}` |
| `[JJ/MM/AAAA – JJ/MM/AAAA]` | `{arrival_date} – {departure_date}` |
| `Remplacer par le mail` | `{email}` |
| `Remplacer par un numéro` | `{phone}` |

### 4. Salva come .docx

Salva il file in formato Word (.docx). Non salvare come .doc o .pdf.

### 5. Carica in Managemob

Vai nella pagina **Documenti**, clicca **"Carica Template"**, dai un nome e carica il file.

### 6. Genera

Seleziona il template, scegli uno o più partecipanti, clicca **Genera**. Il documento scaricato avrà i tag sostituiti con i dati reali.

---

## Regole importanti

- I tag sono **case-sensitive**: scrivi `{name}` non `{Name}` o `{NAME}`
- Non aggiungere spazi dentro le parentesi: `{name}` è corretto, `{ name }` no
- Se un campo non ha valore nel database, il tag viene sostituito con testo vuoto
- La **formattazione** del tag viene mantenuta: se scrivi `{name}` in grassetto, il nome del partecipante apparirà in grassetto
- Puoi usare i tag ovunque nel documento: nel corpo del testo, nelle tabelle, nelle intestazioni, nei piè di pagina

---

## Elenco completo dei tag disponibili

### Dati Personali

| Tag | Descrizione | Esempio |
|---|---|---|
| `{name}` | Nome | Mario |
| `{surname}` | Cognome | Rossi |
| `{sex}` | Sesso | Male / Female |
| `{status}` | Status | Student, Job seeker, Worker |
| `{date_of_birth}` | Data di nascita | 1995-03-15 |
| `{place_of_birth}` | Luogo di nascita | Roma |
| `{nationality}` | Nazionalità | Italian |
| `{marital_status}` | Stato civile | Single, Married |
| `{driving_licence}` | Patente | Yes / No |

### Contatti

| Tag | Descrizione | Esempio |
|---|---|---|
| `{email}` | Email | mario.rossi@email.com |
| `{phone}` | Telefono | +39 333 1234567 |
| `{mobile_phone}` | Cellulare | +39 333 1234567 |
| `{address}` | Indirizzo | Via Roma 1 |
| `{postcode}` | CAP | 73100 |
| `{city}` | Città | Lecce |
| `{country}` | Paese | Italy |

### Passaporto

| Tag | Descrizione |
|---|---|
| `{passport_number}` | Numero passaporto |
| `{passport_expiring_date}` | Data scadenza |

### Mobilità

| Tag | Descrizione | Esempio |
|---|---|---|
| `{mobility_typology}` | Tipologia | Incoming / Outgoing |
| `{indiv_group}` | Individuale o Gruppo | Individual / Group |
| `{group_name}` | Nome del gruppo | ErasmusPro 2026 |
| `{destination_country}` | Paese di destinazione | Italy |
| `{destination_city}` | Città di destinazione | Lecce |
| `{arrival_date}` | Data arrivo | 2026-03-15 |
| `{departure_date}` | Data partenza | 2026-06-15 |
| `{program}` | Programma | Erasmus+ |
| `{project_name}` | Progetto | KA1 VET Mobility |

### Organizzazione di Invio (Sending Organisation)

| Tag | Descrizione |
|---|---|
| `{sending_org_name}` | Nome organizzazione |

### Azienda Ospitante (Host Company)

| Tag | Descrizione |
|---|---|
| `{host_company_name}` | Nome azienda |
| `{host_company_city}` | Città |
| `{host_company_sector}` | Settore |
| `{host_company_tutor}` | Nome tutor |
| `{host_company_tutor_phone}` | Telefono tutor |
| `{host_company_tutor_email}` | Email tutor |

### Alloggio (Accommodation)

| Tag | Descrizione |
|---|---|
| `{accommodation_1_name}` | Nome alloggio 1 |
| `{accommodation_1_city}` | Città alloggio 1 |
| `{accommodation_1_typology}` | Tipo (Host Family, Hostel, ...) |
| `{accommodation_1_start_date}` | Inizio alloggio 1 |
| `{accommodation_1_end_date}` | Fine alloggio 1 |
| `{accommodation_1_weeks}` | Settimane alloggio 1 |
| `{accommodation_1_cost}` | Costo alloggio 1 |
| `{accommodation_2_name}` | Nome alloggio 2 |
| `{accommodation_2_city}` | Città alloggio 2 |
| `{accommodation_2_typology}` | Tipo alloggio 2 |
| `{accommodation_2_start_date}` | Inizio alloggio 2 |
| `{accommodation_2_end_date}` | Fine alloggio 2 |
| `{accommodation_2_weeks}` | Settimane alloggio 2 |
| `{accommodation_2_cost}` | Costo alloggio 2 |

### Altri Provider

| Tag | Descrizione |
|---|---|
| `{insurance_name}` | Assicurazione |
| `{transfer_name}` | Transfer provider |
| `{language_course_provider_name}` | Provider corso di lingua |
| `{mobility_provider_name}` | Provider mobilità |

### Corso di Lingua

| Tag | Descrizione |
|---|---|
| `{language_course_start_date}` | Inizio corso |
| `{language_course_end_date}` | Fine corso |
| `{language_course_weeks}` | Settimane |

### Stage (Internship)

| Tag | Descrizione |
|---|---|
| `{internship_start_date}` | Inizio stage |
| `{internship_end_date}` | Fine stage |
| `{internship_weeks}` | Settimane |

### Finanze

| Tag | Descrizione |
|---|---|
| `{grant_amount}` | Importo grant (€) |
| `{international_transport_cost}` | Trasporto internazionale |
| `{local_transport_cost}` | Trasporto locale |
| `{food_allowance_cost}` | Indennità vitto |
| `{insurance_cost}` | Costo assicurazione |
| `{transfer_cost}` | Costo transfer |
| `{language_course_cost}` | Costo corso lingua |
| `{cultural_activities_cost}` | Attività culturali |
| `{other_expenses}` | Altre spese |
| `{margin}` | Margine calcolato |

### Dati Bancari

| Tag | Descrizione |
|---|---|
| `{iban}` | IBAN |
| `{swift_code}` | Codice SWIFT |

### Istruzione

| Tag | Descrizione |
|---|---|
| `{last_diploma}` | Ultimo diploma |
| `{year_obtained}` | Anno conseguimento |

### Lingue

| Tag | Descrizione |
|---|---|
| `{lang_english}` | Livello inglese (A1-C2) |
| `{lang_spanish}` | Livello spagnolo |
| `{lang_french}` | Livello francese |
| `{lang_german}` | Livello tedesco |
| `{lang_italian}` | Livello italiano |
| `{lang_other}` | Altre lingue |
| `{language_test_score}` | Punteggio test |

---

## Esempio: Template Europass Mobility

Ecco come preparare il template Europass per Managemob:

### Pagina 1 — Intestazione

| Testo originale | Sostituisci con |
|---|---|
| `[Prénom(s)] [Nom(s)]` | `{name} {surname}` |
| `[JJ/MM/AAAA – JJ/MM/AAAA]` | `{arrival_date} – {departure_date}` |

### Pagina 1 — Tabella organismo d'accueil

| Testo originale | Sostituisci con |
|---|---|
| `Remplacer par du texte` (organisme d'accueil) | `{host_company_name}` |
| `Remplacer par du texte` (pays et ville) | `{destination_city}, {destination_country}` |
| `Remplacer par le mail / téléphone` | `{host_company_tutor_email} / {host_company_tutor_phone}` |

### Pagina 5 — Coordonnées du participant

| Testo originale | Sostituisci con |
|---|---|
| `Remplacer par du texte` (nom complet) | `{name} {surname}` |
| `Remplacer par du texte` (mail) | `{email}` |
| `Remplacer par un numéro` (téléphone) | `{phone}` |

### Pagina 5 — Tuteur organisme d'accueil

| Testo originale | Sostituisci con |
|---|---|
| `Remplacer par du texte` (tuteur) | `{host_company_tutor}` |
| `Remplacer par du texte` (mail) | `{host_company_tutor_email}` |
| `Remplacer par un numéro` | `{host_company_tutor_phone}` |

### Pagina 7 — Firme

| Testo originale | Sostituisci con |
|---|---|
| `Remplacer par du texte` (organisme d'envoi) | `{sending_org_name}` |
| `Remplacer par du texte` (adresse envoi) | `{sending_org_name}` |
| `Remplacer par du texte` (organisme d'accueil) | `{host_company_name}` |
| `Remplacer par du texte` (adresse accueil) | `{host_company_city}` |
| `Remplacer par du texte` (participant) | `{name} {surname}` |

---

## Suggerimenti

- **Testa sempre** con un partecipante di prova prima di generare in batch
- **Combina più tag** nella stessa frase: `Il partecipante {name} {surname} di nazionalità {nationality} arriverà il {arrival_date}`
- **Controlla i campi vuoti**: se un partecipante non ha un dato compilato nel database, il tag verrà sostituito con testo vuoto — verifica che i dati siano completi prima di generare
- La guida completa dei placeholder è sempre consultabile nella pagina **Documenti** dell'app, nella sezione "Placeholder disponibili"
