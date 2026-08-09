import CalculatorModal from "@/app/components/CalculatorModal";
import HorizontalLine from "@/app/components/HorizontalLine";
import supplierKeys from "@/app/queries/supplier.keys";
import useSupplierList from "@/hooks/clients/suppliers/useSupplierList";
import { useInsertSupplier } from "@/hooks/clients/suppliers/useSupplierMutations";
import useStockList from "@/hooks/stock/useStockList";
import { useInsertPurchase } from "@/hooks/transactions/purchases/usePurchaseMutations";
import PrintReceipt from "@/services/escPos/escposPrintReceipt";
import { styles } from "@/styles/_styles";
import SystemColorTheme from "@/styles/system-color-theme";
import { Supplier } from "@/types/clientType";
import type { Stock } from "@/types/stockType";
import type { PurchasesTransaction } from "@/types/transactionType";
import { FontAwesome } from "@expo/vector-icons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function PurchasesCreateScreen() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const insertSupplier = useInsertSupplier();
    const insertPurchase = useInsertPurchase();
    const [isPrinting, setIsPrinting] = useState<boolean>(false);
    const [stockModalVisible, setStockModalVisible] = useState<boolean>(false);
    const [configuringStock, setConfiguringStock] = useState<(Stock & { quantity: string, price: string }) | null>(null);
    const [supplierModalVisible, setSupplierModalVisible] = useState<boolean>(false);
    const [insertSupplierModalVisible, setInsertSupplierModalVisible] = useState<boolean>(false);
    const [calcModalVisible, setCalcModalVisible] = useState<boolean>(false);
    const [calcTarget, setCalcTarget] = useState<"item_quantity" | "item_price" | null>(null);

    const [itemSearch, setItemSearch] = useState<string>("");
    const [supplierSearchInput, setSupplierSearchInput] = useState<string>("");
    const [supplierSearchQuery, setSupplierSearchQuery] = useState<string>("");

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<Pick<Supplier, "supplier_id" | "supplier_name">>();

    const { supplierList } = useSupplierList(1, 25, (supplierSearchQuery.trim() !== "" ? supplierSearchQuery : undefined));
    const { stockList } = useStockList(1, 1000, (itemSearch.trim() !== "" ? itemSearch : undefined));

    const suppliers = supplierList.data?.data ?? [];
    const inventory = useMemo(() => (
        stockList.data?.data ?? []
    ), [stockList]);

    const [selectedItems, setSelectedItems] = useState<(Stock & { quantity: string, price: string })[]>([]);

    const [purchaseTransaction, setPurchaseTransaction] = useState<Omit<PurchasesTransaction, 'transact_id'>>({
        supplier_id: "",
        transact_total_amount: 0,
        transact_date: (new Date()).toISOString(),
        transact_status: "PAID",
    });

    const [totalPayable, setTotalPayable] = useState<string>("0.00");

    const transactStatusColor = useMemo(() => {
        switch (purchaseTransaction.transact_status) {
            case "PAID":
                return SystemColorTheme.Success;
            case "PARTIAL":
                return SystemColorTheme.Warning;
            case "UNPAID":
                return SystemColorTheme.Danger;
            default:
                return SystemColorTheme.Secondary;
        }
    }, [purchaseTransaction.transact_status]);

    const [formValidation, setFormValidation] = useState({
        supplier: true,
        items: true,
    });

    const [insertSupplierData, setInsertSupplierData] = useState<Supplier & { plate_no?: string }>({
        supplier_id_type: "NRIC",
        supplier_id: "",
        supplier_name: "",
        supplier_phone: "",
        plate_no: "",
    })

    const scrollRef = useRef<ScrollView>(null);
    const itemModalRef = useRef<Record<string, TextInput | null>>({});
    const insertSupplierRef = useRef<Record<string, TextInput | null>>({});

    const totalsMatch = useMemo(() => {
        if (selectedItems.length === 0) return true;
        const total = selectedItems.reduce(
            (sum, item) =>
                sum +
                (parseFloat(item.quantity) || 0) *
                (parseFloat(item.price) || 0),
            0
        )
        return total.toFixed(2) === totalPayable
    }, [selectedItems, totalPayable]);

    const showDTPickerAndroid = () => {
        DateTimePickerAndroid.open({
            value: new Date(purchaseTransaction.transact_date ?? new Date()),
            design: "material",
            onChange: (event, date) => {
                setPurchaseTransaction(prev => ({
                    ...prev,
                    transact_date: date?.toString()
                }))
            }
        })
    };

    useEffect(() => {
        const total = selectedItems.reduce(
            (sum, item) =>
                sum +
                (parseFloat(item.quantity) || 0) *
                (parseFloat(item.price) || 0),
            0
        ).toFixed(2);

        setTotalPayable(total);
    }, [selectedItems]);

    const handleAddItem = async (item: Stock & { quantity: string, price: string }) => {
        const exists = selectedItems.some(s => s.stock_id === item.stock_id);
        if (!exists) {
            setSelectedItems(prev => {
                return [...prev, { ...item, quantity: item.quantity, price: item.price }];
            });
        } else {
            setSelectedItems(prev => {
                return [...prev.filter(s => s.stock_id !== item.stock_id), { ...item, quantity: item.quantity, price: item.price }];
            });
        }
        setFormValidation(prev => ({
            ...prev,
            items: item !== undefined
        }));
        setStockModalVisible(false);
        setItemSearch("");
        setSelectedCategory(null);
        setConfiguringStock(null);
        requestAnimationFrame(() => {
            setTimeout(() => {
                scrollRef.current?.scrollToEnd();
            }, 100);
        })
    };

    const handleSelectSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setFormValidation(prev => ({
            ...prev,
            supplier: supplier !== undefined
        }));
        setSupplierModalVisible(false);
        setInsertSupplierModalVisible(false);
    };

    useEffect(() => {
        setPurchaseTransaction(prev => ({
            ...prev,
            transact_total_amount: selectedItems.length > 0 ?
                selectedItems.flatMap(stock => Number.parseFloat(stock.quantity) * Number.parseFloat(stock.price)).reduce((previous, current) => previous + current) :
                0
        }))
    }, [selectedItems]);

    const handleFormValidation = () => {
        const validation = {
            supplier: selectedSupplier !== undefined,
            items: selectedItems.length > 0
        };

        setFormValidation(validation);
        return !Object.values(validation).some(v => v === false);
    }

    const handleFormClose = useCallback(async () => {
        setIsPrinting(false);
        setFormValidation({
            supplier: true,
            items: true
        });
        setSelectedSupplier(undefined);
        setSelectedItems([]);

        setInsertSupplierData({
            supplier_id_type: "NRIC",
            supplier_id: "",
            supplier_name: "",
            supplier_phone: "",
            plate_no: "",
        });

        setPurchaseTransaction({
            supplier_id: "",
            transact_total_amount: 0,
            transact_date: new Date().toISOString(),
            transact_status: "PAID"
        });

        setSupplierSearchInput("");
        setItemSearch("");
        setSelectedCategory(null);

        setSupplierModalVisible(false);
        setStockModalVisible(false);
        setCalcModalVisible(false);
        setCalcTarget(null);

        scrollRef.current?.scrollTo({
            y: 0,
            animated: false
        });

        await queryClient.invalidateQueries({
            queryKey: supplierKeys.lists()
        });
    }, [queryClient, scrollRef]);

    useFocusEffect(
        useCallback(() => {
            handleFormClose();
        }, [handleFormClose])
    )

    const handleSaveAndPrint = async (print: boolean) => {
        if (!handleFormValidation()) {
            Toast.show({
                type: "error",
                text1: "Form incomplete!"
            })
            return;
        }
        if (selectedSupplier === undefined || selectedSupplier.supplier_id.trim() === "") return;
        if (totalPayable.trim() === "") return;
        await insertPurchase.mutateAsync({
            header: {
                supplier_id: selectedSupplier.supplier_id,
                transact_status: purchaseTransaction.transact_status,
                transact_date: purchaseTransaction.transact_date,
                transact_total_amount: Number.parseFloat(totalPayable)
            },
            details: selectedItems.map(item => ({
                stock_id: item.stock_id,
                item_quantity: Number.parseFloat(item.quantity),
                item_price: Number.parseFloat(item.price),
                transact_subtotal: Number.parseFloat(item.quantity) * Number.parseFloat(item.price),
            }))
        }).then(async (res) => {
            if (print) {
                if (isPrinting) {
                    Toast.show({
                        type: "error",
                        text1: "Print failed",
                        text2: "Please try again later"
                    });
                } else {
                    await PrintReceipt({
                        header: {
                            transact_id: res.header.transact_id,
                            transact_total_amount: res.header.transact_total_amount
                        },
                        details: res.details.map(detail => ({
                            stock_id: detail.stock_id,
                            item_quantity: detail.item_quantity,
                            item_price: detail.item_price,
                        }))
                    });
                }
            }
            handleFormClose();
            await router.push({
                pathname: "/views/transactions/purchases/PurchasesDetailScreen",
                params: { transact_id: res.header.transact_id }
            });
        })
    };

    const handleCreateSupplier = async () => {
        await insertSupplier.mutateAsync({
            supplier: {
                supplier_id_type: insertSupplierData.supplier_id_type,
                supplier_id: insertSupplierData.supplier_id,
                supplier_name: insertSupplierData.supplier_name,
                supplier_phone: insertSupplierData.supplier_phone,
                supplier_address: insertSupplierData.supplier_address,
                supplier_email: insertSupplierData.supplier_email,
                supplier_tin: insertSupplierData.supplier_tin
            },
            vehicles: insertSupplierData.plate_no !== undefined && insertSupplierData.plate_no?.trim() !== "" ?
                [{
                    supplier_id: insertSupplierData.supplier_id,
                    plate_no: insertSupplierData.plate_no
                }] :
                []
        }).then((res) => {
            if (res.data !== undefined) {
                setInsertSupplierModalVisible(false);
                setSupplierModalVisible(false);
                Toast.show({
                    type: "success",
                    text1: "Insert success",
                    text2: "Successfully created new supplier!"
                });
                setSelectedSupplier({
                    supplier_id: res.data[0].supplier_id,
                    supplier_name: res.data[0].supplier_name,
                });
            } else {
                setInsertSupplierModalVisible(false);
                setSupplierModalVisible(false);
                Toast.show({
                    type: "error",
                    text1: "Insert failed",
                    text2: "Failed to create new supplier"
                })
            }
        })
    }

    const filteredItems = useMemo(() => {
        const q = itemSearch.toLowerCase();

        const selected = selectedItems.map(s => s.stock_id);
        const filtered = inventory.filter(i => {
            const id = (i.stock_id ?? "").toLowerCase();
            const desc = (i.stock_description ?? "").toLowerCase();
            const cat = (i.stock_category ?? "").toLowerCase();

            const matchesSearch = itemSearch.trim() !== "" ? (
                desc.includes(q) ||
                id.includes(q) ||
                cat.includes(q)
            ) : true;

            const notSelected = !selected.includes(i.stock_id);

            return notSelected && matchesSearch;
        }).sort((a, b) => a.stock_id.localeCompare(b.stock_id));
        return filtered;
    }, [inventory, itemSearch, selectedItems]);

    const inventoryCategories = useMemo(() => {
        const categories = filteredItems
            .map(f => f.stock_category)
            .filter((c): c is string => typeof c === "string");
        return [...new Set(categories)].sort((a, b) => a.localeCompare(b));
    }, [filteredItems]);

    const normalizeAmount = (amount: number | string) => {
        if (amount === undefined) return "0.00";
        if (typeof amount === "string") {
            amount = Number.parseFloat(amount)
        };
        return !isNaN(amount) ? amount.toFixed(2) : "0.00";
    }

    const numericInput = (text: string) => text.replace(/[^\d.]/g, "");

    const isNullOrUndefined = (data: any) => {
        return (data === null || data === undefined);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <SafeAreaView
                edges={["bottom"]}
                style={[styles.container]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                    <TouchableOpacity style={{ width: "45%" }} onPress={showDTPickerAndroid}>
                        <View style={{ flexDirection: "row", gap: 10, alignContent: "center", padding: 5, borderBottomWidth: 1, borderColor: SystemColorTheme.Secondary }}>
                            <FontAwesome name="calendar" style={{ fontSize: 24, color: SystemColorTheme.Secondary }} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.text_secondary, { textAlign: "center" }]}>
                                    {
                                        purchaseTransaction.transact_date !== undefined ?
                                            new Date(purchaseTransaction.transact_date).toLocaleDateString("en-CA") :
                                            new Date().toLocaleDateString("en-CA")
                                    }
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={{ width: "45%" }}>
                        <Dropdown
                            data={["UNPAID", "PARTIAL", "PAID"].map((v) => ({
                                value: v,
                                label: v
                            }))}
                            labelField={"label"}
                            valueField={"value"}
                            style={{ paddingVertical: 5, borderBottomWidth: 1, borderColor: SystemColorTheme.Secondary, paddingHorizontal: 10 }}
                            onChange={(item) => setPurchaseTransaction(prev => ({
                                ...prev,
                                transact_status: item.value
                            }))}
                            selectedTextStyle={[styles.text_secondary, { textAlign: "center" }]}
                            renderLeftIcon={() => (
                                <FontAwesome name="credit-card" style={[styles.icon, { color: transactStatusColor }]} />
                            )}
                            value={purchaseTransaction.transact_status}
                        />
                    </View>
                </View>
                <TouchableOpacity onPress={() => setSupplierModalVisible(true)}>
                    <View style={{ flexDirection: "row", gap: 10, alignContent: "center", padding: 5, borderBottomWidth: 1, borderColor: formValidation.supplier ? SystemColorTheme.Secondary : SystemColorTheme.Danger }}>
                        <FontAwesome name="user" style={{ fontSize: 24, color: SystemColorTheme.Secondary }} />
                        <View style={{ flex: 1 }}>
                            <Text numberOfLines={1} style={selectedSupplier !== undefined ? styles.text_secondary : styles.text_placeholder}>
                                {selectedSupplier !== undefined ? selectedSupplier.supplier_name : "Supplier..."}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <HorizontalLine marginVertical={5} />
                {selectedItems.length > 0 ? (
                    <ScrollView ref={scrollRef} style={{ flex: 1 }} nestedScrollEnabled={true}>
                        {selectedItems.map((stock, index) => (
                            <View
                                key={stock.stock_id}
                                style={{
                                    flexDirection: "row",
                                    gap: 5,
                                    marginBottom: index !== selectedItems.length - 1 ? 2 : undefined,
                                }}>
                                <TouchableOpacity
                                    style={{ flex: 1 }}
                                    key={"data_" + stock.stock_id}
                                    onLongPress={() => {
                                        setStockModalVisible(true);
                                        setConfiguringStock(stock);
                                    }}>
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            backgroundColor: SystemColorTheme.Primary,
                                            padding: 5,
                                            paddingHorizontal: 10,
                                        }}>
                                        <Text style={styles.text_secondary}>{stock.stock_id} | {stock.stock_description}</Text>
                                        <View style={{ alignItems: "flex-end" }}>
                                            <Text style={[styles.text_secondary, { paddingVertical: 1 }]}>RM{(Number.parseFloat(stock.quantity) * Number.parseFloat(stock.price)).toFixed(2)}</Text>
                                            <Text style={[styles.text_secondary_sm, { paddingVertical: 1 }]}>{stock.quantity} {stock.stock_uom} X RM{stock.price}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    key={"delete_" + stock.stock_id}
                                    onLongPress={() => {
                                        setSelectedItems(prev => [...prev.filter(item => item.stock_id !== stock.stock_id)])
                                    }}
                                >
                                    <View
                                        style={{
                                            flex: 1,
                                            justifyContent: "center",
                                            alignSelf: "center",
                                            backgroundColor: SystemColorTheme.Primary,
                                            padding: 5,
                                            paddingHorizontal: 10,
                                        }}
                                    >
                                        <FontAwesome name="trash" style={[styles.icon, { textAlignVertical: "center", textAlign: "center" }]} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setStockModalVisible(true)}>
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <Text style={styles.text_placeholder}>
                                {`Press "Add Item"`}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setStockModalVisible(true)}>
                    <View style={[styles.button, (!formValidation.items && styles.border_danger)]}>
                        <Text style={styles.text_secondary}>
                            Add Item
                        </Text>
                    </View>
                </TouchableOpacity>
                <HorizontalLine marginVertical={5} />
                <View style={{ flexDirection: "row", gap: 10, justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={styles.text_secondary}><FontAwesome name="dollar" style={styles.icon} /> Total (RM):</Text>
                    <View style={[
                        styles.border,
                        (selectedItems.length > 0 && !totalsMatch && styles.border_warning),
                        { padding: 2, width: "auto" }
                    ]}>
                        <TextInput
                            style={[styles.text_secondary, { textAlign: "right", paddingLeft: 30 }]}
                            keyboardType="decimal-pad"
                            value={totalPayable}
                            onChangeText={(text) => setTotalPayable(numericInput(text))}
                            onBlur={() => {
                                setTotalPayable(prev => normalizeAmount(prev))
                            }}
                            selectTextOnFocus
                        />
                    </View>
                </View>
                <HorizontalLine marginVertical={5} />
                <View style={{ flexDirection: "row", gap: 10, alignSelf: "flex-end" }}>
                    <TouchableOpacity onPress={() => handleSaveAndPrint(false)}>
                        <View style={[styles.button, styles.bg_default, { flexDirection: "row", gap: 5 }]}>
                            <FontAwesome name="save" style={styles.icon} />
                            <Text style={styles.text_secondary}>Save</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSaveAndPrint(true)}>
                        <View style={[styles.button, styles.bg_info, { flexDirection: "row", gap: 5 }]}>
                            <FontAwesome name="print" style={styles.icon} />
                            <Text style={styles.text_secondary}>Save & Print</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            <Modal
                visible={stockModalVisible}
                animationType="slide"
                onRequestClose={() => {
                    setStockModalVisible(false);
                    setItemSearch("");
                    setSelectedCategory(null);
                    setConfiguringStock(null);
                }}
            >
                <SafeAreaView edges={["bottom"]} style={styles.modal}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16 }}>
                        <Text style={[styles.modalTitle, { fontSize: 20 }]}>
                            Select Item
                        </Text>

                        <TouchableOpacity onPress={() => {
                            setStockModalVisible(false);
                            setItemSearch("");
                            setSelectedCategory(null);
                            setConfiguringStock(null);
                        }}>
                            <FontAwesome name="close" size={20} color={SystemColorTheme.Secondary} />
                        </TouchableOpacity>
                    </View>
                    {(configuringStock === null) ? (
                        <>
                            <TextInput
                                placeholder="Search item..."
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                value={itemSearch}
                                onChangeText={(text) => {
                                    setItemSearch(text);
                                    setSelectedCategory(null);
                                }}
                                style={[styles.text_secondary, styles.border, {
                                    textAlignVertical: "center",
                                    margin: 16,
                                    padding: 16,
                                }]}
                                selectTextOnFocus={true}
                            />
                            {selectedCategory && (
                                <View style={{ margin: 16, flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={styles.text_secondary}>
                                        Category: {selectedCategory}
                                    </Text>
                                    <TouchableOpacity onPress={() => {
                                        setSelectedCategory(null)
                                        setItemSearch("");
                                    }}>
                                        <FontAwesome name="close" color={SystemColorTheme.Secondary} size={20} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {(itemSearch.trim() !== "") ? (
                                (filteredItems.length > 0) ? (
                                    <ScrollView style={{ flex: 1 }}>
                                        {inventoryCategories.map(category => (
                                            <TouchableOpacity
                                                key={category}
                                                onPress={() => {
                                                    setSelectedCategory(category!);
                                                    setItemSearch("");
                                                }}>
                                                <View style={[styles.modalCard, {
                                                    flexDirection: "row",
                                                    gap: 10
                                                }]}>
                                                    <FontAwesome name="folder" size={20} color={SystemColorTheme.Secondary} style={{ textAlignVertical: "center" }} />
                                                    <Text style={[styles.text_secondary, { fontWeight: "bold" }]}>
                                                        {category}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                        {filteredItems.map(stock => (
                                            <TouchableOpacity
                                                key={stock.stock_id}
                                                onPress={() => {
                                                    setConfiguringStock({
                                                        ...stock,
                                                        quantity: "1.00",
                                                        price: !isNullOrUndefined(stock.buy_price) ? stock.buy_price.toFixed(2) : "1.00"
                                                    });
                                                    requestAnimationFrame(() => {
                                                        setTimeout(() => {
                                                            itemModalRef.current["quantity"]?.focus();
                                                        }, 100)
                                                    })
                                                }}>
                                                <View style={[styles.modalCard, {
                                                    flexDirection: "row",
                                                    gap: 10
                                                }]}>
                                                    <Text style={[styles.text_secondary, { fontWeight: "bold" }]}>
                                                        {stock.stock_id} | {stock.stock_description}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                ) : (
                                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                        <Text style={styles.text_placeholder}>
                                            {`Search "${itemSearch}" has no results`}
                                        </Text>
                                    </View>
                                )
                            ) : (
                                (selectedCategory === null) ? (
                                    <View style={{ flex: 1 }}>
                                        {inventoryCategories.length > 0 && inventoryCategories.map(category => (
                                            <TouchableOpacity
                                                key={category}
                                                onPress={() => {
                                                    setSelectedCategory(category!);
                                                    setItemSearch("");
                                                }}>
                                                <View style={[styles.modalCard, {
                                                    flexDirection: "row",
                                                    gap: 10
                                                }]}>
                                                    <FontAwesome name="folder" size={20} color={SystemColorTheme.Secondary} style={{ textAlignVertical: "center" }} />
                                                    <Text style={[styles.text_secondary, { fontWeight: "bold" }]}>
                                                        {category}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : (
                                    <View style={{ flex: 1 }}>
                                        {filteredItems.filter(s => s.stock_category === selectedCategory).map(stock => (
                                            <TouchableOpacity
                                                key={stock.stock_id}
                                                onPress={() => {
                                                    setConfiguringStock({
                                                        ...stock,
                                                        quantity: "1.00",
                                                        price: !isNullOrUndefined(stock.buy_price) ? stock.buy_price.toFixed(2) : "1.00"
                                                    });
                                                    requestAnimationFrame(() => {
                                                        setTimeout(() => {
                                                            itemModalRef.current["quantity"]?.focus();
                                                        }, 100)
                                                    })
                                                }}>
                                                <View style={[styles.modalCard, {
                                                    flexDirection: "row",
                                                    gap: 10
                                                }]}>
                                                    <Text style={[styles.text_secondary, { fontWeight: "bold" }]}>
                                                        {stock.stock_id} | {stock.stock_description}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )
                            )}
                        </>
                    ) : (
                        <>
                            <View style={[styles.modalBody, { justifyContent: "center", marginBottom: "10%" }]}>
                                <View style={[{ flexDirection: "row", gap: 10, marginVertical: 10 }]}>
                                    <Text style={styles.text_secondary}>Stock:</Text>
                                    <Text style={styles.text_secondary}>{configuringStock.stock_id} | {configuringStock.stock_description}</Text>
                                </View>
                                <View style={[{ flexDirection: "row", gap: 10, marginVertical: 10 }]}>
                                    <Text style={styles.text_secondary}>Current quantity:</Text>
                                    <Text style={styles.text_secondary}>{configuringStock.current_quantity.toFixed(2)} {configuringStock.stock_uom}</Text>
                                </View>

                                <View style={[{ flexDirection: "row", gap: 10 }]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.text_secondary}>Quantity:</Text>
                                        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                                            <Text style={[styles.text_secondary, { textAlignVertical: "center" }]}>{configuringStock.stock_uom}</Text>
                                            <TextInput
                                                style={[styles.text_secondary, styles.border, { padding: 10, textAlign: "right", flex: 1 }]}
                                                ref={(ref) => {
                                                    itemModalRef.current["quantity"] = ref;
                                                }}
                                                value={configuringStock.quantity}
                                                onChangeText={(text) => {
                                                    setConfiguringStock(prev => (
                                                        prev ? ({
                                                            ...prev,
                                                            quantity: text
                                                        }) : prev
                                                    ))
                                                }}
                                                keyboardType="decimal-pad"
                                                selectTextOnFocus={true}
                                                returnKeyType="next"
                                                onBlur={() => {
                                                    setConfiguringStock(prev => (
                                                        prev ? ({
                                                            ...prev,
                                                            quantity: normalizeAmount(prev.quantity)
                                                        }) : prev
                                                    ))
                                                }}
                                                onSubmitEditing={() => itemModalRef.current["price"]?.focus()}
                                            />
                                            <TouchableOpacity
                                                style={{ height: "100%" }}
                                                onPress={() => {
                                                    setCalcTarget("item_quantity");
                                                    setCalcModalVisible(true);
                                                }}
                                            >
                                                <View style={[styles.border, { paddingHorizontal: 10, flex: 1, justifyContent: "center" }]}>
                                                    <FontAwesome name="calculator" style={[styles.icon]} />
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.text_secondary}>Price:</Text>
                                        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                                            <Text style={[styles.text_secondary]}>RM</Text>
                                            <TextInput
                                                style={[styles.text_secondary, styles.border, { padding: 10, textAlign: "right", flex: 1 }]}
                                                ref={(ref) => {
                                                    itemModalRef.current["price"] = ref;
                                                }}
                                                value={configuringStock.price}
                                                onChangeText={(text) => {
                                                    setConfiguringStock(prev => (
                                                        prev ? ({
                                                            ...prev,
                                                            price: text
                                                        }) : prev
                                                    ))
                                                }}
                                                keyboardType="decimal-pad"
                                                selectTextOnFocus={true}
                                                onBlur={() => {
                                                    setConfiguringStock(prev => (
                                                        prev ? ({
                                                            ...prev,
                                                            price: normalizeAmount(prev.price)
                                                        }) : prev
                                                    ))
                                                }}
                                                onSubmitEditing={() => {
                                                    handleAddItem(configuringStock);
                                                }}
                                            />
                                            <TouchableOpacity
                                                style={{ height: "100%" }}
                                                onPress={() => {
                                                    setCalcTarget("item_price");
                                                    setCalcModalVisible(true);
                                                }}
                                            >
                                                <View style={[styles.border, { paddingHorizontal: 10, flex: 1, justifyContent: "center" }]}>
                                                    <FontAwesome name="calculator" style={[styles.icon]} />
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
                                    <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                                        setConfiguringStock(null);
                                    }}>
                                        <View style={[styles.button, styles.bg_danger]}>
                                            <Text style={styles.text_secondary}>
                                                Back
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                                        handleAddItem(configuringStock);
                                    }}>
                                        <View style={[styles.button, styles.bg_info]}>
                                            <Text style={styles.text_secondary}>
                                                Add
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}
                </SafeAreaView>
            </Modal>
            <Modal
            animationType="slide"
            visible={supplierModalVisible}
            onRequestClose={() => {
                setSupplierModalVisible(false);
                setInsertSupplierModalVisible(false);
            }}>
                <SafeAreaView style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Supplier</Text>
                        <TouchableOpacity onPress={() => {
                            setSupplierModalVisible(false);
                            setInsertSupplierModalVisible(false);
                        }}>
                            <FontAwesome name="close" style={styles.icon} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: "row", gap: 10, margin: 5 }}>
                        <TouchableOpacity onPress={() => {
                            setInsertSupplierModalVisible(true);
                        }}>
                            <View style={[styles.button, { flexDirection: "row", marginVertical: 0 }]}>
                                <FontAwesome name="user" style={styles.icon} />
                                <FontAwesome name="plus" style={[styles.icon, { fontSize: 10 }]} />
                            </View>
                        </TouchableOpacity>
                        <View style={[styles.border, { flex: 1, flexDirection: "row", gap: 10, paddingHorizontal: 10, alignContent: "center", alignItems: "center" }]}>
                            <FontAwesome name="search" style={styles.icon} />
                            <TextInput
                                value={supplierSearchInput}
                                placeholder="Search supplier..."
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                style={[styles.text_secondary, { flex: 1 }]}
                                maxLength={30}
                                onChangeText={setSupplierSearchInput}
                                onSubmitEditing={() => {
                                    setSupplierSearchQuery(supplierSearchInput)
                                }}
                            />
                            {supplierSearchInput.trim() !== "" && (
                                <TouchableOpacity onPress={() => {
                                    setSupplierSearchInput("");
                                    setSupplierSearchQuery("");
                                }}>
                                    <FontAwesome name="close" style={styles.icon} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    {supplierList.isLoading ? (
                        <View style={{ flex: 1, justifyContent: "center" }}>
                            <Text style={[styles.text_secondary, { textAlign: "center" }]}>Loading...</Text>
                        </View>
                    ) : (
                        <ScrollView style={{ margin: 5 }}>
                            {suppliers.length === 0 && (
                                <View style={{ flex: 1, justifyContent: "center" }}>
                                    {supplierSearchQuery.trim() !== "" ? (
                                        <Text style={styles.text_placeholder}>{`Search "${supplierSearchQuery}" returned no result`}</Text>
                                    ) : (
                                        <Text style={styles.text_placeholder}>No suppliers found</Text>
                                    )}
                                </View>
                            )}
                            {suppliers.map((supplier, index) => (
                                <TouchableOpacity
                                    key={supplier.supplier_id}
                                    onPress={() => {
                                        handleSelectSupplier(supplier);
                                    }}>
                                    <View
                                        key={supplier.supplier_id}
                                        style={[
                                            styles.bg_primary, {
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                                marginBottom: (index !== suppliers.length - 1) ? 2 : undefined,
                                                padding: 5
                                            }]}>
                                        <View>
                                            <View style={{ flexDirection: "row", gap: 5, padding: 5 }}>
                                                <FontAwesome name="user" style={[styles.icon, { alignSelf: "center" }]} />
                                                <Text numberOfLines={5} style={[styles.text_secondary, { textAlignVertical: "center", maxWidth: "60%" }]}>
                                                    {supplier.supplier_name} | {supplier.supplier_id}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: "row", gap: 5, padding: 5 }}>
                                                <FontAwesome name="phone" style={[styles.icon, { alignSelf: "center" }]} />
                                                <Text numberOfLines={1} style={[styles.text_secondary, { textAlignVertical: "center" }]}>
                                                    {supplier.supplier_phone}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: "row", gap: 5, padding: 5, maxWidth: "50%" }}>
                                                <FontAwesome name="car" style={[styles.icon, { alignSelf: "center" }]} />
                                                {supplier.plate_no.map(plate => (
                                                    <View key={`${supplier.supplier_id}_${plate}`} style={[styles.border, { alignContent: "center", backgroundColor: SystemColorTheme.Background, padding: 5 }]}>
                                                        <Text numberOfLines={1} style={[styles.text_secondary, { textAlignVertical: "center" }]}>
                                                            {plate}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                        <View style={{ alignSelf: "center" }}>
                                            <Text numberOfLines={1} style={styles.text_secondary}>{!isNullOrUndefined(supplier.last_transact_date) && new Date(supplier.last_transact_date!).toLocaleDateString("en-GB")}</Text>
                                        </View>
                                    </View>

                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </SafeAreaView>
            </Modal >

            <Modal
            animationType="fade"
            visible={insertSupplierModalVisible}
            onRequestClose={() => {
                setInsertSupplierModalVisible(false);
                setInsertSupplierData({
                    supplier_id: "",
                    supplier_id_type: "NRIC",
                    supplier_name: "",
                    supplier_phone: "",
                });
            }}>
                <View style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add Supplier</Text>
                        <TouchableOpacity onPress={() => {
                            setInsertSupplierModalVisible(false)
                        }}>
                            <FontAwesome name="close" style={styles.icon} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                        <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
                            <Dropdown
                                data={["NRIC", "PASSPORT", "BRN"].map(type => ({
                                    label: type,
                                    value: type
                                }))}
                                labelField={"label"}
                                valueField={"value"}
                                value={insertSupplierData.supplier_id_type}
                                onChange={(text) => setInsertSupplierData(prev => ({
                                    ...prev,
                                    supplier_id_type: text.value
                                }))}
                                selectedTextStyle={[styles.text_secondary, { textAlign: "center" }]}
                                style={[styles.border, { width: 125 }]}
                            />
                            <TextInput
                                ref={(ref) => {
                                    insertSupplierRef.current["supplier_id"] = ref;
                                }}
                                numberOfLines={1}
                                style={[styles.text_secondary, { flex: 1, borderBottomWidth: 1, borderBottomColor: SystemColorTheme.Secondary }]}
                                placeholder={`Enter supplier ${insertSupplierData.supplier_id_type}...`}
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                returnKeyType="next"
                                value={insertSupplierData.supplier_id}
                                onChangeText={(text) => setInsertSupplierData(prev => ({
                                    ...prev,
                                    supplier_id: text
                                }))}
                                onSubmitEditing={() => {
                                    insertSupplierRef.current["supplier_name"]?.focus();
                                }}
                                selectTextOnFocus
                            />
                        </View>
                        <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
                            <FontAwesome name="user" style={[styles.icon, { textAlignVertical: "center" }]} />
                            <TextInput
                                ref={(ref) => {
                                    insertSupplierRef.current["supplier_name"] = ref;
                                }}
                                numberOfLines={1}
                                style={[styles.text_secondary, { flex: 1, borderBottomWidth: 1, borderBottomColor: SystemColorTheme.Secondary }]}
                                placeholder={`Enter supplier name...`}
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                returnKeyType="next"
                                value={insertSupplierData.supplier_name}
                                onChangeText={(text) => setInsertSupplierData(prev => ({
                                    ...prev,
                                    supplier_name: text
                                }))}
                                onSubmitEditing={() => {
                                    insertSupplierRef.current["supplier_phone"]?.focus();
                                }}
                                selectTextOnFocus
                            />
                        </View>
                        <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
                            <FontAwesome name="phone" style={[styles.icon, { textAlignVertical: "center" }]} />
                            <TextInput
                                ref={(ref) => {
                                    insertSupplierRef.current["supplier_phone"] = ref;
                                }}
                                numberOfLines={1}
                                style={[styles.text_secondary, { flex: 1, borderBottomWidth: 1, borderBottomColor: SystemColorTheme.Secondary }]}
                                placeholder={`Enter supplier phone...`}
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                returnKeyType="next"
                                value={insertSupplierData.supplier_phone}
                                onChangeText={(text) => setInsertSupplierData(prev => ({
                                    ...prev,
                                    supplier_phone: text
                                }))}
                                onSubmitEditing={() => {
                                    insertSupplierRef.current["plate_no"]?.focus();
                                }}
                                selectTextOnFocus
                            />
                        </View>
                        <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
                            <FontAwesome name="car" style={[styles.icon, { textAlignVertical: "center" }]} />
                            <TextInput
                                ref={(ref) => {
                                    insertSupplierRef.current["plate_no"] = ref;
                                }}
                                numberOfLines={1}
                                style={[styles.text_secondary, { flex: 1, borderBottomWidth: 1, borderBottomColor: SystemColorTheme.Secondary }]}
                                placeholder={`Enter vehicle plate number...`}
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                returnKeyType="next"
                                value={insertSupplierData.plate_no}
                                onChangeText={(text) => setInsertSupplierData(prev => ({
                                    ...prev,
                                    plate_no: text
                                }))}
                                onSubmitEditing={() => {
                                    insertSupplierRef.current["supplier_address"]?.focus();
                                }}
                                selectTextOnFocus
                            />
                        </View>
                        <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
                            <FontAwesome name="map-marker" style={[styles.icon, { textAlignVertical: "center" }]} />
                            <TextInput
                                ref={(ref) => {
                                    insertSupplierRef.current["supplier_address"] = ref;
                                }}
                                numberOfLines={1}
                                style={[styles.text_secondary, { flex: 1, borderBottomWidth: 1, borderBottomColor: SystemColorTheme.Secondary }]}
                                placeholder={`Enter supplier address...`}
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                returnKeyType="next"
                                value={insertSupplierData.supplier_address}
                                onChangeText={(text) => setInsertSupplierData(prev => ({
                                    ...prev,
                                    supplier_address: text
                                }))}
                                onSubmitEditing={() => {
                                    insertSupplierRef.current["supplier_email"]?.focus();
                                }}
                                selectTextOnFocus
                            />
                        </View>
                        <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
                            <FontAwesome name="envelope" style={[styles.icon, { textAlignVertical: "center" }]} />
                            <TextInput
                                ref={(ref) => {
                                    insertSupplierRef.current["supplier_email"] = ref;
                                }}
                                numberOfLines={1}
                                style={[styles.text_secondary, { flex: 1, borderBottomWidth: 1, borderBottomColor: SystemColorTheme.Secondary }]}
                                placeholder={`Enter supplier email...`}
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                returnKeyType="next"
                                value={insertSupplierData.supplier_email}
                                onChangeText={(text) => setInsertSupplierData(prev => ({
                                    ...prev,
                                    supplier_email: text
                                }))}
                                onSubmitEditing={() => {
                                    insertSupplierRef.current["supplier_tin"]?.focus();
                                }}
                                selectTextOnFocus
                            />
                        </View>
                        <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
                            <FontAwesome name="dollar" style={[styles.icon, { textAlignVertical: "center" }]} />
                            <TextInput
                                ref={(ref) => {
                                    insertSupplierRef.current["supplier_tin"] = ref;
                                }}
                                numberOfLines={1}
                                style={[styles.text_secondary, { flex: 1, borderBottomWidth: 1, borderBottomColor: SystemColorTheme.Secondary }]}
                                placeholder={`Enter supplier TIN...`}
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                value={insertSupplierData.supplier_tin}
                                onChangeText={(text) => setInsertSupplierData(prev => ({
                                    ...prev,
                                    supplier_tin: text
                                }))}
                            />
                        </View>
                    </ScrollView>
                    <View style={{ alignItems: "flex-end", borderTopWidth: 1, borderColor: SystemColorTheme.Secondary, paddingTop: 10 }}>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <TouchableOpacity onPress={() => {
                                setInsertSupplierModalVisible(false);
                            }}>
                                <View style={[styles.button, styles.bg_danger]}>
                                    <Text style={styles.text_secondary}>Cancel</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                handleCreateSupplier();
                            }}>
                                <View style={[styles.button, styles.bg_info]}>
                                    <Text style={styles.text_secondary}>Save supplier</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <CalculatorModal visible={calcModalVisible} onClose={(value) => {
                if (isNullOrUndefined(configuringStock)) return;
                if (value === undefined) {
                    setCalcTarget(null);
                    setCalcModalVisible(false);
                    return;
                };
                if (calcTarget === "item_quantity") {
                    setConfiguringStock((prev) => ({
                        ...prev!,
                        quantity: value.toFixed(2)
                    }))
                }
                if (calcTarget === "item_price") {
                    setConfiguringStock((prev) => ({
                        ...prev!,
                        price: value.toFixed(2)
                    }))
                }
                setCalcTarget(null);
                setCalcModalVisible(false);
            }} />
        </KeyboardAvoidingView >
    )
}