Connectors

# Connectors Overview

ASAPIO provides certified, production-ready connectors for all major cloud messaging platforms. Each connector supports outbound (SAP → cloud) and inbound (cloud → SAP) directions, with enterprise-grade security and reliability built in.

[![Microsoft Azure](img/logos/azure.svg)
Microsoft Azure](../integration/azure.md)
[![Amazon Web Services](img/logos/aws.svg)
Amazon AWS](../integration/aws.md)
[![Google Cloud](img/logos/gcp.svg)
Google Cloud](../integration/google.md)
[![Apache Kafka](img/logos/kafka.svg)
Apache Kafka](../integration/kafka.md)
[![Confluent](img/logos/confluent.svg)
Confluent](../integration/confluent.md)
[![Solace PubSub+](img/partners/solace.png)
Solace PubSub+](../integration/solace.md)
[![SAP Advanced Event Mesh](img/logos/sap.svg)
SAP Adv. Event Mesh](../integration/sap-aem.md)
[F
Microsoft Fabric](../integration/fabric-connector.md)

![Connector configuration screen](img/docs-connector-config.svg)

## Connector Architecture

All ASAPIO connectors share a common architecture designed for reliability and security in enterprise SAP environments:

- **ABAP-native** – connectors run as pure ABAP code within the SAP work process. No external runtime, no middleware server, no additional infrastructure.
- **Secure credential storage** – all credentials (tokens, API keys, passwords, client certificates) are stored in SAP Secure Storage (SSF/PSE), never in Customizing tables or application logs.
- **TLS 1.2+ enforced** – all connections use TLS 1.2 as a minimum. TLS 1.3 is used when the cloud platform supports it.
- **Retry with exponential backoff** – configurable retry logic: 3 attempts by default, with delays of 30 seconds, 2 minutes, and 10 minutes. Messages that exhaust all retries are placed in the Dead Letter Queue with full context.
- **bgRFC delivery** – outbound messages are delivered via SAP's background Remote Function Call framework, ensuring messages are not lost even if the SAP system is restarted during delivery.
- **CloudEvents 1.0** – all connectors support CloudEvents 1.0 JSON format by default (configurable per connector).

## Authentication Methods

Each connector supports a range of authentication methods. The recommended method for each platform is listed below.

| Connector | Supported Auth Methods | Recommended |
| --- | --- | --- |
| Azure Service Bus | SAS Token, Azure AD OAuth 2.0, Managed Identity | Azure AD OAuth 2.0 (SAS deprecated in v3.2.0) |
| Azure Event Hub | SAS Token, Azure AD OAuth 2.0 | Azure AD OAuth 2.0 |
| Apache Kafka / Confluent | SASL/PLAIN, SASL/SCRAM-256, SASL/SCRAM-512, mTLS | mTLS for self-hosted; SASL/SCRAM-512 for Confluent Cloud |
| Solace PubSub+ | Basic (username/password), Client Certificate, OAuth 2.0 | OAuth 2.0 |
| SAP Event Mesh | OAuth 2.0 (Client Credentials, via BTP service key) | OAuth 2.0 (only option) |
| Google Cloud Pub/Sub | Service Account JSON key, Workload Identity | Service Account JSON key |
| AWS SNS / SQS | Access Key + Secret Key, IAM Role via STS | IAM Role via STS (no long-lived credentials) |
| REST API | API Key (header), Basic Auth, OAuth 2.0 Client Credentials | OAuth 2.0 Client Credentials |

## Connector: Azure Service Bus

The Azure Service Bus connector enables reliable messaging between SAP and Azure, supporting queues, topics, and subscriptions with full enterprise messaging semantics including dead-lettering, sessions, and scheduled delivery.

Protocols supported: AMQP 1.0 (recommended for performance) and HTTPS (for restricted network environments). See the [full Azure Service Bus connector reference](connector-azure-service-bus.md) for configuration details.

## Connector: Azure Event Hub

Azure Event Hub is designed for high-throughput event streaming. Use it when you need to ingest SAP events at scale (millions per day) into Azure analytics pipelines, Azure Stream Analytics, or Azure Data Lake.

- **Event Hub Namespace** – the fully qualified namespace name (e.g., `mycompany-events.servicebus.windows.net`)
- **Hub Name** – the specific Event Hub within the namespace
- **Consumer Group** – for inbound: the consumer group to use (default: `$Default`)
- **Partition Key Strategy** – how to assign events to partitions: round-robin, SAP SID, or custom field value
- **Protocol** – AMQP 1.0 (default) or HTTPS

## Connector: Apache Kafka / Confluent

The Kafka connector supports both self-hosted Apache Kafka (2.6+) and Confluent Cloud. It provides high-throughput event streaming with exactly-once producer semantics, Avro and JSON Schema support via Confluent Schema Registry, and configurable consumer groups for inbound flows.

See the [full Kafka / Confluent connector reference](connector-kafka.md) for configuration details, Schema Registry integration, and performance tuning.

## Connector: Solace PubSub+

