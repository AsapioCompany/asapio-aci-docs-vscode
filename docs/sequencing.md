Outbound Messaging

# Sequencing

When event ordering matters – e.g., order created before goods issued – sequencing ensures downstream consumers see SAP events in the exact order they occurred in SAP. Covers sequence group definition, ordering key derivation, and behavior on error and replay.

## Overview

For some use cases, the sequence in which events are sent out is very important. The direct, asynchronous, and parallel sending of events can mean that consumers need to handle out-of-sequence events – especially if calls fail and need to be reprocessed later.

This is a standard pattern in event-driven architectures but poses challenges when many consumers are involved. For most use cases, ASAPIO's practice of re-extracting the data on re-send ensures that the latest data is always sent, regardless of how many changes have happened since the last send.

ASAPIO introduces an option to prevent parallel send operations for the same objects. With this option, you can configure an outbound object to always use an additional sequencing step that ensures messages are sent in sequence if they refer to the same object ID (e.g., the same Sales Order number). This involves multiple steps:

- Saving the generated payload
- Acquiring a lock on sending for the same key (preventing parallel send calls)
- Checking for existing payloads – if there are older unsent payloads, those are sent first

If these steps result in an error, the remaining payloads are not sent and are kept until the next retry (or next event for the object). Note that this also means you will have a more accurate view of the changes – payloads sent after a failure are the ones created at the time of the event. This is important for use cases that deal with status changes, where standard methods might skip certain statuses if calls had errors and are reprocessed at a later time.

## Activate Sequencing

The Sequencing feature is configured in the Header Attributes of the Outbound Object:

- **Transaction:** `/ASADEV/ACI_SETTINGS`
- Select your Instance and Outbound Object
- Go to **Header Attributes**
- Add New Entry and specify:

| Header Attribute | Header Attribute Value |
| --- | --- |
| `SEQUENCING` | `X` |
