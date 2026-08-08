import CalculatorModal from "@/app/components/CalculatorModal";
import HorizontalLine from "@/app/components/HorizontalLine";
import buyerKeys from "@/app/queries/buyer.keys";
import useBuyerList from "@/hooks/clients/buyers/useBuyerList";
import { useInsertBuyer } from "@/hooks/clients/buyers/useBuyerMutations";
import useStockList from "@/hooks/stock/useStockList";
import { useInsertSale } from "@/hooks/transactions/sales/useSaleMutations";
import PrintReceipt from "@/services/escPos/escposPrintReceipt";
import { styles } from "@/styles/_styles";
import SystemColorTheme from "@/styles/system-color-theme";
import { Buyer } from "@/types/clientType";
import type { Stock } from "@/types/stockType";
import type { SalesTransaction } from "@/types/transactionType";
import { FontAwesome } from "@expo/vector-icons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function SalesCreateScreen() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const insertBuyer = useInsertBuyer();
    const insertSale = useInsertSale();
    const [isPrinting, setIsPrinting] = useState<boolean>(false);
    const [stockModalVisible, setStockModalVisible] = useState<boolean>(false);
    const [configuringStock, setConfiguringStock] = useState<(Stock & { quantity: string, price: string }) | null>(null);
    const [buyerModalVisible, setBuyerModalVisible] = useState<boolean>(false);
    const [insertBuyerModalVisible, setInsertBuyerModalVisible] = useState<boolean>(false);
    const [calcModalVisible, setCalcModalVisible] = useState<boolean>(false);
    const [calcTarget, setCalcTarget] = useState<"item_quantity" | "item_price" | null>(null);

    const [itemSearch, setItemSearch] = useState<string>("");
    const [buyerSearchInput, setBuyerSearchInput] = useState<string>("");
    const [buyerSearchQuery, setBuyerSearchQuery] = useState<string>("");

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedBuyer, setSelectedBuyer] = useState<Pick<Buyer, "buyer_id" | "buyer_name">>();

    const { buyerList } = useBuyerList(1, 25, (buyerSearchQuery.trim() !== "" ? buyerSearchQuery : undefined));
    const { stockList } = useStockList(1, 1000, (itemSearch.trim() !== "" ? itemSearch : undefined));

    const buyers = buyerList.data?.data ?? [];
    const inventory = useMemo(() => (
        stockList.data?.data ?? []
    ), [stockList]);

    const [selectedItems, setSelectedItems] = useState<(Stock & { quantity: string, price: string })[]>([]);

    const [saleTransaction, setSaleTransaction] = useState<Omit<SalesTransaction, 'transact_id'>>({
        buyer_id: "",
        transact_total_amount: 0,
        transact_date: (new Date()).toISOString(),
        transact_status: "PAID",
    });

    const [totalPayable, setTotalPayable] = useState<string>("0.00");

    const transactStatusColor = useMemo(() => {
        switch (saleTransaction.transact_status) {
            case "PAID":
                return SystemColorTheme.Success;
            case "PARTIAL":
                return SystemColorTheme.Warning;
            case "UNPAID":
                return SystemColorTheme.Danger;
            default:
                return SystemColorTheme.Secondary;
        }
    }, [saleTransaction.transact_status]);

    const [formValidation, setFormValidation] = useState({
        buyer: true,
        items: true,
    });

    const [insertBuyerData, setInsertBuyerData] = useState<Buyer & { plate_no?: string }>({
        buyer_id_type: "NRIC",
        buyer_id: "",
        buyer_name: "",
        buyer_phone: "",
        plate_no: "",
    })

    const scrollRef = useRef<ScrollView>(null);
    const itemModalRef = useRef<Record<string, TextInput | null>>({});
    const insertBuyerRef = useRef<Record<string, TextInput | null>>({});

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
            value: new Date(saleTransaction.transact_date ?? new Date()),
            design: "material",
            onChange: (event, date) => {
                setSaleTransaction(prev => ({
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

    const handleSelectBuyer = (buyer: Buyer) => {
        setSelectedBuyer(buyer);
        setFormValidation(prev => ({
            ...prev,
            buyer: buyer !== undefined
        }));
        setBuyerModalVisible(false);
        setInsertBuyerModalVisible(false);
    };

    useEffect(() => {
        setSaleTransaction(prev => ({
            ...prev,
            transact_total_amount: selectedItems.length > 0 ?
                selectedItems.flatMap(stock => Number.parseFloat(stock.quantity) * Number.parseFloat(stock.price)).reduce((previous, current) => previous + current) :
                0
        }))
    }, [selectedItems]);

    const handleFormValidation = () => {
        const validation = {
            buyer: selectedBuyer !== undefined,
            items: selectedItems.length > 0
        };

        setFormValidation(validation);
        return !Object.values(validation).some(v => v === false);
    }

    const handleFormClose = async () => {
        setIsPrinting(false);
        setFormValidation({
            buyer: true,
            items: true
        });
        setSelectedBuyer(undefined);
        setSelectedItems([]);

        setInsertBuyerData({
            buyer_id_type: "NRIC",
            buyer_id: "",
            buyer_name: "",
            buyer_phone: "",
            plate_no: "",
        });

        setSaleTransaction({
            buyer_id: "",
            transact_total_amount: 0,
            transact_date: new Date().toISOString(),
            transact_status: "PAID"
        });

        setBuyerSearchInput("");
        setItemSearch("");
        setSelectedCategory(null);

        setBuyerModalVisible(false);
        setStockModalVisible(false);
        setCalcModalVisible(false);
        setCalcTarget(null);

        scrollRef.current?.scrollTo({
            y: 0,
            animated: false
        });

        await queryClient.invalidateQueries({
            queryKey: buyerKeys.lists()
        });
    };

    const handleSaveAndPrint = async (print: boolean) => {
        if (!handleFormValidation()) {
            Toast.show({
                type: "error",
                text1: "Form incomplete!"
            })
            return;
        }
        if (selectedBuyer === undefined || selectedBuyer.buyer_id.trim() === "") return;
        if (totalPayable.trim() === "") return;
        await insertSale.mutateAsync({
            header: {
                buyer_id: selectedBuyer.buyer_id,
                transact_status: saleTransaction.transact_status,
                transact_date: saleTransaction.transact_date,
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
                pathname: "/views/transactions/sales/SalesDetailScreen",
                params: { transact_id: res.header.transact_id }
            });
        })
    };

    const handleCreateBuyer = async () => {
        await insertBuyer.mutateAsync({
            buyer: {
                buyer_id_type: insertBuyerData.buyer_id_type,
                buyer_id: insertBuyerData.buyer_id,
                buyer_name: insertBuyerData.buyer_name,
                buyer_phone: insertBuyerData.buyer_phone,
                buyer_address: insertBuyerData.buyer_address,
                buyer_email: insertBuyerData.buyer_email,
                buyer_tin: insertBuyerData.buyer_tin
            },
            vehicles: insertBuyerData.plate_no !== undefined && insertBuyerData.plate_no?.trim() !== "" ?
                [{
                    buyer_id: insertBuyerData.buyer_id,
                    plate_no: insertBuyerData.plate_no
                }] :
                []
        }).then((res) => {
            if (res.data !== undefined) {
                setInsertBuyerModalVisible(false);
                setBuyerModalVisible(false);
                Toast.show({
                    type: "success",
                    text1: "Insert success",
                    text2: "Successfully created new buyer!"
                });
                setSelectedBuyer({
                    buyer_id: res.data[0].buyer_id,
                    buyer_name: res.data[0].buyer_name,
                });
            } else {
                setInsertBuyerModalVisible(false);
                setBuyerModalVisible(false);
                Toast.show({
                    type: "error",
                    text1: "Insert failed",
                    text2: "Failed to create new buyer"
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
                                        saleTransaction.transact_date !== undefined ?
                                            new Date(saleTransaction.transact_date).toLocaleDateString("en-CA") :
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
                            onChange={(item) => setSaleTransaction(prev => ({
                                ...prev,
                                transact_status: item.value
                            }))}
                            selectedTextStyle={[styles.text_secondary, { textAlign: "center" }]}
                            renderLeftIcon={() => (
                                <FontAwesome name="credit-card" style={[styles.icon, { color: transactStatusColor }]} />
                            )}
                            value={saleTransaction.transact_status}
                        />
                    </View>
                </View>
                <TouchableOpacity onPress={() => setBuyerModalVisible(true)}>
                    <View style={{ flexDirection: "row", gap: 10, alignContent: "center", padding: 5, borderBottomWidth: 1, borderColor: formValidation.buyer ? SystemColorTheme.Secondary : SystemColorTheme.Danger }}>
                        <FontAwesome name="user" style={{ fontSize: 24, color: SystemColorTheme.Secondary }} />
                        <View style={{ flex: 1 }}>
                            <Text numberOfLines={1} style={selectedBuyer !== undefined ? styles.text_secondary : styles.text_placeholder}>
                                {selectedBuyer !== undefined ? selectedBuyer.buyer_name : "Buyer..."}
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
                                    <ScrollView style={{ flex: 1 }}>
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
                                    </ScrollView>
                                ) : (
                                    <ScrollView style={{ flex: 1 }}>
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
                                    </ScrollView>
                                )
                            )}
                        </>
                    ) : (
                        <>
                            <View style={[styles.modalBody, { alignContent: "center", justifyContent: "center", marginBottom: "10%" }]}>
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
                                                style={[styles.border, { height: "100%", paddingHorizontal: 10, justifyContent: "center" }]}
                                                onPress={() => {
                                                    setCalcTarget("item_quantity");
                                                    setCalcModalVisible(true);
                                                }}
                                            >
                                                <FontAwesome name="calculator" style={[styles.icon]} />
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
                                                style={[styles.border, { height: "100%", paddingHorizontal: 10, justifyContent: "center" }]}
                                                onPress={() => {
                                                    setCalcTarget("item_price");
                                                    setCalcModalVisible(true);
                                                }}
                                            >
                                                <FontAwesome name="calculator" style={[styles.icon]} />
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
            <Modal visible={buyerModalVisible} onRequestClose={() => {
                setBuyerModalVisible(false);
                setInsertBuyerModalVisible(false);
            }}>
                <SafeAreaView style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Buyer</Text>
                        <TouchableOpacity onPress={() => {
                            setBuyerModalVisible(false);
                            setInsertBuyerModalVisible(false);
                        }}>
                            <FontAwesome name="close" style={styles.icon} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: "row", gap: 10, margin: 5 }}>
                        <TouchableOpacity onPress={() => {
                            setInsertBuyerModalVisible(true);
                        }}>
                            <View style={[styles.button, { flexDirection: "row", marginVertical: 0 }]}>
                                <FontAwesome name="user" style={styles.icon} />
                                <FontAwesome name="plus" style={[styles.icon, { fontSize: 10 }]} />
                            </View>
                        </TouchableOpacity>
                        <View style={[styles.border, { flex: 1, flexDirection: "row", gap: 10, paddingHorizontal: 10, alignContent: "center", alignItems: "center" }]}>
                            <FontAwesome name="search" style={styles.icon} />
                            <TextInput
                                value={buyerSearchInput}
                                placeholder="Search buyer..."
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                style={[styles.text_secondary, { flex: 1 }]}
                                maxLength={30}
                                onChangeText={setBuyerSearchInput}
                                onSubmitEditing={() => {
                                    setBuyerSearchQuery(buyerSearchInput)
                                }}
                            />
                            {buyerSearchInput.trim() !== "" && (
                                <TouchableOpacity onPress={() => {
                                    setBuyerSearchInput("");
                                    setBuyerSearchQuery("");
                                }}>
                                    <FontAwesome name="close" style={styles.icon} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    {buyerList.isLoading ? (
                        <View style={{ flex: 1, justifyContent: "center" }}>
                            <Text style={[styles.text_secondary, { textAlign: "center" }]}>Loading...</Text>
                        </View>
                    ) : (
                        <ScrollView style={{ margin: 5 }}>
                            {buyers.length === 0 && (
                                <View style={{ flex: 1, justifyContent: "center" }}>
                                    {buyerSearchQuery.trim() !== "" ? (
                                        <Text style={styles.text_placeholder}>{`Search "${buyerSearchQuery}" returned no result`}</Text>
                                    ) : (
                                        <Text style={styles.text_placeholder}>No buyers found</Text>
                                    )}
                                </View>
                            )}
                            {buyers.map((buyer, index) => (
                                <TouchableOpacity
                                    key={buyer.buyer_id}
                                    onPress={() => {
                                        handleSelectBuyer(buyer);
                                    }}>
                                    <View
                                        key={buyer.buyer_id}
                                        style={[
                                            styles.bg_primary, {
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                                marginBottom: (index !== buyers.length - 1) ? 2 : undefined,
                                                padding: 5
                                            }]}>
                                        <View>
                                            <View style={{ flexDirection: "row", gap: 5, padding: 5 }}>
                                                <FontAwesome name="user" style={[styles.icon, { alignSelf: "center" }]} />
                                                <Text numberOfLines={5} style={[styles.text_secondary, { textAlignVertical: "center", maxWidth: "60%" }]}>
                                                    {buyer.buyer_name} | {buyer.buyer_id}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: "row", gap: 5, padding: 5 }}>
                                                <FontAwesome name="phone" style={[styles.icon, { alignSelf: "center" }]} />
                                                <Text numberOfLines={1} style={[styles.text_secondary, { textAlignVertical: "center" }]}>
                                                    {buyer.buyer_phone}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: "row", gap: 5, padding: 5, maxWidth: "50%" }}>
                                                <FontAwesome name="car" style={[styles.icon, { alignSelf: "center" }]} />
                                                {buyer.plate_no.map(plate => (
                                                    <View key={`${buyer.buyer_id}_${plate}`} style={[styles.border, { alignContent: "center", backgroundColor: SystemColorTheme.Background, padding: 5 }]}>
                                                        <Text numberOfLines={1} style={[styles.text_secondary, { textAlignVertical: "center" }]}>
                                                            {plate}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                        <View style={{ alignSelf: "center" }}>
                                            <Text numberOfLines={1} style={styles.text_secondary}>{!isNullOrUndefined(buyer.last_transact_date) && new Date(buyer.last_transact_date!).toLocaleDateString("en-GB")}</Text>
                                        </View>
                                    </View>

                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </SafeAreaView>
            </Modal >

            <Modal visible={insertBuyerModalVisible} onRequestClose={() => {
                setInsertBuyerModalVisible(false);
                setInsertBuyerData({
                    buyer_id: "",
                    buyer_id_type: "NRIC",
                    buyer_name: "",
                    buyer_phone: "",
                });
            }}>
                <View style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add Buyer</Text>
                        <TouchableOpacity onPress={() => {
                            setInsertBuyerModalVisible(false)
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
                                value={insertBuyerData.buyer_id_type}
                                onChange={(text) => setInsertBuyerData(prev => ({
                                    ...prev,
                                    buyer_id_type: text.value
                                }))}
                                selectedTextStyle={[styles.text_secondary, { textAlign: "center" }]}
                                style={[styles.border, { width: 125 }]}
                            />
                            <TextInput
                                ref={(ref) => {
                                    insertBuyerRef.current["buyer_id"] = ref;
                                }}
                                numberOfLines={1}
                                style={[styles.text_secondary, { flex: 1, borderBottomWidth: 1, borderBottomColor: SystemColorTheme.Secondary }]}
                                placeholder={`Enter buyer ${insertBuyerData.buyer_id_type}...`}
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                returnKeyType="next"
                                value={insertBuyerData.buyer_id}
                                onChangeText={(text) => setInsertBuyerData(prev => ({
                                    ...prev,
                                    buyer_id: text
                                }))}
                                onSubmitEditing={() => {
                                    insertBuyerRef.current["buyer_name"]?.focus();
                                }}
                                selectTextOnFocus
                            />
                        </View>
                        <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
                            <FontAwesome name="user" style={[styles.icon, { textAlignVertical: "center" }]} />
                            <TextInput
                                ref={(ref) => {
                                    insertBuyerRef.current["buyer_name"] = ref;
                                }}
                                numberOfLines={1}
                                style={[styles.text_secondary, { flex: 1, borderBottomWidth: 1, borderBottomColor: SystemColorTheme.Secondary }]}
                                placeholder={`Enter buyer name...`}
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                returnKeyType="next"
                                value={insertBuyerData.buyer_name}
                                onChangeText={(text) => setInsertBuyerData(prev => ({
                                    ...prev,
                                    buyer_name: text
                                }))}
                                onSubmitEditing={() => {
                                    insertBuyerRef.current["buyer_phone"]?.focus();
                                }}
                                selectTextOnFocus
                            />
                        </View>
                        <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
                            <FontAwesome name="phone" style={[styles.icon, { textAlignVertical: "center" }]} />
                            <TextInput
                                ref={(ref) => {
                                    insertBuyerRef.current["buyer_phone"] = ref;
                                }}
                                numberOfLines={1}
                                style={[styles.text_secondary, { flex: 1, borderBottomWidth: 1, borderBottomColor: SystemColorTheme.Secondary }]}
                                placeholder={`Enter buyer phone...`}
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                returnKeyType="next"
                                value={insertBuyerData.buyer_phone}
                                onChangeText={(text) => setInsertBuyerData(prev => ({
                                    ...prev,
                                    buyer_phone: text
                                }))}
                                onSubmitEditing={() => {
                                    insertBuyerRef.current["plate_no"]?.focus();
                                }}
                                selectTextOnFocus
                            />
                        </View>
                        <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
                            <FontAwesome name="car" style={[styles.icon, { textAlignVertical: "center" }]} />
                            <TextInput
                                ref={(ref) => {
                                    insertBuyerRef.current["plate_no"] = ref;
                                }}
                                numberOfLines={1}
                                style={[styles.text_secondary, { flex: 1, borderBottomWidth: 1, borderBottomColor: SystemColorTheme.Secondary }]}
                                placeholder={`Enter vehicle plate number...`}
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                returnKeyType="next"
                                value={insertBuyerData.plate_no}
                                onChangeText={(text) => setInsertBuyerData(prev => ({
                                    ...prev,
                                    plate_no: text
                                }))}
                                onSubmitEditing={() => {
                                    insertBuyerRef.current["buyer_address"]?.focus();
                                }}
                                selectTextOnFocus
                            />
                        </View>
                        <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
                            <FontAwesome name="map-marker" style={[styles.icon, { textAlignVertical: "center" }]} />
                            <TextInput
                                ref={(ref) => {
                                    insertBuyerRef.current["buyer_address"] = ref;
                                }}
                                numberOfLines={1}
                                style={[styles.text_secondary, { flex: 1, borderBottomWidth: 1, borderBottomColor: SystemColorTheme.Secondary }]}
                                placeholder={`Enter buyer address...`}
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                returnKeyType="next"
                                value={insertBuyerData.buyer_address}
                                onChangeText={(text) => setInsertBuyerData(prev => ({
                                    ...prev,
                                    buyer_address: text
                                }))}
                                onSubmitEditing={() => {
                                    insertBuyerRef.current["buyer_email"]?.focus();
                                }}
                                selectTextOnFocus
                            />
                        </View>
                        <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
                            <FontAwesome name="envelope" style={[styles.icon, { textAlignVertical: "center" }]} />
                            <TextInput
                                ref={(ref) => {
                                    insertBuyerRef.current["buyer_email"] = ref;
                                }}
                                numberOfLines={1}
                                style={[styles.text_secondary, { flex: 1, borderBottomWidth: 1, borderBottomColor: SystemColorTheme.Secondary }]}
                                placeholder={`Enter buyer email...`}
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                returnKeyType="next"
                                value={insertBuyerData.buyer_email}
                                onChangeText={(text) => setInsertBuyerData(prev => ({
                                    ...prev,
                                    buyer_email: text
                                }))}
                                onSubmitEditing={() => {
                                    insertBuyerRef.current["buyer_tin"]?.focus();
                                }}
                                selectTextOnFocus
                            />
                        </View>
                        <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
                            <FontAwesome name="dollar" style={[styles.icon, { textAlignVertical: "center" }]} />
                            <TextInput
                                ref={(ref) => {
                                    insertBuyerRef.current["buyer_tin"] = ref;
                                }}
                                numberOfLines={1}
                                style={[styles.text_secondary, { flex: 1, borderBottomWidth: 1, borderBottomColor: SystemColorTheme.Secondary }]}
                                placeholder={`Enter buyer TIN...`}
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                value={insertBuyerData.buyer_tin}
                                onChangeText={(text) => setInsertBuyerData(prev => ({
                                    ...prev,
                                    buyer_tin: text
                                }))}
                            />
                        </View>
                    </ScrollView>
                    <View style={{ alignItems: "flex-end", borderTopWidth: 1, borderColor: SystemColorTheme.Secondary, paddingTop: 10 }}>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <TouchableOpacity onPress={() => {
                                setInsertBuyerModalVisible(false);
                            }}>
                                <View style={[styles.button, styles.bg_danger]}>
                                    <Text style={styles.text_secondary}>Cancel</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                handleCreateBuyer();
                            }}>
                                <View style={[styles.button, styles.bg_info]}>
                                    <Text style={styles.text_secondary}>Save buyer</Text>
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