import useStockDetails from "@/hooks/stock/useStockDetails";
import useStockList from "@/hooks/stock/useStockList";
import { useUpdateStock } from "@/hooks/stock/useStockMutations";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import type * as StockTypes from "@/types/stockType";
import FontAwesome from "@expo/vector-icons/FontAwesome";
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

export default function StockDetailScreen() {
    const router = useRouter();
    const { stock_id } = useLocalSearchParams<{stock_id?: string}>();
    const updateStock = useUpdateStock();

    if (!stock_id || stock_id.trim() === "") {
        return (
            <View style={[styles.container, {justifyContent: "center"}]}>
                <Text style={styles.text_secondary}>Invalid stock_id</Text>
                <Link
                href="/views/stock/inventory"
                style={[styles.text_secondary, {textDecorationLine: "underline"}]}>
                    Go back
                </Link>
            </View>
        );
    }

    useFocusEffect(
        useCallback(() => {
            return () => {
                handleFormClose();
            }
        }, [])
    );

    const scrollRef = useRef<ScrollView>(null);
    const fieldRefs = useRef<Record<string, number>>({});

    const focusField = (y: number) => {
        scrollRef.current?.scrollTo({
            y: y - 200,
            animated: true
        });
    };

    const handleUpdate = async () => {
        const stockPayload = {
            stock_id: stockData?.stock_id,
            stock_description: stockData?.stock_description,
            stock_uom: stockData?.stock_uom,
            stock_category: stockData?.stock_category,
            current_quantity: Number.parseFloat(stockData?.current_quantity ?? "0"),
        };

        const pricesPayload = {
            stock_id: stockData!.stock_id,
            buy_price: Number.parseFloat(prices?.buy_price  ?? "0"),
            sell_price: Number.parseFloat(prices?.sell_price ?? "0"),
            effective_date: new Date().toISOString(),
        };
        
        const update = await updateStock.mutateAsync({
            stock_id: stock_id,
            stock: stockPayload,
            prices: pricesPayload,
        });

        return update;
    };

    const handleUpdateAndClose = async () => {
        await handleUpdate();
        await handleFormClose();
        await router.replace("/views/stock/inventory");
    }

    const handleCancel = async () => {
        await handleFormClose();
        await router.push("/views/stock/inventory");
    }

    const handleFormClose = async () => {
        setStockData({
            stock_id: "",
            stock_category: "",
            stock_description: "",
            stock_uom: "KG",
            current_quantity: "0",
        });
        setPrices({
            buy_price: "0",
            sell_price: "0",
        });
        scrollRef.current?.scrollTo({
            y: 0,
            animated: false
        });
    }

    const { stockList: {data: stockList} } = useStockList();
    const { data: stockDetails } = useStockDetails(stock_id);
    const stockCategories = [...new Set(stockList?.map(s => s.stock_category))];
    const [categoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);
    const [categorySearch, setCategorySearch] = useState<string>("");

    const [prices, setPrices] = useState<{
        buy_price: string;
        sell_price: string;
    }>();

    const [stockData, setStockData] = useState<Omit<StockTypes.Stock, "current_quantity"> & {current_quantity: string}>({
        stock_id: stock_id ?? "",
        stock_category: "",
        stock_description: "",
        stock_uom: "KG",
        current_quantity: "0",
    });

    useEffect(() => {
        if (stockDetails?.stock?.stock_id !== undefined) {
            setStockData({
                ...stockDetails?.stock,
                current_quantity: stockDetails?.stock.current_quantity?.toString() ?? "0",
            });
            const sortedPrices = [...stockDetails.priceHistory].sort((a, b) => {
                return (
                    new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
                );
            });
            setPrices({
                buy_price: sortedPrices[0].buy_price.toString(),
                sell_price: sortedPrices[0].sell_price.toString(),
            });
        };
    }, [stockDetails]);

    if (stockData.stock_id === "") {
        return (
            <View
                style={{
                    backgroundColor: SystemColorTheme.Background,
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1
                }}
            >
                <Text style={styles.text_secondary}>Loading...</Text>
            </View>
        )
    }

    function normalizeAmounts(input: number | string) {
        switch (typeof input) {
            case "string":
                return Number.parseFloat(input).toFixed(2);
            case "number":
                return input.toFixed(2);
        }
    };

    return (
        <>
            <Stack.Screen options={{ title: `Stock Details - ${stock_id}` }} />

            <SafeAreaView
                style={{ flex: 1, backgroundColor: SystemColorTheme.Background }}
                edges={["bottom"]}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={
                        Platform.OS === "ios" || Platform.OS === "android"
                            ? "padding"
                            : undefined
                    }
                >
                    <ScrollView
                        ref={scrollRef}
                        contentContainerStyle={styles.formContainer}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                    >
                        {/* Stock Info */}
                        <View style={styles.categoryContainer}>

                            {/* Stock ID */}
                            <View
                                onLayout={(e) => {
                                    fieldRefs.current["stock_id"] =
                                        e.nativeEvent.layout.y;
                                }}
                                style={{
                                    flexDirection: "row",
                                    gap: 8,
                                    alignItems: "center"
                                }}
                            >
                                <Text style={styles.text_secondary}>
                                    Stock ID:
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    value={stockData.stock_id}
                                    onChangeText={(text) => {
                                        setStockData((prev) => prev ? {
                                            ...prev,
                                            stock_id: text
                                        } : prev)
                                    }}
                                />

                            </View>
                            
                            {/* Category */}
                            <View
                                onLayout={(e) => {
                                    fieldRefs.current["stock_category"] =
                                        e.nativeEvent.layout.y;
                                }}
                                style={{
                                    flexDirection: "row",
                                    gap: 8,
                                    alignItems: "center"
                                }}
                            >
                                <Text style={styles.text_secondary}>
                                    Category:
                                </Text>

                                <TextInput
                                    placeholder="Enter stock category..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={stockData.stock_category ?? ""}
                                    onChangeText={(text) =>
                                        setStockData((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    stock_category: text
                                                }
                                                : prev
                                        )
                                    }
                                    style={styles.input}
                                    onFocus={() => {
                                        const y =
                                            fieldRefs.current["stock_category"];

                                        if (y !== undefined) {
                                            focusField(y);
                                        }
                                    }}
                                />

                                <Pressable
                                    style={[
                                        styles.button,
                                        { paddingHorizontal: 10 }
                                    ]}
                                    onPress={() =>
                                        setCategoryModalVisible(true)
                                    }
                                >
                                    <FontAwesome
                                        name="search"
                                        color={SystemColorTheme.Secondary}
                                        size={20}
                                    />
                                </Pressable>
                            </View>

                            {/* Description */}
                            <View
                                onLayout={(e) => {
                                    fieldRefs.current["stock_description"] =
                                        e.nativeEvent.layout.y;
                                }}
                                style={{
                                    flexDirection: "row",
                                    gap: 8,
                                    alignItems: "center"
                                }}
                            >
                                <Text style={styles.text_secondary}>
                                    Description:
                                </Text>

                                <TextInput
                                    placeholder="Stock description..."
                                    placeholderTextColor={
                                        SystemColorTheme.Primary
                                    }
                                    value={stockData.stock_description}
                                    onChangeText={(text) =>
                                        setStockData((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    stock_description: text
                                                }
                                                : prev
                                        )
                                    }
                                    style={styles.input}
                                    onFocus={() => {
                                        const y =
                                            fieldRefs.current[
                                                "stock_description"
                                            ];

                                        if (y !== undefined) {
                                            focusField(y);
                                        }
                                    }}
                                />
                            </View>

                            {/* UOM */}
                            <View>
                                <Text style={styles.text_secondary}>
                                    Unit of measurement
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.inputRow,
                                    {
                                        alignItems: "center",
                                        gap: 8
                                    }
                                ]}
                            >
                                {(["KG", "PC"] as const).map((type) => (
                                    <Pressable
                                        key={type}
                                        style={[
                                            styles.button,
                                            styles.formSelectButtons,

                                            stockData.stock_uom === type && {
                                                backgroundColor:
                                                    SystemColorTheme.Secondary
                                            }
                                        ]}
                                        onPress={() => {
                                            setStockData((prev) =>
                                                prev
                                                    ? {
                                                        ...prev,
                                                        stock_uom: type
                                                    }
                                                    : prev
                                            );
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.buttonText,

                                                stockData.stock_uom === type && {
                                                    color:
                                                        SystemColorTheme.Primary
                                                }
                                            ]}
                                        >
                                            {type}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            {/* Quantity */}
                            <View
                                onLayout={(e) => {
                                    fieldRefs.current["current_quantity"] =
                                        e.nativeEvent.layout.y;
                                }}
                                style={{
                                    flexDirection: "row",
                                    gap: 8,
                                    alignItems: "center"
                                }}
                            >
                                <Text style={styles.text_secondary}>
                                    Current quantity:
                                </Text>

                                <TextInput
                                    placeholder="Current quantity..."
                                    placeholderTextColor={
                                        SystemColorTheme.Primary
                                    }
                                    value={stockData.current_quantity.toString()}
                                    keyboardType={
                                        Platform.OS === "ios"
                                            ? "decimal-pad"
                                            : "numeric"
                                    }
                                    onChangeText={(text) =>
                                        setStockData((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    current_quantity:
                                                        text === ""
                                                            ? "0" : text.replace(/[^0-9.]/g, "")
                                                }
                                                : prev
                                        )
                                    }
                                    onBlur={() => setStockData((prev) =>
                                        prev
                                        ? {
                                            ...prev,
                                            current_quantity: normalizeAmounts(prev.current_quantity)
                                        } : prev
                                    )}
                                    style={styles.input}
                                    onFocus={() => {
                                        const y =
                                            fieldRefs.current[
                                                "current_quantity"
                                            ];

                                        if (y !== undefined) {
                                            focusField(y);
                                        }
                                    }}
                                />
                            </View>

                            {/* Buy Price */}
                            <View
                                onLayout={(e) => {
                                    fieldRefs.current["buy_price"] =
                                        e.nativeEvent.layout.y;
                                }}
                                style={{
                                    flexDirection: "row",
                                    gap: 8,
                                    alignItems: "center"
                                }}
                            >
                                <Text style={styles.text_secondary}>
                                    Buy price (RM):
                                </Text>

                                <TextInput
                                    placeholder="Buy Price (RM)..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={prices?.buy_price ?? ""}
                                    keyboardType={
                                        Platform.OS === "ios"
                                            ? "decimal-pad"
                                            : "numeric"
                                    }
                                    onChangeText={(text) =>
                                        setPrices((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    buy_price: text === "" ? "9" : text.replace(/[^0-9.]/g, "")
                                                }
                                                : prev
                                        )
                                    }
                                    onBlur={() => setPrices((prev) =>
                                        prev
                                        ? {
                                            ...prev,
                                            buy_price: normalizeAmounts(prev.buy_price)
                                        } : prev
                                    )}
                                    style={styles.input}
                                    onFocus={() => {
                                        const y = fieldRefs.current["buy_price"];
                                        if (y !== undefined) focusField(y);
                                    }}
                                />
                            </View>

                            {/* Sell Price */}
                            <View
                                onLayout={(e) => {
                                    fieldRefs.current["sell_price"] =
                                        e.nativeEvent.layout.y;
                                }}
                                style={{
                                    flexDirection: "row",
                                    gap: 8,
                                    alignItems: "center"
                                }}
                            >
                                <Text style={styles.text_secondary}>
                                    Sell price (RM):
                                </Text>

                                <TextInput
                                    placeholder="Sell Price (RM)..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={prices?.sell_price ?? "0"}
                                    keyboardType={
                                        Platform.OS === "ios"
                                            ? "decimal-pad"
                                            : "numeric"
                                    }
                                    onChangeText={(text) =>
                                        setPrices((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    sell_price: text === "" ? "0" : text.replace(/[^0-9.]/g, "")
                                                }
                                                : prev
                                        )
                                    }
                                    onBlur={() => setPrices((prev) =>
                                        prev
                                        ? {
                                            ...prev,
                                            sell_price: normalizeAmounts(prev.sell_price)
                                        } : prev
                                    )}
                                    style={styles.input}
                                    onFocus={() => {
                                        const y = fieldRefs.current["sell_price"];
                                        if (y !== undefined) focusField(y);
                                    }}
                                />
                            </View>

                            {/* Actions */}
                            <View style={styles.inputRow}>
                                <Pressable
                                    style={[
                                        styles.button,
                                        styles.formSelectButtons,
                                        styles.bg_danger
                                    ]}
                                    onPress={handleCancel}
                                >
                                    <Text style={styles.buttonText}>
                                        Cancel
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={[
                                        styles.button,
                                        styles.formSelectButtons
                                    ]}
                                    onPress={handleUpdate}
                                >
                                    <FontAwesome
                                        name="save"
                                        style={styles.buttonIcon}
                                        color={SystemColorTheme.Secondary}
                                        size={20}
                                    />

                                    <Text style={styles.buttonText}>
                                        Update Stock
                                    </Text>
                                </Pressable>

                            </View>
                            <Pressable
                                style={[
                                    styles.button,
                                ]}
                                onPress={handleUpdateAndClose}
                            >
                                <FontAwesome
                                    name="save"
                                    style={styles.buttonIcon}
                                    color={SystemColorTheme.Secondary}
                                    size={20}
                                />

                                <Text style={styles.buttonText}>
                                    Update & Close
                                </Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                    <Modal visible={categoryModalVisible} animationType="slide" onRequestClose={() => {
                        setCategoryModalVisible(false);
                        setCategorySearch("");
                    }}>
                        <SafeAreaView style={{ flex: 1, backgroundColor: SystemColorTheme.Background }}>
                            {/* Header */}
                            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16 }}>
                                <Text style={[styles.text_secondary, { fontSize: 20 }]}>
                                    Select Supplier
                                </Text>

                                <Pressable onPress={() => {
                                    setCategoryModalVisible(false);
                                    setCategorySearch("");
                                }}>
                                    <FontAwesome name="close" size={20} color={SystemColorTheme.Secondary} />
                                </Pressable>
                            </View>

                            {/* Search */}
                            <TextInput
                                placeholder="Search supplier..."
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                value={categorySearch}
                                onChangeText={setCategorySearch}
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
                                data={stockCategories.filter((s) => {
                                    const q = categorySearch.toLowerCase();

                                    return s?.toLowerCase().includes(q);
                                })}
                                ListEmptyComponent={
                                    <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                                        <Text style={styles.text_secondary}>No results</Text>
                                    </View>
                                }
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => {
                                            setStockData((prev) =>
                                                prev
                                                    ? {
                                                        ...prev,
                                                        stock_category: item,
                                                    }
                                                    : prev
                                            );

                                            setCategoryModalVisible(false);
                                        }}
                                    >
                                        <View
                                            style={{
                                                padding: 16,
                                                backgroundColor: SystemColorTheme.Primary,
                                                margin: 5,
                                                borderRadius: 10,
                                            }}
                                        >
                                            <Text style={styles.text_secondary}>
                                                {item}
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
}