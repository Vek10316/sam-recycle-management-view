import LoadingScreen from "@/app/components/LoadingScreen";
import useStockList from "@/hooks/stock/useStockList";
import { useCreateStock } from "@/hooks/stock/useStockMutations";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import type * as StockTypes from "@/types/stockType";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function StockCreateScreen() {
    const router = useRouter();

    const [stockData, setStockData] = useState<Omit<StockTypes.Stock, "current_quantity"> & { current_quantity: string }>({
        stock_id: "",
        stock_category: "",
        stock_uom: "KG",
        stock_description: "",
        current_quantity: "0.00",
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
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const dropdownRef = useRef<any>(null);

    const focusField = (y: number) => {
        scrollRef.current?.scrollTo({
            y: y - 200,
            animated: true
        });
    };

    const handleInsert = async () => {
        if (!handleFormValidation()) return;

        const payload: { stock: StockTypes.Stock, prices: Omit<StockTypes.StockPricingHistory, "history_id"> } = {
            stock: {
                stock_id: stockData!.stock_id,
                stock_description: stockData?.stock_description ?? "",
                stock_uom: stockData?.stock_uom ?? "KG",
                stock_category: stockData?.stock_category ?? "",
                current_quantity: Number.parseFloat(stockData?.current_quantity ?? "0.00"),
            },
            prices: {
                stock_id: stockData!.stock_id,
                buy_price: Number.parseFloat(prices?.buy_price ?? "0.00"),
                sell_price: Number.parseFloat(prices?.sell_price ?? "0.00"),
                effective_date: new Date().toISOString(),
            }
        }

        await createStock.mutateAsync(payload).then((res) => {
            if (res !== undefined && res.stock.stock_id.trim() !== "") {
                router.push({
                    pathname: "/views/stock/inventory/StockDetailScreen",
                    params: {
                        stock_id: res.stock.stock_id
                    }
                })
            }
        });
    };

    const createStock = useCreateStock();
    const { categories } = useStockList(1, 100);
    const [createNewCategory, setCreateNewCategory] = useState<boolean>(false);
    const [categorySearch, setCategorySearch] = useState<string>("");
    const stockCategories = categories.data !== undefined ? [
        ...categories.data.data,
        "CUSTOM"
    ] : ["CUSTOM"]
    const [formValidation, setFormValidation] = useState({
        stock_id: true,
        stock_category: true,
        current_quantity: true,
        buy_price: true,
        sell_price: true,
    });

    const handleFormValidation = () => {
        const validation = {
            stock_id: stockData.stock_id.trim() !== "",
            stock_category: stockData.stock_category !== undefined && stockData.stock_category.trim() !== "",
            current_quantity: stockData.current_quantity.trim() !== "",
            buy_price: prices.buy_price.trim() !== "",
            sell_price: prices.sell_price.trim() !== "",
        };
        setFormValidation(validation);

        const validated = !Object.values(validation).some(v => v === false);
        if (!validated) {
            Toast.show({
                type: "error",
                text1: "Form incomplete"
            });
        }
        return validated;
    };

    const [prices, setPrices] = useState<{
        buy_price: string;
        sell_price: string;
    }>({
        buy_price: "0.00",
        sell_price: "0.00",
    });

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
            current_quantity: "0.00",
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

    function normalizeAmounts(input: string) {
        return Number.parseFloat(input.trim() !== "" ? input : "0").toFixed(2);
    };

    const handleResetCategory = () => {
        setCreateNewCategory(false);
        setStockData(prev => ({ ...prev, stock_category: "" }));
    };

    if (categories.isLoading) {
        return <LoadingScreen />
    } else {
        return (
            <>
                <Stack.Screen options={{ title: `New Stock` }} />
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={
                        Platform.OS === "ios" || Platform.OS === "android"
                            ? "padding"
                            : undefined
                    }
                >
                    <SafeAreaView
                        style={{ flex: 1, backgroundColor: SystemColorTheme.Background }}
                        edges={["bottom"]}
                    >
                        <View style={[styles.container, { justifyContent: "center" }]}>
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
                                        ref={ref => {
                                            inputRefs.current[0] = ref
                                        }}
                                        placeholder="Enter stock ID..."
                                        placeholderTextColor={SystemColorTheme.Placeholder}
                                        value={stockData?.stock_id ?? ""}
                                        onChangeText={(text) =>
                                            setStockData((prev) =>
                                                prev
                                                    ? {
                                                        ...prev,
                                                        stock_id: text.toUpperCase()
                                                    }
                                                    : prev
                                            )
                                        }
                                        style={[styles.input, !formValidation.stock_id && styles.border_danger]}
                                        onFocus={(e) => {
                                            const y =
                                                fieldRefs.current["stock_id"];

                                            if (y !== undefined) {
                                                focusField(y);
                                            }
                                        }}
                                        returnKeyType="next"
                                        onSubmitEditing={() => {
                                            inputRefs.current[1]?.focus();
                                        }}
                                        selectTextOnFocus={true}
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
                                    {!createNewCategory && (
                                        <Dropdown
                                            ref={(ref) => {
                                                dropdownRef.current = ref
                                            }}
                                            placeholder="Select category"
                                            labelField="label"
                                            valueField="value"
                                            data={stockCategories.map(c => ({
                                                label: c,
                                                value: c
                                            }))}
                                            style={[styles.input, styles.bg_default, { flex: 1 }, !formValidation.stock_category && styles.border_danger]}
                                            containerStyle={[styles.bg_default]}
                                            itemTextStyle={styles.text_secondary}
                                            inputSearchStyle={[styles.text_secondary]}
                                            selectedTextStyle={styles.text_secondary}
                                            searchQuery={(keyword, labelValue) => {
                                                return labelValue.toLowerCase().includes(keyword.toLowerCase()) || labelValue === "CUSTOM";
                                            }}
                                            onChangeText={search => {
                                                setCategorySearch(search.trim().toUpperCase());
                                            }}
                                            value={stockData?.stock_category ?? undefined}
                                            search
                                            searchPlaceholder="Search..."
                                            placeholderStyle={[styles.text_secondary, { color: SystemColorTheme.Placeholder }]}
                                            onChange={(item) => {
                                                if (item.label === "CUSTOM") {
                                                    setCreateNewCategory(true);
                                                    setStockData(prev => ({
                                                        ...prev,
                                                        stock_category: categorySearch
                                                    }));
                                                    return;
                                                }
                                                setStockData(prev => ({
                                                    ...prev,
                                                    stock_category: item.value
                                                }))
                                            }}
                                            renderItem={(item, selected) => {
                                                if (item.label === "CUSTOM") {
                                                    return categorySearch.trim() !== "" ? (
                                                        <View style={[styles.bg_default, styles.dropdownContainer]}>
                                                            <Text
                                                                style={[
                                                                    styles.text_secondary,
                                                                    {
                                                                        color: selected
                                                                            ? SystemColorTheme.Info
                                                                            : SystemColorTheme.Secondary
                                                                    }
                                                                ]}
                                                            >
                                                                {`Add "${categorySearch.toUpperCase()}"`}
                                                            </Text>
                                                        </View>
                                                    ) : null
                                                }
                                                return (
                                                    <View style={[styles.bg_default, styles.dropdownContainer]}>
                                                        <Text
                                                            style={[
                                                                styles.text_secondary,
                                                                {
                                                                    color: selected
                                                                        ? SystemColorTheme.Info
                                                                        : SystemColorTheme.Secondary
                                                                }
                                                            ]}
                                                        >
                                                            {item.label}
                                                        </Text>
                                                    </View>
                                                );
                                            }}
                                        />
                                    )}
                                    {createNewCategory && (
                                        <Pressable style={[styles.input, { flex: 1 }]} onLongPress={() => {
                                            handleResetCategory()
                                        }}>
                                            <Text style={[styles.text_secondary]}>{stockData.stock_category?.toUpperCase() ?? ""}</Text>
                                        </Pressable>
                                    )}
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
                                        ref={ref => {
                                            inputRefs.current[1] = ref
                                        }}
                                        placeholder="Stock description..."
                                        placeholderTextColor={
                                            SystemColorTheme.Placeholder
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
                                        onSubmitEditing={() => {
                                            inputRefs.current[2]?.focus();
                                        }}
                                        returnKeyType="next"
                                        selectTextOnFocus={true}
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
                                                styles.flexButton,
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
                                        ref={ref => {
                                            inputRefs.current[2] = ref
                                        }}
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
                                        style={[styles.input, !formValidation.current_quantity && styles.border_danger]}
                                        onFocus={() => {
                                            const y =
                                                fieldRefs.current[
                                                "current_quantity"
                                                ];

                                            if (y !== undefined) {
                                                focusField(y);
                                            }
                                        }}
                                        onSubmitEditing={() => {
                                            inputRefs.current[3]?.focus();
                                        }}
                                        returnKeyType="next"
                                        selectTextOnFocus={true}
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
                                        ref={ref => {
                                            inputRefs.current[3] = ref
                                        }}
                                        placeholder="Buy Price (RM)..."
                                        placeholderTextColor={SystemColorTheme.Placeholder}
                                        value={prices?.buy_price ?? "0.00"}
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
                                        style={[styles.input, !formValidation.buy_price && styles.border_danger]}
                                        onFocus={() => {
                                            const y = fieldRefs.current["buy_price"];
                                            if (y !== undefined) focusField(y);
                                        }}
                                        onSubmitEditing={() => {
                                            inputRefs.current[4]?.focus();
                                        }}
                                        returnKeyType="next"
                                        selectTextOnFocus={true}
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
                                        ref={ref => {
                                            inputRefs.current[4] = ref
                                        }}
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
                                        style={[styles.input, !formValidation.sell_price && styles.border_danger]}
                                        onFocus={() => {
                                            const y = fieldRefs.current["sell_price"];
                                            if (y !== undefined) focusField(y);
                                        }}
                                        selectTextOnFocus={true}
                                    />
                                </View>
                            </View>
                            <View style={styles.categoryContainer}>
                                {/* Actions */}
                                <View style={styles.inputRow}>
                                    <Pressable
                                        style={[
                                            styles.flexButton,
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
                                            styles.flexButton,
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
                        </View>
                    </SafeAreaView>
                </KeyboardAvoidingView>
            </>
        );
    }
}