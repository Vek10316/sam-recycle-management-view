//app/views/transactions/sales/salesListScreen.tsx
import LoadingScreen from "@/app/components/LoadingScreen";
import PaginationButtons from "@/app/components/PaginationButtons";
import salesKeys from "@/app/queries/saleTransactions.keys";
import useSaleTransactions from "@/hooks/transactions/sales/useSaleTransactions";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import Fontawesome from "@expo/vector-icons/FontAwesome";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SalesListScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [sortAsc, setSortAsc] = useState(true);
    const [searchStringInput, setSearchStringInput] = useState("");
    const [searchStringQuery, setSearchStringQuery] = useState("");
    const [pageNo, setPageNo] = useState(1);
    const pageSize = 100;
    const sales = useSaleTransactions(pageNo, pageSize, (searchStringQuery.trim() !== "" ? searchStringQuery.trim() : undefined));
    const salesList = sales.data?.data ?? [];
    const metadata = sales.data?.metadata ?? {
        pageNo,
        pageSize,
        totalCount: 0,
        totalPages: 0,
    };

    const handleRefresh = useCallback(async (reset?: boolean) => {
        if (reset) {
            await setSearchStringInput("");
            await setSearchStringQuery("");
            await setPageNo(1);
        }

        await queryClient.invalidateQueries({
            queryKey: salesKeys.all
        });
    }, [queryClient]);

    useFocusEffect(useCallback(() => {
        handleRefresh(true);
    }, [handleRefresh]))

    const renderStatusPill = (status: string) => {
        let colorHex: string = "";
        switch (status.toLowerCase()) {
            case "paid":
                colorHex = SystemColorTheme.Success;
                break;
            case "partial":
                colorHex = SystemColorTheme.Warning;
                break;
            default:
                colorHex = SystemColorTheme.Danger;
                break;
        };

        return (
            <View style={[styles.statusPill, { backgroundColor: colorHex }]}>
                <Text style={styles.statusPillText}>
                    {status.toUpperCase()}
                </Text>
            </View>
        );
    };

    const formatDateString = (input: string) => {
        try {
            const formattedDate = new Date(input).toLocaleDateString('en-CA', {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
            return formattedDate;
        } catch {
            console.error("Failed to format date.");
            return input;
        }
    }

    const viewSaleDetails = (transact_id: string) => {
        router.push(`./SalesDetailScreen?transact_id=${transact_id}`);
    };


    if (sales.isLoading || sales.isFetching) {
        return LoadingScreen();
    }

    return (
        <SafeAreaView edges={["bottom"]} style={styles.container}>
            <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                    style={{
                        padding: 5,
                        height: 57,
                        width: 57,
                        backgroundColor: "#fff",
                        borderRadius: 5,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                    onPress={() => handleRefresh(true)}
                >
                    <Fontawesome name="refresh" size={32} color="#000" />
                </Pressable>
                <View style={[styles.searchBar, { flex: 1 }]}>

                    <Fontawesome name="search" size={24} color={SystemColorTheme.Secondary} />
                    <TextInput
                        style={styles.searchInput}
                        value={searchStringInput}
                        onChangeText={setSearchStringInput}
                        onSubmitEditing={() => {
                            setSearchStringQuery(searchStringInput);
                        }}
                        placeholder="Search sales"
                        placeholderTextColor="#aaa"
                    />

                    <Pressable
                        onPress={() => setSortAsc(prev => !prev)}
                        style={styles.sortBtn}
                    >
                        <Text style={styles.sortText}>
                            {sortAsc ? "A → z" : "z → A"}
                        </Text>
                    </Pressable>
                </View>

            </View>

            <FlatList
                data={salesList}
                keyExtractor={(item) => item.transact_id}


                renderItem={({ item }) => {
                    return (
                        <Pressable onPress={() => viewSaleDetails(item.transact_id)}>
                            <View style={[styles.card]}>
                                <View style={styles.row}>
                                    <View style={styles.rowLeft}>
                                        <Text style={styles.text_secondary} numberOfLines={1}>
                                            {item.buyer_name || "Unknown Buyer"}
                                        </Text>

                                        <Text style={styles.text_secondary} numberOfLines={1}>
                                            {item.transact_id}
                                        </Text>

                                        <Text style={styles.text_secondary}>
                                            {item.transact_date?.trim()
                                                ? formatDateString(item.transact_date!)
                                                : ""}
                                        </Text>
                                    </View>

                                    <View style={styles.rowRight}>
                                        {renderStatusPill(item.transact_status ?? "")}

                                        <Text style={styles.text_secondary}>
                                            {(item.total_quantity ?? 0).toFixed(2)}
                                        </Text>

                                        <Text style={styles.text_secondary}>
                                            RM {item.transact_total_amount.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>

                            </View>
                        </Pressable>
                    );
                }}
                ListEmptyComponent={
                    <Text style={{ color: SystemColorTheme.Secondary, textAlign: "center", marginTop: 20 }}>
                        {sales.isLoading ? "Loading transactions..." : "No results found"}
                    </Text>
                }
            />

            {salesList !== undefined && metadata !== undefined && (
                <View style={{ position: "static", bottom: 10, left: 0, right: 0 }}>
                    <PaginationButtons currentPage={metadata.pageNo} totalPages={metadata.totalPages} onPageChange={(page) => setPageNo(page)} />
                    <Text style={styles.text_secondary_mini}>
                        Showing{" "}
                        {salesList.length === 0
                            ? "0"
                            : `${(metadata.pageNo - 1) * metadata.pageSize + 1} - ${(metadata.pageNo - 1) * metadata.pageSize + salesList.length
                            }`}{" "}
                        of {metadata.totalCount}{" "}
                        {searchStringQuery.trim()
                            ? `for search result: ${searchStringQuery}`
                            : "results"}
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
};