# ASAPIO Documentation — Agent Overview

Map of every Markdown file under `docs/`. Use this to figure out where a topic lives before reading full pages. Paths are relative to `docs/`.

**Total files:** 38 (23 at root, 15 under `connectors/`).

Images referenced by these docs live in `docs/img/` (root-level pages use `img/...`; connector pages use `../img/...`).

---

## Entry points

### [ASAPIO Documentation](index.md)

Everything you need to install, configure and operate the ASAPIO Integration Add-on – the SAP-native ABAP add-on for event-driven SAP cloud integration.

Sections:
- **Quick start – your first integration in 4 steps**
- **Explore by topic**
- **Supported Connectors**

### [Quick Start Guide](getting-started.md)

Get the ASAPIO Integration Add-on up and running in your SAP system in under an hour.

Sections:
- **Step 1: Verify System Requirements**
- **Step 2: Download the Transport Files** — Log in to the ASAPIO customer portal, Navigate to Downloads > Integration Add-on, Extract the ZIP
- **Step 3: Import Transport into SAP** — Upload the transport files to SAP, Add to the import queue, Execute the import
- **Step 4: Activate the License** — Open the license transaction, Enter your license key, Verify and save
- **Step 5: Configure Your First Connector** — Open the Event Studio, Create a new flow, Configure the source connector, Configure the target connector, Save and activate
- **Step 6: Send a Test Event** — Open the Test Run panel, Select a sample event, Execute and verify

## Install & setup

### [Installation & Setup](installation.md)

How to obtain, import, and activate the ASAPIO Integration Add-on in your SAP system.

Sections:
- **Supported SAP Systems**
- **Download & Import** — Import Sequence
- **Authorization Roles & Objects**
- **Uninstallation**

### [Configuration Transport](transport.md)

How to package your ASAPIO configuration – cloud instances, outbound objects, payload designs – as an SAP transport request for controlled promotion from development through quality to production.

Sections:
- **Overview**
- **Configuration Tables** — Connection & Event Configuration, Payload Design Tables
- **Creating a Transport Request**
- **Multi-Client Transport (SCC1)**
- **First-Time Transport Procedure**

### [Event Studio](eventstudio.md)

A no-ABAP Fiori app for day-to-day integration administration – create cloud instances, activate outbound objects, and adjust settings without back-end Customizing.

Sections:
- **Overview**
- **Data Catalog**
- **Interfaces**
- **Events**
- **Connections**
- **Monitoring**
- **Help**
- **Deployment** — Option A – SAP BTP via Business Application Studio, Option B – ABAP Application Server

## Outbound messaging

### [Outbound Messaging Overview](outbound.md)

Core concepts of outbound event processing – how SAP business events are captured, enriched with payload data, queued, and reliably delivered to cloud targets with built-in retry and error handling.

Sections:
- **Available Event Triggers**
- **SAP Business Object Events**
- **Business Transaction Events (BTE)**
- **Event Filtering**
- **Setting Up Outbound Messaging**
- **Simple Notifications**
- **Message Builder (Full Payloads)**
- **Payload Modification Options**
- **Batch Job Setup**
- **Packed Load / Initial Load**
- **Immediate Retry**
- **Custom Events, Extractors, and Triggers**
- **Authorization Notes**

### [Payload Designer](designer.md)

A point-and-click tool for building the JSON payload that leaves SAP.

Sections:
- **Overview**
- **Screens**
- **Toolbar Actions** — Payload Design actions, Payload Design Version actions
- **Creating a Payload Design**
- **Field Configuration Options**
- **Table Aliases (SP09+)**
- **Use in Outbound Objects**
- **Clean Core Checks**

### [Support of CDS Views](cds-view-support.md)

Use ABAP Core Data Services (CDS) views as the data provider for outbound message payloads.

Sections:
- **What are CDS Views?**
- **Supported Types of CDS Views** — Classic CDS Views, CDS View Entities
- **How to Use a CDS View Entity as Data Source** — Interface Configuration

### [CloudEvents Format](cloudevents.md)

Structure outbound messages as CloudEvents v1.0 – the CNCF standard envelope format supported by Azure Event Grid, Solace, Confluent, and many other platforms.

