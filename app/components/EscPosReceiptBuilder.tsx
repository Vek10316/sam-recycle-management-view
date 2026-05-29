import { PermissionsAndroid, Platform } from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

/* -------------------- CONFIG -------------------- */

const PRINTER_NAME = 'Printer001';
const LINE_WIDTH = 48;

const COL_ITEM = 12;
const COL_QTY = 12;
const COL_PRICE = 12;
const COL_TOTAL = 12;

/* -------------------- PERMISSIONS -------------------- */

export const requestBluetoothPermissions = async () => {
  if (Platform.OS !== 'android') return true;

  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
  ]);

  const connectGranted =
    granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
    PermissionsAndroid.RESULTS.GRANTED;

  const scanGranted =
    granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
    PermissionsAndroid.RESULTS.GRANTED;

  return connectGranted && scanGranted;
};

/* -------------------- PRINTER -------------------- */

const connectPrinter = async () => {
  try {
    const devices = await RNBluetoothClassic.getBondedDevices();
    const printer = devices.find(d => d.name === PRINTER_NAME);
  
    if (!printer) {
      console.log(`Printer not paired (${PRINTER_NAME})`);
      return;
      // throw new Error(`Printer not paired (${PRINTER_NAME})`);
    }
  
    await printer.connect();
  
    const connected = await printer.isConnected();
    console.log('CONNECTED:', connected);
  
    return printer;
  } catch (err) {
    console.error(err);
  }
};

/* -------------------- MOCK DATA -------------------- */

const mockTransaction = {
  supplier_id: 'SUP-001',
  transact_total_amount: 150.5,
  transact_date: '2026-05-03',
};

const mockDetails = [
  { stock_id: 'Item A', item_quantity: 2, item_price: 25.0 },
  { stock_id: 'Item B', item_quantity: 1, item_price: 100.5 },
  { stock_id: 'Item C', item_quantity: 3, item_price: 15.25 },
  { stock_id: 'Item D', item_quantity: 5, item_price: 10.0 },
  { stock_id: 'Item E', item_quantity: 1, item_price: 50.0 },
  { stock_id: 'Item F', item_quantity: 4, item_price: 12.75 },
];

const phoneNumbers = ['60177348359', '60187600430'];
const footerMessage = 'Thank you for your business with us!';

/* -------------------- HELPERS -------------------- */

const padRight = (text: string, width: number) =>
  text.length >= width ? text.slice(0, width) : text + ' '.repeat(width - text.length);

const padLeft = (text: string, width: number) =>
  text.length >= width ? text.slice(0, width) : ' '.repeat(width - text.length) + text;

const truncate = (text: string, max: number) =>
  text.length > max ? text.slice(0, max - 1) + '…' : text;

const center = (text: string) => {
  const space = Math.floor((LINE_WIDTH - text.length) / 2);
  return ' '.repeat(Math.max(0, space)) + text;
};

const headerRow = () =>
  padRight('Item', COL_ITEM) +
  padLeft('Qty', COL_QTY) +
  padLeft('Price', COL_PRICE) +
  padLeft('Total', COL_TOTAL);

const formatRow = (item: string, qty: number, price: number) => {
  const subtotal = (qty * price).toFixed(2);

  return (
    padRight(truncate(item, COL_ITEM), COL_ITEM) +
    padLeft(qty.toString(), COL_QTY) +
    padLeft(price.toFixed(2), COL_PRICE) +
    padLeft(subtotal, COL_TOTAL)
  );
};

/* -------------------- PRINT CORE -------------------- */

