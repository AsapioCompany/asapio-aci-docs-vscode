Reference

# FAQ

Common questions from ASAPIO customers and integration engineers – covering initial setup, connector configuration, payload design, error handling, and licensing. If your question isn't answered here, open a ticket via the [Support Portal](../support/index.md).

Answers to the most common questions – from first-time setup to advanced feature configuration.

## Getting Started

What is the ASAPIO Integration Add-on?

The ASAPIO Integration Add-on is a native SAP ABAP add-on that enables event-driven and batch integration between SAP systems (S/4HANA, ECC) and cloud platforms such as Microsoft Azure, AWS, Kafka, Solace, Google Pub/Sub, and more. It installs directly into the SAP system – no middleware or additional server is required. Events are triggered by standard SAP Business Object events and sent to the configured cloud endpoint.

Which SAP systems are supported?

The ASAPIO Integration Add-on supports:

- SAP S/4HANA (on-premise and Private Cloud Edition)
- SAP ECC (ERP 6.0, EhP 7+)
- SAP NetWeaver 7.31 and higher (minimum ABAP stack)

For full system requirements see the [Installation & Setup](../installation/index.md) guide.

Do I need ABAP development skills to use ASAPIO?

Not for standard use cases. The Payload Designer, Event Studio, and the SPRO Customizing guide let you configure payload structures, event linkages, and connector settings without writing ABAP code. Functional consultants and basis administrators can set up and operate most integrations.

ABAP knowledge is only needed if you want to implement custom BAdI extensions or write your own formatter/extractor function modules.

How long does a typical first integration take to set up?

A standard integration (e.g., sending a Sales Order event to Azure Service Bus) typically takes a few hours from transport import to first successful message. The steps are:

1. Install the transport ([Installation guide](../installation/index.md))
2. Create an RFC destination and cloud instance for your connector
3. Create or import a payload design (or pick one from the Integration Catalog)
4. Create the outbound object and link it to an SAP Business Object event
5. Test with a trace-enabled run and verify in the ASAPIO Monitor

What is a cloud instance?

A cloud instance (configured in `/ASADEV/ACI_SETTINGS` via SPRO) is the ASAPIO record that groups the connection settings for one cloud endpoint – the RFC destination, authentication type, and default values like topic names or queue names. You can have multiple cloud instances pointing to different targets (e.g., one for production, one for dev/test).

What is the Integration Catalog?

The [Integration Catalog](../catalog/index.md) is a downloadable library of 212 pre-built integration items covering the most common SAP business events across all major Lines of Business (Sales, Procurement, Production, Finance, Logistics, Quality Management, and more). Each item contains a predefined payload design and event linkage that you can import and activate immediately – or use as a starting point for customization.

## Installation & Licensing

What are the minimum system requirements?

See the [Installation & Setup](../installation/index.md) page for full details, including minimum SAP basis release, required support packages, and the import sequence for transport requests. In general: SAP NetWeaver 7.31+, SAP\_BASIS 731 SP10+, HTTP connectivity from the SAP system to the cloud endpoint.

What is the difference between the ASAPIO Integration Add-on and the SAP OEM editions?

ASAPIO offers the same technology in multiple editions:

- **ASAPIO Integration Add-on** – direct ASAPIO license, full connector library
- **SAP Event Add-On for ERP** – OEM edition for SAP Advanced Event Mesh (SAP BTP), licensed by SAP
- **SAP NetWeaver Event-enablement Add-on** – OEM edition for SAP Event Mesh (SAP BTP)
- **SAP Fieldglass Integration Add-on** – OEM edition for Fieldglass ERP integration

The OEM editions are obtained through SAP and have their own support components (OPU-ASA-AEM, OPU-ASA-EE, OPU-ASA-FG). See [Support](../support/index.md) for the correct channel per edition.

## Connectors & Connectivity

Which cloud platforms are supported?

ASAPIO has certified connectors for: Microsoft Azure (Service Bus, Event Hub, Event Grid, ADLS Gen2), Microsoft Fabric (OneLake, Open Mirroring), Solace PubSub+, Confluent, Apache Kafka, SAP Advanced Event Mesh, Google Cloud Pub/Sub, Amazon Web Services (EventBridge, SNS, Kinesis, S3), StreamSets, mysupply, SAP Ariba, and AI Vergabemanager.

See the full [Connectors overview](../connectors/index.md) for details on each.

Can I connect to a platform that is not on the standard connector list?