Sections:
- **Overview**
- **Activate CloudEvents Formatting**
- **Optional Header Attributes**

### [Sequencing](sequencing.md)

When event ordering matters – e.g. order created before goods issued – sequencing ensures downstream consumers see SAP events in the exact order they occurred in SAP.

Sections:
- **Overview**
- **Activate Sequencing**

### [IDoc Messaging](idoc.md)

Route existing SAP IDocs to cloud message brokers without changing the IDoc setup.

Sections:
- **Overview**
- **Outbound (IDoc → JSON → Cloud)** — ALE Configuration, Outbound Object Configuration, Event Linkage, Connector-Specific Header Attributes, Testing Outbound
- **Inbound (Cloud → JSON → IDoc)** — Inbound Function Module, Inbound IDoc Configuration, JSON Schema
- **PUSH and PULL Modes**

### [Real-Time ATP (Inventory)](atp.md)

Push live Available-to-Promise (ATP) and inventory check results to external systems the moment they occur in SAP – enabling real-time stock visibility for e-commerce, supply-chain and analytics platforms without polling or batch exports.

Sections:
- **Overview**
- **Supported Business Objects**
- **Custom Extractor Function Module**
- **BAdI Implementation**
- **Output JSON Format**

### [RAP Events](rap-events.md)

Use business events emitted by SAP RAP (ABAP RESTful Application Programming Model) business objects as native integration triggers – no custom ABAP event wiring needed.

Sections:
- **Overview**
- **Prerequisites**
- **bgRFC Destination Setup**
- **Activating RAP Events** — Via SAP GUI (SPRO), Via Event Studio Deployment
- **Supported RAP Objects**
- **CDS View Entity Redefinition**
- **Custom Payloads**

### [AsyncAPI® Support](asyncapi.md)

Export a machine-readable AsyncAPI specification for your ASAPIO integration scenarios – describing channels, message schemas, and platform bindings.

Sections:
- **Overview**
- **Export AsyncAPI Specification**

## Inbound messaging

### [Inbound Messaging Overview](inbound.md)

How external systems push data back into SAP via the ASAPIO inbound HTTP endpoint.

Sections:
- **Overview**
- **HTTP Endpoint (SICF)**
- **Custom Inbound Function Module**
- **Recommended Pattern**
- **Optional Configuration**
- **Reprocessing Failed Messages**

## Monitoring

### [Monitor & Traces](monitoring.md)

The central operations console for the Integration Add-on. View every sent and received message, inspect full payload content, track delivery status, read error details and re-trigger failed messages – no ABAP debugging or SE16 required.

Sections:
- **ASAPIO Monitor** — Selection Criteria, Log Entry Details, Layout Options, Monitor Actions, Charts & Statistics
- **Change Pointer Operations**
- **Pro-Active Alerting** — Alerting Setup, Alerting BAdI
- **Message Tracing**
- **Archiving & Deletion**
- **Configuration Parameters**

### [SAP Cloud ALM Connectivity](calm_connectivity.md)

Forward ASAPIO integration health and connectivity metrics to SAP Cloud ALM for centralized service monitoring.

Sections:
- **Overview**
- **SAP Cloud ALM Setup** — Health Monitoring Service, Integration & Exception Monitoring Service
- **SAP System Configuration** — Metrics Instance (Health Monitoring), Logs Instance (Exception Monitoring)
- **Authentication**

## Reference

### [FAQ](faq.md)

Common questions from ASAPIO customers and integration engineers – covering initial setup, connector configuration, payload design, error handling, and licensing.

Sections:
- **Getting Started**
- **Installation & Licensing**
- **Connectors & Connectivity**
- **Outbound Messaging**
- **Performance & Scale**
- **Inbound Messaging**
- **Monitoring & Error Handling**
- **Feature-Specific Questions**

### [GDPR Functions](gdpr-functions.md)

The Integration Add-on stores message payload data in monitoring tables.

Sections:
- **Overview**
- **Personal Data Stored by ASAPIO** — Trace Data (Sensitive), SAP Fieldglass–Specific Data
- **Deletion**
- **Data Migration**

### [Glossary](glossary.md)

