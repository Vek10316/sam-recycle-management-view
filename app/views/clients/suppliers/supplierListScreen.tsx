//app/views/clients/suppliers/supplierListScreen.tsx
import useSupplierList from "@/hooks/clients/suppliers/useSupplierList";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import type { Supplier } from "@/types/clientType";
import FontAwesome, { default as Fontawesome } from "@expo/vector-icons/FontAwesome";
import { Link, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SupplierListScreen() {
    const [search, setSearch] = useState("");
    const [sortAsc, setSortAsc] = useState(true);
    const { supplierList, vehicles } = useSupplierList();
    const router = useRouter();
    if (supplierList.isLoading || vehicles.isLoading) {
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

    const suppliers = supplierList.data ?? [];
    const supplierVehicles = vehicles.data ?? [];

    const vehicleMap = useMemo(() => {
        const map = new Map<string, string[]>();

        for (const vehicle of supplierVehicles) {
            const existing = map.get(vehicle.supplier_id) ?? [];

            existing.push(vehicle.plate_no);

            map.set(vehicle.supplier_id, existing);
        }

        return map;
    }, [supplierVehicles]);

    const filteredSuppliers = useMemo(() => {
        const searchLower = search.toLowerCase();

        return suppliers
            .filter((supplier) => {
                const matchesSupplier =
                    supplier.supplier_name
                        .toLowerCase()
                        .includes(searchLower) ||
                    supplier.supplier_id
                        .toLowerCase()
                        .includes(searchLower);

                const plates =
                    vehicleMap.get(supplier.supplier_id) ?? [];

                const matchesVehicle = plates.some((plate) =>
                    plate.toLowerCase().includes(searchLower)
                );

                return matchesSupplier || matchesVehicle;
            })
            .sort((a, b) =>
                sortAsc
                    ? a.supplier_name.localeCompare(b.supplier_name)
                    : b.supplier_name.localeCompare(a.supplier_name)
            );
    }, [suppliers, vehicleMap, search, sortAsc]);

    const renderItem = ({ item }: { item: Supplier }) => (
        <View style={styles.card}>
            <Pressable onPress={() => router.push({
                pathname: "/views/clients/suppliers/SupplierDetailScreen",
                params: { supplier_id: item.supplier_id },
            })}>
                <Text style={[styles.text_secondary, { fontWeight: "bold", fontSize: 24 }]}>{item.supplier_name}</Text>

                <Text style={styles.text_secondary}>ID: {item.supplier_id}</Text>
                <Text style={styles.text_secondary}>📞 {item.supplier_phone}</Text>
                <Text style={styles.text_secondary}>✉️ {item.supplier_email}</Text>
                <Text style={styles.text_secondary}>📍 {item.supplier_address}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                    {(vehicleMap.get(item.supplier_id) ?? []).map((plate) => (
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
        <SafeAreaView style={styles.container}>
            <View style={styles.searchBar}>
                <Fontawesome name="search" size={24} color={SystemColorTheme.Secondary}></Fontawesome>

                <TextInput
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search suppliers..."
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
                data={filteredSuppliers}
                keyExtractor={(item) => item.supplier_id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 0 }}
                initialNumToRender={10}
                windowSize={10}
                removeClippedSubviews
            />

            <Pressable style={styles.fab} onPress={() => router.push('/views/clients/suppliers/SupplierCreateScreen')}>
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