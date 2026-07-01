//ReportsOverview.tsx
import {
    useReadMonthlyExpenses,
    useReadMonthlyPurchasedItems,
    useReadMonthlyPurchasesTotal,
    useReadMonthlySalesTotal,
    useReadMonthlySoldItems
} from "@/hooks/reports/useReports";
import { styles } from "@/styles/_styles";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReportsOverview() {
    const today = new Date();
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const [selectedDate, setSelectedDate] = useState<Date>(firstDayOfLastMonth);

    const {
        purchasesTotal,
        loading: purchasesTotalLoading,
        error: purchasesTotalError,
        load: refetchPurchasesTotal,
    } = useReadMonthlyPurchasesTotal(selectedDate);

    const {
        purchasedItems,
        loading: purchasedItemsLoading,
        error: purchasedItemsError,
        load: refetchPurchasedItems,
    } = useReadMonthlyPurchasedItems(selectedDate);

    const {
        salesTotal,
        loading: salesTotalLoading,
        error: salesTotalError,
        load: refetchSalesTotal,
    } = useReadMonthlySalesTotal(selectedDate);

    const {
        soldItems,
        loading: soldItemsLoading,
        error: soldItemsError,
        load: refetchSoldItems,
    } = useReadMonthlySoldItems(selectedDate);

    const {
        expensesTotal,
        loading: expensesTotalLoading,
        error: expensesTotalError,
        load: refetchExpensesTotal,
    } = useReadMonthlyExpenses(selectedDate);

    const refetchAllAsync = async () => {
        await Promise.all([
            refetchPurchasesTotal(),
            refetchPurchasedItems(),
            refetchSalesTotal(),
            refetchSoldItems(),
            refetchExpensesTotal(),
        ]);
    };

    const resetAll = () => {
        setSelectedDate(firstDayOfLastMonth);
    };

    useFocusEffect(useCallback(() => {
        resetAll();
    }, []));

    const showDatePicker = () => {
        DateTimePickerAndroid.open({
            mode: "date",
            value: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1),
            onChange: async (event, date) => {
                setSelectedDate(date ?? selectedDate);
                await refetchAllAsync();
            },
            design: "material",
        })
    }

    return (
        <SafeAreaView style={[styles.container]}>
            <Stack.Screen options={{ headerTitle: "Reports Overview" }} />
            <View style={[{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }]}>
                <Text style={[styles.text_secondary, { textAlignVertical: "center" }]}>Date:</Text>
                <Pressable onPress={() => showDatePicker()}>
                    <View style={styles.button}>
                        <Text style={styles.text_secondary}>{selectedDate.toLocaleDateString("en-CA")}</Text>
                    </View>
                </Pressable>
            </View>
            <View style={styles.categoryContainer}>
                <Text style={styles.text_secondary}>Purchases Total - {selectedDate.toLocaleDateString("en-CA", { month: "long" })}</Text>
                {!purchasesTotalLoading && typeof purchasesTotal === "number" && (<Text style={styles.text_secondary}>RM {purchasesTotal?.toFixed(2)}</Text>)}
                {!purchasesTotalLoading && typeof purchasesTotal !== "number" && (<Text style={styles.text_secondary}>No purchases found</Text>)}
                {purchasesTotalError && (
                    <View style={{ paddingTop: 10 }}>
                        <Text style={[styles.text_secondary, styles.categoryTitleLabel]}>Error:</Text>
                        <Text style={styles.text_secondary}>{purchasesTotalError.toString()}</Text>
                    </View>
                )}
            </View>
            <View style={styles.categoryContainer}>
                <Text style={styles.text_secondary}>Purchased Items - {selectedDate.toLocaleDateString("en-CA", { month: "long" })}</Text>
                {!purchasedItemsLoading && purchasedItems.map((value) =>
                    <View key={value.stock_id} style={styles.inputRow}>
                        <Text style={styles.text_secondary}>{value.stock_id}</Text>
                        <Text style={styles.text_secondary}>{value.item_quantity}</Text>
                    </View>
                )}
                {!purchasedItemsLoading && purchasedItems.length === 0 && (
                    <Text style={styles.text_secondary}>No purchased items found</Text>
                )}
                {purchasedItemsError && (
                    <View style={{ paddingTop: 10 }}>
                        <Text style={[styles.text_secondary, styles.categoryTitleLabel]}>Error: </Text>
                        <Text style={styles.text_secondary}>{purchasedItemsError.toString()}</Text>
                    </View>
                )}
            </View>
            <View style={styles.categoryContainer}>
                <Text style={styles.text_secondary}>Sales Total - {selectedDate.toLocaleDateString("en-CA", { month: "long" })}</Text>
                {!salesTotalLoading && typeof salesTotal === "number" && (<Text style={styles.text_secondary}>RM {salesTotal?.toFixed(2)}</Text>)}
                {!salesTotalLoading && typeof salesTotal !== "number" && (<Text style={styles.text_secondary}>No sales found</Text>)}
                {salesTotalError && (
                    <View style={{ paddingTop: 10 }}>
                        <Text style={[styles.text_secondary, styles.categoryTitleLabel]}>Error:</Text>
                        <Text style={styles.text_secondary}>{salesTotalError.toString()}</Text>
                    </View>
                )}
            </View>
            <View style={styles.categoryContainer}>
                <Text style={styles.text_secondary}>Sold Items - {selectedDate.toLocaleDateString("en-CA", { month: "long" })}</Text>
                {!soldItemsLoading && soldItems.map((value) =>
                    <View key={value.stock_id} style={styles.inputRow}>
                        <Text style={styles.text_secondary}>{value.stock_id}</Text>
                        <Text style={styles.text_secondary}>{value.item_quantity}</Text>
                    </View>
                )}
                {!soldItemsLoading && soldItems.length === 0 && (
                    <Text style={styles.text_secondary}>No sold items found</Text>
                )}
                {soldItemsError && (
                    <View style={{ paddingTop: 10 }}>
                        <Text style={[styles.text_secondary, styles.categoryTitleLabel]}>Error: </Text>
                        <Text style={styles.text_secondary}>{soldItemsError.toString()}</Text>
                    </View>
                )}
            </View>
            <View style={styles.categoryContainer}>
                <Text style={styles.text_secondary}>Expenses Total - {selectedDate.toLocaleDateString("en-CA", { month: "long" })}</Text>
                {!expensesTotalLoading && typeof expensesTotal === "number" && (
                    <Text style={styles.text_secondary}>RM {expensesTotal.toFixed(2)}</Text>
                )}
                {!expensesTotalLoading && typeof expensesTotal !== "number" && (
                    <Text style={styles.text_secondary}>No expenses found!</Text>
                )}
                {expensesTotalError && (
                    <View style={{ paddingTop: 10 }}>
                        <Text style={[styles.text_secondary, styles.categoryTitleLabel]}>Error: </Text>
                        <Text style={styles.text_secondary}>{expensesTotalError.toString()}</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};
