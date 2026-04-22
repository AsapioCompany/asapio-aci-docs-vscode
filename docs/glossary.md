Reference

# Glossary

Key terms and concepts used in ASAPIO documentation and in SAP integration contexts. Terms are listed alphabetically.

A

ABAP

Advanced Business Application Programming – the primary programming language of the SAP platform. ASAPIO runs as native ABAP code within the SAP ABAP application server, requiring no external runtime or middleware. ABAP programs, classes, and function modules are transported via SAP's standard transport system (STMS).

Advanced Event Mesh (AEM)

SAP's enterprise-grade event mesh service, built on Solace PubSub+ technology and available as part of SAP BTP. AEM extends the capabilities of SAP Event Mesh with support for mesh topology (connecting multiple event brokers), broker links for cross-region event replication, and dynamic message routing. The ASAPIO [SAP Event Mesh connector](connector-sap-event-mesh.md) supports both standard Event Mesh and AEM.

AMQP (Advanced Message Queuing Protocol)

An open standard application layer protocol for message-oriented middleware. AMQP 1.0 is an ISO standard and is supported by Azure Service Bus, Azure Event Hub, Solace PubSub+, and SAP Event Mesh. ASAPIO uses AMQP 1.0 as the preferred protocol for Azure and Solace connectors due to its performance and reliability characteristics.

ATP (Available-to-Promise)

SAP's capability to check real-time material availability for a requested quantity and delivery date. ATP considers current stock levels, planned receipts (purchase orders, production orders), and planned issues (sales orders) to determine whether a requested quantity can be confirmed and on what date. ASAPIO exposes this capability as a REST API for external systems. See [Real-Time ATP Check](atp.md).

Avro

