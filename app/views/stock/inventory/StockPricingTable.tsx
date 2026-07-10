import LoadingScreen from "@/app/components/LoadingScreen";
import useStockList from "@/hooks/stock/useStockList";
import { useUpdateStockPricing } from "@/hooks/stock/useStockMutations";
import { styles } from "@/styles/_styles";
import SystemColorTheme from "@/styles/system-color-theme";
import type { StockPricingHistory } from "@/types/stockType";
import { FontAwesome } from "@expo/vector-icons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const columnLabelMap = {
    stock_id: "ID",
    buy_price: "Buy Price (RM)",
    sell_price: "Sell Price (RM)",
    effective_date: "Date",
};

export default function StockPricingTable() {
    const router = useRouter();
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(100);
    const { stockIds, pricingHistory } = useStockList(pageNo, pageSize);
    let stockIdMap: { label: string, value: string }[] = stockIds.data?.sort((a, b) => a.localeCompare(b)).map(s => ({
        label: s,
        value: s
    })) ?? [];
    const [pricingMap, setPricingMap] = useState<StockPricingHistory[]>([]);
    const [priceChangeMap, setPriceChangeMap] = useState<StockPricingHistory[]>([]);
    const [stockPriceUpdateData, setStockPriceUpdateData] = useState<
        Omit<StockPricingHistory, "history_id" | "buy_price" | "sell_price"> & { buy_price: string, sell_price: string }
    >({
        stock_id: "",
        buy_price: "0.00",
        sell_price: "0.00",
        effective_date: new Date()
    });
    const [validateUpdateData, setValidateUpdateData] = useState({
        stock_id: true,
        buy_price: true,
        sell_price: true,
        effective_date: true,
    });
    const updateStockPrice = useUpdateStockPricing();
    const [updateModalVisible, setUpdateModalVisible] = useState(false);

    useEffect(() => {
        if (pricingHistory.isLoading || pricingHistory.isFetching) return;
        const sortedData = [...(pricingHistory.data ?? [])].sort((a, b) => (new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()));
        const tempPricing: StockPricingHistory[] = [];
        const tempPriceChange: StockPricingHistory[] = [];
        for (const row of sortedData) {
            const count = tempPricing.filter(item => item.stock_id === row.stock_id).length;
            if (count === 0) {
                tempPricing.push(row);
            } else {
                const countChange = tempPriceChange.filter(item => item.stock_id === row.stock_id).length;
                if (countChange === 0) {
                    tempPriceChange.push(row);
                }
            }
        }
        setPricingMap(tempPricing);
        setPriceChangeMap(tempPriceChange);
    }, [pricingHistory.data, pricingHistory.isLoading, pricingHistory.isFetching])

    const renderTable = (data: StockPricingHistory[] | undefined) => {
        return (
            <View style={styles.bg_default}>
                <FlatList
                    data={data}
                    style={[styles.border, { borderRadius: 5 }]}
                    ListHeaderComponent={() => (
                        <View style={styles.row}>
                            <View style={[styles.border, styles.table_cell, styles.bg_primary, { flex: 1 }]}>
                                <Text style={[styles.text_secondary, { fontWeight: "bold" }]}>{columnLabelMap.stock_id}</Text>
                            </View>
                            <View style={[styles.border, styles.table_cell, styles.bg_primary, { flex: 2 }]}>
                                <Text numberOfLines={1} style={[styles.text_secondary, { fontWeight: "bold" }]}>{columnLabelMap.effective_date}</Text>
                            </View>
                            <View style={[styles.border, styles.table_cell, styles.bg_primary, { flex: 2 }]}>
                                <Text numberOfLines={1} style={[styles.text_secondary, { fontWeight: "bold", textAlign: "right" }]}>{columnLabelMap.buy_price}</Text>
                            </View>
                            <View style={[styles.border, styles.table_cell, styles.bg_primary, { flex: 2 }]}>
                                <Text numberOfLines={1} style={[styles.text_secondary, { fontWeight: "bold", textAlign: "right" }]}>{columnLabelMap.sell_price}</Text>
                            </View>
                        </View>
                    )}
                    renderItem={(row) => {
                        const priceChange = priceChangeMap.find((p) => p.stock_id === row.item.stock_id);
                        const buyPriceChange = priceChange?.buy_price;
                        const sellPriceChange = priceChange?.sell_price;
                        return (
                            <View style={styles.row}>
                                <View style={[styles.border, styles.table_cell, { flex: 1 }]}>
                                    <Text numberOfLines={1} style={[styles.text_secondary, styles.text_overflow_hidden]}>{row.item.stock_id}</Text>
                                </View>
                                <View style={[styles.border, styles.table_cell, { flex: 2 }]}>
                                    <Text numberOfLines={1} style={[styles.text_secondary]}>
                                        {
                                            new Date(row.item.effective_date).toLocaleDateString("en-GB", {
                                                year: "2-digit",
                                                month: "2-digit",
                                                day: "2-digit"
                                            })
                                        }
                                    </Text>
                                </View>
                                <View style={[styles.border, styles.table_cell, { flex: 2, flexDirection: "row", justifyContent: "flex-end", gap: 5 }]}>
                                    {(buyPriceChange !== undefined && buyPriceChange !== row.item.buy_price) && (
                                        <Text numberOfLines={1} style={[
                                            styles.text_secondary_sm,
                                            (buyPriceChange > row.item.buy_price) && styles.text_success,
                                            (buyPriceChange < row.item.buy_price) && styles.text_danger,
                                            { textAlignVertical: "top", textAlign: "right" }
                                        ]}>
                                            {buyPriceChange.toFixed(2)}
                                        </Text>
                                    )}
                                    <Text numberOfLines={1} style={[styles.text_secondary, { textAlign: "right" }]}>
                                        {row.item.buy_price.toFixed(2)}
                                    </Text>
                                </View>
                                <View style={[styles.border, styles.table_cell, { flex: 2, flexDirection: "row", justifyContent: "flex-end", gap: 5 }]}>
                                    {(sellPriceChange !== undefined && sellPriceChange !== row.item.sell_price) && (
                                        <Text numberOfLines={1} style={[
                                            styles.text_secondary_sm,
                                            (sellPriceChange < row.item.sell_price) && styles.text_success,
                                            (sellPriceChange > row.item.sell_price) && styles.text_danger,
                                            { textAlignVertical: "top", textAlign: "right" }
                                        ]}>
                                            {sellPriceChange.toFixed(2)}
                                        </Text>
                                    )}
                                    <Text numberOfLines={1} style={[styles.text_secondary, { textAlign: "right" }]}>
                                        {row.item.buy_price.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        )
                    }}
                    ListEmptyComponent={() => (
                        <View>
                            <Text style={styles.text_secondary}>
                                No results
                            </Text>
                        </View>
                    )}
                />
            </View>
        )
    }

    if (pricingHistory.isLoading || pricingHistory.isFetching) {
        return <LoadingScreen />
    };

    const showDTPicker = () => {
        DateTimePickerAndroid.open({
            value: stockPriceUpdateData.effective_date as Date,
            mode: "date",
            design: "default"
        })
    }

    const handleUpdatePrice = () => {
        if (Object.values(validateUpdateData).find(v => v === false)) {
            Toast.show({
                type: "error",
                text1: "Form incomplete"
            });
        }
        updateStockPrice.mutate({
            stock_id: stockPriceUpdateData.stock_id,
            effective_date: stockPriceUpdateData.effective_date,
            buy_price: Number.parseFloat(stockPriceUpdateData.buy_price),
            sell_price: Number.parseFloat(stockPriceUpdateData.sell_price),
        });
        setUpdateModalVisible(false);
    };

    return (
        <SafeAreaView style={[styles.container, { padding: 20 }]}>
            <View style={{ alignSelf: "flex-end" }}>
                <Pressable onPress={() => setUpdateModalVisible(true)}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>Update Price</Text>
                    </View>
                </Pressable>
            </View>
            {renderTable(pricingMap.sort((a, b) => String(a.stock_id).localeCompare(String(b.stock_id))))}
            <Modal
                visible={updateModalVisible}
                animationType="slide"
                onRequestClose={() => {
                    setUpdateModalVisible(false);
                }}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Update price</Text>
                        <Pressable onPress={() => {
                            setUpdateModalVisible(false);
                        }}>
                            <FontAwesome name="close" size={20} color={SystemColorTheme.Secondary} />
                        </Pressable>
                    </View>
                    <View style={styles.modalBody}>
                        <View style={styles.categoryContainer}>
                            <View style={[styles.row, { alignItems: "center", gap: 10 }]}>
                                <Text style={styles.inputLabel} >ID:</Text>
                                <Dropdown
                                    labelField="label"
                                    valueField="value"
                                    data={stockIdMap}
                                    value={stockPriceUpdateData.stock_id}
                                    search
                                    style={styles.input}
                                    onChange={(item) => {
                                        const priceMap = pricingMap.find(p => p.stock_id === item.value);
                                        setStockPriceUpdateData(prev => ({
                                            ...prev,
                                            stock_id: item.value,
                                            buy_price: priceMap !== undefined ? priceMap.buy_price.toFixed(2) : "0.00",
                                            sell_price: priceMap !== undefined ? priceMap.sell_price.toFixed(2) : "0.00",
                                        }))
                                    }}
                                    placeholder="Select stock ID..."
                                    placeholderStyle={styles.text_placeholder}
                                    containerStyle={styles.bg_default}
                                    itemTextStyle={styles.text_secondary}
                                    inputSearchStyle={styles.text_secondary}
                                    selectedTextStyle={styles.text_secondary}
                                    renderItem={(item, selected) => (
                                        <View style={[
                                            styles.bg_default,
                                            selected && styles.bg_primary,
                                            styles.dropdownContainer
                                        ]}>
                                            <Text style={styles.text_secondary}>
                                                {item.value}
                                            </Text>
                                        </View>
                                    )}
                                />
                            </View>
                            <View style={[styles.row, { alignItems: "center", gap: 10 }]}>
                                <Text style={styles.inputLabel} >Date:</Text>
                                <Pressable style={[styles.button, { flex: 1 }]} onPress={showDTPicker}>
                                    <Text style={styles.text_secondary}>
                                        {(stockPriceUpdateData.effective_date as Date).toLocaleDateString("en-GB")}
                                    </Text>
                                </Pressable>
                            </View>
                            <View style={[styles.row, { alignItems: "center", gap: 10 }]}>
                                <Text style={styles.inputLabel} >Buy Price (RM):</Text>
                                <TextInput
                                    keyboardType="decimal-pad"
                                    value={stockPriceUpdateData.buy_price}
                                    onChangeText={(text) => {
                                        setStockPriceUpdateData(prev => ({ ...prev, buy_price: text }))
                                        if (text.trim() === "") {
                                            setValidateUpdateData(prev => ({ ...prev, buy_price: false }))
                                        } else {
                                            setValidateUpdateData(prev => ({ ...prev, buy_price: true }))
                                        }
                                    }}
                                    onEndEditing={(e) => {
                                        const value = Number.parseFloat(e.nativeEvent.text) < 0 || isNaN(Number.parseFloat(e.nativeEvent.text)) ? 0 : Number.parseFloat(e.nativeEvent.text);
                                        if (value >= 0) {
                                            setValidateUpdateData(prev => ({ ...prev, buy_price: true }))
                                        } else {
                                            setValidateUpdateData(prev => ({ ...prev, buy_price: false }))
                                        }
                                        setStockPriceUpdateData(prev => ({
                                            ...prev,
                                            buy_price: value.toFixed(2)
                                        }))
                                    }}
                                    style={[
                                        styles.input,
                                        !(validateUpdateData.buy_price) && styles.border_danger,
                                    ]}
                                    placeholder="Enter sell price..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                />
                            </View>
                            <View style={[styles.row, { alignItems: "center", gap: 10 }]}>
                                <Text style={styles.inputLabel} >Sell Price (RM):</Text>
                                <TextInput
                                    keyboardType="decimal-pad"
                                    value={stockPriceUpdateData.sell_price}
                                    onChangeText={(text) => {
                                        setStockPriceUpdateData(prev => ({ ...prev, sell_price: text }))
                                        if (text.trim() === "") {
                                            setValidateUpdateData(prev => ({ ...prev, sell_price: false }))
                                        } else {
                                            setValidateUpdateData(prev => ({ ...prev, sell_price: true }))
                                        }
                                    }}
                                    onEndEditing={(e) => {
                                        const value = Number.parseFloat(e.nativeEvent.text) < 0 || isNaN(Number.parseFloat(e.nativeEvent.text)) ? 0 : Number.parseFloat(e.nativeEvent.text);
                                        if (value >= 0) {
                                            setValidateUpdateData(prev => ({ ...prev, sell_price: true }))
                                        } else {
                                            setValidateUpdateData(prev => ({ ...prev, sell_price: false }))
                                        }
                                        setStockPriceUpdateData(prev => ({
                                            ...prev,
                                            sell_price: value.toFixed(2)
                                        }))
                                    }}
                                    style={[
                                        styles.input,
                                        !(validateUpdateData.sell_price) && styles.border_danger,
                                    ]}
                                    placeholder="Enter sell price..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                />
                            </View>
                            <Pressable style={[styles.flexButton, styles.bg_info]} onPress={handleUpdatePrice}>
                                <Text style={styles.text_secondary}>
                                    Save
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    )
}