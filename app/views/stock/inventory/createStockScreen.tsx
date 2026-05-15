import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import type { Stock } from "@/types/stockType";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useFocusEffect } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function SupplierCreateScreen() {
    useFocusEffect(
        useCallback(() => {
            return () => {
                handleFormClose();
            }
        }, [])
    );

    const [stockData, setStockData] = useState<Stock>({
        stock_id: "",
        stock_description: "",
        stock_uom: "KG",
        stock_category: "",
        current_quantity: 0
    });

    const scrollRef = useRef<ScrollView>(null);
    const fieldRefs = useRef<Record<string, number>>({});

    const focusField = (y: number) => {
        scrollRef.current?.scrollTo({
            y: y - 200,
            animated: true
        });
    };

    const handleSubmit = () => {
        const stockPayload = {
            stock_id: stockData?.stock_id,
            stock_description: stockData?.stock_description,
            stock_uom: stockData?.stock_uom,
            stock_category: stockData?.stock_category
        };
    };

    const handleCancel = () => {
        handleFormClose();
        router.push("/views/stock/inventory");
    }

    const handleFormClose = () => {
        setStockData({
            stock_id: "",
            stock_description: "",
            stock_uom: "KG",
            stock_category: "",
            current_quantity: 0
        });
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

                    {/* Stock Info */}
                    <View style={styles.categoryContainer}>

                        <Text style={styles.formTitle}>
                        <FontAwesome name="user" size={20}></FontAwesome>
                            Stock Info
                        </Text>

                        {/* Stock ID */}
                        <View
                            onLayout={(e) => {
                                fieldRefs.current["stock_id"] =
                                    e.nativeEvent.layout.y;
                            }}
                        >
                            <TextInput
                                placeholder={`Enter stock ID...`}
                                placeholderTextColor={SystemColorTheme.Secondary}
                                value={stockData.stock_id}
                                onChangeText={(text) => setStockData({...stockData, stock_id: text})}
                                style={styles.input}
                                onFocus={() => {
                                    const y = fieldRefs.current["stock_id"];
                                    if (y !== undefined) focusField(y);
                                }}
                            />
                        </View>

                        {/* Stock Category */}
                        <View
                            onLayout={(e) => {
                                fieldRefs.current["stock_category"] =
                                    e.nativeEvent.layout.y;
                            }}
                        >
                            <TextInput
                                placeholder={`Enter stock category...`}
                                placeholderTextColor={SystemColorTheme.Secondary}
                                value={stockData.stock_id}
                                onChangeText={(text) => setStockData({...stockData, stock_id: text})}
                                style={styles.input}
                                onFocus={() => {
                                    const y = fieldRefs.current["stock_category"];
                                    if (y !== undefined) focusField(y);
                                }}
                            />
                        </View>

                        <View style={styles.inputRow}>
                            {(["KG", "PC"] as const).map((type) => (
                                <Pressable
                                    key={type}
                                    style={[
                                        styles.button,
                                        styles.formSelectButtons,
                                        stockData.stock_uom === type && {
                                            backgroundColor: SystemColorTheme.Secondary
                                        }
                                    ]}
                                    onPress={() => {
                                        setStockData({...stockData, stock_uom: type});
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            stockData.stock_uom === type && {
                                                color: SystemColorTheme.Primary
                                            }
                                        ]}
                                    >
                                        {type}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>


                        {/* Description */}
                        <View
                            onLayout={(e) => {
                                fieldRefs.current["stock_description"] =
                                    e.nativeEvent.layout.y;
                            }}
                        >
                            <TextInput
                                placeholder="Stock Description..."
                                placeholderTextColor={SystemColorTheme.Secondary}
                                value={stockData.stock_description}
                                onChangeText={(text) => setStockData({...stockData, stock_description: text})}
                                style={styles.input}
                                onFocus={() => {
                                    const y = fieldRefs.current["stock_description"];
                                    if (y !== undefined) focusField(y);
                                }}
                            />
                        </View>

                        {/* Current Quantity */}
                        <View
                            onLayout={(e) => {
                                fieldRefs.current["current_quantity"] =
                                    e.nativeEvent.layout.y;
                            }}
                        >
                            <TextInput
                                placeholder="Current Quantity..."
                                placeholderTextColor={SystemColorTheme.Secondary}
                                value={stockData.current_quantity.toString()}
                                onChangeText={(text) => setStockData({...stockData, current_quantity: Number.parseFloat(text)})}
                                style={styles.input}
                                onFocus={() => {
                                    const y = fieldRefs.current["current_quantity"];
                                    if (y !== undefined) focusField(y);
                                }}
                            />
                        </View>

                        <View style={styles.inputRow}>
                            <Pressable
                                style={[styles.button, styles.formSelectButtons, styles.bg_danger]}
                                onPress={handleCancel}
                            >
                                <Text style={styles.buttonText}>
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.formSelectButtons]}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.buttonText}>
                                    Save Stock
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}