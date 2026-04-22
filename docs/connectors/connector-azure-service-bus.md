Connectors

# Azure Service Bus Connector

Send and receive messages between SAP and Azure Service Bus – queues, topics, and subscriptions – with full enterprise messaging semantics, including dead-lettering, sessions, scheduled delivery, and duplicate detection.

## Overview

Azure Service Bus is Microsoft's fully managed enterprise message broker. It provides reliable, ordered, at-least-once message delivery with advanced features such as message sessions (ordered per-entity delivery), scheduled messages, message deferral, and dead-lettering for poison messages.

The ASAPIO Azure Service Bus connector supports:

- **Entity types**: Queues, Topics, Topic Subscriptions
- **Protocols**: AMQP 1.0 (recommended, port 5671 TLS) and HTTPS (port 443, for environments where AMQP is blocked)
- **Directions**: Outbound (SAP → Azure Service Bus) and Inbound (Azure Service Bus → SAP)
- **Authentication**: SAS Token (legacy), Entra ID (Azure AD) OAuth 2.0 (recommended), Managed Identity (for Azure-hosted SAP)
- **Tiers**: Standard and Premium (Premium required for VNet isolation and Geo-DR)

## Prerequisites

- Active Azure subscription
- Azure Service Bus namespace (Standard or Premium tier)
- Queue or topic already created in the namespace
- For OAuth 2.0: Entra ID (Azure AD) app registration with the **Azure Service Bus Data Sender** role (outbound) and/or **Azure Service Bus Data Receiver** role (inbound)
- For SAS: the primary or secondary connection string from the namespace or entity
- ASAPIO Add-on v3.0.0 or higher installed in SAP
- Outbound TCP access from SAP to `*.servicebus.windows.net` on port 5671 (AMQP) or 443 (HTTPS)

## Configuration Parameters

| Parameter | Required | Default | Description |
| --- | --- | --- | --- |
| Namespace FQDN | required | – | Fully qualified namespace name, e.g. `mycompany.servicebus.windows.net` |
| Queue / Topic Name | required | – | Name of the queue or topic to publish to / receive from |
| Subscription Name | optional | – | For inbound from a topic subscription. Leave blank for queue or topic publish. |
| Authentication Method | required | OAuth | One of: `SAS`, `OAuth`, `ManagedIdentity` |
| SAS Connection String | conditional | – | Required if Authentication Method = SAS. Stored in SAP Secure Storage. |
| Client ID | conditional | – | Entra ID (Azure AD) app Client ID. Required if Authentication Method = OAuth. |
| Tenant ID | conditional | – | Entra ID (Azure AD) Tenant ID. Required if Authentication Method = OAuth. |
| Client Secret | conditional | – | Entra ID (Azure AD) app secret. Required if Authentication Method = OAuth. Stored in SAP Secure Storage. |
| Protocol | optional | AMQP | Transport protocol: `AMQP` (port 5671) or `HTTPS` (port 443) |
| Message Format | optional | CloudEvents JSON | Message envelope format: `CloudEvents JSON`, `Raw JSON`, or `XML` |
| Max Retry Attempts | optional | 3 | Number of delivery retries before placing in Dead Letter Queue |
| Retry Delay (sec) | optional | 30 | Initial retry delay in seconds (doubles on each retry – exponential backoff) |
| Enable Dead Letter Queue | optional | true | Whether to place undeliverable messages in the Azure Service Bus DLQ |
| Message TTL (seconds) | optional | 86400 | Time-to-live for messages in Azure Service Bus (default: 24 hours) |
| Polling Interval (sec) | optional | 30 | For inbound only: how often ASAPIO polls for new messages |
| Inbound Batch Size | optional | 10 | For inbound only: max messages to receive per polling cycle |

## Step-by-Step Setup

### Create an Azure Service Bus namespace

In the Azure portal, search for **Service Bus** and click **Create**. Choose a resource group, name the namespace (it must be globally unique), select the **Standard** or **Premium** tier, and click **Review + Create**.

### Create a queue or topic

In your namespace, click **Queues** (for point-to-point) or **Topics** (for publish/subscribe). Click **+ Queue** or **+ Topic**. Configure the name and optional settings (message TTL, lock duration, dead-lettering options), then click **Create**.

### Set up authentication

**For OAuth 2.0 (recommended)**: In Entra ID (Azure AD), go to **App registrations → New registration**. Note the Client ID and Tenant ID. Create a client secret under **Certificates & secrets**. Assign the app the **Azure Service Bus Data Sender** role on your namespace (IAM tab).

**For SAS**: In your namespace, go to **Shared access policies**, create a policy with *Send* and/or *Listen* claims, and copy the primary connection string.

