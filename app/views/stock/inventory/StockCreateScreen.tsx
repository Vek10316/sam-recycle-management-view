import useStockList from "@/hooks/stock/useStockList";
import { useCreateStock } from "@/hooks/stock/useStockMutations";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import type * as StockTypes from "@/types/stockType";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
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

export default function StockCreateScreen() {
    const router = useRouter();
    const createStock = useCreateStock();
    const { stockList } = useStockList();
    const stockCategories = useMemo(() => {
        return [...new Set(stockList.data?.map(s => s.stock_category))]
    }, [stockList]);
    const [categoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);
    const [categorySearch, setCategorySearch] = useState<string>("");

    const [prices, setPrices] = useState<{
        buy_price: string;
        sell_price: string;
    }>({
        buy_price: "0",
        sell_price: "0",
    });

    const [stockData, setStockData] = useState<Omit<StockTypes.Stock, "current_quantity"> & { current_quantity: string }>({
        stock_id: "",
        stock_category: "",
        stock_uom: "KG",
        stock_description: "",
        current_quantity: "0",
    });

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

    const handleInsert = async () => {
        if (stockData?.stock_id.trim() === "") {
            alert("Please enter Stock ID!");
            return;
        }

        const payload: { stock: StockTypes.Stock, prices: Omit<StockTypes.StockPricingHistory, "history_id"> } = {
            stock: {
                stock_id: stockData!.stock_id,
                stock_description: stockData?.stock_description ?? "",
                stock_uom: stockData?.stock_uom ?? "KG",
                stock_category: stockData?.stock_category ?? "",
                current_quantity: Number.parseFloat(stockData?.current_quantity ?? "0"),
            },
            prices: {
                stock_id: stockData!.stock_id,
                buy_price: Number.parseFloat(prices?.buy_price ?? "0"),
                sell_price: Number.parseFloat(prices?.sell_price ?? "0"),
                effective_date: new Date().toISOString(),
            }
        }

        return await createStock.mutateAsync(payload);
    };

    const handleCancel = async () => {
        await handleFormClose();
        await router.push("/views/stock/inventory");
    }

    const handleFormClose = () => {
        setStockData({
            stock_id: "",
            stock_category: "",
            stock_description: "",
            stock_uom: "KG",
            current_quantity: "0",
        });
        setPrices({
            buy_price: "0.00",
            sell_price: "0.00",
        });
        scrollRef.current?.scrollTo({
            y: 0,
            animated: false
        });
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
            <Stack.Screen options={{ title: `New Stock` }} />

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
                                    id="inputStockID"
                                    placeholder="Enter stock ID..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={stockData?.stock_id ?? ""}
                                    onChangeText={(text) =>
                                        setStockData((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    stock_id: text
                                                }
                                                : prev
                                        )
                                    }
                                    style={styles.input}
                                    onFocus={(e) => {
                                        const y =
                                            fieldRefs.current["stock_id"];

                                        if (y !== undefined) {
                                            focusField(y);
                                        }
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
                                    value={stockData?.stock_category ?? ""}
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
                                        SystemColorTheme.Placeholder
                                    }
                                    value={stockData?.stock_description ?? ""}
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
                                    Unit of measurement:
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

                                            stockData!.stock_uom === type && {
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

                                                stockData!.stock_uom === type && {
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
                                    value={stockData?.current_quantity.toString() ?? "0"}
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
                                                    current_quantity: text.replace(/[^0-9.-]/g, "")
                                                } : prev
                                        )
                                    }
                                    onBlur={() => {
                                        setStockData((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    current_quantity: normalizeAmounts(prev.current_quantity)
                                                } : prev
                                        )
                                    }}
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
                                    value={prices?.buy_price ?? "0"}
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
                                                    buy_price: text.replace(/[^0-9.]/g, "")
                                                }
                                                : prev
                                        )
                                    }
                                    onBlur={() => {
                                        setPrices((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    buy_price: normalizeAmounts(prev.buy_price)
                                                } : prev
                                        )
                                    }}
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
                                                    sell_price: text.replace(/[^0-9.]/g, "")
                                                } : prev
                                        )
                                    }
                                    onBlur={() => {
                                        setPrices((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    sell_price: normalizeAmounts(prev.sell_price)
                                                } : prev
                                        )
                                    }}
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
                                    onPress={handleInsert}
                                >
                                    <FontAwesome
                                        name="save"
                                        style={styles.buttonIcon}
                                        color={SystemColorTheme.Secondary}
                                        size={20}
                                    />

                                    <Text style={styles.buttonText}>
                                        Save Stock
                                    </Text>
                                </Pressable>
                            </View>
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
                                    Select Category
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
                                placeholder="Search category..."
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
                                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                        <Text style={styles.text_secondary}>No result</Text>
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