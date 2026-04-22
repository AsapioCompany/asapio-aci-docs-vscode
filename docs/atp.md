Outbound Messaging

# Real-Time ATP (Inventory)

Push live Available-to-Promise (ATP) and inventory check results to external systems the moment they occur in SAP – enabling real-time stock visibility for e-commerce, supply-chain, and analytics platforms without polling or batch exports.

## Overview

ASAPIO supports real-time Available-to-Promise (ATP) / inventory level messaging. When stock-relevant documents are created or changed in SAP, ASAPIO triggers an ATP check via `BAPI_MATERIAL_AVAILABILITY` and sends the resulting inventory data (quantity, unit, plant, date) to the connected messaging platform in real time.

This provides downstream systems (e.g., e-commerce platforms, order management systems) with accurate, event-driven inventory information without polling.

## Supported Business Objects

| Business Object | Trigger |
| --- | --- |
| `BUS2032` (Sales Order) | Standard BO event |
| `BUS2012` (Purchase Order) | Standard BO event |
| `LIKP` (Delivery) | Standard BO event |
| `BUS2017` (Goods Movement) | BAdI `MB_DOCUMENT_UPDATE` |
| `ZBUS2093` (Material Reservation) | User Exit `MBCF0007` |

## Custom Extractor Function Module

The ATP extractor is implemented as a custom function module (e.g., `Z_ACI_EXTRACTOR_ATP`) that calls `BAPI_MATERIAL_AVAILABILITY` to retrieve the current stock situation and returns it in the ASAPIO extractor interface format.

The key pattern in ABAP:

```
CALL FUNCTION 'BAPI_MATERIAL_AVAILABILITY'
  EXPORTING
    plant          = lv_werks
    material       = lv_matnr
    unit           = lv_meins
  IMPORTING
    av_qty_plt     = lv_quantity
  TABLES
    wmdvsx         = lt_schedule.
```

## BAdI Implementation

The trigger is connected to ASAPIO via BAdI `/ASADEV/TRIGGER_BADI`, method `/ASADEV/TRIGGER_IF~SET_BDCP_LINES`. The BAdI method retrieves the triggering document key and populates the BDCP (change pointer) lines structure for ASAPIO to pick up.

## Output JSON Format

The ATP payload sent to the messaging platform has the following structure:

```
{
  "objectType": "BUS2032",
  "werks": "1000",
  "matnr": "000000000000012345",
  "meins": "EA",
  "date": "20241115",
  "quantity": 150.000
}
```

Fields:

| Field | Description |
| --- | --- |
| `objectType` | The SAP Business Object type that triggered the event |
| `werks` | Plant code |
| `matnr` | Material number (unformatted) |
| `meins` | Base unit of measure |
| `date` | Date of the ATP check (YYYYMMDD) |
| `quantity` | Available quantity from `BAPI_MATERIAL_AVAILABILITY` |
