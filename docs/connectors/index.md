Connectors

# All Connectors

Every supported cloud platform connector in one place – Azure Service Bus, AWS SNS/SQS, Confluent, Solace, SAP Advanced Event Mesh, Google Pub/Sub, Apache Kafka, and more. Each connector manages authentication, connection pooling, and protocol specifics for its target platform. Follow the individual connector guide for step-by-step setup.

ASAPIO provides prebuilt connectors for the most popular cloud messaging platforms. Each connector can be configured entirely in SAP Customizing – no custom code is required for standard scenarios.

## Microsoft

- [**Microsoft Azure®**](azure/index.md) – Azure Service Bus, Azure Event Hubs, Azure Event Grid, and Azure Data Lake Storage. Supports SAS Key, OAuth (Entra ID), and Managed Identity authentication.
- [**Microsoft Fabric®**](fabric/index.md) – Send SAP data to Microsoft Fabric Lakehouses and mirrors using the OneLake storage API. Includes a Predefined Content Data Catalog with 30+ S/4HANA and ECC payload designs.

## Event Streaming

- [**Solace® PubSub+**](solace/index.md) – Connect SAP to Solace via REST or AMQP. Supports OAuth, dynamic topics, and HA failover.
- [**Confluent®**](confluent/index.md) – Confluent Kafka integration via REST proxy or native Kafka protocol.
