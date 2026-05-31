//app/views/transactions/purchases/purchasesListScreen.tsx
import LoadingScreen from "@/app/components/DetailsLoadingScreen";
import purchasesKeys from "@/app/queries/purchaseTransactions.keys";
import usePurchaseTransactions from "@/hooks/transactions/purchases/usePurchaseTransactions";
import SystemColorTheme from '@/styles/system-color-theme';
import Fontawesome from "@expo/vector-icons/FontAwesome";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function PurchasesListScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const purchases = usePurchaseTransactions();
    const purchasesList = purchases.data ?? [];
    const [sortAsc, setSortAsc] = useState(true);
    const [searchString, setSearchString] = useState("");


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
            <View style={[styles.pill, { backgroundColor: colorHex }]}>
                <Text style={styles.pillText}>
                    {status.toUpperCase()}
                </Text>
            </View>
        );
    };

    const filteredAndSortedPurchases = useMemo(() => {
        const filtered = purchasesList.filter((p) => {
            const supplierName = p.supplier_name.toLowerCase();

            const search = searchString.toLowerCase().trim();

            return (
                p.transact_id.toLowerCase().includes(search) ||
                supplierName.includes(search)
            );
        });

        return [...filtered].sort((a, b) => {
            const supplierA = a.supplier_name || "";
            const supplierB = b.supplier_name || "";

            return sortAsc
                ? supplierA.localeCompare(supplierB)
                : supplierB.localeCompare(supplierA);
        });
    }, [searchString, sortAsc, purchasesList]);

    const placeHolderButton = () => {
        alert("You pressed a button!");
    }

    const formatDateString = (input: string) => {
        try {
            const formattedDate = new Date(input).toLocaleDateString('en-GB', {
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

    const viewPurchaseDetails = (transact_id: string) => {
        router.push(`./PurchasesDetailScreen?transact_id=${transact_id}`);
    };


    if (purchases.isLoading) {
        return LoadingScreen("Loading purchases...");
    } else if (purchases.isFetching) {
        return LoadingScreen("Refreshing purchases...")
    }

    const handleRefresh = () => {
        queryClient.invalidateQueries({
            queryKey: purchasesKeys.all
        });
    };

    return (
        <View style={styles.container}>
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
                    onPress={() => handleRefresh()}
                >
                    <Fontawesome name="refresh" size={32} color="#000" />
                </Pressable>
                <View style={styles.searchBar}>

                    <Fontawesome name="search" size={24} color={SystemColorTheme.Secondary} />
                    <TextInput
                        style={styles.searchInput}
                        value={searchString}
                        onChangeText={(text) => setSearchString(text)}
                        placeholder="Search purchases"
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

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10, gap: 7 }}>
                <Pressable style={{ flex: 1, backgroundColor: SystemColorTheme.Secondary, alignItems: "center", paddingVertical: 5, borderRadius: 5 }} onPress={placeHolderButton}>
                    <Text style={{ fontSize: 18 }}>Filter</Text>
                </Pressable>
                <Pressable style={{ flex: 1, backgroundColor: SystemColorTheme.Secondary, alignItems: "center", paddingVertical: 5, borderRadius: 5 }} onPress={placeHolderButton}>
                    <Text style={{ fontSize: 18 }}>Sort</Text>
                </Pressable>
            </View>

            <FlatList
                data={filteredAndSortedPurchases}
                keyExtractor={(item) => item.transact_id}


                renderItem={({ item }) => {
                    return (
                        <Pressable onPress={() => viewPurchaseDetails(item.transact_id)}>
                            <View style={[styles.card]}>
                                <View style={styles.row}>
                                    <View style={styles.left}>
                                        <Text style={styles.name} numberOfLines={1}>
                                            {item.supplier_name || "Unknown Supplier"}
                                        </Text>

                                        <Text style={styles.text} numberOfLines={1}>
                                            {item.transact_id}
                                        </Text>

                                        <Text style={styles.text}>
                                            {item.transact_date?.trim()
                                                ? formatDateString(item.transact_date!)
                                                : ""}
                                        </Text>
                                    </View>

                                    <View style={styles.right}>
                                        {renderStatusPill(item.transact_status ?? "")}

                                        <Text style={styles.text}>
                                            {(item.total_quantity ?? 0).toFixed(2)}
                                        </Text>

                                        <Text style={styles.text}>
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
                        {purchases.isLoading ? "Loading transactions..." : "No results found"}
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: SystemColorTheme.Background,
        padding: 16,
        paddingBottom: 40
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: SystemColorTheme.Secondary,
        marginBottom: 12,
    },
    card: {
        flex: 1,
        borderWidth: 1,
        borderColor: SystemColorTheme.Secondary,
        backgroundColor: SystemColorTheme.Primary,
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
        color: SystemColorTheme.Secondary,
        textOverflow: "ellipsis",
        overflow: "hidden"
    },
    text: {
        color: SystemColorTheme.Secondary,
        fontSize: 18,
    },
    btnText: {
        color: SystemColorTheme.Secondary,
        fontSize: 15,
        fontWeight: "600",
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SystemColorTheme.Primary,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: SystemColorTheme.Secondary,
        paddingHorizontal: 10,
        marginBottom: 12,
        flex: 1,
    },
    searchInput: {
        flex: 1,
        color: SystemColorTheme.Secondary,
        padding: 8,
        margin: 8,
        fontSize: 18,
    },
    sortBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: SystemColorTheme.Background,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: SystemColorTheme.Secondary,
        marginLeft: 8,
        height: 34
    },

    sortText: {
        color: SystemColorTheme.Secondary,
        fontSize: 12,
        fontWeight: "600",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "flex-start",
    },

    left: {
        flex: 1,
        minWidth: 0, // CRITICAL in RN for text truncation in rows
        paddingRight: 10,
    },

    right: {
        alignItems: "flex-end",
        flexShrink: 1,
        minWidth: 0,
        gap: 0,
    },

    pill: {
        alignSelf: "flex-end",
        paddingVertical: 3,
        paddingHorizontal: 6,
        borderRadius: 5,
        backgroundColor: "#000",
        maxWidth: "100%",   // allow container control instead of fixed cap
    },

    pillText: {
        color: "#fff",
        fontSize: 16,
        flexShrink: 1,
        textAlign: "center",
    },
});