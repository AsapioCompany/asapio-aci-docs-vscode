Reference

# Release Notes

Full release history for the ASAPIO Integration Add-on. All releases are available for download from the customer portal at **portal.asapio.com**.

v3.2.0
Major
Latest
January 15, 2026

New Features

- **SAP Advanced Event Mesh connector – generally available.** Full support for enterprise mesh topology, broker links, and cross-region event replication. Connects to AEM via SAP BTP service key. See [AEM documentation](connector-sap-event-mesh.md#aem).
- **AI-powered field mapping suggestions.** The Event Studio now suggests target field mappings based on source field names and types using an embedded ML model trained on SAP data models. Suggestions appear as a sidebar in the field mapper; accept with one click.
- **Enhanced GDPR audit log export.** CSV and PDF export now include an electronic signature using SAP's digital signature infrastructure. PDF export is suitable for DPO submissions and regulatory documentation. See [GDPR Audit Logging](gdpr-functions.md#audit-logging).
- **Confluent Schema Registry v7 support.** Updated Schema Registry client to support SR v7 API, including the new schema normalization and schema comparison endpoints.

Improvements

- **Azure Service Bus:** OAuth 2.0 with Azure AD app registration is now the default authentication method. SAS Token authentication is deprecated and will be removed in v4.0. A migration guide is included in the download.
- **Monitoring cockpit redesigned.** New throughput charts with configurable time ranges (1h, 24h, 7d, 30d), error rate trend sparklines, top-5 error type breakdown per flow, and one-click navigation from error to DLQ entry.
- **Performance:** batch mode throughput improved by 40% through parallel bgRFC scaling. Flows with batch size ≥ 100 now automatically use multiple bgRFC units.
- **Event Studio:** flow canvas zoom and pan improved, minimap added for large flows with more than 10 nodes, keyboard shortcuts added for common actions (Ctrl+S save, Ctrl+D deploy, Ctrl+T test run).

Bug Fixes

- Fixed: Solace connector reconnection delay after network interruption was 5 minutes. Now reconnects within 10 seconds using exponential backoff starting at 1 second.
- Fixed: Event Studio field mapping editor lost unsaved changes when browser tab was refreshed. Changes are now auto-saved to session storage every 30 seconds.
- Fixed: GDPR erasure report was missing entries for inbound flows when the flow had been deactivated between message processing and erasure request.
- Fixed: CloudEvents `time` attribute was incorrectly serialized with local SAP timezone instead of UTC in systems with non-UTC timezone configured.

v3.1.2
Patch
October 8, 2025

Bug Fixes

- Fixed: Azure Service Bus connector entered an infinite retry loop when the Azure Service Bus Dead Letter Queue was full (max DLQ depth reached). Messages are now placed in ASAPIO's internal DLQ instead of retrying indefinitely.
- Fixed: Solace AMQP 1.0 connector experienced periodic connection drops on high-latency networks (RTT > 200ms). Improved heartbeat handling and keepalive configuration.
- Fixed: CloudEvents `time` attribute was set to epoch (1970-01-01) for events triggered via batch mode rather than real-time events.
- Fixed: Event Studio froze (browser tab unresponsive) when opening integration flows with more than 50 field mappings. Resolved by virtualizing the mapping list in the field mapper panel.
- Fixed: GCP Pub/Sub connector logged a spurious warning "token refresh not needed" every 60 seconds for active connections.

v3.1.0
Minor
July 22, 2025

New Features

- **Confluent Schema Registry support.** Avro and JSON Schema encoding for Kafka messages. Schema ID embedded in Confluent wire format. Schemas resolved automatically from the configured Schema Registry URL. See [Schema Registry documentation](connector-kafka.md#schema-registry).
- **Enhanced monitoring cockpit.** New throughput charts (events/hour time series), SLA tracking per flow (configurable threshold, alerts on breach), and a new "top errors" widget.
- **SAP S/4HANA 2023 FPS01 certification.** Tested and certified with SAP S/4HANA 2023 Feature Pack Stack 01.
- **New connector: StreamSets DataOps Platform (beta).** Send and receive data via StreamSets pipelines. Available for SAP S/4HANA on-premise only. Not supported on ECC.

Improvements

- **Kafka connector:** idempotent producer is now enabled by default for all Kafka 2.6+ brokers. Previously opt-in. This ensures exactly-once outbound delivery without any configuration change needed.
- **Inbound HTTP:** rate limiting is now configurable per endpoint (requests/minute and requests/second). Previously a global setting only.
- **GDPR pseudonymization:** now supports "consistent token mode" – the same input value always produces the same pseudonymized token. This allows correlating records across log entries without revealing PII. Previously, a new random token was generated per occurrence.
- **Designer:** added "duplicate flow" action – creates a copy of an existing flow with a new name. Useful for creating variants of existing flows.

v3.0.0
Major
March 1, 2025

New Features

- **Complete Event Studio rewrite.** New React-based canvas with drag-and-drop flow builder, inline field mapper with visual source-to-target drag connections, and a redesigned properties panel. Performance and usability significantly improved.
- **SAP BTP Advanced Event Mesh connector (beta).** First release of the AEM connector. Basic publish/subscribe functionality. Mesh topology and broker links not yet supported (added in v3.2.0).
- **CloudEvents 1.0 support for all connectors.** All connectors now use CloudEvents 1.0 JSON format by default. Configurable per connector. ASAPIO custom extension attributes (`asapio-*`) introduced. See [CloudEvents documentation](cloudevents.md).
- **Real-time ATP check feature.** New HTTP endpoint for external systems to query SAP ATP without custom development. See [ATP documentation](atp.md).

Breaking Changes

- **Transport import sequence changed.** Must now import in order: 1) Basis Objects, 2) Core Add-on, 3) Connector Packages. Previous releases had a different sequence. A migration guide is available in the v3.0.0 download package.
- **Connector configuration format updated.** Authentication settings use a new format. A migration wizard is available in Event Studio (**Admin → Migrate v2 Connectors**) to automatically convert existing connector configurations. Manual migration instructions in the migration guide.
- **bgRFC queue names changed.** ASAPIO v3.x uses new bgRFC queue names prefixed with `ZASAPIO_`. Old queues from v2.x remain until manually cleaned up in `SMQ2`.

v2.9.5
Patch
November 14, 2024

Bug Fixes

- Fixed: GCP Pub/Sub connector had an OAuth token refresh race condition that caused messages to be dropped silently when the token expired during a burst of outbound events. Token refresh is now serialized and locked to prevent the race condition.
- Fixed: SAP Event Mesh connector rejected valid namespace names containing hyphens (e.g., `default/my-company/integration/`). Namespace validation updated to allow hyphens per the SAP Event Mesh specification.
- Fixed: Event Studio "Export Flow" function generated invalid JSON in Safari (all versions) due to a non-standard JSON serialization behavior. Now uses explicit JSON.stringify with a polyfill for Safari compatibility.
- Fixed: Retry job `ZASAPIO_RETRY_JOB` did not process entries added to the DLQ while the job was actively running. DLQ entries added during a job run are now included in the same run or the next run, no longer skipped.
