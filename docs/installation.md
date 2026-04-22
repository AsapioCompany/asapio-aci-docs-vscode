Getting Started

# Installation & Setup

How to obtain, import and activate the ASAPIO Integration Add-on in your SAP system. Covers supported releases, transport import order, authorization role setup and uninstallation. **Start here before any other configuration step.**

## Supported SAP Systems

The ASAPIO Integration Add-on supports the following SAP backend systems:

| System | Minimum Release |
| --- | --- |
| SAP ECC 6.0 | EhP6 or higher |
| SAP S/4HANA (on-premise) | 2020 through 2025 (any SP) |
| RISE with SAP Private Cloud | 2020 through 2025 |
| Other SAP NetWeaver AS ABAP systems | SAP\_BASIS 731 SP0003 (SAPKB73103) or higher |

Minimum software component versions required: **SAP\_BASIS 731 SP0003** (SAPKB73103) and **SAP\_ABA 731 SP0003** (SAPKA73103).

No SAP Business Function activation is required for the core framework. Some connectors (e.g., the Fieldglass connector) may require additional Business Functions – refer to the respective connector guide.

## Download & Import

The ASAPIO Integration Add-on is distributed either as SAP transport files or as add-on installation files (.PAT). Obtain the installation files from the [ASAPIO Support Portal](../support/index.md). Two delivery options are available:

- **Transport import** (recommended for on-premise): upload transport files using transaction **CG3Z**, then import via **SE09** and **STMS**. Upload `R*` data files to `/usr/sap/trans/data/` and `K*` cofiles to `/usr/sap/trans/cofiles/`.
- **Add-on installation (.PAT)**: install via transaction **SAINT**. Note that `.PAT` files must be uploaded directly via the application server file system – SAINT frontend upload is not supported.

### Import Sequence

Transport files must be imported in this exact order:

| # | Transport | Description |
| --- | --- | --- |
| 1 | **Framework** | Core framework – dictionary objects, function groups, programs |
| 2 | **Event Content** | Pre-delivered event definitions and customizing. Since release 9.32210, event content is combined with the framework transport (this step can be skipped for 9.32210+) |
| 3 | **Connector** | Connector-specific classes and handlers for your target platform |
| 4 | **NWEE Unlock** (optional) | Required only if the ASANWEE add-on (SAP Advanced Event Mesh) is used |

## Authorization Roles & Objects

Two roles are delivered with the add-on:

| Role | Purpose |
| --- | --- |
| `/ASADEV/ACI_ADMIN_ROLE` | Full configuration access – required for all Customizing and monitoring transactions |
| `/ASADEV/ACI_JOB_ROLE` | Restricted role for batch job execution and workflow users (e.g., SAP\_WFRT, WF-BATCH) |

The following transactions are included in `S_TCODE`:

`/ASADEV/68000202`, `/ASADEV/68000203`, `/ASADEV/68000204`, `/ASADEV/68000205`, `/ASADEV/68000206`, `/ASADEV/68000207`, `/ASADEV/68000212`, `/ASADEV/68000216`, `/ASADEV/68000217`, `/ASADEV/68000218`, `/ASADEV/ACI_MONITOR`, `/ASADEV/ACI`, `/ASADEV/DESIGN`, `/ASADEV/SCI_CP_RESET`, `/ASADEV/SCI_TPW`, `BD52`, `BD61`, `RBDCPCLR`, `SE38`, `SPRO`, `WE81`, `SOAMANAGER`

Authorization objects included in the roles:

| Auth Object | Description |
| --- | --- |
| `/ASADEV/RC` | Replication control – required for all outbound/inbound processing |
| `/ASADEV/AR` | Archive access |
| `/ASADEV/CU` | Customizing |
| `/ASADEV/IN` | Inbound processing |
| `/ASADEV/ML` | Monitor log access |
| `/ASADEV/PD` | Payload Designer access |
| `/ASADEV/PW` | Password / secure store access |

## Uninstallation

There are two scenarios for uninstalling the ASAPIO Integration Add-on:

- **Case 1 – ASANWEE or ASAAEMEE add-on is installed:** First import the deletion transports for all additional connectors (in reverse order to installation). Then use transaction **SAINT** to uninstall the framework add-on package (ASANWEE / ASAAEMEE).
- **Case 2 – Transport-only installation (no ASANWEE):** Import the deletion transport provided by the ASAPIO Support Portal. The deletion transport removes all repository objects and Customizing entries.

In both cases, ensure all active batch jobs using ASAPIO programs are stopped before starting the uninstallation.

To verify that the removal is complete, go to transaction **SE16**, open table **TADIR**, and filter by `DEVCLASS = '/ASADEV/*'`. No entries should remain after a successful uninstall.