Key terms and concepts used in ASAPIO documentation and in SAP integration contexts.

### [Release Notes](releases.md)

Full release history for the ASAPIO Integration Add-on. All releases are available for download from the customer portal at **portal.asapio.com**.

## Support

### [Support](support.md)

How to reach the ASAPIO support team, open a ticket, and provide the right diagnostic data for fast resolution.

Sections:
- **Support Channels** — ASAPIO Integration Add-on (direct licensees), SAP Fieldglass Integration Add-on, SAP NetWeaver Event-enablement Add-on, SAP's Event Add-On for ERP (SAP Advanced Event Mesh)
- **Ticket Processing**
- **Creating a Support Request** — Login, Issue Description, Checking Ticket Status
- **ASAPIO Support Terms**

## Connectors

Connector pages cover authentication setup, configuration fields, outbound and inbound flow setup, and platform-specific notes.

### [Connectors Overview](connectors.md)

ASAPIO provides certified, production-ready connectors for all major cloud messaging platforms.

Sections:
- **Connector Architecture**
- **Authentication Methods**
- **Connector: Azure Service Bus**
- **Connector: Azure Event Hub**
- **Connector: Apache Kafka / Confluent**
- **Connector: Solace PubSub+**
- **Connector: SAP Event Mesh**
- **Connector: SAP Advanced Event Mesh**
- **Connector: Google Cloud Pub/Sub**
- **Connector: AWS SNS / SQS**
- **Connector: REST API**
- **Compatibility Matrix**

### [All Connectors](connectors/index.md)

Every supported cloud platform connector in one place – Azure Service Bus, AWS SNS/SQS, Confluent, Solace, SAP Advanced Event Mesh, Google Pub/Sub, Apache Kafka, and more.

Sections:
- **Microsoft**
- **Event Streaming**

### [AI Vergabemanager Connector](connectors/ai-vm.md)

AI VERGABEMANAGER integration overview

Sections:
- **Overview**
- **Features**
- **Documentation**

### [SAP Ariba® Connector](connectors/ariba.md)

The ASAPIO Ariba Connector enables direct communication between SAP ERP / S/4HANA and SAP Ariba, allowing enterprises to orchestrate procurement processes across both platforms with real-time event-driven integration.

Sections:
- **Overview**
- **Key Features**
- **Documentation & Licensing**

### [Amazon® Web Services Connector](connectors/aws.md)

ASAPIO supports sending SAP event payloads to multiple AWS services using **AWS Signature Version 4 (SigV4)** request signing.

Sections:
- **Overview**
- **IAM Users & Permissions**
- **Setup** — 1. Activate BC-Set, 2. Create Cloud Instance, 3. Response Handler
- **Service-Specific Header Attributes** — EventBridge, SNS, Kinesis, S3
- **SNS Payload Offloading (S3)**
- **Custom SNS Message Attributes**

### [Microsoft Azure® Connector](connectors/azure.md)

The ASAPIO Azure connector enables SAP systems to send events and data to Microsoft Azure messaging and storage services.

Sections:
- **Overview**
- **Prerequisites**
- **Authentication Options**
- **RFC Destinations**
- **BC-Set Activation**
- **Cloud Instance Configuration** — OAuth Default Values, Managed Identity Default Values, SAS Key Default Values
- **Service-Specific Endpoint Configuration** — Azure Service Bus, Azure Event Hub, Azure Event Grid, Azure Data Lake Storage (ADLSgen2), Custom HTTP Endpoint
- **Outbound Messaging** — Key Header Attributes
- **Payload Offloading (Service Bus)**
- **Inbound: Azure Service Bus Pull**

### [Confluent® Connector](connectors/confluent.md)

The ASAPIO Confluent connector is certified by Confluent and supports two connectivity modes:

Sections:
- **Overview**
- **REST Proxy Setup** — RFC Destination, BC-Set & Cloud Adapter, Cloud Instance
- **Native Kafka Protocol (S4KAFKA)**
- **Outbound Configuration** — Key Header Attributes
- **Dead Letter Queues (2510+)**
- **Inbound: REST Proxy Pull**

### [Azure Service Bus Connector](connectors/connector-azure-service-bus.md)

