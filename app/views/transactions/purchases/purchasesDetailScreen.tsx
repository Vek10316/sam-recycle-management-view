//@/app/views/transactions/purchases/PurchasesDetailScreen.tsx
import LoadingScreen from "@/app/components/DetailsLoadingScreen";
import useSupplierList from "@/hooks/clients/suppliers/useSupplierList";
import PrintPurchase from "@/hooks/print/usePrintPurchase";
import useStockList from "@/hooks/stock/useStockList";
import usePurchaseDetails from "@/hooks/transactions/purchases/usePurchaseDetails";
import { useUpdatePurchase } from "@/hooks/transactions/purchases/usePurchaseMutations";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import { Supplier } from "@/types/clientType";
import type { Stock, StockPricingHistory } from "@/types/stockType";
import { PurchasesTransaction, TransactionDetails } from "@/types/transactionType";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
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

export default function PurchasesDetailScreen() {
    const router = useRouter();
    const transact_id = useLocalSearchParams<{transact_id?: string}>().transact_id;

    if (!transact_id || transact_id.trim() === "") {
        return (
            <>
            <Stack.Screen options={{title: "Invalid transact_id"}}/>
            <View style={[styles.container, {justifyContent: "center"}]}>
                <Text style={styles.text_secondary}>Invalid transact_id parameter</Text>
                <Link
                href="/views/transactions/purchases/PurchasesListScreen"
                style={[styles.text_secondary, {textDecorationLine: "underline"}]}>
                    Go back
                </Link>
            </View>
            </>
        );
    }

    const [initialized, setInitialized] = useState(false);
    const [supplierModalVisible, setSupplierModalVisible] = useState(false);
    const [itemModalVisible, setItemModalVisible] = useState(false);
    
    const purchase = usePurchaseDetails(transact_id);
    const { supplierList } = useSupplierList();
    const { stockList, pricingHistory } = useStockList();
    const updatePurchase = useUpdatePurchase();
    
    const purchaseHeader = purchase?.data?.header;
    const purchaseDetails = purchase?.data?.details ?? [];
    const stockArray = stockList.data ?? [];
    const stockPriceHistory = pricingHistory.data ?? [];
    const suppliers = supplierList.data ?? [];
    
    const [purchaseUpdateData, setPurchaseUpdateData] = useState<{header: PurchasesTransaction, details: Omit<TransactionDetails, "detail_id">[]}>(
        {
            header: {
                transact_id,
                supplier_id: purchaseHeader?.supplier_id ?? "",
                transact_date: purchaseHeader?.transact_date ?? "",
                transact_address: purchaseHeader?.transact_address ?? "",
                transact_status: purchaseHeader?.transact_status ?? "PAID",
                transact_total_amount: purchaseHeader?.transact_total_amount ?? 0,
            },
            details: purchaseDetails ?? []
        }
    );
    const [supplierSearch, setSupplierSearch] = useState("");
    const [totalPayable, setTotalPayable] = useState<string>(purchaseHeader?.transact_total_amount.toString() ?? "0");

    const [itemSearch, setItemSearch] = useState("");
    const [selectedItems, setSelectedItems] = useState<
        (Omit<Stock, "current_quantity"> & { quantity: string; price: string; })[]
    >([]);

    const [transactStatus, setTransactStatus] = useState<"UNPAID" | "PARTIAL" | "PAID">("PARTIAL");

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

        return Array.from<Stock & {buy_price: number, sell_price: number}>(map.values());
    }, [stockArray, stockPriceHistory]);

    const scrollRef = useRef<ScrollView>(null);
    const fieldRefs = useRef<Record<string, number>>({});
    const [selectedSupplier, setSelectedSupplier] = useState<Pick<Supplier, "supplier_id" | "supplier_name">>(
        {
            supplier_id: "",
            supplier_name: "",
        }
    );

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

    const focusField = (y: number) => {
        scrollRef.current?.scrollTo({
            y: y - 200,
            animated: true
        });
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

            return [...prev, { ...item, quantity: "1", price: price.toString(), subtotal: price.toString() }];
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

    useEffect(() => {
        if (!purchaseHeader || !purchaseDetails.length || !stockArray.length || initialized) return;

        setSelectedSupplier({
            supplier_id: purchaseHeader.supplier_id,
            supplier_name: purchaseHeader.supplier_name ?? "",
        });

        setTransactStatus(purchaseHeader.transact_status);

        setTotalPayable(
            purchaseHeader.transact_total_amount.toFixed(2)
        );

        setPurchaseUpdateData({
            header: {
                transact_id,
                supplier_id: purchaseHeader.supplier_id,
                transact_date: purchaseHeader.transact_date ?? "",
                transact_address: purchaseHeader.transact_address ?? "",
                transact_total_amount: purchaseHeader.transact_total_amount ?? 0,
                transact_status: purchaseHeader.transact_status ?? "PAID"
            },
            details: purchaseDetails
        })

        setSelectedItems(
            purchaseDetails.map(p => {
                const stock = stockArray.find(
                    s => s.stock_id === p.stock_id
                );

                return {
                    stock_id: p.stock_id,
                    stock_description:
                        stock?.stock_description ?? "",
                    stock_category:
                        stock?.stock_category ?? "",
                    stock_uom:
                        stock?.stock_uom ?? "KG",
                    quantity: p.item_quantity.toString(),
                    price: p.item_price.toString(),
                };
            })
        );
        setInitialized(true);
    }, [purchase, stockArray, initialized]);

    useEffect(() => {
        const total = selectedItems.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            return sum + qty * price;
        }, 0);

        setTotalPayable(total.toFixed(2));
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

    const handleFormClose = () => {
        setSelectedSupplier({supplier_id: "", supplier_name: ""});
        setSelectedItems([]);

        setTransactStatus("PAID");
        setTotalPayable("0");

        setSupplierSearch("");
        setItemSearch("");

        setSupplierModalVisible(false);
        setItemModalVisible(false);
        setInitialized(false);

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

    const handlePrint = async () => {
        if (selectedSupplier?.supplier_id.trim() === "") {
            alert("(Supplier) Details incomplete, failed to print");
            return;
        }

        if (selectedItems.length === 0) {
            alert("(Stock) Details incomplete, failed to print")
            return;
        }

        const header = {
            transact_id: transact_id,
            transact_total_amount: Number.parseFloat(totalPayable),
        };
        
        const details = selectedItems.map(s => {
            return {
                stock_id: s.stock_id,
                item_price: Number.parseFloat(s.price),
                item_quantity: Number.parseFloat(s.quantity),
            };
        })
        
        await PrintPurchase({header, details});
    };

    const handleUpdateAndPrint = async (printReceipt: boolean) => {
        if (selectedSupplier?.supplier_id.trim() === "") {
            alert("Please select a supplier before saving");
            return;
        }

        if (selectedItems.length === 0) {
            alert("Please select at least 1 item before saving")
            return;
        }

        const payload = {
            header: {
                supplier_id: selectedSupplier?.supplier_id || "",
                transact_date: purchaseUpdateData?.header.transact_date || "",
                transact_address: purchaseUpdateData?.header.transact_address || "",
                transact_total_amount: Number.parseFloat(totalPayable),
                transact_status: transactStatus,
            },
            details: selectedItems.map(s => {
                const price = Number.parseFloat(s.price);
                const quantity = Number.parseFloat(s.quantity);
                const subtotal = price * quantity;
                return {
                    transact_id: transact_id,
                    stock_id: s.stock_id,
                    item_price: price,
                    item_quantity: quantity,
                    transact_subtotal: subtotal,
                };
            }),
        }

        const result = await updatePurchase.mutateAsync(
            {transact_id, header: payload.header, details: payload.details}
        );
        if (result?.header.transact_id.trim() === "") {
            console.error(`Something went wrong, failed to print receipt`);
            return;
        };

        if (printReceipt) {
            await handlePrint();
        };

        Toast.show({
            type: "success",
            text1: "Success",
            text2: `Successfully updated ${transact_id}`
        });
    }

    if (purchase.isLoading || stockList.isLoading || pricingHistory.isLoading || supplierList.isLoading) {
        return LoadingScreen();
    }

    return (
        <>
        <Stack.Screen options={{title: transact_id}}/>
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
                    <Pressable onPress={() => setSupplierModalVisible(true)}>
                        <View style={[styles.categoryContainer, styles.button]}>
                            {!selectedSupplier?.supplier_id ? <FontAwesome name="search" color={SystemColorTheme.Secondary} style={styles.buttonIcon} size={20}/> : null}
                            <Text style={[styles.text_secondary, styles.buttonLabel]}>
                                {selectedSupplier?.supplier_id.trim() !== "" ? selectedSupplier.supplier_name : "Supplier..."}
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
                    <View style={[styles.categoryContainer]}>
                        <Pressable onPress={() => handleUpdateAndPrint(true)}>
                            <View style={[styles.button]}>
                                <FontAwesome name="upload" size={20} color={SystemColorTheme.Secondary} style={styles.buttonIcon}></FontAwesome>
                                <Text style={[styles.buttonLabel, styles.text_secondary]}>
                                    Update & Print
                                </Text>
                            </View>
                        </Pressable>
                        <View style={[styles.inputRow, {justifyContent: "space-between"}]}>
                            <Pressable style={[styles.button, styles.formSelectButtons, {backgroundColor: SystemColorTheme.Info}]}
                                onPress={() => handlePrint()}>
                                <FontAwesome name="print" size={20} color={SystemColorTheme.Secondary} style={styles.buttonIcon}></FontAwesome>
                                <Text style={[styles.buttonText, styles.text_secondary]}>
                                    Print
                                </Text>
                            </Pressable>
                            <Pressable style={[styles.button, styles.formSelectButtons]}
                                onPress={() =>handleUpdateAndPrint(false)}>
                                <FontAwesome name="save" size={20} color={SystemColorTheme.Secondary} style={styles.buttonIcon}></FontAwesome>
                                <Text style={[styles.buttonText, styles.text_secondary]}>
                                    Update
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
                
                <Modal visible={supplierModalVisible} animationType="slide" onRequestClose={() => {
                    setSupplierModalVisible(false);
                    setSupplierSearch("");
                }}>
                    <SafeAreaView style={{ flex: 1, backgroundColor: SystemColorTheme.Background }}>
                        
                        {/* Header */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16 }}>
                            <Text style={[styles.text_secondary, { fontSize: 20 }]}>
                                Select Supplier
                            </Text>

                            <Pressable onPress={() => {
                                setSupplierModalVisible(false);
                                setSupplierSearch("");
                            }}>
                                <FontAwesome name="close" size={20} color={SystemColorTheme.Secondary} />
                            </Pressable>
                        </View>

                        {/* Search */}
                        <TextInput
                            placeholder="Search supplier..."
                            placeholderTextColor={SystemColorTheme.Placeholder}
                            value={supplierSearch}
                            onChangeText={setSupplierSearch}
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
                            data={suppliers.filter(s => {
                                const q = supplierSearch.toLowerCase();

                                return (
                                    s.supplier_name.toLowerCase().includes(q) ||
                                    s.supplier_id.toLowerCase().includes(q) ||
                                    (s.supplier_phone ?? "").toLowerCase().includes(q)
                                );
                            })}
                            keyExtractor={(item) => item.supplier_id.toString()}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => {
                                        setSelectedSupplier(item);
                                        setSupplierModalVisible(false);
                                    }}
                                >
                                    <View style={{ padding: 16, backgroundColor: SystemColorTheme.Primary, margin: 5, borderRadius: 10 }}>
                                        <Text style={styles.text_secondary}>
                                            {item.supplier_name} | {item.supplier_id}
                                        </Text>
                                    </View>
                                </Pressable>
                            )}
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
        </>
    );
};