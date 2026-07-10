//@/app/views/transactions/sales/SalesDetailScreen.tsx
import LoadingScreen from "@/app/components/LoadingScreen";
import buyerKeys from "@/app/queries/buyer.keys";
import stockKeys from "@/app/queries/stock.keys";
import useBuyerList from "@/hooks/clients/buyers/useBuyerList";
import PrintSale from "@/hooks/print/usePrintTransaction";
import useStockList from "@/hooks/stock/useStockList";
import useSaleDetails from "@/hooks/transactions/sales/useSaleDetails";
import { useUpdateSale } from "@/hooks/transactions/sales/useSaleMutations";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import { Buyer } from "@/types/clientType";
import type { Stock } from "@/types/stockType";
import { SalesTransaction, TransactionDetails } from "@/types/transactionType";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useQueryClient } from "@tanstack/react-query";
import { Link, Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";

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

export default function SalesDetailScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isPrinting, setIsPrinting] = useState(false);
    const transact_id = useLocalSearchParams<{transact_id?: string}>().transact_id;

    if (!transact_id || transact_id.trim() === "") {
        return (
            <>
            <Stack.Screen options={{title: "Invalid transact_id"}}/>
            <View style={[styles.container, {justifyContent: "center"}]}>
                <Text style={styles.text_secondary}>Invalid transact_id parameter</Text>
                <Link
                href="/views/transactions/sales/SalesListScreen"
                style={[styles.text_secondary, {textDecorationLine: "underline"}]}>
                    Go back
                </Link>
            </View>
            </>
        );
    }

    const [initialized, setInitialized] = useState(false);
    const [buyerModalVisible, setBuyerModalVisible] = useState(false);
    const [itemModalVisible, setItemModalVisible] = useState(false);
    const [buyerSearch, setBuyerSearch] = useState("");
    
    const sale = useSaleDetails(transact_id);
    const { buyerList } = useBuyerList(1, 50, (buyerSearch.trim() !== "" ? buyerSearch : undefined));
    const { stockList } = useStockList(1, 100);
    const updateSale = useUpdateSale();
    
    const saleHeader = sale?.data?.header;
    const saleDetails = sale?.data?.details ?? [];
    const buyers = buyerList.data?.data ?? [];
    const stockArray = stockList.data?.data ?? [];
    
    const [saleUpdateData, setSaleUpdateData] = useState<{header: SalesTransaction, details: Omit<TransactionDetails, "detail_id">[]}>(
        {
            header: {
                transact_id,
                buyer_id: saleHeader?.buyer_id ?? "",
                transact_date: saleHeader?.transact_date ?? "",
                transact_address: saleHeader?.transact_address ?? "",
                transact_status: saleHeader?.transact_status ?? "PAID",
                transact_total_amount: saleHeader?.transact_total_amount ?? 0,
            },
            details: saleDetails ?? []
        }
    );
    const [totalPayable, setTotalPayable] = useState<string>(saleHeader?.transact_total_amount.toString() ?? "0");

    const [itemSearch, setItemSearch] = useState("");
    const [selectedItems, setSelectedItems] = useState<
        (Omit<Stock, "current_quantity"> & { quantity: string; price: string; })[]
    >([]);

    const [transactStatus, setTransactStatus] = useState<"UNPAID" | "PARTIAL" | "PAID">("PARTIAL");

    const scrollRef = useRef<ScrollView>(null);
    const fieldRefs = useRef<Record<string, number>>({});
    const [selectedBuyer, setSelectedBuyer] = useState<Pick<Buyer, "buyer_id" | "buyer_name">>(
        {
            buyer_id: "",
            buyer_name: "",
        }
    );

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
            const price = stockArray.find(i => i.stock_id == item.stock_id)?.buy_price ?? 0;
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
        if (!saleHeader || !saleDetails.length || !stockArray.length || initialized) return;

        setSelectedBuyer({
            buyer_id: saleHeader.buyer_id,
            buyer_name: saleHeader.buyer_name ?? "",
        });

        setTransactStatus(saleHeader.transact_status);

        setTotalPayable(
            saleHeader.transact_total_amount.toFixed(2)
        );

        setSaleUpdateData({
            header: {
                transact_id,
                buyer_id: saleHeader.buyer_id,
                transact_date: saleHeader.transact_date ?? "",
                transact_address: saleHeader.transact_address ?? "",
                transact_total_amount: saleHeader.transact_total_amount ?? 0,
                transact_status: saleHeader.transact_status ?? "PAID"
            },
            details: saleDetails
        })

        setSelectedItems(
            saleDetails.map(p => {
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
    }, [sale, stockArray, initialized]);

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
        setSelectedBuyer({buyer_id: "", buyer_name: ""});
        setSelectedItems([]);

        setTransactStatus("PAID");
        setTotalPayable("0");

        setBuyerSearch("");
        setItemSearch("");

        setBuyerModalVisible(false);
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

    useEffect(() => {
        if (!isPrinting) return;
        Toast.show({
            type: "info",
            text1: "Printing..."
        });
    }, [isPrinting]);

    const handlePrint = async () => {
        if (isPrinting) return;
        if (selectedBuyer?.buyer_id.trim() === "") {
            Toast.show({
                type: "error",
                text1: "Print failed",
                text2: "(Buyer) Details incomplete"
            });
            setIsPrinting(false);
            return;
        }
        
        if (selectedItems.length === 0) {
            Toast.show({
                type: "error",
                text1: "Print failed",
                text2: "Please select at least 1 item before printing"
            });
            setIsPrinting(false);
            return;
        }
        
        setIsPrinting(true);

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
        
        await PrintSale({header, details});
        setIsPrinting(false);
    };

    const handleUpdateAndPrint = async (printReceipt: boolean) => {
        if (selectedBuyer?.buyer_id.trim() === "") {
            Toast.show({
                type: "error",
                text1: "Update failed",
                text2: "(Buyer) Details incomplete"
            });
            return;
        }

        if (selectedItems.length === 0) {
            Toast.show({
                type: "error",
                text1: "Update failed",
                text2: "Please select at least 1 item before saving"
            });
            return;
        }

        const payload = {
            header: {
                buyer_id: selectedBuyer?.buyer_id || "",
                transact_date: saleUpdateData?.header.transact_date || "",
                transact_address: saleUpdateData?.header.transact_address || "",
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

        const result = await updateSale.mutateAsync(
            {transact_id, header: payload.header, details: payload.details}
        );
        if (result?.header.transact_id.trim() === "") {
            Toast.show({
                type: "error",
                text1: "Update failed",
                text2: "Failed to update sale"
            });
            return;
        };

        if (printReceipt && !isPrinting) {
            await handlePrint();
        };

        Toast.show({
            type: "success",
            text1: "Success",
            text2: `Successfully updated ${transact_id}`
        });
    }

    if (sale.isLoading || stockList.isLoading || buyerList.isLoading) {
        return <LoadingScreen />;
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
                    <Pressable onPress={() => setBuyerModalVisible(true)}>
                        <View style={[styles.categoryContainer, styles.flexButton]}>
                            {!selectedBuyer?.buyer_id ? <FontAwesome name="search" color={SystemColorTheme.Secondary} style={styles.buttonIcon} size={20}/> : null}
                            <Text style={[styles.text_secondary, styles.buttonLabel]}>
                                {selectedBuyer?.buyer_id.trim() !== "" ? selectedBuyer.buyer_name : "Buyer..."}
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
                                        styles.flexButton,
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
                                        <View style={[styles.flexButton, {paddingHorizontal: 15}]}>
                                            <FontAwesome name="trash-o" size={20} color={SystemColorTheme.Secondary}></FontAwesome>
                                        </View>
                                    </Pressable>
                                </View>

                            </View>
                            )
                        })}

                        {/* Add Button ALWAYS at bottom */}
                        <Pressable onPress={() => setItemModalVisible(true)}>
                            <View style={styles.flexButton}>
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
                            <View style={[styles.flexButton]}>
                                <FontAwesome name="upload" size={20} color={SystemColorTheme.Secondary} style={styles.buttonIcon}></FontAwesome>
                                <Text style={[styles.buttonLabel, styles.text_secondary]}>
                                    Update & Print
                                </Text>
                            </View>
                        </Pressable>
                        <View style={[styles.inputRow, {justifyContent: "space-between"}]}>
                            <Pressable style={[styles.flexButton, styles.formSelectButtons, {backgroundColor: (isPrinting) ? SystemColorTheme.Background : SystemColorTheme.Info}]}
                                onPress={() => handlePrint()}
                                disabled={isPrinting}>
                                <FontAwesome name="print" size={20} color={SystemColorTheme.Secondary} style={styles.buttonIcon}></FontAwesome>
                                <Text style={[styles.buttonText, styles.text_secondary]}>
                                    {(isPrinting) ? "Printing..." : "Print"}
                                </Text>
                            </Pressable>
                            <Pressable style={[styles.flexButton, styles.formSelectButtons]}
                                onPress={() =>handleUpdateAndPrint(false)}>
                                <FontAwesome name="save" size={20} color={SystemColorTheme.Secondary} style={styles.buttonIcon}></FontAwesome>
                                <Text style={[styles.buttonText, styles.text_secondary]}>
                                    Update
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
                            onEndEditing={async () => {
                                await queryClient.invalidateQueries({
                                    queryKey: buyerKeys.lists()
                                });
                            }}
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
                            data={buyers.filter(s => {
                                const q = buyerSearch.toLowerCase();

                                return (
                                    s.buyer_name.toLowerCase().includes(q) ||
                                    s.buyer_id.toLowerCase().includes(q) ||
                                    (s.buyer_phone ?? "").toLowerCase().includes(q)
                                );
                            })}
                            keyExtractor={(item) => item.buyer_id.toString()}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => {
                                        setSelectedBuyer(item);
                                        setBuyerModalVisible(false);
                                    }}
                                >
                                    <View style={{ padding: 16, backgroundColor: SystemColorTheme.Primary, margin: 5, borderRadius: 10 }}>
                                        <Text style={styles.text_secondary}>
                                            {item.buyer_name} | {item.buyer_id}
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
                            onEndEditing={async () => {
                                await queryClient.invalidateQueries({
                                    queryKey: stockKeys.all
                                })
                            }}
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
                            data={stockArray}
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