Getting Started

# Configuration Transport

How to package your ASAPIO configuration – cloud instances, outbound objects, payload designs – as an SAP transport request for controlled promotion from development through quality to production.

## Overview

ASAPIO Customizing tables are client-dependent and are **not automatically recorded** in change requests by the standard SAP transport system. To move ASAPIO configuration between systems (Development → QA → Production), you must manually add the relevant table entries to a transport request.

## Configuration Tables

The following ASAPIO configuration tables must be manually transported:

### Connection & Event Configuration

| Table | Description |
| --- | --- |
| `/ASADEV/AMR_EVEN` | Load Events (Fieldglass, SAP Event Mesh) |
| `/ASADEV/ACI_ADPT` | Cloud Adapter (FG\_CON\_N, WS\_IN, SAP\_EM) |
| `/ASADEV/AMR_CODE` | Codepages |
| `/ASADEV/AMR_CONN` | Cloud Instance (connection definitions) |
| `/ASADEV/ACI_SHDE` | Attributes per Cloud Instance |
| `/ASADEV/ACI_CNST` | Definition of Global Functions |
| `/ASADEV/ACI_GLOB` | Activation of Global Functions / Constants |
| `/ASADEV/ACI_DEFA` | Default values |
| `/ASADEV/ACI_EMAP` | Handling of Return codes / Error messages |
| `/ASADEV/AMR_OBJ` | Outbound Objects |
| `/ASADEV/ACI_HATT` | Header Attributes of Replication Objects |
| `/ASADEV/ACI_XML` | XML Mapping fields |
| `/ASADEV/AMR_OB_I` | Inbound Objects |
| `/ASADEV/ACI_MDOC` | Inbound Object field mapping |
| `/ASADEV/ACI_FGUN` | Unit of Measurement conversion FG ↔ SAP |
| `/ASADEV/ACI_FGPL` | Relevant plants for SAP Fieldglass |
| `/ASADEV/ACI_FGRM` | Role Mapping |
| `/ASADEV/ACI_FGCC` | Relevant company codes for SAP Fieldglass |
| `/ASADEV/ACI_ARCC` | Company codes (Support Package 01, Feature Pack 1 and 2 only) |
| `/ASADEV/DATA_EVE` | Event Studio – Event Definitions |

### Payload Design Tables

| Table | Description |
| --- | --- |
| `/ASADEV/DYN_VIEW` | Payload Designer view definitions |
| `/ASADEV/DYN_VERS` | Payload Designer versions |
| `/ASADEV/DBJT_INP` | Join table input |
| `/ASADEV/DBJC_INP` | Join condition input |
| `/ASADEV/DYN_FLDS` | Field selections |
| `/ASADEV/DBAN_INP` | Annotation input |
| `/ASADEV/ACI_PD_S` | Payload Design status settings |
| `/ASADEV/ACI_PD_U` | Payload Design user settings |

## Creating a Transport Request

Use transaction SE09 (Workbench Organizer) to create a transport request and add the configuration table entries:

1. Create a new Customizing request in SE09
2. Add the relevant table entries using object type `R3TR` / `TABU`
3. For each table, specify the table name and the key fields of the rows to include
4. Release the transport request when all entries are added
5. Import to the target system via STMS

## Multi-Client Transport (SCC1)

If configuration needs to be copied across clients within the same system, use transaction SCC1:

1. In SCC1, select the **source client**
2. Enter the **transport request number**
3. Enable **Start Immediately**
4. Execute to import the request into the current client

## First-Time Transport Procedure

When transporting ASAPIO configuration to a new target system for the first time, move **all workbench and Customizing requests** together. This ensures that BC-set auto-configuration and all manual configuration entries are available in the target system.

1. Ensure the ASAPIO software package has been imported into the target system
2. Check that all required RFC destinations exist in the target system
3. Import the configuration transport via STMS
4. Verify that connection instances and outbound objects are active in the target client
5. Run a test from `/n/ASADEV/ACI_MONITOR` to confirm successful operation
