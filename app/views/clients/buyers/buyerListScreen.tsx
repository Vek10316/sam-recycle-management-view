//app/views/clients/buyers/BuyerListScreen.tsx
import LoadingScreen from "@/app/components/LoadingScreen";
import PaginationButtons from "@/app/components/PaginationButtons";
import buyerKeys from "@/app/queries/buyer.keys";
import useBuyerList from "@/hooks/clients/buyers/useBuyerList";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import type { Buyer } from "@/types/clientType";
import FontAwesome, { default as Fontawesome } from "@expo/vector-icons/FontAwesome";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BuyerListScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [searchString, setSearchString] = useState("");
    const [sortAsc, setSortAsc] = useState(true);
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { buyerList } = useBuyerList(pageNo, pageSize, searchString);
    const buyers = buyerList.data?.data ?? [];
    const metadata = buyerList.data?.metadata ?? {
        pageNo,
        pageSize,
        totalCount: 0,
        totalPages: 0,
    };

    const renderItem = ({ item }: { item: (Buyer & { plate_no?: string }) }) => (
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
            queryKey: buyerKeys.all
        });
    }

    if (buyerList.isLoading) {
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
                            queryKey: buyerKeys.all
                        })
                    }}
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
                data={buyers}
                ListEmptyComponent={
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <Text style={styles.text_secondary}>No results</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.buyer_id}
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
                    {buyers.length === 0
                        ? "0"
                        : `${(metadata.pageNo - 1) * metadata.pageSize + 1} - ${(metadata.pageNo - 1) * metadata.pageSize + buyers.length
                        }`}{" "}
                    of {metadata.totalCount}{" "}
                    {searchString.trim()
                        ? `for search result: ${searchString}`
                        : "results"}
                </Text>
            </View>

            <Pressable style={styles.fab} onPress={() => router.push('/views/clients/buyers/BuyerCreateScreen')}>
                <FontAwesome name="plus-circle" color={SystemColorTheme.Secondary} size={56}></FontAwesome>
            </Pressable>
        </SafeAreaView>
    );
};