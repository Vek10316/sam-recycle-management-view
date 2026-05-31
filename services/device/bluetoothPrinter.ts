import BluetoothPrinterConfig from '@/config/bluetoothPrinter.config';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import Toast from "react-native-toast-message";

const ConnectBluetoothPrinter = async () => {
    try {
        const devices = await RNBluetoothClassic.getBondedDevices();
        const printer = devices.find(d => d.name === BluetoothPrinterConfig.PRINTER_NAME);
        if (!printer) {
            console.error(`Printer not paired (${BluetoothPrinterConfig.PRINTER_NAME})`);
            Toast.show({
                type: "error",
                text1: "Bluetooth connection failed"
            });
            return;
        }
        let isConnected = await printer.isConnected();
        if (!isConnected) {
            await printer.connect();
        } else {
            Toast.show({
                type: "info",
                text1: "Already connected to device"
            });
            return;
        }
        return printer;
    } catch (err: any) {
        Toast.show({
            type: "error",
            text1: "Bluetooth connection failed",
            text2: err?.toString() ?? "",
        });
    }
};

export default ConnectBluetoothPrinter;