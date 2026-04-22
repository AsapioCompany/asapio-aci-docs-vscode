Getting Started

# Quick Start Guide

Get the ASAPIO Integration Add-on up and running in your SAP system in under an hour. This guide walks you through every step from system verification to sending your first test event.

## Step 1: Verify System Requirements

Before you begin, confirm your SAP landscape meets the minimum requirements. Attempting to install on an unsupported release is the most common cause of transport import failures.

| Requirement | Minimum Version | Notes |
| --- | --- | --- |
| SAP S/4HANA | 1809 (on-premise) | Or SAP ECC 6.0 EhP7 or higher |
| NetWeaver ABAP | 7.4 SP10 | Kernel patch level 317 or higher recommended |
| SAP Basis authorization | S\_CTS\_ADMI | Required for transport import via STMS |
| Network connectivity | 443/TCP outbound | From SAP application server to target cloud platform |
| Browser | Chrome 90+, Firefox 90+, Edge 90+ | Required for Event Studio UI |

⚠️

SAP Business ByDesign and S/4HANA Cloud not supported

The ASAPIO Integration Add-on requires a native ABAP stack. SAP Business ByDesign and S/4HANA Cloud (public edition) are not supported because they do not expose a transport-importable ABAP environment.

## Step 2: Download the Transport Files

ASAPIO provides the Add-on as a standard SAP transport bundle, downloaded from the customer portal.

### Log in to the ASAPIO customer portal

Navigate to **portal.asapio.com** and sign in with your customer credentials. If you don't have an account, contact [support@asapio.com](mailto:support@asapio.com).

### Navigate to Downloads > Integration Add-on

Select the latest stable release (currently **v3.2.0**). Download the transport bundle ZIP file to your local machine.

### Extract the ZIP

The bundle contains the following files – do not rename them:

- `K9xxxxx.DEV` – the cofile (transport header and object list)
- `R9xxxxx.DEV` – the data file (ABAP objects, customizing)
- `ASAPIO_v3.2.0_RELEASE_NOTES.pdf` – release notes
- `ASAPIO_v3.2.0_INSTALL_GUIDE.pdf` – full installation guide

ℹ️

Multiple transport packages

Large releases may include multiple transport files (Basis objects, Core Add-on, Connector packages). Always import them in the order listed in the release notes – order matters.

## Step 3: Import Transport into SAP

Use the SAP Transport Management System (STMS) to import the Add-on into your development system first.

### Upload the transport files to SAP

In STMS (transaction `STMS`), go to **Extras → Upload**. Browse to the extracted cofile (`K9xxxxx.DEV`) and select it. SAP will automatically locate the matching data file.

### Add to the import queue

Open the import queue for your DEV system. The uploaded transport will appear at the bottom. Select it and choose **Add to Import Queue**.

### Execute the import

Select the transport, click the **Import** button (truck icon). Leave the default import options. Confirm the dialog. The import typically takes 5–15 minutes. Monitor progress in `SM37`.

After a successful import, the transport log in `STMS` should show return code 0 (green) or 4 (warning, acceptable). Return code 8 or higher indicates an error – see the [Troubleshooting](installation.md#troubleshooting) section.

```
-- Example transport import log (STMS) --
Transport: DEVK900123 ASAPIO Integration Add-on v3.2.0
Import started: 2026-03-27 09:14:02
  Phase: Dictionary activation          [OK]
  Phase: ABAP program generation        [OK]
  Phase: Table content import           [OK]
  Phase: Authorization object import    [OK]
Import ended:   2026-03-27 09:22:47
Return code: 0 (Success)
```

## Step 4: Activate the License

The Add-on requires a license key tied to your SAP System ID (SID). Without an active license, flows will not execute.

### Open the license transaction

Run transaction `/ASAPIO/LICENSE`. The license screen displays your current SAP System ID automatically.

### Enter your license key

Paste the license key from the ASAPIO customer portal into the **License Key** field. Keys are unique per SID – ensure you are using the key generated for this system.

### Verify and save

Click **Verify**. The system checks that the key matches the SID and that the license period is valid. A green status indicator confirms activation. Click **Save**.

⚠️

System ID mismatch

If verification fails with "System ID mismatch", the license key was generated for a different SID. Log in to the customer portal and generate a new key for the correct SID. Contact [support@asapio.com](mailto:support@asapio.com) if you are unsure which SID your license covers.

## Step 5: Configure Your First Connector

With the license active, open the Event Studio and create your first flow. This example connects SAP S/4HANA to Azure Service Bus.

### Open the Event Studio

Run transaction `/ASAPIO/DESIGNER`. Event Studio opens in your default browser.

### Create a new flow

Click **New Flow** in the top-left toolbar. Enter a descriptive name, e.g., `MM_GOODS_MOVEMENT_TO_ASB`. Click **Create**.

### Configure the source connector

Drag the **SAP S/4HANA** source node from the left panel onto the canvas. In the properties panel, select the event type (e.g., *Goods Movement*) and optionally add a filter (e.g., movement type = 101).

### Configure the target connector

Drag the **Azure Service Bus** target node onto the canvas. Draw an arrow from the source node to the target. In the properties panel, enter your Service Bus namespace, queue or topic name, and authentication credentials.

### Save and activate

Click **Save**, then click **Activate**. The flow status changes from *Inactive* to *Active* immediately – no SAP restart required.

💡

Test connection before activating

Click **Test Connection** in the target connector properties panel before activating. This validates your credentials and network connectivity without sending real events.

## Step 6: Send a Test Event

Verify the end-to-end flow by sending a sample event from the Event Studio.

### Open the Test Run panel

With your flow open in Event Studio, click **Test Run** in the bottom toolbar. A panel appears on the right side.

### Select a sample event

Choose **Use sample payload**. ASAPIO provides a pre-filled sample matching the selected event type. You can edit the JSON before sending.

### Execute and verify

Click **Run**. The test panel shows each processing step in real time: source event received, field mapping applied, message published to Azure Service Bus. Verify the message appears in your Azure portal Service Bus explorer.

💡

You're done!

Your first ASAPIO integration flow is live. Explore the [Event Studio](designer.md) docs to learn about field mapping, filters, and monitoring. See the [Connectors](connectors.md) reference for all supported cloud platforms.
