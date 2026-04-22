Outbound Messaging

# Support of CDS Views

Use ABAP Core Data Services (CDS) views as the data provider for outbound message payloads. Explains which CDS view types are supported, how they are referenced in the Payload Designer, and key performance considerations for high-volume scenarios.

## What are CDS Views?

CDS (Core Data Services) views are a key technology in SAP's data modeling approach, providing a powerful way to define and consume structured data in SAP systems. CDS views let developers create semantically rich, reusable, and optimized database views that enhance performance and simplify application development. They are widely used in SAP S/4HANA, SAP BW/4HANA, and other SAP landscapes to expose data efficiently for analytical and transactional applications.

## Supported Types of CDS Views

### Classic CDS Views

Classic CDS Views are supported in the following scenarios:

- As **Extraction View** for outbound interfaces
- As a source **Table** in the ASAPIO Payload Designer

### CDS View Entities

- As of Release April 2025 (9.32504), CDS View Entities are supported as a data source for outbound interfaces.
- As of Release October 2025 (9.32510), you can create custom CDS View Entities directly in [ASAPIO Event Studio](../eventstudio/index.md) and link them to a trigger event.
- **Please note:** CDS View Entities are *not* supported in the Classic SAP GUI-based ASAPIO Payload Designer. Please use [ASAPIO Event Studio](../eventstudio/index.md).

## How to Use a CDS View Entity as Data Source

### Interface Configuration

#### In Event Studio

Please follow the [ASAPIO Event Studio](../eventstudio/index.md) documentation.

#### In Classic SAP GUI Customizing

To use CDS View Entities, configure an outbound object with the following settings:

- **Extraction Func. Mod:** `/ASADEV/ACI_GEN_VIEW_EXTRCT_S4`
- **Format Function:** `/ASADEV/ACI_GEN_VIEW_FRM_CB_S4`
- **Extraction View Name:** The name of your CDS View Entity

**Note:** The search help does not find CDS View Entities. You can enter the value directly and it will work, but it cannot be selected via the search help.
