//@/app/views/transactions/purchases/purchasesCreateScreen.tsx
import LoadingScreen from "@/app/components/LoadingScreen";
import stockKeys from "@/app/queries/stock.keys";
import supplierKeys from "@/app/queries/supplier.keys";
import useSupplierList from "@/hooks/clients/suppliers/useSupplierList";
import { useCreateSupplier } from "@/hooks/clients/suppliers/useSupplierMutations";
import PrintPurchase from "@/hooks/print/usePrintTransaction";
import useStockList from "@/hooks/stock/useStockList";
import { useCreatePurchase } from "@/hooks/transactions/purchases/usePurchaseMutations";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import type { Supplier } from "@/types/clientType";
import type { Stock } from "@/types/stockType";
import type { PurchasesTransaction } from "@/types/transactionType";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useQueryClient } from "@tanstack/react-query";
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

export default function PurchasesCreateScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isPrinting, setIsPrinting] = useState(false);
    const [supplierSearch, setSupplierSearch] = useState("");
    const [itemSearch, setItemSearch] = useState("");

    const [supplierModalVisible, setSupplierModalVisible] = useState(false);
    const [itemModalVisible, setItemModalVisible] = useState(false);
    const [insertSupplierModalVisible, setInsertSupplierModalVisible] = useState(false);
    const [insertSupplierData, setInsertSupplierData] = useState<(Supplier & { plate_no?: string })>({
        supplier_id_type: "NRIC",
        supplier_id: "",
        supplier_name: "",
        plate_no: "",
    });
    const [insertSupplierValidation, setInsertSupplierValidation] = useState({
        supplier_id: true,
        supplier_name: true,
    });
    const [insertSupplierSuccess, setInsertSupplierSuccess] = useState(false);
    const [enableKeyboardAvoidView, setEnableKeyboardAvoidView] = useState(false);
    const [totalPayable, setTotalPayable] = useState("0");
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier>();
    const [selectedItems, setSelectedItems] = useState<
        (Stock & { quantity: string; price: string; })[]
    >([]);
    const [transactStatus, setTransactStatus] = useState<"UNPAID" | "PARTIAL" | "PAID">("PAID");
    const [loading, setLoading] = useState<boolean>(true);

    const [purchaseTransaction, setPurchaseTransaction] = useState<Omit<PurchasesTransaction, 'transact_id' | 'transact_status'>>({
        supplier_id: "",
        transact_total_amount: 0,
        transact_date: (new Date()).toISOString(),
    });

    const { supplierList } = useSupplierList(1, 50, supplierSearch.trim() !== "" ? supplierSearch : undefined);
    const { stockList } = useStockList(1, 100, itemSearch.trim() !== "" ? itemSearch : undefined);

    useEffect(() => {
        if (supplierList.isLoading || stockList.isLoading) return;
        setLoading(false);
    }, [supplierList.data, stockList.data])

    const insertPurchase = useCreatePurchase();
    const insertSupplier = useCreateSupplier();

    const suppliers = supplierList.data?.data ?? [];
    const stockArray = stockList.data?.data ?? [];

    const filteredItems = useMemo(() => {
        const q = itemSearch.toLowerCase();

        const selected = selectedItems.map(s => s.stock_id);
        return stockArray.filter(i => {
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
    }, [stockArray, itemSearch, selectedItems]);

    useEffect(() => {
        setPurchaseTransaction(prev => ({
            ...prev,
            supplier_id: selectedSupplier?.supplier_id ?? ""
        }));
    }, [selectedSupplier]);

    useEffect(() => {
        const total = selectedItems.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            return sum + qty * price;
        }, 0);

        setTotalPayable(total.toFixed(2));
        setPurchaseTransaction(prev => ({
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

    const inputRefs = useRef<Record<string, TextInput | null>>({});
    const scrollRef = useRef<ScrollView>(null);
    const fieldRefs = useRef<Record<string, number>>({});

    const focusField = (y: number) => {
        scrollRef.current?.scrollTo({
            y: y - 100,
            animated: true
        });
    };

    const handleTotalChange = (text: string) => {
        const cleaned = text.replace(/[^0-9.]/g, "");

        if ((cleaned.match(/\./g) || []).length > 1) return;

        setTotalPayable(cleaned);
    };

    const handleAddItem = (item: Stock) => {
        setSelectedItems(prev => {
            const price = stockArray.find(i => i.stock_id == item.stock_id)?.buy_price ?? 0;
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

    const handleFormClose = async () => {
        setSelectedSupplier(undefined);
        setSelectedItems([]);

        setPurchaseTransaction({
            supplier_id: "",
            transact_total_amount: 0,
            transact_date: new Date().toISOString(),
        });

        setTransactStatus("PAID");
        setTotalPayable("0");

        setSupplierSearch("");
        setItemSearch("");

        setSupplierModalVisible(false);
        setItemModalVisible(false);

        scrollRef.current?.scrollTo({
            y: 0,
            animated: false
        });

        await queryClient.invalidateQueries({
            queryKey: supplierKeys.lists()
        });
        await queryClient.invalidateQueries({
            queryKey: stockKeys.all
        });

    };

    useFocusEffect(
        useCallback(() => {
            return () => {
                handleFormClose();
            };
        }, [])
    );

    const handleInsertSuppluer = async () => {
        const data = insertSupplierData;
        if (
            data.supplier_id.trim() === "" ||
            data.supplier_name.trim() === ""
        ) {
            Toast.show({
                type: "error",
                text1: "Insert data incomplete"
            })
            return;
        }

        await insertSupplier.mutateAsync({
            supplier: {
                supplier_id_type: data.supplier_id_type,
                supplier_id: data.supplier_id,
                supplier_name: data.supplier_name,
                supplier_phone: data.supplier_phone,
            },
            vehicles: (data.plate_no !== undefined && data.plate_no?.trim() !== "") ? [{
                supplier_id: data.supplier_id_type,
                plate_no: data.plate_no
            }] : []
        }).then(res => {
            if (res.supplier_id !== undefined && res.supplier_id.trim() !== "") {
                setInsertSupplierSuccess(true);
            }
        })
    };

    const handleSaveAndPrint = async (printReceipt: boolean): Promise<void> => {
        if (!selectedSupplier || selectedSupplier.supplier_id.trim() === "") {
            Toast.show({
                type: "error",
                text1: "Form incomplete",
                text2: "Please select a supplier before saving"
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
            ...purchaseTransaction,
            transact_status: transactStatus,
            supplier_id: selectedSupplier.supplier_id,
        }

        const details = selectedItems.map(item => ({
            stock_id: item.stock_id,
            item_quantity: parseFloat(item.quantity) || 0,
            item_price: parseFloat(item.price) || 0,
            transact_subtotal: parseFloat(item.quantity) * parseFloat(item.price) || 0
        }))

        const result = await insertPurchase.mutateAsync({
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
            setIsPrinting(true);
            await PrintPurchase({
                header: {
                    transact_id: result.header.transact_id,
                    transact_total_amount: result.header.transact_total_amount,
                },
                details: details
            }).finally(() => {
                setIsPrinting(false);
            });
        };


        await router.push({
            pathname: "./PurchasesDetailScreen",
            params: { transact_id: result.header.transact_id },
        });
    };

    // 👇 ONLY AFTER ALL HOOKS
    if (loading) return <LoadingScreen />;

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: SystemColorTheme.Background }}
            edges={["bottom"]}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" || Platform.OS === "android" ? "padding" : undefined}
                enabled={enableKeyboardAvoidView}
            >
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.formContainer}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                >
                    <Pressable onPress={() => setSupplierModalVisible(true)}>
                        <View style={[styles.categoryContainer, styles.flexButton]}>
                            {!selectedSupplier ? <FontAwesome name="search" color={SystemColorTheme.Secondary} style={styles.buttonIcon} size={20} /> : ""}
                            <Text style={[styles.text_secondary, styles.buttonLabel]}>
                                {selectedSupplier ? selectedSupplier.supplier_name : "Supplier..."}
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
                                        { backgroundColor: transactStatus === payment ? btnColors(payment) : SystemColorTheme.Background }
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
                                    <Text style={[styles.text_secondary, { borderBottomWidth: 1, borderColor: SystemColorTheme.Secondary, paddingBottom: 3 }]}>
                                        {item.stock_description} ({item.stock_id})
                                    </Text>

                                    <View style={{ flexDirection: "row", gap: 10, marginTop: 5, alignItems: "center" }}>
                                        <View
                                            style={{ flex: 1 }}
                                            onLayout={(e) => {
                                                fieldRefs.current[`${item.stock_id}_item_quantity`] =
                                                    e.nativeEvent.layout.y;
                                            }}
                                        >
                                            <Text style={styles.text_secondary}>{item.stock_uom ?? "Quantity"}:</Text>
                                            <TextInput
                                                placeholder="Qty"
                                                keyboardType="decimal-pad"
                                                value={item.quantity}
                                                ref={(ref) => {
                                                    inputRefs.current[`${item.stock_id}_item_quantity`] = ref;
                                                }}
                                                onFocus={() => {
                                                    setEnableKeyboardAvoidView(true);

                                                    requestAnimationFrame(() => {
                                                        setTimeout(() => {
                                                            focusField(fieldRefs.current[`${item.stock_id}_item_quantity`]);
                                                        }, 150);
                                                    });
                                                }}
                                                onChangeText={(text) => updateItem(item.stock_id, "quantity", text)}
                                                onBlur={() => {
                                                    const num = parseFloat(item.quantity);
                                                    updateItem(item.stock_id, "quantity", isNaN(num) ? "0" : num.toString());
                                                }}
                                                style={[styles.text_secondary, { borderWidth: 1, borderRadius: 5, padding: 3, borderColor: SystemColorTheme.Secondary, backgroundColor: SystemColorTheme.Background }]}
                                            />
                                        </View>
                                        <View
                                            style={{ flex: 1 }}
                                            onLayout={(e) => {
                                                fieldRefs.current[`${item.stock_id}_item_price`] =
                                                    e.nativeEvent.layout.y;
                                            }}
                                        >
                                            <Text style={styles.text_secondary}>Price:</Text>
                                            <TextInput
                                                placeholder="Price"
                                                keyboardType="decimal-pad"
                                                value={item.price}
                                                ref={(ref) => { inputRefs.current[`${item.stock_id}_item_price`] = ref }}
                                                onFocus={() => {
                                                    setEnableKeyboardAvoidView(true);

                                                    requestAnimationFrame(() => {
                                                        setTimeout(() => {
                                                            focusField(fieldRefs.current[`${item.stock_id}_item_price`]);
                                                        }, 150);
                                                    });
                                                }}
                                                onChangeText={(text) => updateItem(item.stock_id, "price", text)}
                                                style={[styles.text_secondary, { borderWidth: 1, borderRadius: 5, padding: 3, borderColor: SystemColorTheme.Secondary, backgroundColor: SystemColorTheme.Background }]}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.text_secondary}>Subtotal:</Text>
                                            <Text style={[styles.text_secondary, { padding: 3 }]}>
                                                {subtotal}
                                            </Text>
                                        </View>
                                        <Pressable onLongPress={() => removeItem(item.stock_id)}>
                                            <View style={[styles.flexButton, { paddingHorizontal: 15 }]}>
                                                <FontAwesome name="trash-o" size={20} color={SystemColorTheme.Secondary}></FontAwesome>
                                            </View>
                                        </Pressable>
                                    </View>

                                </View>
                            )
                        })}

                        <Pressable onPress={() => setItemModalVisible(true)}>
                            <View style={styles.flexButton}>
                                <Text style={[styles.buttonLabel, styles.text_secondary]}>
                                    Add Item
                                </Text>
                            </View>
                        </Pressable>
                        <Pressable onPress={() => setInsertSupplierModalVisible(true)}>
                            <View style={styles.flexButton}>
                                <Text style={[styles.buttonLabel, styles.text_secondary]}>
                                    Draft supplier
                                </Text>
                            </View>
                        </Pressable>
                    </View>

                    <View style={styles.categoryContainer}>
                        <View style={[styles.categoryTitle, { marginBottom: 5 }]}>
                            <FontAwesome name="dollar" size={20} color={SystemColorTheme.Secondary} style={styles.categoryTitleIcon}></FontAwesome>
                            <Text style={[styles.categoryTitleLabel, styles.text_secondary]}>Total</Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={[styles.text_secondary]}>Total payable:</Text>
                            <View style={{ minWidth: 100, borderWidth: 1, borderRadius: 3, borderColor: SystemColorTheme.Secondary, backgroundColor: SystemColorTheme.Background, paddingHorizontal: 3 }}>
                                <TextInput
                                    style={[styles.text_secondary, { textAlign: "right", padding: 5 }]}
                                    value={totalPayable}
                                    keyboardType="decimal-pad"
                                    ref={(ref) => { inputRefs.current["total_payable"] = ref }}
                                    onFocus={() => {
                                        setEnableKeyboardAvoidView(true);
                                        const y =
                                            fieldRefs.current["total_payable"];
                                        if (y !== undefined) {
                                            focusField(y);
                                        };
                                    }}
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
                            <Pressable style={[styles.flexButton, styles.formSelectButtons]} onPress={() => handleSaveAndPrint(false)}>
                                <FontAwesome name="print" size={20} color={SystemColorTheme.Secondary} style={styles.buttonIcon}></FontAwesome>
                                <Text style={[styles.buttonLabel, styles.text_secondary]}>
                                    Save
                                </Text>
                            </Pressable>
                            <Pressable style={[styles.flexButton, styles.formSelectButtons, { backgroundColor: SystemColorTheme.Info }]} onPress={() => handleSaveAndPrint(false)} disabled={isPrinting}>
                                <FontAwesome name="print" size={20} color={SystemColorTheme.Secondary} style={styles.buttonIcon}></FontAwesome>
                                <Text style={[styles.buttonLabel, styles.text_secondary]}>
                                    Save & Print
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>

                <Modal
                    visible={supplierModalVisible}
                    animationType="slide"
                    onRequestClose={async () => {
                        setSupplierModalVisible(false);
                        setSupplierSearch("");
                        await queryClient.invalidateQueries({
                            queryKey: supplierKeys.lists()
                        })
                    }}
                    onDismiss={() => {
                        queryClient.invalidateQueries({
                            queryKey: supplierKeys.lists()
                        })
                    }}>
                    <SafeAreaView style={{ flex: 1, backgroundColor: SystemColorTheme.Background }}>

                        {/* Header */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16 }}>
                            <Text style={[styles.text_secondary, { fontSize: 20 }]}>
                                Select Supplier
                            </Text>

                            <Pressable onPress={async () => {
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
                            onEndEditing={async () => {
                                await queryClient.invalidateQueries({
                                    queryKey: supplierKeys.lists()
                                })
                            }}
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
                            data={suppliers}
                            keyExtractor={(item) => item.supplier_id.toString()}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => {
                                        setSelectedSupplier(item);
                                        setSupplierModalVisible(false);
                                    }}
                                    style={styles.modalCard}
                                >
                                    <Text style={styles.text_secondary}>
                                        {item.supplier_name} | {item.supplier_id}
                                    </Text>
                                </Pressable>
                            )}
                            ListEmptyComponent={
                                <View style={[styles.bg_default, styles.container]}>
                                    <Text style={styles.text_secondary}>No suppliers found...</Text>
                                    {supplierSearch.trim() !== "" && (
                                        <Pressable>
                                            <View>
                                                <Text style={[styles.text_secondary, { textDecorationLine: "underline" }]}>Draft {supplierSearch}</Text>
                                            </View>
                                        </Pressable>
                                    )}
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
                {/* Draft supplier modal */}
                <Modal visible={insertSupplierModalVisible} onRequestClose={() => setInsertSupplierModalVisible(false)} animationType="slide">
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={[styles.text_secondary, { fontSize: 20 }]}>
                            Insert Supplier
                        </Text>

                        <Pressable onPress={() => {
                            setInsertSupplierModalVisible(false);
                            setItemSearch("");
                        }}>
                            <FontAwesome name="close" size={20} color={SystemColorTheme.Secondary} />
                        </Pressable>
                    </View>
                    <View style={styles.modalBody}>
                        <View style={styles.categoryContainer}>
                            <Text style={styles.inputLabel}>ID Type: </Text>
                            <View style={styles.inputRow}>
                                {(["NRIC", "BRN", "PASSPORT"] as const).map((type) => (
                                    <Pressable
                                        key={type}
                                        style={[
                                            styles.flexButton,
                                            styles.formSelectButtons,
                                            insertSupplierData.supplier_id_type === type && {
                                                backgroundColor: SystemColorTheme.Secondary
                                            }
                                        ]}
                                        onPress={() => {
                                            setInsertSupplierData({ ...insertSupplierData, supplier_id_type: type });
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                insertSupplierData.supplier_id_type === type && {
                                                    color: SystemColorTheme.Primary
                                                }
                                            ]}
                                        >
                                            {type}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>{insertSupplierData.supplier_id_type.trim() !== "" ? insertSupplierData.supplier_id_type : "NRIC"}:</Text>
                                <TextInput
                                    style={[styles.input, (!insertSupplierValidation.supplier_id) && styles.border_danger]}
                                    placeholder={`Enter supplier ${insertSupplierData.supplier_id_type}...`}
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    onChangeText={(text) => {
                                        if (text.trim() === "") {
                                            setInsertSupplierValidation(prev => ({ ...prev, supplier_id: false }))
                                        } else {
                                            setInsertSupplierValidation(prev => ({ ...prev, supplier_id: true }))
                                        }
                                        setInsertSupplierData(prev => ({
                                            ...prev,
                                            supplier_id: text
                                        }))
                                    }}
                                />
                            </View>
                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>NAME:</Text>
                                <TextInput
                                    style={[styles.input, (!insertSupplierValidation.supplier_name) && styles.border_danger]}
                                    placeholder="Enter supplier name..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    onChangeText={(text) => {
                                        if (text.trim() === "") {
                                            setInsertSupplierValidation(prev => ({ ...prev, supplier_id: false }))
                                        } else {
                                            setInsertSupplierValidation(prev => ({ ...prev, supplier_id: true }))
                                        }
                                        setInsertSupplierData(prev => ({
                                            ...prev,
                                            supplier_name: text
                                        }))
                                    }}
                                />
                            </View>
                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>PHONE:</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="number-pad"
                                    placeholder="Enter supplier phone..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    onChangeText={(text) => {
                                        setInsertSupplierData(prev => ({
                                            ...prev,
                                            supplier_phone: text
                                        }))
                                    }}
                                />
                            </View>
                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>VEHICLE:</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter plate number..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    onChangeText={(text) => {
                                        setInsertSupplierData(prev => ({
                                            ...prev,
                                            plate_no: text
                                        }))
                                    }}
                                />
                            </View>
                            <Pressable style={[styles.flexButton, styles.bg_info]}>
                                <Text style={styles.text_secondary}>Insert</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};