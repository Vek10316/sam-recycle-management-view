import usePurchaseTransactions from "@/app/hooks/transactions/usePurchaseTransactions";
import SystemColorTheme from '@/styles/system-color-theme';
import Fontawesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function purchasesListScreen() {
    const router = useRouter();
    const { purchasesList, refetch, loading, error } = usePurchaseTransactions();
    const [sortAsc, setSortAsc] = useState(true);
    const [searchString, setSearchString] = useState("");

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    )

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
            <View style={{
                padding: 3,
                paddingHorizontal: 5,
                backgroundColor: colorHex,
                borderRadius: 5,
                justifyContent: "center"
            }}>
                <Text style={{color: "#fff"}}>{status.toUpperCase()}</Text>
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
        router.push(`./purchasesDetailScreen?transact_id=${transact_id}`);
    };

    return (
        <View style={styles.container}>
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
                    {sortAsc ? "A → Z" : "Z → A"}
                    </Text>
                </Pressable>
            </View>

            <View style={{flexDirection: "row", justifyContent: "space-between", marginBottom: 10, gap: 7}}>
                <Pressable style={{flex: 1, backgroundColor: SystemColorTheme.Secondary, alignItems: "center", paddingVertical: 5, borderRadius: 5}} onPress={placeHolderButton}>
                    <Text style={{fontSize: 18}}>Filter</Text>
                </Pressable>
                <Pressable style={{flex: 1, backgroundColor: SystemColorTheme.Secondary, alignItems: "center", paddingVertical: 5, borderRadius: 5}} onPress={placeHolderButton}>
                    <Text style={{fontSize: 18}}>Sort</Text>
                </Pressable>
            </View>

            <FlatList
            data={filteredAndSortedPurchases}
            keyExtractor={(item) => item.transact_id}


            renderItem={({ item }) => {
                return (
                <Pressable onPress={() => viewPurchaseDetails(item.transact_id)}>
                    <View style={styles.card}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={styles.name}>
                            {item.supplier_name || "Unknown Supplier"}
                            <Text style={styles.text}> | {item.transact_id}</Text>
                        </Text>
                        {renderStatusPill(item.transact_status ?? "")}
                        </View>

                        <Text style={styles.text}>Date: {(item.transact_date?.trim() !== "") ? formatDateString(item.transact_date!) : ""}</Text>
                        <Text style={styles.text}>
                        Amount: RM {item.transact_total_amount}
                        </Text>
                    </View>
                </Pressable>
                );
            }}
            ListEmptyComponent={
                <Text style={{ color: SystemColorTheme.Secondary, textAlign: "center", marginTop: 20 }}>
                    {loading ? "Loading transactions..." : "No results found"}
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
    borderWidth: 1,
    borderColor: SystemColorTheme.Secondary,
    backgroundColor: SystemColorTheme.Primary,
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: SystemColorTheme.Secondary,
    marginBottom: 6,
  },
  text: {
    color: SystemColorTheme.Secondary,
    fontSize: 13,
  },
  actions: {
  flexDirection: "row",
  justifyContent: "flex-end",
  marginTop: 10,
  gap: 15
},
editBtn: {
  backgroundColor: "#2E6F95",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 6,
},
deleteBtn: {
  backgroundColor: "#A94442",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 6,
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
  marginBottom: 12
},
searchInput: {
  flex: 1,
  color: SystemColorTheme.Secondary,
  padding: 8,
  margin: 8
},
sortBtn: {
  paddingHorizontal: 10,
  paddingVertical: 6,
  backgroundColor: SystemColorTheme.Background,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: SystemColorTheme.Secondary,
  marginLeft: 8,
},

sortText: {
  color: SystemColorTheme.Secondary,
  fontSize: 12,
  fontWeight: "600",
}
});