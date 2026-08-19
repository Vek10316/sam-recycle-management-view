import CompanyProfile from "@/config/companyProfile.config";
import EscPosByteCommands from "@/config/escPosByteCommands";
import EscPosReceiptConfig from "@/config/escPosReceipt.config";
import Toast from "react-native-toast-message";
import RequestBluetoothPermissions from "../device/bluetoothPermissions";
import ConnectBluetoothPrinter from "../device/bluetoothPrinter";

interface PrintInput {
    header: {
        transact_id: string;
        transact_total_amount: number;
    },
    details: {
        stock_id: string;
        item_price: number;
        item_quantity: number;
    }[],
}

const commands = EscPosByteCommands;
const profile = CompanyProfile;
const config = EscPosReceiptConfig;

const PrintReceipt = async (params: PrintInput): Promise<boolean> => {
    let printer: any;

    try {
        const hasPermission = RequestBluetoothPermissions();

        if (!hasPermission) {
            Toast.show({
                type: "error",
                text1: "Permission denied",
                text2: "Application does not have bluetooth permission"
            })
            return false;
        }

        printer = await ConnectBluetoothPrinter();

        if (printer == null) {
            Toast.show({
                type: "error",
                text1: "Connection failed",
                text2: "Could not connect to printer"
            });
            return false;
        }

        // Header start
        printer.write(commands.TEXT_BIG);
        printer.write(commands.ALIGN_CENTER);
        printer.write(profile.NAME);
        printer.write(commands.NEWLINE);
        printer.write(commands.TEXT_NORMAL);

        // Address
        const address = profile.ADDRESS;
        const builtAddress =
            `${address.UNIT_NO}, ${address.STREET}\n` + 
            `${address.AREA}, ${address.POST_CODE}\n` +
            `${address.CITY}, ${address.STATE}`

        printer.write(builtAddress);
        printer.write(commands.NEWLINE);

        profile.PHONES.forEach(phone => {
            printer.write(phone);
            printer.write(commands.NEWLINE);
        });

        printer.write(commands.ALIGN_LEFT);
        printer.write(commands.FEED_1);
        // Header end

        let currentDateTime = new Date()
            .toLocaleString("en-CA", {
                weekday: "short",
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: false,
            })
            .replace(",", "")
            .toUpperCase();

        printer.write(currentDateTime);
        printer.write(commands.NEWLINE);
        printer.write(`Receipt No: ${params.header.transact_id}`);
        printer.write(commands.NEWLINE);

        // Items table start
        printer.write(horizontalLine);

        const headerMargins = config.TABLE_HEADER_MARGINS;
        const tableHeader =
            padRight('Item', headerMargins.COL_ITEM) +
            padLeft('Qty', headerMargins.COL_QTY) +
            padLeft('Price', headerMargins.COL_PRICE) +
            padLeft('Total', headerMargins.COL_TOTAL);

        printer.write(tableHeader);
        printer.write(horizontalLine);

        const formatRow = (item: string, qty: number, price: number) => {
            const subtotal = (qty * price).toFixed(2);

            return (
                padRight(truncate(item, headerMargins.COL_ITEM), headerMargins.COL_ITEM) +
                padLeft(qty.toString(), headerMargins.COL_QTY) +
                padLeft(price.toFixed(2), headerMargins.COL_PRICE) +
                padLeft(subtotal, headerMargins.COL_TOTAL)
            );
        }

        const tableBody = params.details.map((i) =>
            formatRow(i.stock_id, i.item_quantity, i.item_price)
        ).join("\n") + "\n";

        printer.write(tableBody);
        printer.write(horizontalLine);

        const tableTotal = padLeft(
            `TOTAL: RM${params.header.transact_total_amount.toFixed(2)}`,
            config.LINE_WIDTH
        ) + "\n";

        printer.write(tableTotal)
        printer.write(horizontalLine);
        // Item table end
        printer.write(commands.FEED_5);
        printer.write(commands.CUT_FULL);
        
        printer.disconnect();
        return true;
    } catch (err: any) {
        console.error("Print operation failed: ", err);
        return false;
    }
}

const horizontalLine = "-".repeat(config.LINE_WIDTH) + "\n";

const padRight = (text: string, width: number) =>
    text.length >= width ? text.slice(0, width) : text + ' '.repeat(width - text.length);

const padLeft = (text: string, width: number) =>
    text.length >= width ? text.slice(0, width) : ' '.repeat(width - text.length) + text;

const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max - 1) + '…' : text;

export default PrintReceipt;