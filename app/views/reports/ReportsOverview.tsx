//ReportsOverview.tsx
import LoadingScreen from "@/app/components/LoadingScreen";
import useExportToBukku from "@/hooks/export/useExportToBukku";
import useReports from "@/hooks/reports/useReports";
import { DateRange } from "@/services/api/export/exportDataService";
import { styles } from "@/styles/_styles";
import { FontAwesome } from "@expo/vector-icons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReportsOverview() {
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [previewTarget, setPreviewTarget] = useState<
        "PURCHASES_BILL" | "SUPPLIERS" | "SALES_BILL" | "BUYERS" | null
    >(null);

    const [dateRange, setDateRange] = useState<{ startDate: Date, endDate: Date }>({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    })

    const {
        purchasesTotalByDateRange,
        purchasedItemsByDateRange,
        salesTotalByDateRange,
        soldItemsByDateRange,
        expensesTotalByDateRange
    } = useReports({
        startDate: dateRange?.startDate,
        endDate: dateRange?.endDate
    });

    const reports = useMemo(() => {
        if (
            !purchasesTotalByDateRange.isLoading && purchasesTotalByDateRange.isFetched &&
            !purchasedItemsByDateRange.isLoading && purchasedItemsByDateRange.isFetched &&
            !salesTotalByDateRange.isLoading && salesTotalByDateRange.isFetched &&
            !soldItemsByDateRange.isLoading && soldItemsByDateRange.isFetched &&
            !expensesTotalByDateRange.isLoading && expensesTotalByDateRange.isFetched
        ) {
            return {
                purchasesTotalByDateRange: purchasesTotalByDateRange.data,
                purchasedItemsByDateRange: purchasedItemsByDateRange.data,
                salesTotalByDateRange: salesTotalByDateRange.data,
                soldItemsByDateRange: soldItemsByDateRange.data,
                expensesTotalByDateRange: expensesTotalByDateRange.data
            };
        } else {
            return undefined;
        }
    }, [
        purchasesTotalByDateRange,
        purchasedItemsByDateRange,
        salesTotalByDateRange,
        soldItemsByDateRange,
        expensesTotalByDateRange
    ])

    const handlePreview = (content_type: "PURCHASES_BILL" | "SUPPLIERS" | "SALES_BILL" | "BUYERS") => {
        setPreviewTarget(content_type);
        setPreviewModalVisible(true);
    }

    const parsedDateString = (date: string) => {
        const [day, month, year] = date.split("/").map(Number);
        return new Date(year, month - 1, day);
    }

    const { previewBukkuPurchasesBill, previewBukkuSalesBill, previewBukkuSuppliers, previewBukkuBuyers } = useExportToBukku(dateRange);
    const previewTransactions = useMemo(() => {
        const billData =
            previewTarget === "PURCHASES_BILL" ? previewBukkuPurchasesBill.data :
                previewTarget === "SALES_BILL" ? previewBukkuSalesBill.data :
                    undefined;

        if (!billData) return undefined;

        const data: Record<string, any>[] = [...billData.data].sort((a, b) =>
            parsedDateString(b.date).getTime() -
            parsedDateString(a.date).getTime()
        );

        return {
            headers: billData.headers,
            data,
            totalCount: billData.totalCount,
        };
    }, [previewTarget, previewBukkuPurchasesBill, previewBukkuSalesBill]);

    const previewContacts = useMemo(() => {
        const contactData =
            previewTarget === "SUPPLIERS" ? previewBukkuSuppliers.data :
                previewTarget === "BUYERS" ? previewBukkuBuyers.data :
                    undefined;

        if (!contactData) return undefined;

        const data: Record<string, any>[] = contactData.data;

        return {
            headers: contactData.headers,
            data: data,
            totalCount: contactData.totalCount ?? 0
        };
    }, [previewTarget, previewBukkuSuppliers, previewBukkuBuyers]);

    useFocusEffect(useCallback(() => {
        return () => {
            setDateRange({
                startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
            })
        };
    }, []));

    const PreviewModalContent = () => {
        if (previewTarget === "PURCHASES_BILL" || previewTarget === "SALES_BILL") {
            if (previewTransactions === undefined) return (
                <View style={[{ flex: 1, alignContent: "center", justifyContent: "center" }]}>
                    <Text style={styles.text_secondary}>
                        No results
                    </Text>
                </View>
            )
            return (
                <ScrollView nestedScrollEnabled={true} horizontal style={styles.bg_default}>
                    <ScrollView nestedScrollEnabled>
                        <View style={{ flexDirection: "row" }}>
                            {Object.entries(previewTransactions.headers).map(([key, value]) => (
                                <View
                                    key={key}
                                    style={{
                                        width: key === "_" ? 50 : 150,
                                        borderColor: "#fff",
                                        borderWidth: 1,
                                        padding: 3
                                    }}
                                >
                                    <Text style={styles.text_secondary} numberOfLines={1}>
                                        {value as any}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        {previewTransactions.data.map((row, rowIndex) => (
                            <View key={rowIndex} style={{ flexDirection: "row" }}>
                                {Object.keys(previewTransactions.headers).map((key) => (
                                    <View
                                        key={key}
                                        style={{
                                            width: key === "_" ? 50 : 150,
                                            borderColor: "#fff",
                                            borderWidth: 1,
                                            padding: 3
                                        }}
                                    >
                                        <Text style={[styles.text_secondary, typeof row[key] === "number" && { textAlign: "right" }]} numberOfLines={1}>
                                            {row[key] ?? ""}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                        {previewTransactions.totalCount > 100 && (<Text style={styles.text_placeholder}>...{previewTransactions.totalCount - 100} more result(s)</Text>)}
                    </ScrollView>
                </ScrollView>
            )
        } else if (previewTarget === "SUPPLIERS" || previewTarget === "BUYERS") {
            if (previewContacts === undefined) return (
                <View style={[{ flex: 1, alignContent: "center", justifyContent: "center" }]}>
                    <Text style={styles.text_secondary}>
                        No results
                    </Text>
                </View>
            )
            return (
                <ScrollView nestedScrollEnabled={true} horizontal style={styles.bg_default}>
                    <ScrollView nestedScrollEnabled>
                        <View style={{ flexDirection: "row" }}>
                            {Object.entries(previewContacts.headers).map(([key, value]) => (
                                <View
                                    key={key}
                                    style={{
                                        width: key === "_" ? 50 : 150,
                                        borderColor: "#fff",
                                        borderWidth: 1,
                                        padding: 3
                                    }}
                                >
                                    <Text style={styles.text_secondary} numberOfLines={1}>
                                        {value as any}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        {previewContacts.data.map((row, rowIndex) => (
                            <View key={rowIndex} style={{ flexDirection: "row" }}>
                                {Object.keys(previewContacts.headers).map((key) => (
                                    <View
                                        key={key}
                                        style={{
                                            width: key === "_" ? 50 : 150,
                                            borderColor: "#fff",
                                            borderWidth: 1,
                                            padding: 3
                                        }}
                                    >
                                        <Text style={[styles.text_secondary, typeof row[key] === "number" && { textAlign: "right" }]} numberOfLines={1}>
                                            {row[key] ?? ""}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </ScrollView>
                </ScrollView>
            )
        }
    };

    const showDatePicker = (targetDate: keyof DateRange) => {
        const { startDate, endDate } = dateRange;
        DateTimePickerAndroid.open({
            mode: "date",
            value: targetDate === "startDate" ?
                new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1) :
                new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1),
            onValueChange: async (event, date) => {
                if (date === undefined) return;
                if (targetDate === "startDate") {
                    setDateRange(prev => ({
                        startDate: date,
                        endDate: date > prev.endDate ? date : prev.endDate,
                    }));
                } else {
                    setDateRange(prev => ({
                        startDate: date < prev.startDate ? date : prev.startDate,
                        endDate: date
                    }));
                }
            },
            design: "material",
        })
    }

    if (reports === undefined) {
        return <LoadingScreen />
    }

    return (
        <SafeAreaView edges={["bottom"]} style={[styles.container]}>
            <Stack.Screen options={{ headerTitle: "Reports Overview" }} />
            <View style={[{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 }]}>
                <View key="filterStartDate">
                    <Pressable onPress={() => showDatePicker("startDate")}>
                        <View style={styles.button}>
                            <Text style={styles.text_secondary}>{dateRange.startDate.toLocaleDateString("en-CA")}</Text>
                        </View>
                    </Pressable>
                </View>
                <FontAwesome name="arrow-right" style={styles.icon} />
                <View key="filterEndDate">
                    <Pressable onPress={() => showDatePicker("endDate")}>
                        <View style={styles.button}>
                            <Text style={styles.text_secondary}>{dateRange.endDate.toLocaleDateString("en-CA")}</Text>
                        </View>
                    </Pressable>
                </View>
            </View>
            <ScrollView nestedScrollEnabled={true}>
                <View style={styles.categoryContainer}>
                    <Text style={[styles.text_secondary, styles.categoryTitleLabel]}>Purchases Total</Text>
                    {reports.purchasesTotalByDateRange && (<Text style={styles.text_secondary}>RM {reports.purchasesTotalByDateRange.toFixed(2)}</Text>)}
                    {!reports.purchasesTotalByDateRange && (<Text style={styles.text_secondary}>No purchases found</Text>)}
                    <View>
                        <Pressable style={{ maxWidth: 100 }} onPress={() => handlePreview("PURCHASES_BILL")}>
                            <View style={[styles.button, styles.bg_info]}>
                                <Text style={styles.text_secondary}>
                                    Preview
                                </Text>
                            </View>
                        </Pressable>
                    </View>
                </View>
                <View style={styles.categoryContainer}>
                    <Text style={[styles.text_secondary, styles.categoryTitleLabel]}>Purchased Items</Text>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }}>
                        {(reports.purchasedItemsByDateRange !== undefined) && reports.purchasedItemsByDateRange.map((value) =>
                            <View key={value.stock_id} style={styles.row}>
                                <Text style={styles.text_secondary_sm}>{value.stock_id}</Text>
                                <Text style={styles.text_secondary_sm}>{value.item_quantity.toFixed(2)}</Text>
                            </View>
                        )}
                    </ScrollView>
                    {reports.purchasedItemsByDateRange === undefined || reports.purchasedItemsByDateRange.length === 0 && (
                        <Text style={styles.text_secondary}>No purchased items found</Text>
                    )}
                </View>
                <View style={styles.categoryContainer}>
                    <Text style={[styles.text_secondary, styles.categoryTitleLabel]}>Suppliers</Text>
                    {(previewBukkuSuppliers.data != null) && previewBukkuSuppliers.data.totalCount > 0 && (
                        <Text style={styles.text_secondary}>Count: {previewBukkuSuppliers.data.totalCount}</Text>
                    )}
                    {(previewBukkuSuppliers?.data?.totalCount ?? 0) <= 0 && (
                        <Text style={styles.text_secondary}>No suppliers found</Text>
                    )}
                    <View>
                        <Pressable style={{ maxWidth: 100 }} onPress={() => handlePreview("SUPPLIERS")}>
                            <View style={[styles.button, styles.bg_info]}>
                                <Text style={styles.text_secondary}>
                                    Preview
                                </Text>
                            </View>
                        </Pressable>
                    </View>
                </View>
                <View style={styles.categoryContainer}>
                    <Text style={[styles.text_secondary, styles.categoryTitleLabel]}>Sales Total</Text>
                    {reports.salesTotalByDateRange && (<Text style={styles.text_secondary}>RM {reports.salesTotalByDateRange.toFixed(2)}</Text>)}
                    {!reports.salesTotalByDateRange && (<Text style={styles.text_secondary}>No sales found</Text>)}
                    <View>
                        <Pressable style={{ maxWidth: 100 }} onPress={() => handlePreview("SALES_BILL")}>
                            <View style={[styles.button, styles.bg_info]}>
                                <Text style={styles.text_secondary}>
                                    Preview
                                </Text>
                            </View>
                        </Pressable>
                    </View>
                </View>
                <View style={styles.categoryContainer}>
                    <Text style={[styles.text_secondary, styles.categoryTitleLabel]}>Sold Items</Text>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }}>
                        {(reports.soldItemsByDateRange !== undefined) && reports.soldItemsByDateRange.map((value) =>
                            <View key={value.stock_id} style={styles.inputRow}>
                                <Text style={styles.text_secondary_sm}>{value.stock_id}</Text>
                                <Text style={styles.text_secondary_sm}>{value.item_quantity}</Text>
                            </View>
                        )}
                    </ScrollView>
                    {reports.soldItemsByDateRange === undefined || reports.soldItemsByDateRange.length === 0 && (
                        <Text style={styles.text_secondary}>No sold items found</Text>
                    )}
                </View>
                <View style={styles.categoryContainer}>
                    <Text style={[styles.text_secondary, styles.categoryTitleLabel]}>Buyers</Text>
                    {(previewBukkuBuyers.data != null) && previewBukkuBuyers.data.totalCount > 0 && (
                        <Text style={styles.text_secondary}>Count: {previewBukkuBuyers.data.totalCount}</Text>
                    )}
                    {(previewBukkuBuyers?.data?.totalCount ?? 0) <= 0 && (
                        <Text style={styles.text_secondary}>No buyers found</Text>
                    )}
                    <View>
                        <Pressable style={{ maxWidth: 100 }} onPress={() => handlePreview("BUYERS")}>
                            <View style={[styles.button, styles.bg_info]}>
                                <Text style={styles.text_secondary}>
                                    Preview
                                </Text>
                            </View>
                        </Pressable>
                    </View>
                </View>
                <View style={styles.categoryContainer}>
                    <Text style={[styles.text_secondary, styles.categoryTitleLabel]}>Expenses Total</Text>
                    {reports.expensesTotalByDateRange !== undefined && typeof reports.expensesTotalByDateRange === "number" && (
                        <Text style={styles.text_secondary}>RM {reports.expensesTotalByDateRange.toFixed(2)}</Text>
                    )}
                    {!reports.expensesTotalByDateRange && typeof reports.expensesTotalByDateRange !== "number" && (
                        <Text style={styles.text_secondary}>No expenses found!</Text>
                    )}
                </View>
            </ScrollView>
            <Modal animationType="slide" visible={previewModalVisible} style={[styles.modal]}
                onRequestClose={() => {
                    setPreviewModalVisible(false);
                }}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{previewTarget !== null ? previewTarget : "Preview"}</Text>
                    <Pressable onPress={() => setPreviewModalVisible(false)}>
                        <FontAwesome name="close" style={styles.icon} />
                    </Pressable>
                </View>
                <PreviewModalContent />
                <View style={[styles.bg_default, { alignItems: "flex-end" }]}>
                    <Pressable style={[styles.button, styles.bg_info]}>
                        <Text style={styles.text_secondary}>Export</Text>
                    </Pressable>
                    <Text style={styles.text_secondary_sm}>*Previewed items are limited to 100 rows</Text>
                </View>
            </Modal>
        </SafeAreaView>
    );
};