The Solace connector integrates with Solace PubSub+ (self-hosted and Solace Cloud). It supports AMQP 1.0 and the Solace native SMF protocol, topic subscriptions, and Dead Message Queue (DMQ) configuration.

- **Solace Cloud URL** – the messaging service URL (e.g., `mr-xxxxxx.messaging.solace.cloud`)
- **VPN Name** – the message VPN (e.g., `asapio-integration`)
- **Authentication** – Basic (username/password), Client Certificate, or OAuth 2.0
- **Topic Subscriptions** – wildcard topic subscriptions supported (e.g., `sap/s4hana/*/events/>`)
- **DMQ** – configure Dead Message Queue name for messages that cannot be delivered after all retries
- **Protocol** – AMQP 1.0 (port 5671 TLS) or Solace native AMQP (port 55443)

## Connector: SAP Event Mesh

The SAP Event Mesh connector integrates with SAP BTP's managed message broker. It also supports SAP Advanced Event Mesh (AEM), powered by Solace technology, for enterprise-grade mesh topology and cross-region event replication.

See the [full SAP Event Mesh connector reference](connector-sap-event-mesh.md) for BTP service key setup, namespace configuration, and AEM-specific options.

## Connector: SAP Advanced Event Mesh

SAP Advanced Event Mesh extends Event Mesh with enterprise capabilities: broker links for connecting multiple event brokers, mesh topology for cross-region event replication, and dynamic message routing. AEM is generally available as of ASAPIO v3.2.0.

Configuration is via SAP BTP service key – the AEM service key contains the broker URL, VPN name, and messaging endpoints. Paste the service key JSON into the connector configuration in Event Studio, or map individual fields manually.

## Connector: Google Cloud Pub/Sub

The Google Cloud Pub/Sub connector supports both outbound (SAP publishes to a GCP topic) and inbound (SAP subscribes to a GCP subscription). Configuration highlights:

- **Service Account JSON** – paste the GCP service account key JSON directly into the connector config. ASAPIO stores it in SAP Secure Storage.
- **Project ID and Topic/Subscription name** – full resource path format: `projects/my-project/topics/sap-events`
- **Message Ordering** – enable ordering key support for ordered delivery within a topic partition
- **Exactly-Once Delivery** – enable for subscriptions that require exactly-once processing (requires GCP exactly-once subscription type)
- **Naming Conventions** – ASAPIO recommends topic naming: `sap-<module>-<event-type>`, e.g., `sap-mm-goods-movement`

## Connector: AWS SNS / SQS

The AWS connector supports Amazon SNS (outbound: publish to topic) and Amazon SQS (inbound: poll queue). It also supports the SNS → SQS fan-out pattern common in AWS event-driven architectures.

- **Authentication** – Access Key + Secret (for dev/test) or IAM Role via STS AssumeRole (recommended for production)
- **Region** – AWS region (e.g., `eu-central-1`) – must match your SNS/SQS resource region
- **SNS Topic ARN** – for outbound: full topic ARN, e.g., `arn:aws:sns:eu-central-1:123456789012:sap-events`
- **SQS Queue URL** – for inbound: full queue URL
- **FIFO Queue Support** – supported; message group ID mapped from a configurable flow field
- **Polling Interval** – for inbound SQS: configurable from 1 to 300 seconds (default: 30)

## Connector: REST API

The generic REST connector allows integration with any HTTP/HTTPS endpoint – external portals, custom APIs, legacy systems, or cloud services not covered by a dedicated connector.

- **Outbound** – HTTP POST (default) or PUT to a configurable endpoint URL. Supports JSON and XML payloads.
- **Inbound** – ASAPIO exposes an HTTP endpoint that accepts POST requests. See [Inbound Messaging](inbound.md) for details.
- **Authentication** – API Key (custom header name configurable), Basic Auth, OAuth 2.0 Client Credentials flow (token auto-refreshed).
- **Headers** – configure custom HTTP headers (e.g., `X-API-Version: 2`, `Accept: application/json`)
- **TLS Client Certificate** – mTLS supported; upload the client certificate in STRUST and reference it in the connector config.

## Compatibility Matrix

| Connector | SAP S/4HANA 1809 | SAP S/4HANA 2020+ | ECC 6.0 EhP7 | Status |
| --- | --- | --- | --- | --- |
| Azure Service Bus | ✓ | ✓ | ✓ | GA |
| Azure Event Hub | ✓ | ✓ | ✓ | GA |
| Apache Kafka / Confluent | ✓ | ✓ | ✓ | GA |
| Solace PubSub+ | ✓ | ✓ | ✓ | GA |
| SAP Event Mesh | ✓ | ✓ | ✓ | GA |
| SAP Advanced Event Mesh | ✓ | ✓ | ✓ | GA |
| Google Cloud Pub/Sub | ✓ | ✓ | ✓ | GA |
| AWS SNS / SQS | ✓ | ✓ | ✓ | GA |
| REST API | ✓ | ✓ | ✓ | GA |
| StreamSets DataOps | ✓ | ✓ | – | Beta |
