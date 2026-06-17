//@/app/views/transactions/sales/salesCreateScreen.tsx
import LoadingScreen from "@/app/components/DetailsLoadingScreen";
import useBuyerList from "@/hooks/clients/buyers/useBuyerList";
import PrintSale from "@/hooks/print/usePrintTransaction";
import useStockList from "@/hooks/stock/useStockList";
import { useCreateSale } from "@/hooks/transactions/sales/useSaleMutations";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import type { Buyer } from "@/types/clientType";
import type { Stock, StockPricingHistory } from "@/types/stockType";
import type { SalesTransaction } from "@/types/transactionType";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function SalesCreateScreen() {
    const router = useRouter();
    const [isPrinting, setIsPrinting] = useState(false);
    const [buyerSearch, setBuyerSearch] = useState("");
    const [itemSearch, setItemSearch] = useState("");
    const inputRefs = useRef<Record<string, TextInput | null>>({});
    const scrollRef = useRef<ScrollView>(null);
    const fieldRefs = useRef<Record<string, number>>({});
    const [buyerData, setBuyerData] = useState<Buyer>();
    const [buyerModalVisible, setBuyerModalVisible] = useState(false);
    const [totalPayable, setTotalPayable] = useState("0");
    const [itemModalVisible, setItemModalVisible] = useState(false);
    const [selectedItems, setSelectedItems] = useState<
        (Stock & { quantity: string; price: string; })[]
    >([]);
    const [transactStatus, setTransactStatus] = useState<"UNPAID" | "PARTIAL" | "PAID">("PAID");

    const [saleTransaction, setSaleTransaction] = useState<Omit<SalesTransaction, 'transact_id' | 'transact_status'>>({
       buyer_id: "",
       transact_total_amount: 0,
       transact_date: (new Date()).toISOString(),
    });

    const { buyerList } = useBuyerList();
    const { stockList, pricingHistory } = useStockList();
    const insertSale = useCreateSale();

    const buyers = buyerList.data ?? [];
    const stockArray = stockList.data ?? [];
    const stockPriceHistory = pricingHistory.data ?? [];

    const itemsArray = useMemo(() => {
        const sorted = [...stockPriceHistory].sort(
            (a, b) =>
                new Date(b.effective_date).getTime() -
                new Date(a.effective_date).getTime()
        );

        const latestByStock = new Map<string, StockPricingHistory>();

        for (const item of sorted) {
            if (!latestByStock.has(item.stock_id)) {
                latestByStock.set(item.stock_id, item);
            }
        }

        const map = new Map();

        for (const item of stockArray) {
            const price = latestByStock.get(item.stock_id);

            map.set(item.stock_id, {
                ...item,
                buy_price: price?.buy_price ?? 0,
                sell_price: price?.sell_price ?? 0,
            });
        }

        return Array.from(map.values());
    }, [stockArray, stockPriceHistory]);

    const filteredBuyers = useMemo(() => {
        const q = buyerSearch.toLowerCase();
        return buyers.filter(s => (
            (s.buyer_name ?? "").toLowerCase().includes(q) ||
            (s.buyer_id ?? "").toLowerCase().includes(q) ||
            (s.buyer_phone ?? "").toLowerCase().includes(q)
        ));
    }, [buyers, buyerSearch]);

    const filteredItems = useMemo(() => {
    const q = itemSearch.toLowerCase();

    const selected = selectedItems.map(s => s.stock_id);
        return itemsArray.filter(i => {
            const id = (i.stock_id ?? "").toLowerCase();
            const desc = (i.stock_description ?? "").toLowerCase();
            const cat = (i.stock_category ?? "").toLowerCase();

            const matchesSearch =
                desc.includes(q) ||
                id.includes(q) ||
                cat.includes(q);

            const notSelected = !selected.includes(i.stock_id);

            return notSelected && matchesSearch;
        });
    }, [itemsArray, itemSearch, selectedItems]);

    useEffect(() => {
        setSaleTransaction(prev => ({
            ...prev,
            buyer_id: buyerData?.buyer_id ?? ""
        }));
    }, [buyerData]);

    useEffect(() => {
        const total = selectedItems.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            return sum + qty * price;
        }, 0);

        setTotalPayable(total.toFixed(2));
        setSaleTransaction(prev => ({
            ...prev,
            transact_total_amount: total
        }));
    }, [selectedItems]);

    const btnColors = (status: string) => {
        switch (status) {
            case "UNPAID":
                return SystemColorTheme.Danger;
            case "PARTIAL":
                return SystemColorTheme.Warning;
            case "PAID":
                return SystemColorTheme.Success;
            default:
                return SystemColorTheme.Background;
        }
    }

    const focusField = (key: string) => {
        const input = inputRefs.current[key];

        if (input && scrollRef.current) {
            input.measureLayout(
                scrollRef.current.getInnerViewNode(),
                (_x, y) => {
                    scrollRef.current?.scrollTo({
                        y: Math.max(y - 120, 0),
                        animated: true,
                    });
                },
                () => {}
            );
        }
    };

    const handleTotalChange = (text: string) => {
        // Allow only numbers + optional decimal
        const cleaned = text.replace(/[^0-9.]/g, "");

        // Prevent multiple dots
        if ((cleaned.match(/\./g) || []).length > 1) return;

        setTotalPayable(cleaned);
    };

    const handleAddItem = (item: Stock) => {
        setSelectedItems(prev => {
            const price = itemsArray.find(i => i.stock_id == item.stock_id)?.buy_price ?? 0;
            const exists = prev.find(i => i.stock_id === item.stock_id);
            if (exists) return prev; 

            return [...prev, { ...item, quantity: "1", price: price.toString() }];
        });

        setItemModalVisible(false);
        setItemSearch("");
    };

    const updateItem = (id: string, field: "quantity" | "price", value: string) => {
        // Allow only numbers + decimal
        const cleaned = value.replace(/[^0-9.]/g, "");

        // Prevent multiple dots
        if ((cleaned.match(/\./g) || []).length > 1) return;

        setSelectedItems(prev =>
            prev.map(item =>
                item.stock_id === id
                    ? { ...item, [field]: cleaned }
                    : item
            )
        );
    };

    const removeItem = (id: string) => {
        setSelectedItems(prev => prev.filter(item => item.stock_id !== id));
    };

    const handleFormClose = () => {
        setBuyerData(undefined);
        setSelectedItems([]);

        setSaleTransaction({
            buyer_id: "",
            transact_total_amount: 0,
            transact_date: new Date().toISOString(),
        });

        setTransactStatus("PAID");
        setTotalPayable("0");

        setBuyerSearch("");
        setItemSearch("");

        setBuyerModalVisible(false);
        setItemModalVisible(false);

        scrollRef.current?.scrollTo({
            y: 0,
            animated: false
        });
    };
    
    useFocusEffect(
        useCallback(() => {
            return () => {
            // runs when screen is unfocused
            handleFormClose();
            };
        }, [])
    );

    const handleSaveAndPrint = async (printReceipt: boolean): Promise<void> => {
        if (!buyerData || buyerData.buyer_id.trim() === "") {
            Toast.show({
                type: "error",
                text1: "Form incomplete",
                text2: "Please select a buyer before saving"
            });
            return;
        }

        if (selectedItems.length === 0) {
            Toast.show({
                type: "error",
                text1: "Form incomplete",
                text2: "Please choose at least one item before saving"
            });
            return;
        }

        // Proceed with saving and printing
        const header = {
            ...saleTransaction,
            transact_status: transactStatus,
            buyer_id: buyerData.buyer_id,
        }

        const details = selectedItems.map(item => ({
            stock_id: item.stock_id,
            item_quantity: parseFloat(item.quantity) || 0,
            item_price: parseFloat(item.price) || 0,
            transact_subtotal: parseFloat(item.quantity) * parseFloat(item.price) || 0
        }))

        const result = await insertSale.mutateAsync({
            header,
            details
        });
        
        if (!result?.header) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Insert did not return details!",
            })
            return;
        }
        
        if (printReceipt && !isPrinting) {
            await PrintSale({
                header: {
                    transact_id: result.header.transact_id,
                    transact_total_amount: result.header.transact_total_amount,
                },
                details: details
            });
        };

        
        await router.push({
            pathname: "./SalesDetailScreen",
            params: { transact_id: result.header.transact_id },
        });
    };

    // 👇 ONLY AFTER ALL HOOKS
    if (
        buyerList.isLoading ||
        stockList.isLoading ||
        pricingHistory.isLoading
    ) {
        return LoadingScreen("Loading...");
    }

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: SystemColorTheme.Background }}
            edges={["bottom"]}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" || Platform.OS === "android" ? "padding" : undefined}
            >
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.formContainer}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                >
                    <Pressable onPress={() => setBuyerModalVisible(true)}>
                        <View style={[styles.categoryContainer, styles.button]}>
                            {!buyerData ? <FontAwesome name="search" color={SystemColorTheme.Secondary} style={styles.buttonIcon} size={20}/> : ""}
                            <Text style={[styles.text_secondary, styles.buttonLabel]}>
                                {buyerData ? buyerData.buyer_name : "Buyer..."}
                            </Text>
                        </View>
                    </Pressable>

                    <View style={styles.categoryContainer}>
                        <View style={styles.categoryTitle}>
                            <FontAwesome style={[styles.categoryTitleIcon, styles.text_secondary]} name="money" size={20}></FontAwesome>
                            <Text style={[styles.categoryTitleLabel, styles.text_secondary]}>Payment</Text>
                        </View>
                        <View style={[styles.inputRow]}>
                            {(["UNPAID", "PARTIAL", "PAID"] as const).map((payment) => (
                                <Pressable
                                    key={payment}
                                    style={[
                                        styles.button,
                                        styles.formSelectButtons,
                                        {backgroundColor: transactStatus === payment ? btnColors(payment) : SystemColorTheme.Background}
                                    ]}
                                    onPress={() => setTransactStatus(payment)}
                                >
                                    <Text style={[
                                        styles.buttonText,
                                        transactStatus == payment && {
                                            color: "#000"
                                        }
                                    ]}>{payment}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View style={styles.categoryContainer}>
                        <View style={styles.categoryTitle}>
                            <FontAwesome name="archive" size={20} color={SystemColorTheme.Secondary} style={styles.categoryTitleIcon} />
                            <Text style={[styles.categoryTitleLabel, styles.text_secondary]}>Items</Text>
                        </View>

                        {/* Selected Items */}
                        {selectedItems.map(item => {
                            const qty = parseFloat(item.quantity) || 0;
                            const price = parseFloat(item.price) || 0;
                            const subtotal = (qty * price).toFixed(2);

                            return (
                                <View key={item.stock_id} style={{
                                    padding: 10,
                                    borderWidth: 1,
                                    borderColor: SystemColorTheme.Secondary,
                                    borderRadius: 8,
                                    marginBottom: 10
                                }}>
                                <Text style={[styles.text_secondary, {borderBottomWidth: 1, borderColor: SystemColorTheme.Secondary, paddingBottom: 3}]}>
                                    {item.stock_description} ({item.stock_id})
                                </Text>

                                <View style={{ flexDirection: "row", gap: 10, marginTop: 5, alignItems: "center" }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.text_secondary}>{item.stock_uom ?? "Quantity"}:</Text>
                                        <TextInput
                                            placeholder="Qty"
                                            keyboardType="decimal-pad"
                                            value={item.quantity}
                                            onChangeText={(text) => updateItem(item.stock_id, "quantity", text)}
                                            onBlur={() => {
                                                const num = parseFloat(item.quantity);
                                                updateItem(item.stock_id, "quantity", isNaN(num) ? "0" : num.toString());
                                            }}
                                            style={[styles.text_secondary, {borderWidth: 1, borderRadius: 5, padding: 3, borderColor: SystemColorTheme.Secondary, backgroundColor: SystemColorTheme.Background}]}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.text_secondary}>Price:</Text>
                                        <TextInput
                                            placeholder="Price"
                                            keyboardType="decimal-pad"
                                            value={item.price}
                                            onChangeText={(text) => updateItem(item.stock_id, "price", text)}
                                            style={[styles.text_secondary, {borderWidth: 1, borderRadius: 5, padding: 3, borderColor: SystemColorTheme.Secondary, backgroundColor: SystemColorTheme.Background}]}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.text_secondary}>Subtotal:</Text>
                                        <Text style={[styles.text_secondary, {padding: 3}]}>
                                            {subtotal}
                                        </Text>
                                    </View>
                                    <Pressable onLongPress={() => removeItem(item.stock_id)}>
                                        <View style={[styles.button, {paddingHorizontal: 15}]}>
                                            <FontAwesome name="trash-o" size={20} color={SystemColorTheme.Secondary}></FontAwesome>
                                        </View>
                                    </Pressable>
                                </View>

                            </View>
                            )
                        })}

                        {/* Add Button ALWAYS at bottom */}
                        <Pressable onPress={() => setItemModalVisible(true)}>
                            <View style={styles.button}>
                                <Text style={[styles.buttonLabel, styles.text_secondary]}>
                                    Add Item
                                </Text>
                            </View>
                        </Pressable>
                    </View>

                    <View style={styles.categoryContainer}>
                        <View style={[styles.categoryTitle, { marginBottom: 5}]}>
                            <FontAwesome name="dollar" size={20} color={SystemColorTheme.Secondary} style={styles.categoryTitleIcon}></FontAwesome>
                            <Text style={[styles.categoryTitleLabel, styles.text_secondary]}>Total</Text>
                        </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                            <Text style={[styles.text_secondary]}>Total payable:</Text>
                            <View style={{minWidth: 100, borderWidth: 1, borderRadius: 3, borderColor: SystemColorTheme.Secondary, backgroundColor: SystemColorTheme.Background, paddingHorizontal: 3}}>
                                <TextInput
                                    style={[styles.text_secondary, { textAlign: "right", padding: 5 }]}
                                    value={totalPayable}
                                    keyboardType="decimal-pad"
                                    onChangeText={handleTotalChange}
                                    onBlur={() => {
                                        const num = parseFloat(totalPayable);
                                        if (!isNaN(num)) {
                                            setTotalPayable(num.toFixed(2));
                                        } else {
                                            setTotalPayable("0.00");
                                        }
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.categoryContainer}>
                        <View style={[styles.inputRow]}>
                            <Pressable style={[styles.button, styles.formSelectButtons]} onPress={() => handleSaveAndPrint(false)}>
                                <FontAwesome name="print" size={20} color={SystemColorTheme.Secondary} style={styles.buttonIcon}></FontAwesome>
                                <Text style={[styles.buttonLabel, styles.text_secondary]}>
                                    Save
                                </Text>
                            </Pressable>
                            <Pressable style={[styles.button, styles.formSelectButtons, {backgroundColor: SystemColorTheme.Info}]} onPress={() => handleSaveAndPrint(false)} disabled={isPrinting}>
                                <FontAwesome name="print" size={20} color={SystemColorTheme.Secondary} style={styles.buttonIcon}></FontAwesome>
                                <Text style={[styles.buttonLabel, styles.text_secondary]}>
                                    Save & Print
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>

                <Modal visible={buyerModalVisible} animationType="slide" onRequestClose={() => {
                    setBuyerModalVisible(false);
                    setBuyerSearch("");
                }}>
                    <SafeAreaView style={{ flex: 1, backgroundColor: SystemColorTheme.Background }}>
                        
                        {/* Header */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16 }}>
                            <Text style={[styles.text_secondary, { fontSize: 20 }]}>
                                Select Buyer
                            </Text>

                            <Pressable onPress={() => {
                                setBuyerModalVisible(false);
                                setBuyerSearch("");
                            }}>
                                <FontAwesome name="close" size={20} color={SystemColorTheme.Secondary} />
                            </Pressable>
                        </View>

                        {/* Search */}
                        <TextInput
                            placeholder="Search buyer..."
                            placeholderTextColor={SystemColorTheme.Placeholder}
                            value={buyerSearch}
                            onChangeText={setBuyerSearch}
                            style={{
                                margin: 16,
                                padding: 12,
                                borderRadius: 8,
                                backgroundColor: SystemColorTheme.Primary,
                                color: SystemColorTheme.Secondary,
                                borderColor: SystemColorTheme.Secondary,
                                borderWidth: 1
                            }}
                        />

                        {/* List */}
                        <FlatList
                            data={filteredBuyers}
                            keyExtractor={(item) => item.buyer_id.toString()}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => {
                                        setBuyerData(item);
                                        setBuyerModalVisible(false);
                                    }}
                                    style={styles.modalCard}
                                >
                                    <Text style={styles.text_secondary}>
                                        {item.buyer_name} | {item.buyer_id}
                                    </Text>
                                </Pressable>
                            )}
                            ListEmptyComponent={
                                <View style={[styles.bg_default, styles.container]}>
                                    <Text style={styles.text_secondary}>No buyers found...</Text>
                                </View>
                            }
                        />
                    </SafeAreaView>
                </Modal>

                <Modal
                    visible={itemModalVisible}
                    animationType="slide"
                    onRequestClose={() => {
                        setItemModalVisible(false);
                        setItemSearch("");
                    }}
                >
                    <SafeAreaView style={{ flex: 1, backgroundColor: SystemColorTheme.Background }}>

                        {/* Header */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16 }}>
                            <Text style={[styles.text_secondary, { fontSize: 20 }]}>
                                Select Item
                            </Text>

                            <Pressable onPress={() => {
                                setItemModalVisible(false);
                                setItemSearch("");
                            }}>
                                <FontAwesome name="close" size={20} color={SystemColorTheme.Secondary} />
                            </Pressable>
                        </View>

                        {/* Search */}
                        <TextInput
                            placeholder="Search item..."
                            placeholderTextColor={SystemColorTheme.Placeholder}
                            value={itemSearch}
                            onChangeText={setItemSearch}
                            style={{
                                margin: 16,
                                padding: 12,
                                borderRadius: 8,
                                backgroundColor: SystemColorTheme.Primary,
                                color: SystemColorTheme.Secondary,
                                borderColor: SystemColorTheme.Secondary,
                                borderWidth: 1
                            }}
                        />

                        {/* List */}
                        <FlatList
                            data={filteredItems}
                            keyExtractor={(item) => item.stock_id}
                            renderItem={({ item }) => (
                                <Pressable onPress={() => handleAddItem(item)}>
                                    <View style={{
                                        padding: 16,
                                        backgroundColor: SystemColorTheme.Primary,
                                        margin: 5,
                                        borderRadius: 10
                                    }}>
                                        <Text style={styles.text_secondary}>
                                            {item.stock_description} | {item.stock_id}
                                        </Text>
                                    </View>
                                </Pressable>
                            )}
                        />
                    </SafeAreaView>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};