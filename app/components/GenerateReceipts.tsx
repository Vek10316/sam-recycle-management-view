//app/components/GenerateReceipts.tsx
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { PurchasesTransaction, TransactionDetails } from '../../types/transactionType';

export default function generatePurchaseReceiptPdf (
  transaction: PurchasesTransaction,
  details: TransactionDetails[]) {

  const html = `
    <html>
      <head>
        <style>
          @page { margin: 0; }

          body {
            margin: 0;
            // width: 444px;
            width: 888px;
            font-family: monospace;
            font-size: 30px;
            padding: 20px;
            background-color: #fff;
          }

          .company-name {
            font-size: 100px;
          }

          h1, h3, p {
            margin: 4px 0;
          }

          .center {
            text-align: center;
          }

          .divider {
            border-top: 2px dashed #000;
            margin: 6px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }

          th, td {
            padding: 4px 0;
            font-size: 30px;
          }

          thead td {
            border-bottom: 2px solid #000;
            font-weight: bold;
          }

          tbody tr td {
            border-bottom: 2px dotted #ccc;
          }

          td:nth-child(1) { width: 35%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          td:nth-child(2) { width: 15%; text-align: right; }
          td:nth-child(3) { width: 25%; text-align: right; }
          td:nth-child(4) { width: 25%; text-align: right; }

        </style>
      </head>

      <body>
        <div id="receipt">
          <div class="center">
            <h1 class="company-name">SAM RECYCLE</h1>
            <p>No. 22, Jalan Seroja 42</p>
            <p>Taman Johor Jaya, Johor Bahru</p>
            <p>017-7348359 / 018-7600430</p>
          </div>

          <div class="divider"></div>

          <p>Supplier: ${transaction.supplier_id}</p>
          <p>Date: ${transaction.transact_date ?? new Date().toLocaleString("en-MY")}</p>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <td>Item</td>
                <td>Qty</td>
                <td>Price</td>
                <td>Sub</td>
              </tr>
            </thead>

            <tbody>
              ${details.map(item => `
                <tr>
                  <td>${item.stock_id}</td>
                  <td>${item.item_quantity}</td>
                  <td>${item.item_price.toFixed(2)}</td>
                  <td>${(item.item_quantity * item.item_price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="divider"></div>

          <h3 style="text-align: right;">
            TOTAL: RM ${transaction.transact_total_amount.toFixed(2)}
          </h3>

          <div class="divider"></div>

          <div class="center">
            <p>Thank you</p>
          </div>

        </div>
      </body>
    </html>
  `;

  const baseHeight = 259*2;
  const rowHeight = 22*2;

  const finalHeight =
    baseHeight +
    details.length * rowHeight;

  executePrint(html, 336*2, finalHeight);
};

async function executePrint(html: string, width: number, height?: number) {
  const { uri } = await Print.printToFileAsync({
    html,
    width,
    height
  });

  await Sharing.shareAsync(uri);
}