### Configure in ASAPIO Event Studio

Open transaction `/ASAPIO/DESIGNER`. Open or create a flow. Drag the **Azure Service Bus** connector onto the canvas. In the properties panel, enter the Namespace FQDN and Queue/Topic Name, select OAuth as the authentication method, and enter the Client ID, Tenant ID, and Client Secret. Click **Test Connection** to validate.

### Test and activate

Use Event Studio's **Test Run** feature to send a sample event. Verify that the message arrives in the Azure Service Bus explorer (Azure portal). Once verified, click **Activate**.

## Outbound Example (SAP → Azure Service Bus)

**Scenario**: SAP S/4HANA fires a material goods movement event (transaction MIGO, movement type 101) → ASAPIO publishes a CloudEvent to the Azure Service Bus topic `sap-mm-events` → an Azure Logic App subscribes and updates an external WMS.

The message published to Azure Service Bus looks like this:

```
{
  "specversion": "1.0",
  "id": "a8f3c2d1-4e5b-6f7a-8b9c-0d1e2f3a4b5c",
  "source": "urn:asapio:sap:s4hana:PRD:100",
  "type": "com.asapio.sap.s4hana.mm.goodsmovement.v1",
  "time": "2026-03-27T09:14:02Z",
  "datacontenttype": "application/json",
  "asapio-system-id": "PRD",
  "asapio-client": "100",
  "asapio-flow-id": "MM_GOODS_OUT_ASB",
  "data": {
    "materialDocument": "5000012345",
    "fiscalYear": "2026",
    "postingDate": "2026-03-27",
    "documentDate": "2026-03-27",
    "plant": "1000",
    "storageLocation": "0001",
    "items": [
      {
        "lineItem": "0001",
        "material": "MAT-001234",
        "materialDescription": "Hydraulic Pump Assembly",
        "quantity": 50.0,
        "unit": "PC",
        "movementType": "101",
        "purchaseOrder": "4500012345",
        "poItem": "10",
        "batch": "B2026001"
      }
    ]
  }
}
```

## Inbound Example (Azure Service Bus → SAP)

**Scenario**: An external supplier portal posts a delivery confirmation to the Azure Service Bus queue `delivery-confirmations` → ASAPIO polls the queue every 30 seconds → creates a Goods Receipt (MIGO) in SAP MM.

Configure the inbound flow in Event Studio:

- **Source**: Azure Service Bus connector (select queue `delivery-confirmations`, polling interval 30s, batch size 10)
- **Target**: SAP S/4HANA – Goods Receipt creation (calls `BAPI_GOODSMVT_CREATE`)
- **Field Mapping**: Map delivery confirmation JSON fields to BAPI import parameters
- **Message Acknowledgment**: ASAPIO completes (deletes) the Azure message only after a successful BAPI call; on error, the message returns to the queue for retry

## Message Format

By default, all messages use the CloudEvents 1.0 JSON format. The CloudEvents attributes are set as Azure Service Bus **Application Properties** (message metadata), and the `data` field is the message body. This allows downstream Azure consumers to filter by event type using Service Bus subscription filters without parsing the JSON body.

To disable CloudEvents and send raw JSON, set **Message Format = Raw JSON** in the connector configuration. In this mode, the entire mapping output is sent as the message body, with no envelope.

## Troubleshooting

| Error Message | Likely Cause | Resolution |
| --- | --- | --- |
| "AMQP connection refused" or timeout | Firewall blocks port 5671 from SAP to Azure | Open outbound TCP 5671 from SAP application server to `*.servicebus.windows.net`. Alternatively, switch Protocol to HTTPS (port 443). |
| "SAS token expired" | SAP system clock not synchronized | SAS tokens are time-limited. Ensure the SAP server clock is synchronized via NTP. The clock drift tolerance is 5 minutes. Consider switching to OAuth (tokens refresh automatically). |
| "Message size exceeds limit" | Azure Service Bus Standard tier max message size is 256 KB | Reduce message payload size (remove unnecessary fields in the mapper), or upgrade to the Premium tier (max 100 MB per message). Alternatively, store the payload in Azure Blob Storage and send only a reference in the message. |
| "Unauthorized – 401" | OAuth credentials incorrect or role not assigned | Verify the Client ID, Tenant ID, and Client Secret in the connector config. Confirm the Entra ID (Azure AD) app has the **Azure Service Bus Data Sender** role on the namespace (not just the queue/topic). |
| "Queue/Topic not found – 404" | Queue or topic name misspelled, or wrong namespace | Double-check the queue/topic name (case-sensitive). Verify that the Namespace FQDN is correct. Confirm that the entity exists in the Azure portal. |