Yes. The **Custom HTTP** connector allows you to send messages to any HTTP/HTTPS REST endpoint. You configure the target URI in the cloud instance and the integration sends the payload as a standard HTTP POST. This covers most REST APIs that accept JSON payloads.

Can I run multiple connectors at the same time?

Yes. You can have any number of cloud instances, each pointing to a different platform or a different endpoint on the same platform. A single outbound object can send to one instance, and you can create multiple outbound objects for the same SAP event if you need fan-out to multiple targets.

Where are connector credentials stored?

Secrets (API keys, client secrets, passwords) are stored in the ASAPIO secure credential store: table `/ASADEV/SCI_TPW`, accessed via SPRO → "Set the cloud connection password". Credentials never appear in plain text in Customizing tables. OAuth tokens are fetched at runtime and cached in memory.

## Outbound Messaging

What is the difference between real-time event mode and batch mode?

**Real-time (event-driven):** An SAP Business Object event (e.g., `BUS2032 CHANGED` for Sales Orders) triggers the outbound message immediately when the object is saved. Best for individual transactions requiring near-real-time delivery.

**Batch mode:** A scheduled background job (report `/ASADEV/ACI_BATCH_SEND` or similar) extracts a set of records and sends them in one job run. Best for bulk data loads, delta extracts, or cases where real-time triggers would create excessive load.

**Packed Load:** A variant of batch mode that uses multiple parallel work processes for high-volume transfers. See the Performance question below.

How do I find out which SAP events are available for a given Business Object?

Use transaction **SWE2** (Event Type Linkage) to browse available Business Object types and their events. You can also use transaction **SWO1** to inspect a Business Object and its events directly. The ASAPIO Integration Catalog lists the most common ones with ready-to-use configurations. See also [Outbound Messaging – How to identify event triggers](../outbound/index.md).

How do I define which fields are included in the message payload?

Use the [Payload Designer](../designer/index.md) (transaction `/ASADEV/DESIGN`). You select the SAP database tables or CDS views, join them in the visual Join Builder, and choose which fields to include. The designer outputs JSON at runtime – no ABAP coding required. You can also add custom fields, apply conversion classes, set default values, and skip fields conditionally.

Can I filter which records get sent?

Yes. In the Payload Designer, open the version screen and add a WHERE condition (filter string) to restrict which records are extracted. For example, you can filter by company code, sales organization, plant, or any field in the joined tables. Filters use standard ABAP Open SQL WHERE clause syntax.

What are the different outbound message types?

- **Simple Notification** – sends a lightweight JSON notification with key fields only (e.g., document number, change type). Low payload overhead, useful for triggering downstream processes.
- **Message Builder (Payload Designer)** – sends a rich JSON payload built from SAP table joins. The standard approach for most integrations.
- **Packed Load** – batches many records into a single large message with parallel extraction. Used for high-volume initial loads or delta batch jobs.
- **IDoc** – serialises a standard SAP IDoc as JSON and sends it via the cloud connector. Useful for ERP-to-ERP or legacy system integrations.

See [Outbound Messaging overview](../outbound/index.md) for setup steps for each type.

What is CloudEvents format and should I use it?

[CloudEvents](../cloudevents/index.md) is a CNCF specification for describing event data in a common format. ASAPIO can wrap outbound messages in a CloudEvents envelope (adding standardized attributes like `source`, `type`, `specversion`, `id`, and `time`). Use CloudEvents if your target platform or consumer expects the standard envelope, or if you want interoperability across different event sources.

## Performance & Scale

What is the performance impact of real-time event messaging?

The additional workload per single event for message generation is almost negligible. The HTTP call to the cloud endpoint is asynchronous by default and does not block the SAP update task.

**Important:** Triggers from SAP batch processes (MRP runs, mass goods movements, etc.) should not use real-time event mode. Use batch or packed-load mode instead to avoid flooding the SAP work process pool and the target service.

What is Packed Load and when should I use it?

Packed Load is a high-throughput batch mode that uses multiple parallel SAP work processes (configured via server groups) to extract and send large volumes of data. ASAPIO splits the dataset into chunks and distributes them across work processes.

Use Packed Load when:

- Sending initial data loads (millions of records)
- Running daily or weekly bulk delta transfers
- MRP runs or mass update scenarios generating thousands of events

