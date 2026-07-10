import LoadingScreen from "@/app/components/LoadingScreen";
import useStockList from "@/hooks/stock/useStockList";
import { useCreateStockMovement } from "@/hooks/stock/useStockMutations";
import { styles } from "@/styles/_styles";
import SystemColorTheme from "@/styles/system-color-theme";
import type * as StockTypes from "@/types/stockType";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function StockMovementCreateScreen() {
    const [initialized, setInitialized] = useState<boolean>(false);
    const [movementData, setMovementData] = useState<StockTypes.StockMovement | undefined>();
    const [movementDirection, setMovementDirection] = useState<string>("OUT");
    const [stockModalVisible, setStockModalVisible] = useState<boolean>(false);
    const [stockSearch, setStockSearch] = useState<string>("");
    const [selectedStock, setSelectedStock] = useState<StockTypes.Stock>();
    const createStockMovement = useCreateStockMovement();
    const stockList = useStockList().stockList;

    useEffect(() => {
        if (stockList.isLoading || initialized) return;
        setInitialized(true);
    }, [stockList])

    const handleSubmit = async () => {
        if (
            movementData?.direction.trim() === "" ||
            movementData?.stock_id.trim() === "" ||
            movementData?.quantity_change! > 0
        ) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Form incomplete!"
            });
        }

        await createStockMovement.mutateAsync({
            data: movementData!
        });
    }

    const handleSelectStock = async (stock: StockTypes.Stock) => {
        setSelectedStock(stock);
        setStockModalVisible(false);
        setStockSearch("");
    }

    const filteredStock = useMemo(() => {
        if (stockSearch.trim() === "") return stockList.data;
        const q = stockSearch.toLowerCase();
        return stockList.data?.filter(item => (
            (item.stock_id ?? "").toLowerCase().includes(q) ||
            (item.stock_description ?? "").toLowerCase().includes(q) ||
            (item.stock_category ?? "").toLowerCase().includes(q)
        ));
    }, [stockSearch, stockList]);

    if (stockList.isLoading && !initialized)
        return LoadingScreen();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: SystemColorTheme.Background }}>
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: SystemColorTheme.Background }}
                behavior={
                    Platform.OS === "ios" || Platform.OS === "android"
                        ? "padding"
                        : undefined
                }
            >
                <View style={styles.formContainer}>
                    <View style={styles.categoryContainer}>
                        <Pressable
                            style={[
                                styles.flexButton,
                                selectedStock && selectedStock?.stock_id.trim() !== "" && { backgroundColor: SystemColorTheme.Secondary }
                            ]}
                            onPress={() => setStockModalVisible(true)}
                        >
                            <Text
                                style={[
                                    styles.buttonText,
                                    selectedStock && selectedStock.stock_id?.trim() !== "" && { color: SystemColorTheme.Primary }
                                ]}
                                numberOfLines={1}
                            >{selectedStock ? `${selectedStock.stock_id} | ${selectedStock.stock_description}` : "Select Stock"}</Text>
                        </Pressable>
                        <Text style={styles.text_secondary}>Direction:</Text>
                        <View style={[styles.inputRow]}>
                            {(["IN", "OUT"] as const).map((direction) => (
                                <Pressable
                                    key={direction}
                                    style={[
                                        styles.flexButton,
                                        styles.formSelectButtons,
                                        movementDirection === direction && {
                                            backgroundColor: SystemColorTheme.Secondary
                                        }
                                    ]}
                                    onPress={() => setMovementDirection(direction)}
                                >
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            movementDirection === direction && {
                                                color: SystemColorTheme.Primary
                                            }
                                        ]}
                                    >
                                        {direction}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                        {selectedStock && (
                            <>
                                <View style={[styles.inputSection, { paddingTop: 8 }]}>
                                    <Text style={styles.text_secondary}>Quantity: </Text>
                                    <TextInput
                                        style={styles.input}
                                    />
                                    <Text style={styles.text_secondary}>{selectedStock.stock_uom}</Text>
                                </View>

                                <View style={[styles.inputSection, { paddingTop: 8 }]}>
                                    <Text style={styles.text_secondary}>Remarks: </Text>
                                    <TextInput
                                        style={styles.input}
                                    />
                                </View>
                            </>
                        )}
                    </View>
                    {selectedStock && (
                        <View style={styles.categoryContainer}>
                            <View style={styles.inputRow}>
                                <Pressable style={[styles.flexButton, styles.bg_danger, { flex: 1 }]}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </Pressable>
                                <Pressable style={[styles.flexButton, styles.bg_default, { flex: 1 }]}>
                                    <Text style={styles.buttonText}>Submit</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
            <Modal
                visible={stockModalVisible}
                onRequestClose={() => setStockModalVisible(false)}
                animationType={"slide"}
            >
                <SafeAreaView style={[styles.modal]}>
                    <View style={[styles.modalHeader]}>
                        <Text style={[styles.modalTitle]}>
                            Select Stock
                        </Text>
                        <Pressable onPress={() => setStockModalVisible(false)}>
                            <FontAwesome name="close" size={20} color={SystemColorTheme.Secondary} />
                        </Pressable>
                    </View>
                    <View style={styles.modalBody}>
                        <View style={styles.searchBar}>
                            <FontAwesome name="search" style={styles.searchIcon} />
                            <TextInput placeholder="Search stock..." placeholderTextColor={SystemColorTheme.Placeholder} style={styles.searchInput} onChangeText={(text) => {
                                setStockSearch(text)
                            }} />
                        </View>
                        <FlatList
                            data={filteredStock}
                            keyExtractor={(item) => item.stock_id}
                            renderItem={(item) => (
                                <Pressable style={styles.modalCard} onPress={() => handleSelectStock(item.item)}>
                                    <Text style={styles.text_secondary}>{item.item.stock_id} | {item.item.stock_description}</Text>
                                </Pressable>
                            )}
                            ListEmptyComponent={
                                <View>
                                    <Text style={styles.text_secondary}>No stock found</Text>
                                </View>
                            }
                        />
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};