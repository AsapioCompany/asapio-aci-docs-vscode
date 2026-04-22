Connectors

# Apache® Kafka® Connector

## Overview

ASAPIO connects to Apache Kafka via the **Confluent REST Proxy**. The REST Proxy provides a RESTful interface to an Apache Kafka cluster, which ASAPIO uses to publish messages from SAP without requiring a native Kafka client inside the ABAP environment.

The REST Proxy approach works for any standard Apache Kafka deployment, whether self-managed, hosted on a cloud provider, or run as a managed service.

## Setup

Configuration and setup are identical to the Confluent connector. Please refer to the [Confluent® documentation](../confluent/index.md) for the complete setup guide, including:

- Creating SM59 RFC destinations for the REST Proxy endpoint
- Activating the BC-Set `/ASADEV/ACI_BCSET_FRAMEWORK_KAFK`
- Configuring the Cloud Instance with Cloud Adapter `/ASADEV/CL_ACI_KAFKA_HANDLER`
- Setting up outbound objects and header attributes (`KAFKA_TOPIC`, `KAFKA_KEY_FIELD`)
- Inbound processing via the REST Proxy consumer API

If you are using Apache Kafka without the Confluent REST Proxy, ASAPIO also supports a native Apache Kafka protocol connection via the Kafka Native handler (`/ASADEV/CL_S4_KAFKA_HANDLER`, Cloud Type `S4KAFKA`). See the Confluent documentation for details.