See [Set-up packed load](../outbound/index.md#packedload) for configuration details.

## Inbound Messaging

How does inbound messaging work?

ASAPIO inbound messaging allows external systems to push data back into SAP. The add-on exposes an inbound endpoint that accepts HTTP requests. Received data is staged as an ASAPIO Generic IDoc (`/ASADEV/ACI_GENERIC_IDOC`) and then processed via standard SAP IDoc inbound processing (WE20 partner profile, process code, inbound function module). This means all standard SAP IDoc error handling and monitoring applies. See the [Inbound Messaging](../inbound/index.md) page for setup steps.

Can I poll an external API from SAP instead of waiting for a push?

Yes. Several connector scenarios (e.g., mysupply, some Kafka setups) use a polling model: a scheduled ASAPIO background job calls the external API at a configured interval, retrieves new data, and processes it via the IDoc staging mechanism. The polling interval is configured via the outbound/inbound object settings.

## Monitoring & Error Handling

How do I monitor message delivery?

The ASAPIO Monitor (transaction `/ASADEV/ACI_MONITOR` or via SPRO) shows all outbound message attempts with their status (success, error, retry). You can filter by date, cloud instance, outbound object, or status.

For central monitoring across SAP systems, ASAPIO can push health metrics and exception events to [SAP Cloud ALM](../monitoring/calm_connectivity/index.md).

What happens when a message fails to deliver?

Failed messages are logged in the ASAPIO Monitor with the HTTP response code and error details. The add-on supports configurable automatic retry logic: you define the number of retries and the interval (default: 2 retries). After all retries are exhausted the message remains in *Error* status and can be manually re-sent from the Monitor once the root cause is resolved.

How do I re-send a failed message?

In the ASAPIO Monitor, select the failed message entry and use the **Re-send** action. You can re-send individual messages or use mass re-send for a selection. Re-sends are independent of the original event – they replay the stored payload without re-extracting from SAP, so the data reflects the state at the time of the original message.

How long are message logs and traces retained?

Retention is controlled by your periodic archiving job using report `/ASADEV/ACI_AMRLOG_DELETE`. You define the retention period (by date range) in the job parameters. Trace payloads (stored in SAP table STXH) are deleted together with the log entries. There is no fixed system-imposed retention limit – it is your responsibility to archive regularly to avoid table growth.

## Feature-Specific Questions

What is Event Studio?

[Event Studio](../eventstudio/index.md) is an SAP Fiori web app (running on SAP BTP) that provides a graphical interface for configuring ASAPIO integrations. It lets you create cloud instances, outbound objects, event linkages, and payload designs without using ABAP transactions. It is particularly useful for teams that prefer a visual, browser-based tool over SPRO Customizing.

What is the Payload Designer?

The [Payload Designer](../designer/index.md) (transaction `/ASADEV/DESIGN`) is a no-code tool for building JSON payload definitions from SAP database tables and CDS views. You join tables visually, select fields, apply conversions, set skip conditions, and preview the resulting JSON – all without writing ABAP. Payload designs are reusable across multiple outbound objects and can be transported between systems.

Can I add custom fields to the payload that don't come from the main SAP table?

Yes, in several ways:

- **Join additional tables** in the Payload Designer (e.g., join ADRC for address data, LFA1 for vendor master)
- **Add a custom field** with a conversion class/method that computes a value at runtime (e.g., a calculated field, a lookup)
- **Use a CDS view** that already combines the required fields
- **Implement a BAdI extension** if the logic is too complex for a conversion method

Can I export my event definitions as an API specification?

Yes. ASAPIO supports [AsyncAPI 2.0 export](../asyncapi/index.md). You can generate an AsyncAPI specification from your payload designs, which documents the event channels, message schema, and payload structure in a machine-readable format. This is useful for registering APIs in API catalogs or sharing event contracts with consuming teams.

Does ASAPIO support SAP RAP (RESTful Application Programming) events?

Yes. From S/4HANA 2020 onwards, ASAPIO supports the [RAP Event Linkage Framework](../rap-events/index.md). You can react to Business Object events raised by RAP-based objects (e.g., standard S/4HANA APIs) and send them via ASAPIO outbound processing. The Integration Catalog includes pre-built RAP event linkages for the most common S/4HANA objects.

Can I send data as an IDoc format over a cloud connector?

Yes. The [IDoc Messaging](../idoc/index.md) feature serialises standard SAP IDocs as JSON and sends them via any configured ASAPIO cloud connector. This is useful for integrating legacy ERP-to-ERP scenarios or existing IDoc-based processes with modern cloud platforms, without changing the SAP-side IDoc configuration.
