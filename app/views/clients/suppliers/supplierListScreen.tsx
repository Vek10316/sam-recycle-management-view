//app/views/clients/suppliers/SupplierListScreen.tsx
import LoadingScreen from "@/app/components/LoadingScreen";
import PaginationButtons from "@/app/components/PaginationButtons";
import supplierKeys from "@/app/queries/supplier.keys";
import useSupplierList from "@/hooks/clients/suppliers/useSupplierList";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import type { Supplier } from "@/types/clientType";
import FontAwesome, { default as Fontawesome } from "@expo/vector-icons/FontAwesome";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SupplierListScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [searchString, setSearchString] = useState("");
    const [sortAsc, setSortAsc] = useState(true);
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { supplierList } = useSupplierList(pageNo, pageSize, searchString);
    const suppliers = supplierList.data?.data ?? [];
    const metadata = supplierList.data?.metadata ?? {
        pageNo,
        pageSize,
        totalCount: 0,
        totalPages: 0,
    };

    const renderItem = ({ item }: { item: (Supplier & { plate_no?: string }) }) => (
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
                    {(item.plate_no !== undefined && item?.plate_no.trim() !== "") && item.plate_no.split(", ").map(plate => (
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

    const handleRefresh = async (reset?: boolean) => {
        if (reset) {
            setSearchString("");
        }
        queryClient.invalidateQueries({
            queryKey: supplierKeys.all
        });
    }

    if (supplierList.isLoading) {
        return <LoadingScreen />
    }

    return (
        <SafeAreaView style={[styles.container, { paddingTop: 0, paddingBottom: 60 }]}>
            <View style={styles.searchBar}>
                <Fontawesome name="search" size={24} color={SystemColorTheme.Secondary}></Fontawesome>

                <TextInput
                    style={styles.searchInput}
                    value={searchString}
                    onChangeText={setSearchString}
                    onEndEditing={() => {
                        queryClient.invalidateQueries({
                            queryKey: supplierKeys.all
                        })
                    }}
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
                data={suppliers}
                ListEmptyComponent={
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <Text style={styles.text_secondary}>No results</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.supplier_id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 0 }}
                initialNumToRender={10}
                windowSize={10}
                removeClippedSubviews
            />

            <View style={{ position: "static", bottom: 10, left: 0, right: 0 }}>
                <PaginationButtons currentPage={metadata.pageNo} totalPages={metadata.totalPages} onPageChange={(page) => setPageNo(page)} />
                <Text style={styles.text_secondary_mini}>
                    Showing{" "}
                    {suppliers.length === 0
                        ? "0"
                        : `${(metadata.pageNo - 1) * metadata.pageSize + 1} - ${(metadata.pageNo - 1) * metadata.pageSize + suppliers.length
                        }`}{" "}
                    of {metadata.totalCount}{" "}
                    {searchString.trim()
                        ? `for search result: ${searchString}`
                        : "results"}
                </Text>
            </View>

            <Pressable style={styles.fab} onPress={() => router.push('/views/clients/suppliers/SupplierCreateScreen')}>
                <FontAwesome name="plus-circle" color={SystemColorTheme.Secondary} size={56}></FontAwesome>
            </Pressable>
        </SafeAreaView>
    );
};