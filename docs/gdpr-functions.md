Reference

# GDPR Functions

The Integration Add-on stores message payload data in monitoring tables. This page documents the built-in tools for GDPR subject access requests (SAR) and data erasure – required for compliance in all production landscapes that process personal data.

## Overview

ASAPIO supports the three core GDPR data subject rights relevant to integration middleware:

- **Right to information** – knowing what personal data is stored
- **Right to deletion** – removing personal data from ASAPIO tables
- **Right to data portability / migration** – exporting or moving personal data

There are two scenarios where customer data (including personally identifiable information) may be stored within the ASAPIO Integration Add-on: in configuration or Customizing (e.g., the SAP user ID that created a configuration set); or in the header or payload of messages and transmission logs, depending on customer configuration (e.g., supplier contact data, employee records).

**Note:** No data is transferred to or stored at ASAPIO servers or premises. The customer is solely responsible for where data is stored.

## Personal Data Stored by ASAPIO

ASAPIO stores user-related data in the following tables:

| Location | Data | Notes |
| --- | --- | --- |
| `/ASADEV/A_AMRLOG` | SAP user names | Logged in message processing records |
| `/ASADEV/DYN_VIEW` | SAP user names | Recorded as creator/modifier in Payload Designer |
| SLG1 (Application Log) | SAP user names | Standard SAP application log |
| SCU3 (Change Recording) | SAP user names | Standard SAP table change log |

### Trace Data (Sensitive)

When tracing is activated for an outbound object, the actual message payload is stored in:

- **STXH** – SAP text header table, used to store trace payloads

Trace data may contain *customer or business-critical information* depending on the payload design. It is stored only when tracing is explicitly enabled and only for the duration configured.

### SAP Fieldglass–Specific Data

If the SAP Fieldglass connector is installed, additional reference data is stored in:

- `/ASADEV/ACI_FGRF` – Fieldglass reference data
- `/ASADEV/ACI_TSRF` – Time sheet reference data
- CDHDR / CDPOS – Standard SAP change documents

## Deletion

To delete personal data from ASAPIO tables, use the archiving and deletion program:

- **Report:** `/ASADEV/ACI_AMRLOG_DELETE`
- Deletes message log entries (`/ASADEV/A_AMRLOG`) and associated trace data (STXH)
- Selection options: by date range, by cloud instance, or by outbound object

For SAP standard logs and change documents:

- **SLG1:** Use standard SAP transaction SLG2 to delete application log entries
- **SCU3:** Standard SAP table change log – use SAP-provided archiving options
- **CDHDR / CDPOS:** Use standard SAP change document archiving (object `CHANGEDOCU`)

For Payload Designer entries in `/ASADEV/DYN_VIEW`: delete the payload design via transaction `/ASADEV/DESIGN` when the design is no longer needed.

**Note:** The Fieldglass reference tables (`/ASADEV/ACI_FGRF` and `/ASADEV/ACI_TSRF`) have no dedicated deletion report. Entries in these tables should not be deleted, as they typically contain only technical interface users. For SAP standard logs and change documents, use SAP-provided archiving tools (SLG2 for application logs, standard archiving for SCU3/CDHDR/CDPOS).

## Data Migration

For data portability, message log data can be exported via standard ABAP data export tools (SE16N export to spreadsheet). For automated export scenarios, contact [ASAPIO Support](../support/index.md).
