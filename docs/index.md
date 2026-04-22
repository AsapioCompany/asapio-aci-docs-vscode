Integration Add-on · Technical Reference

# ASAPIO Documentation

Everything you need to install, configure and operate the ASAPIO Integration Add-on – the SAP-native ABAP add-on for event-driven SAP cloud integration.

[Quick Start →](installation/index.md)
[Browse Connectors](connectors/index.md)

## Quick start – your first integration in 4 steps

[1

Install

Import the transport request, configure roles, and activate the BC-Set in your SAP system.

Installation guide →](installation/index.md)[2

Connect

Create the RFC destination and configure a cloud instance for your target platform.

Choose a connector →](connectors/index.md)[3

Configure Events

Design the payload, link SAP business events to the outbound object, and activate.

Outbound messaging →](outbound/index.md)[4

Monitor

Track delivery, inspect message traces, and handle errors in the ASAPIO Monitor.

Monitor & traces →](monitoring/index.md)

## Explore by topic

🚀
Getting Started

[Installation & Setup
System requirements, transport import, roles and uninstallation.](installation/index.md)
[Integration Catalog
212 pre-built event definitions across all SAP Lines of Business.](catalog/index.md)
[Event Studio
Fiori app for configuring integrations without coding.](eventstudio/index.md)
[Configuration Transport
Move ASAPIO customizing across SAP system landscapes.](transport/index.md)

📤
Outbound Messaging

[Overview
Batch jobs, retry logic, packed load extractor, and outbound object setup.](outbound/index.md)
[Payload Designer
Design JSON payloads from SAP tables and CDS views – no ABAP code required.](designer/index.md)
[CDS View Support
Use released CDS views and custom views as data sources.](cds-view-support/index.md)
[CloudEvents Format
Produce CNCF CloudEvents-compliant message envelopes.](cloudevents/index.md)
[IDoc Messaging
Send SAP IDocs as JSON over any cloud connector.](idoc/index.md)
[RAP Events
React to S/4HANA Business Object events via the RAP framework.](rap-events/index.md)
[Real-Time ATP
Push inventory and availability-to-promise data in real time.](atp/index.md)
[Message Sequencing
Guarantee ordered delivery of related SAP events.](sequencing/index.md)
[AsyncAPI Export
Export event schemas as AsyncAPI 2.0 specifications.](asyncapi/index.md)

📥
Inbound Messaging

[Inbound Overview
Receive events from external systems into SAP via IDoc staging and inbound APIs.](inbound/index.md)

📊
Monitoring & Operations

[Monitor & Traces
Message traces, error handling, re-send, and alerting for administrators.](monitoring/index.md)
[SAP Cloud ALM
Health and exception monitoring via Cloud ALM APIs.](monitoring/calm_connectivity/index.md)
[FAQ
Common questions on performance, configuration, and compatibility.](faq/index.md)
[GDPR Functions
Data subject rights, deletion reports, and data portability.](gdpr-functions/index.md)
[Support Portal
Open a support ticket with our engineering and support team.](support/index.md)

## Supported Connectors

[Microsoft Azure
Service Bus · Event Hub · Event Grid · ADLS](connectors/azure/index.md)
[Microsoft Fabric
OneLake · Open Mirroring](connectors/fabric/index.md)
[Solace PubSub+
REST · AMQP](connectors/solace/index.md)
[Confluent
Kafka REST Proxy · Native Kafka](connectors/confluent/index.md)
[Apache Kafka
Generic Kafka REST Proxy](connectors/kafka/index.md)
[SAP Advanced Event Mesh
REST · AMQP](connectors/sap-aem/index.md)
[Google Cloud Pub/Sub
Service Account (JWT)](connectors/google/index.md)
[Amazon Web Services
EventBridge · SNS · Kinesis · S3](connectors/aws/index.md)
[StreamSets
Data Collector REST API](connectors/streamsets/index.md)
[mysupply
Procurement · API Key](connectors/mysupply/index.md)
[SAP Ariba
OAuth2](connectors/ariba/index.md)
[AI Vergabemanager
API Key](connectors/ai-vm/index.md)