Send and receive messages between SAP and Azure Service Bus – queues, topics, and subscriptions – with full enterprise messaging semantics including dead-lettering, sessions, scheduled delivery, and duplicate detection.

Sections:
- **Overview**
- **Prerequisites**
- **Configuration Parameters**
- **Step-by-Step Setup** — Create an Azure Service Bus namespace, Create a queue or topic, Set up authentication, Configure in ASAPIO Event Studio, Test and activate
- **Outbound Example (SAP → Azure Service Bus)**
- **Inbound Example (Azure Service Bus → SAP)**
- **Message Format**
- **Troubleshooting**

### [SAP Event Mesh Connector](connectors/connector-sap-event-mesh.md)

Publish and consume events on SAP Event Mesh and SAP Advanced Event Mesh – the native event brokers for SAP BTP.

Sections:
- **Overview**
- **Prerequisites**
- **Getting the Service Key** — Open BTP Cockpit, Find the Event Mesh instance, Create a service key, Download the JSON
- **Configuration in ASAPIO**
- **Queue and Topic Configuration**
- **CloudEvents Integration**
- **Advanced Event Mesh**
- **Testing**

### [Microsoft Fabric® Connector](connectors/fabric.md)

The ASAPIO Microsoft Fabric connector enables direct, event-driven loading of SAP data into Microsoft Fabric Lakehouses and Mirrors via the OneLake storage API.

Sections:
- **Overview**
- **Prerequisites**
- **RFC Destinations**
- **BC-Set**
- **Cloud Instance**
- **Open Mirroring (Parquet Format)**
- **Lakehouse (File Upload)**
- **Predefined Content Data Catalog**
- **Custom Data Products**
- **Initial / Packed Load**
- **Lakehouse Notebook**

### [Google® Pub/Sub® Connector](connectors/google.md)

Create two HTTP RFC destinations (SM59, type G):

Sections:
- **Prerequisites**
- **RFC Destinations**
- **Certificate Import**
- **Service Account Setup**
- **Cloud Instance**
- **Outbound Configuration**
- **Custom Message Attributes**

### [Apache® Kafka® Connector](connectors/kafka.md)

ASAPIO connects to Apache Kafka via the **Confluent REST Proxy**.

Sections:
- **Overview**
- **Setup**

### [mysupply Connector](connectors/mysupply.md)

The ASAPIO mysupply connector integrates SAP purchase requisition (PR) items with the [mysupply](https://www.mysupply.ai/) AI-powered procurement platform.

Sections:
- **Overview**
- **Basic Configuration** — SSL Certificate, RFC Destination, Cloud Instance
- **Outbound Configuration** — Standard Outbound Fields
- **Inbound Configuration** — Inbound Fields Updated in SAP, Optional Inbound Fields
- **Unit of Measure Mapping**
- **BAdI Extensions**
- **Known Restrictions**

### [SAP Advanced Event Mesh](connectors/sap-aem.md)

SAP Integration Suite, Advanced Event Mesh (AEM) is a fully managed event streaming and management service available on SAP BTP.

Sections:
- **Overview**
- **Configuration** — 1. Validation Service RFC Destination, 2. Token RFC Destination, 3. Validation Service Cloud Instance, 4. AEM RFC Destination, 5. AEM Cloud Instance
- **Dynamic Topics**
- **Function Modules**
- **Header Attributes**

### [Solace® PubSub+ Connector](connectors/solace.md)

ASAPIO connects to Solace PubSub+ message brokers (on-premise or cloud) using either **REST-based** or **AMQP-based** connectivity.

Sections:
- **Overview**
- **REST-Based Connectivity** — RFC Destination, BC-Set & Cloud Adapter, Cloud Instance, High Availability Setup
- **AMQP-Based Connectivity (2510+)**
- **Outbound Configuration** — Key Header Attributes
- **Dynamic Topics**

### [StreamSets® Connector](connectors/streamsets.md)

ASAPIO can send SAP event payloads directly to a **StreamSets® Data Collector** HTTP endpoint.

Sections:
- **Overview**
- **Setup** — 1. Create RFC Destination, 2. Create Cloud Instance, 3. Error Mapping, 4. Outbound Object
