Monitoring

# SAP Cloud ALM Connectivity

Forward ASAPIO integration health and connectivity metrics to SAP Cloud ALM for centralized service monitoring. Covers the Cloud ALM agent setup, metric push configuration, and how to interpret connector status in the ALM health dashboard.

## Overview

ASAPIO can send integration health metrics to **SAP Cloud ALM**, enabling central monitoring of ASAPIO message processing alongside other SAP integration scenarios. The connectivity uses the following Cloud ALM APIs:

- **Raw Data Inbound Metrics API** – reports error ratios per outbound object using the OpenTelemetry/OTLP format. Shown in SAP Cloud ALM Health Monitoring.
- **Raw Data Inbound Logs API** – sends exception messages and error details to Integration & Exception Monitoring (available from January 2026 onwards).

## SAP Cloud ALM Setup

In the SAP Cloud ALM tenant, configure a service entry for the ASAPIO SAP system:

### Health Monitoring Service

1. Go to **Admin → Landscape Management → Services & Systems**
2. Create a new service of type **Unspecified Cloud Service HTTP**
3. Toggle the service to **ON** in the **Health Monitoring** scope
4. Retrieve the **Service ID** from the service details – this is used in the SAP system configuration

### Integration & Exception Monitoring Service

1. Create a separate service in Landscape Management (same type: Unspecified Cloud Service HTTP)
2. Toggle this service to **ON** in the **Integration & Exception Monitoring** scope
3. Retrieve the Service ID for this service separately

## SAP System Configuration

Configure the Cloud ALM connectivity in the ASAPIO connection instance default values (`/ASADEV/ACI_SETTINGS` → SPRO → Connection Instance Default Values).

### Metrics Instance (Health Monitoring)

Create a dedicated ASAPIO connection instance for the metrics API with the following settings:

| Setting | Value |
| --- | --- |
| RFC Destination | `CLOUD_ALM_METRICS_API` (type G, pointing to the Cloud ALM metrics endpoint) |
| Token RFC Destination | `CLOUD_ALM_METRICS_TOKEN` (type G, OAuth token endpoint) |
| Default: `AUTH_TYPE` | `OAUTH` |
| Default: `CLIENT_ID` | OAuth Client ID from Cloud ALM service key |
| Default: `TOKEN_DESTINATION` | `CLOUD_ALM_METRICS_TOKEN` |
| Default: `CALM_SERVICEID` | Service ID from Health Monitoring service |

Set `CALM_INSTANCE` in the outbound object or connection default values to the name of this metrics instance.

### Logs Instance (Exception Monitoring)

Create a second connection instance for the logs API:

| Setting | Value |
| --- | --- |
| RFC Destination | `CLOUD_ALM_LOGS_API` |
| Token RFC Destination | `CLOUD_ALM_LOGS_TOKEN` |
| Default: `AUTH_TYPE` | `OAUTH` |
| Default: `CLIENT_ID` | OAuth Client ID |
| Default: `TOKEN_DESTINATION` | `CLOUD_ALM_LOGS_TOKEN` |
| Default: `CALM_LOG_SERVICEID` | Service ID from Exception Monitoring service |

Set `CALM_LOGS_INSTANCE` in the configuration to reference this instance.

## Authentication

Both APIs authenticate via OAuth 2.0 Client Credentials. The OAuth Client ID and Client Secret are obtained from the SAP Cloud ALM service key in BTP. Store the Client Secret in ABAP Secure Store (`/ASADEV/SCI_TPW`).