export const handleDummyPrintTest = async () => {
  let printer: any;

  try {
    const hasPermission = await requestBluetoothPermissions();
    if (!hasPermission) {
      console.log('Bluetooth permission denied');
      return;
    }

    console.log(
      `handleDummyPrintTest at ${new Date().toLocaleDateString('en-GB')}`
    );

    printer = await connectPrinter();

    /* Header */
    await printer.write('\x1B\x61\x01'); // center
    await printer.write('\x1B\x21\x30'); // double size
    await printer.write('SAM RECYCLE\n');
    await printer.write('\x1B\x21\x00'); // reset

    const address = [
      'No. 22, Jalan Seroja 42,',
      'Taman Johor Jaya, 81100',
      'Johor Bahru, Johor',
    ];

    await printer.write(address.join('\n') + '\n');

    await printer.write('\x1B\x61\x00'); // left align
    await printer.write('\x1B\x64\x01'); // feed 1 line

    /* Body */
    const text =
      phoneNumbers.join('\n') +
      '\n' +
      `Supplier: ${mockTransaction.supplier_id}\n` +
      '-'.repeat(LINE_WIDTH) +
      '\n' +
      headerRow() +
      '\n' +
      '-'.repeat(LINE_WIDTH) +
      '\n' +
      mockDetails
        .map(i => formatRow(i.stock_id, i.item_quantity, i.item_price))
        .join('\n') +
      '\n' +
      '-'.repeat(LINE_WIDTH) +
      '\n' +
      padLeft(
        `TOTAL: RM${mockTransaction.transact_total_amount.toFixed(2)}`,
        LINE_WIDTH
      ) +
      '\n' +
      '-'.repeat(LINE_WIDTH) +
      '\n' +
      center(footerMessage);

    await printer.write(text);

    /* Footer */
    await printer.write('\x1B\x64\x05'); // feed
    await printer.write('\x1D\x56\x00'); // cut

    await new Promise(res => setTimeout(res, 300));

    console.log('PRINT SUCCESS');
  } catch (err) {
    console.log('PRINT FAILED:', err);
  } finally {
    if (printer) {
      try {
        await printer.disconnect();
      } catch {}
    }
  }
};

export default function handlePrintPurchase(
  transaction: {
    supplier_name: string;
    supplier_id: string;
    transact_total_amount: number;
  },
  details: {
    stock_id: string;
    item_price: number;
    item_quantity: number;
  }[]
) {
  let printer: any;

  try {
    const hasPermission = requestBluetoothPermissions();

    if (!hasPermission) {
      console.log("Bluetooth permission denied");
      return;
    }

    console.log(
      `${new Date().toLocaleDateString("en-GB")}: New purchase print request: {${JSON.stringify(transaction)}, ${JSON.stringify(details)}}`
    );

    printer = connectPrinter();

    console.log("Printer instance:", printer);

    /* Header */
    printer.write("\x1B\x61\x01");
    printer.write("\x1B\x21\x30");
    printer.write("SAM RECYCLE\n");
    printer.write("\x1B\x21\x00");

    const address = [
      "No. 22, Jalan Seroja 42,",
      "Taman Johor Jaya, 81100",
      "Johor Bahru, Johor",
    ];

    printer.write(address.join("\n") + "\n");

    printer.write("\x1B\x61\x00");
    printer.write("\x1B\x64\x01");

    const text =
      phoneNumbers.join("\n") +
      "\n" +
      `Supplier: ${transaction.supplier_name} ${transaction.supplier_id}\n` +
      "-".repeat(LINE_WIDTH) +
      "\n" +
      headerRow() +
      "\n" +
      "-".repeat(LINE_WIDTH) +
      "\n" +
      details
        .map((i) =>
          formatRow(i.stock_id, i.item_quantity, i.item_price)
        )
        .join("\n") +
      "\n" +
      "-".repeat(LINE_WIDTH) +
      "\n" +
      padLeft(
        `TOTAL: RM${transaction.transact_total_amount.toFixed(2)}`,
        LINE_WIDTH
      ) +
      "\n" +
      "-".repeat(LINE_WIDTH) +
      "\n" +
      center(footerMessage);

    printer.write(text);

    /* Footer */
    printer.write("\x1B\x64\x05");
    printer.write("\x1D\x56\x00");

    new Promise((res) => setTimeout(res, 300));
    printer.disconnect();
    console.log("PRINT SUCCESS");
  } catch (err) {
    console.error("PRINT FAILED:", err);
  } finally {
    if (printer) {
      try {
        printer.disconnect();
      } catch {}
    }
  }
}