A compact binary data serialization format developed by the Apache Software Foundation, widely used in Kafka-based event streaming. Avro uses a JSON-defined schema to describe the data structure. ASAPIO supports Avro encoding for Kafka messages when a Confluent Schema Registry is configured. See [Kafka Schema Registry Integration](connector-kafka.md#schema-registry).

B

BAPI (Business API)

SAP's standard programming interface for executing business processes. BAPIs are RFC-enabled function modules that provide a stable, versioned API for creating or changing SAP business documents. ASAPIO uses BAPIs as the target actions for inbound flows (e.g., `BAPI_GOODSMVT_CREATE` for goods movements, `BAPI_PO_CREATE1` for purchase orders).

bgRFC (Background Remote Function Call)

SAP's framework for reliable, asynchronous message delivery using background work processes. bgRFC guarantees at-least-once delivery: if the SAP system is restarted during message processing, the framework resumes delivery after restart. ASAPIO uses bgRFC for all outbound message delivery, ensuring no events are lost during SAP maintenance windows.

BTP (SAP Business Technology Platform)

SAP's unified cloud platform for extension, integration, data, and analytics. BTP hosts services including SAP Event Mesh, SAP Advanced Event Mesh, SAP Integration Suite, and SAP Build. ASAPIO integrates with BTP services via their REST APIs and service keys.

C

CloudEvents

A specification from the Cloud Native Computing Foundation (CNCF) that defines a common, vendor-neutral format for describing event data. CloudEvents 1.0 defines required attributes (`specversion`, `id`, `source`, `type`) and optional attributes (`time`, `datacontenttype`, `dataschema`). ASAPIO supports CloudEvents 1.0 as the default message format for all connectors since v3.0.0. See [CloudEvents Support](cloudevents.md).

Consumer Group

A Kafka concept: a named group of consumer instances that collectively consume a topic's partitions. Each partition is consumed by exactly one member of the group at a time. Each consumer group maintains its own independent read offset – multiple groups can consume the same topic without interfering with each other. ASAPIO creates one consumer group per inbound Kafka flow; the group ID is configurable.

D

Dead Letter Queue (DLQ)

A storage area for messages that could not be successfully delivered or processed after all retry attempts. ASAPIO maintains an internal DLQ (stored in SAP table `ZASAPIO_DLQ`) for all integration flows. DLQ entries include the original message payload, error details, and retry history. Failed messages can be replayed manually from Event Studio's Error Log tab. See [Error Handling](inbound.md#dlq).

Designer

ASAPIO's browser-based Event Studio UI for creating, configuring, testing, and deploying integration flows. Accessed via SAP transaction /ASAPIO/DESIGNER, which opens the URL `/sap/bc/ui5_ui5/asapio/designer` in the default browser. The Designer runs entirely within the SAP system with no external dependencies. See [Event Studio documentation](designer.md).

E

Event Mesh

SAP BTP's managed message broker service, part of the SAP Integration Suite. Provides queues, topics, and webhook subscriptions with enterprise-grade reliability. Event Mesh supports CloudEvents 1.0 natively and is SAP's recommended event broker for SAP-to-SAP and SAP-to-cloud event-driven integration. See [SAP Event Mesh connector](connector-sap-event-mesh.md).

F

Flow

An integration configuration in ASAPIO that defines a complete integration scenario: source system, source event type, field mapping and transformations, optional filter conditions, target system, target action, and error handling settings. Flows are created and managed in ASAPIO Event Studio. A flow can be in Active (processing events) or Inactive (paused) state. Flows are versioned – the last 5 versions are retained for rollback.

G

GDPR (General Data Protection Regulation)

European Union regulation (EU 2016/679) governing the processing of personal data of EU residents. ASAPIO provides built-in GDPR compliance tools for the integration layer: data masking, audit logging, right-to-erasure support, retention policies, and consent management. See [GDPR Functions](gdpr-functions.md).

I

IDoc (Intermediate Document)

SAP's proprietary message format for electronic data interchange (EDI), used primarily in SAP-to-SAP and SAP-to-EDI partner integrations. IDocs have a hierarchical structure with control record, data records, and status records. ASAPIO can receive IDoc-formatted XML via inbound flows and submit them to SAP via `IDOC_INBOUND_ASYNCHRONOUS`, and can also convert outbound SAP data to IDoc XML format.

Inbound

The direction of data flow where an external system sends data to SAP via ASAPIO. The external system can push data to ASAPIO's HTTP webhook endpoint, or ASAPIO can poll a cloud message broker (Azure Service Bus, SQS, Kafka, etc.) for new messages. ASAPIO processes the received message and executes a configured SAP action. Contrast with *Outbound*. See [Inbound Messaging documentation](inbound.md).

N

Namespace (Event Mesh)

A logical grouping prefix in SAP Event Mesh that organizes topics and queues. All topics and queues within an Event Mesh service instance must start with the namespace defined in the service key. Format: `default/<domain>/<system>/`. Example: `default/asapio.com/integration/`. Topic names within the namespace follow the pattern: `<namespace><module>/<event-type>`.

O

Outbound

The direction of data flow where SAP sends data to an external system via ASAPIO. Triggered by SAP business events (goods movement postings, purchase order creation, sales order changes, etc.) or by a scheduled batch job. ASAPIO transforms the SAP data using the flow's field mapping and publishes it to the configured target connector. Contrast with *Inbound*.

R

RFC (Remote Function Call)

SAP's protocol for calling functions in remote SAP systems or calling ABAP function modules from external programs. RFC uses a proprietary binary protocol over TCP. Types: synchronous RFC (sRFC), asynchronous RFC (aRFC), background RFC (bgRFC). ASAPIO uses bgRFC internally for reliable outbound message delivery.

S

SASL (Simple Authentication and Security Layer)

A framework for adding authentication support to connection-based protocols such as Kafka. ASAPIO's Kafka connector supports three SASL mechanisms: PLAIN (username/password in clear text – only safe over TLS), SCRAM-SHA-256 (salted challenge-response, more secure), and SCRAM-SHA-512 (stronger hash). For Confluent Cloud, SASL/PLAIN over TLS is standard. For self-hosted Kafka, SCRAM-SHA-256 is recommended.

Schema Registry

A service that stores and serves schemas (Avro, JSON Schema, Protobuf) for Kafka messages. Confluent Schema Registry is the most widely used implementation. The schema ID is embedded in each Kafka message header, and consumers look up the schema from the registry to deserialize the message. ASAPIO integrates with Confluent Schema Registry for Avro and JSON Schema encoding. See [Schema Registry Integration](connector-kafka.md#schema-registry).

SID (System ID)

A 3-character alphanumeric identifier for an SAP system instance. Examples: `PRD` (production), `QAS` (quality assurance), `DEV` (development). The SID is displayed in the SAP system title bar and in transaction SM51. ASAPIO licenses are tied to SAP SIDs – each system in your landscape requires its own license key.

SSF / Secure Storage (SAP Secure Storage)

SAP's secure storage facility for cryptographic material and sensitive configuration data. Implemented using PSE (Personal Security Environment) files managed via transaction STRUST. ASAPIO stores all connector credentials (API keys, passwords, client certificates, OAuth secrets) in SAP Secure Storage, never in plain-text Customizing tables.

STMS (Transport Management System)

The SAP transaction and framework for managing software transports between SAP systems in a landscape (DEV → QA → PRD). ASAPIO is installed via standard STMS transport import. Transaction STMS is used to upload transport files, add them to the import queue, and execute the import. See [Installation Guide](installation.md).

T

TLS (Transport Layer Security)

The standard protocol for encrypting network connections. All ASAPIO cloud connectors enforce TLS 1.2 as a minimum. TLS 1.3 is used when supported by the cloud platform. Server certificates are validated against the SAP system's trusted CA store (maintained in STRUST). For mTLS, client certificates are also presented during the TLS handshake.

Topic

A named channel for publishing and subscribing to messages in a messaging system. In Kafka, a topic is a log of ordered, immutable message records partitioned across one or more brokers. In Azure Service Bus and SAP Event Mesh, a topic supports multiple independent subscribers via subscriptions. ASAPIO integration flows are configured with a specific topic name for both outbound publishing and inbound subscription.

W

Webhook

An HTTP callback mechanism where an external system sends an HTTP POST request to a pre-configured URL when an event occurs. ASAPIO's inbound HTTP endpoint acts as a webhook receiver – external systems POST messages to the ASAPIO endpoint URL, which processes them and executes SAP actions. See [Configuring an HTTP Inbound Endpoint](inbound.md#http-endpoint).
