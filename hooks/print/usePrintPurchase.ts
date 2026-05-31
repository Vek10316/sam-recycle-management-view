import PrintReceipt from "@/services/escPos/escposPrintReceipt";
import Toast from "react-native-toast-message";

const usePrintPurchase = async (params: {
    header: {
        transact_id: string,
        transact_total_amount: number
    },
    details: {
        stock_id: string,
        item_quantity: number,
        item_price: number
    }[]
}) => {
    const res = await PrintReceipt({
        header: {
            transact_id: params.header.transact_id,
            transact_total_amount: params.header.transact_total_amount
        },
        details: params.details
    });
    if (!res) {
        Toast.show({
            type: "error",
            text1: "Print failed"
        })
    }
};

export default usePrintPurchase;