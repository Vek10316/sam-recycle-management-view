import SystemColorTheme from '@/styles/system-color-theme';
import type { Buyer } from "@/types/clientType";
import type { SalesTransaction } from "@/types/transactionType";
import Fontawesome from "@expo/vector-icons/FontAwesome";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const DUMMY_SALES: SalesTransaction[] = [
  { transact_id: "1", buyer_id: "12345", transact_date: "2026-04-29", transact_address: "", transact_total_amount: 125, transact_status: "Paid" },
  { transact_id: "2", buyer_id: "67890", transact_date: "2026-04-29", transact_address: "", transact_total_amount: 40, transact_status: "Pending" },
  { transact_id: "3", buyer_id: "12345", transact_date: "2026-04-29", transact_address: "", transact_total_amount: 30, transact_status: "Paid" },

  { transact_id: "4", buyer_id: "11111", transact_date: "2026-04-28", transact_address: "", transact_total_amount: 210, transact_status: "Pending" },
  { transact_id: "5", buyer_id: "22222", transact_date: "2026-04-27", transact_address: "", transact_total_amount: 75, transact_status: "Paid" },
  { transact_id: "6", buyer_id: "33333", transact_date: "2026-04-26", transact_address: "", transact_total_amount: 150, transact_status: "Cancelled" },
  { transact_id: "7", buyer_id: "44444", transact_date: "2026-04-25", transact_address: "", transact_total_amount: 90, transact_status: "Pending" },
  { transact_id: "8", buyer_id: "55555", transact_date: "2026-04-24", transact_address: "", transact_total_amount: 60, transact_status: "Paid" },
  { transact_id: "9", buyer_id: "67890", transact_date: "2026-04-23", transact_address: "", transact_total_amount: 300, transact_status: "Paid" },
  { transact_id: "10", buyer_id: "11111", transact_date: "2026-04-22", transact_address: "", transact_total_amount: 45, transact_status: "Pending" },

  { transact_id: "11", buyer_id: "22222", transact_date: "2026-04-21", transact_address: "", transact_total_amount: 500, transact_status: "Paid" },
  { transact_id: "12", buyer_id: "33333", transact_date: "2026-04-20", transact_address: "", transact_total_amount: 120, transact_status: "Cancelled" },
  { transact_id: "13", buyer_id: "44444", transact_date: "2026-04-19", transact_address: "", transact_total_amount: 80, transact_status: "Paid" },
  { transact_id: "14", buyer_id: "55555", transact_date: "2026-04-18", transact_address: "", transact_total_amount: 35, transact_status: "Pending" },
  { transact_id: "15", buyer_id: "12345", transact_date: "2026-04-17", transact_address: "", transact_total_amount: 260, transact_status: "Paid" },
];

const DUMMY_SUPPLIERS: Partial<Buyer>[] = [
  { buyer_id: "12345", buyer_name: "John Cena" },
  { buyer_id: "67890", buyer_name: "Zhong Xi Na" },

  { buyer_id: "11111", buyer_name: "Alpha Supplies" },
  { buyer_id: "22222", buyer_name: "Beta Trading" },
  { buyer_id: "33333", buyer_name: "Gamma Wholesale" },
  { buyer_id: "44444", buyer_name: "Delta Goods" },
  { buyer_id: "55555", buyer_name: "Epsilon Mart" },
];


export default function salesListScreen() {
    const [sortAsc, setSortAsc] = useState(true);
    const [searchString, setSearchString] = useState("");
    const buyerMap = useMemo(
        () =>
            Object.fromEntries(
            DUMMY_SUPPLIERS
                .filter(s => s.buyer_id)
                .map(s => [s.buyer_id!, s])
            ),
        []
    );
    const renderStatusPill = (status: string) => {
        let colorHex: string = "";
        switch (status.toLowerCase()) {
            case "paid":
                colorHex = "#079C14";
                break;
            case "pending":
                colorHex = "#C89809";
                break;
            default:
                colorHex = "#C81C09";
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

    const filteredAndSortedSales = useMemo(() => {
        const filtered = DUMMY_SALES.filter((p) => {
            const buyerName =
            buyerMap[p.buyer_id]?.buyer_name?.toLowerCase() || "";

            const search = searchString.toLowerCase().trim();

            return (
            p.transact_id.toLowerCase().includes(search) ||
            buyerName.includes(search)
            );
        });

        return [...filtered].sort((a, b) => {
            const buyerA = buyerMap[a.buyer_id]?.buyer_name || "";
            const buyerB = buyerMap[b.buyer_id]?.buyer_name || "";

            return sortAsc
            ? buyerA.localeCompare(buyerB)
            : buyerB.localeCompare(buyerA);
        });
    }, [searchString, sortAsc, buyerMap]);

    const placeHolderButton = () => {
        alert("You pressed a button!");
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <Fontawesome name="search" size={24} color={SystemColorTheme.Secondary} />

                <TextInput
                    style={styles.searchInput}
                    value={searchString}
                    onChangeText={(text) => setSearchString(text)}
                    placeholder="Search sales"
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
            data={filteredAndSortedSales}
            keyExtractor={(item) => item.transact_id}


            renderItem={({ item }) => {
                const buyer = buyerMap[item.buyer_id];

                return (
                <View style={styles.card}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.name}>
                        {buyer?.buyer_name || "Unknown Buyer"}
                        <Text style={styles.text}> | {item.transact_id}</Text>
                    </Text>
                    {renderStatusPill(item.transact_status ?? "")}
                    </View>

                    <Text style={styles.text}>Date: {item.transact_date}</Text>
                    <Text style={styles.text}>
                    Amount: RM {item.transact_total_amount}
                    </Text>
                </View>
                );
            }}
            ListEmptyComponent={
                <Text style={{ color: SystemColorTheme.Secondary, textAlign: "center", marginTop: 20 }}>
                    No results found
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