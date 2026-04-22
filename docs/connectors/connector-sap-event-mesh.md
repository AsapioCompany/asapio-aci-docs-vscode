Connectors

# SAP Event Mesh Connector

Publish and consume events on SAP Event Mesh and SAP Advanced Event Mesh – the native event broker for SAP BTP. Ideal for SAP-to-SAP BTP integration and event-driven BTP extension scenarios.

## Overview

SAP Event Mesh is SAP BTP's managed message broker service, part of SAP Integration Suite. It provides queues, topics, and webhooks with enterprise-grade reliability. SAP Advanced Event Mesh (AEM), powered by Solace technology, extends Event Mesh with enterprise mesh capabilities for large-scale, multi-region deployments.

ASAPIO supports both:

- **SAP Event Mesh** – standard plan and default plan, using HTTP REST protocol with OAuth 2.0 authentication from the BTP service key
- **SAP Advanced Event Mesh** – broker URL and VPN name from the AEM service key, AMQP 1.0 protocol, mesh topology, and cross-region replication
- **Directions**: Outbound (SAP → Event Mesh) and Inbound (Event Mesh → SAP via polling or webhook subscription)
- **CloudEvents**: natively supported – SAP Event Mesh and AEM both support CloudEvents 1.0

## Prerequisites

- SAP BTP account (trial or production)
- SAP Event Mesh service instance created in BTP (standard plan or default plan)
- Service key created for the Event Mesh instance
- For AEM: Advanced Event Mesh service instance and service key from BTP
- TCP outbound access from SAP to BTP endpoints: `*.enterprise-messaging.cloud.sap` on port 443

## Getting the Service Key

The service key JSON contains all credentials and endpoint URLs needed for the ASAPIO connector. Obtain it from the SAP BTP Cockpit:

### Open BTP Cockpit

Log in to **account.hana.ondemand.com**. Navigate to your subaccount and select the **Space** where your SAP Event Mesh instance resides.

### Find the Event Mesh instance

Go to **Services → Service Instances**. Find your SAP Event Mesh instance (service name: `enterprise-messaging`) and click on it.

### Create a service key

Click **Service Keys → Create**. Give it a name (e.g. `asapio-key`). Leave the parameters empty for a standard key. Click **Create**.

### Download the JSON

Click the key name to view its JSON content. Copy the full JSON or download it. The key looks like the following:

```
{
  "namespace": "default/asapio.com/integration/",
  "instanceid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "messaging": [
    {
      "oa2": {
        "clientid": "sb-clone-xxxx",
        "clientsecret": "xxxx-xxxx-xxxx",
        "tokenendpoint": "https://xxx.authentication.eu10.hana.ondemand.com/oauth/token",
        "granttype": "client_credentials"
      },
      "protocol": ["httprest"],
      "broker": {
        "type": "sapmgw"
      },
      "uri": "https://enterprise-messaging-pubsub.cfapps.eu10.hana.ondemand.com"
    }
  ],
  "serviceinstanceid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "xsappname": "clone-xxxx"
}
```

## Configuration in ASAPIO

In ASAPIO Event Studio, open the SAP Event Mesh connector properties. You have two configuration options:

#### Option 1: Paste full service key JSON

Click **Import Service Key** and paste the entire JSON from SAP BTP. ASAPIO parses the JSON and extracts all required fields automatically.

#### Option 2: Manual field entry

Enter each field individually:

| Field | Source in Service Key | Example Value |
| --- | --- | --- |
| Token Endpoint | `messaging[0].oa2.tokenendpoint` | `https://xxx.authentication.eu10.hana.ondemand.com/oauth/token` |
| Client ID | `messaging[0].oa2.clientid` | `sb-clone-xxxx` |
| Client Secret | `messaging[0].oa2.clientsecret` | stored in SAP Secure Storage |
| REST URL | `messaging[0].uri` | `https://enterprise-messaging-pubsub.cfapps.eu10.hana.ondemand.com` |
| Namespace | `namespace` | `default/asapio.com/integration/` |

## Queue and Topic Configuration

SAP Event Mesh uses a namespace-prefixed naming convention for topics and queues.

#### Namespace format

The namespace is defined in the service key and follows the pattern: `default/<domain>/<system>/`

Example: `default/asapio.com/integration/`

#### Topic naming

Topics must start with the namespace. ASAPIO recommends the following convention:

```
default/asapio.com/sap/<SID>/<module>/<event-type>

Example: default/asapio.com/sap/PRD/mm/goodsmovement
```

#### Queue vs. Topic Subscription

- **Queue**: persistent storage, one consumer at a time. Use for reliable, ordered, point-to-point delivery.
- **Topic Subscription**: multiple consumers can subscribe to the same topic. Use for publish/subscribe fan-out scenarios.

ℹ️

Create queues before publishing

SAP Event Mesh does not auto-create queues. Create queues in the SAP Event Mesh cockpit (or via the Management API) before activating your ASAPIO flow. Topics are created on first publish.

## CloudEvents Integration

SAP Event Mesh natively supports CloudEvents 1.0 as the message format. When publishing via ASAPIO, the following CloudEvents attributes are set:

| Attribute | Value | Notes |
| --- | --- | --- |
| `specversion` | `1.0` | Always 1.0 |
| `source` | `urn:asapio:s4hana:<SID>` | e.g. `urn:asapio:s4hana:PRD` |
| `type` | `com.asapio.sap.<module>.<event>` | e.g. `com.asapio.sap.s4hana.mm.goodsmovement` |
| `id` | UUID v4, auto-generated | Unique per message |
| `time` | ISO 8601 UTC | Posting time in SAP |
| `datacontenttype` | `application/json` | Always JSON for Event Mesh connector |

## Advanced Event Mesh

SAP Advanced Event Mesh (AEM) extends SAP Event Mesh with Solace-based enterprise features. To configure the AEM connector in ASAPIO, obtain the AEM service key from SAP BTP (service: `enterprise-messaging` with AEM plan, or the dedicated AEM service).

Additional AEM-specific settings:

- **Broker URL**: from the AEM service key, the AMQP endpoint (e.g. `amqps://mr-xxxxxx.messaging.solace.cloud:5671`)
- **VPN Name**: the message VPN from the AEM service key
- **Messaging Endpoints**: REST endpoint for management operations
- **Mesh Topology**: configure broker links in the AEM console to enable cross-region event replication. ASAPIO publishes to the local broker; AEM handles global distribution automatically.

💡

AEM for multi-region SAP landscapes

If you have SAP systems in multiple regions (e.g. EU and US), AEM's mesh topology automatically replicates events published from the EU SAP system to the US event broker, so US consumers can subscribe locally without cross-region latency.

## Testing

Use the SAP Event Mesh cockpit (accessible from SAP BTP Cockpit → Services → Event Mesh → Manage) to:

- View published events in queue browsers
- Check queue depth and consumer count
- Replay or delete messages from queues
- Monitor event delivery status
- Test topic subscriptions

After activating your ASAPIO flow, trigger a test event using Event Studio's **Test Run** function and verify that the message appears in the SAP Event Mesh cockpit queue browser.
