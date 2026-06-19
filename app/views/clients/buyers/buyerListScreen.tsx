//app/views/clients/buyers/buyerListScreen.tsx
import useBuyerList from "@/hooks/clients/buyers/useBuyerList";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import type { Buyer } from "@/types/clientType";
import FontAwesome, { default as Fontawesome } from "@expo/vector-icons/FontAwesome";
import { Link, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BuyerListScreen() {
    const [search, setSearch] = useState("");
    const [sortAsc, setSortAsc] = useState(true);
    const { buyerList, vehicles } = useBuyerList();
    const router = useRouter();
    if (buyerList.isLoading || vehicles.isLoading) {
        return (
            <View
                style={{
                    backgroundColor: SystemColorTheme.Background,
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1
                }}
            >
                <Text style={styles.text_secondary}>Loading...</Text>
                <Link href="/" style={[styles.text_secondary, { textDecorationLine: "underline" }]}>Go back</Link>
            </View>
        );
    };

    const buyers = buyerList.data ?? [];
    const buyerVehicles = vehicles.data ?? [];

    const vehicleMap = useMemo(() => {
        const map = new Map<string, string[]>();

        for (const vehicle of buyerVehicles) {
            const existing = map.get(vehicle.buyer_id) ?? [];

            existing.push(vehicle.plate_no);

            map.set(vehicle.buyer_id, existing);
        }

        return map;
    }, [buyerVehicles]);

    const filteredBuyers = useMemo(() => {
        const searchLower = search.toLowerCase();

        return buyers
            .filter((buyer) => {
                const matchesBuyer =
                    buyer.buyer_name
                        .toLowerCase()
                        .includes(searchLower) ||
                    buyer.buyer_id
                        .toLowerCase()
                        .includes(searchLower);

                const plates =
                    vehicleMap.get(buyer.buyer_id) ?? [];

                const matchesVehicle = plates.some((plate) =>
                    plate.toLowerCase().includes(searchLower)
                );

                return matchesBuyer || matchesVehicle;
            })
            .sort((a, b) =>
                sortAsc
                    ? a.buyer_name.localeCompare(b.buyer_name)
                    : b.buyer_name.localeCompare(a.buyer_name)
            );
    }, [buyers, vehicleMap, search, sortAsc]);

    const renderItem = ({ item }: { item: Buyer }) => (
        <View style={styles.card}>
            <Pressable onPress={() => router.push({
                pathname: "/views/clients/buyers/BuyerDetailScreen",
                params: { buyer_id: item.buyer_id },
            })}>
                <Text style={[styles.text_secondary, { fontWeight: "bold", fontSize: 24 }]}>{item.buyer_name}</Text>

                <Text style={styles.text_secondary}>ID: {item.buyer_id}</Text>
                <Text style={styles.text_secondary}>📞 {item.buyer_phone}</Text>
                <Text style={styles.text_secondary}>✉️ {item.buyer_email}</Text>
                <Text style={styles.text_secondary}>📍 {item.buyer_address}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                    {(vehicleMap.get(item.buyer_id) ?? []).map((plate) => (
                        <View key={plate} style={styles.vehicleTag}>
                            <Text style={styles.vehicleText}>
                                {plate}
                            </Text>
                        </View>
                    ))}
                </View>
            </Pressable>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, {paddingTop: 0, paddingBottom: 60}]}>
            <View style={styles.searchBar}>
                <Fontawesome name="search" size={24} color={SystemColorTheme.Secondary}></Fontawesome>

                <TextInput
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search buyers..."
                    placeholderTextColor="#aaa"
                />

                <Pressable
                    onPress={() => setSortAsc((prev) => !prev)}
                    style={styles.sortBtn}
                >
                    <Text style={styles.sortText}>
                        {sortAsc ? "A → Z" : "Z → A"}
                    </Text>
                </Pressable>
            </View>

            <FlatList
                data={filteredBuyers}
                keyExtractor={(item) => item.buyer_id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 0 }}
                initialNumToRender={10}
                windowSize={10}
                removeClippedSubviews
            />

            <Pressable style={styles.fab} onPress={() => router.push('/views/clients/buyers/BuyerCreateScreen')}>
                <FontAwesome name="plus-circle" color={SystemColorTheme.Secondary} size={56}></FontAwesome>
            </Pressable>
        </SafeAreaView>
    );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: SystemColorTheme.Background,
//     padding: 16,
//     paddingBottom: 128
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: SystemColorTheme.Secondary,
//     marginBottom: 12,
//   },
//
//   name: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: SystemColorTheme.Secondary,
//     marginBottom: 6,
//   },
//   text: {
//     color: SystemColorTheme.Secondary,
//     fontSize: 13,
//   },
//   actions: {
//   flexDirection: "row",
//   justifyContent: "flex-end",
//   marginTop: 10,
//   gap: 15
// },
//
//


// });