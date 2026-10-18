//app/views/transactions/purchases/purchasesListScreen.tsx
import HorizontalLine from "@/app/components/HorizontalLine";
import LoadingScreen from "@/app/components/LoadingScreen";
import PaginationButtons from "@/app/components/PaginationButtons";
import offlineTransactionsKeys from "@/app/queries/offlineTransactions.keys";
import purchasesKeys from "@/app/queries/purchaseTransactions.keys";
import useSupplierSearch from "@/hooks/clients/suppliers/useSupplierSearch";
import useApiHealth from "@/hooks/health/useApiHealth";
import useOfflineTransactions from "@/hooks/offlineDatabase/transactions/useOfflineTransactions";
import { useSyncPurchase } from "@/hooks/offlineDatabase/transactions/useOfflineTransactionsMutations";
import usePurchaseTransactions from "@/hooks/transactions/purchases/usePurchaseTransactions";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import { Supplier } from "@/types/clientType";
import type { OfflinePurchasesTransactionListResult } from "@/types/offlineTransactionType";
import { default as Fontawesome, default as FontAwesome } from "@expo/vector-icons/FontAwesome";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function PurchasesListScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [sortAsc, setSortAsc] = useState(true);
    const [searchStringInput, setSearchStringInput] = useState("");
    const [searchStringQuery, setSearchStringQuery] = useState("");
    const [pageNo, setPageNo] = useState(1);
    const pageSize = 100;
    const scrollRef = useRef<ScrollView | null>(null);

    const [syncPurchaseModalVisible, setSyncPurchaseModalVisible] = useState<boolean>(false);
    const [syncPurchaseTarget, setSyncPurchaseTarget] = useState<OfflinePurchasesTransactionListResult | null>(null);
    const [supplierMatch, setSupplierMatch] = useState<Supplier | null>(null);
    const [supplierSearch, setSupplierSearch] = useState<Supplier[] | null>(null);
    const [showOfflinePurchases, setShowOfflinePurchases] = useState<boolean>(false);
    const supplierMatchListRef = useRef<FlatList | null>(null);
    const supplierMatchRef = useRef<Record<number, View | null>>({});
    const syncPurchase = useSyncPurchase();

    const { isOnline } = useApiHealth();
    const purchases = isOnline ? usePurchaseTransactions(pageNo, pageSize, (searchStringQuery.trim() !== "" ? searchStringQuery.trim() : undefined)) : undefined;
    const { offlinePurchasesList: offlinePurchases } = useOfflineTransactions();
    const offlinePurchasesList = offlinePurchases.data ?? [];
    const purchasesList = isOnline ? purchases?.data?.data ?? [] : [];
    const metadata = purchases?.data?.metadata ?? {
        pageNo,
        pageSize,
        totalCount: 0,
        totalPages: 0,
    };

    const handleRefresh = useCallback(async (reset?: boolean) => {
        if (reset) {
            setShowOfflinePurchases(false);
            setSyncPurchaseModalVisible(false);
            setSyncPurchaseTarget(null);
            setSupplierMatch(null);
            setSupplierSearch(null);
            setSearchStringInput("");
            setSearchStringQuery("");
            setPageNo(1);
        }

        await queryClient.invalidateQueries({
            queryKey: purchasesKeys.all
        });

        await queryClient.invalidateQueries({
            queryKey: offlineTransactionsKeys.purchases
        });
    }, [queryClient]);

    useFocusEffect(useCallback(() => {
        return () => {
            handleRefresh(true);
        }
    }, [handleRefresh]))

    const handleSelectSyncTarget = (purchase: OfflinePurchasesTransactionListResult) => {
        useSupplierSearch({ searchQuery: "20" }).then(res => {
            setSupplierSearch(res);
            if (res !== undefined && res.length === 1) setSupplierMatch(res[0])
        }).finally(() => {
            setSyncPurchaseTarget(purchase);
        });
    };

    const handleSyncPurchase = async () => {
        if (syncPurchaseTarget === null) {
            Toast.show({
                type: "error",
                text1: "Failed to select sync target"
            });
            return;
        };

        if (supplierMatch === null) {
            Toast.show({
                type: "error",
                text1: "Could not match supplier!"
            });
            return;
        };

        syncPurchase.mutate({
            transact_id: syncPurchaseTarget.transact_id,
            supplier_id: supplierMatch.id
        });

        queryClient.invalidateQueries({
            queryKey: purchasesKeys.all
        });
        
        queryClient.invalidateQueries({
            queryKey: offlineTransactionsKeys.purchases
        });

        handleResetSyncTarget();
        setSyncPurchaseModalVisible(false);
    };

    const handleResetSyncTarget = () => {
        setSupplierSearch(null);
        setSupplierMatch(null);
        setSyncPurchaseTarget(null);
    };

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

    const viewPurchaseDetails = (transact_id: string) => {
        router.push({
            pathname: `./PurchasesDetailScreen`,
            params: { transact_id }
        });
    };

    const handleSupplierMatch = (supplier: Supplier) => {
        setSupplierMatch(supplier);
    };


    if (purchases != null && purchases.isFetching) {
        return LoadingScreen();
    }

    return (
        <SafeAreaView edges={["bottom"]} style={styles.container}>
            <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                    style={[styles.bg_default, styles.border, {
                        padding: 5,
                        height: 57,
                        width: 57,
                        borderRadius: 5,
                        justifyContent: "center",
                        alignItems: "center",
                    }]}
                    onPress={() => handleRefresh(true)}
                >
                    <Fontawesome style={[styles.icon, { fontSize: 32 }]} name="refresh" />
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
            <ScrollView ref={scrollRef} nestedScrollEnabled style={{ flex: 1 }}>
                {purchasesList.map(item => (
                    <Pressable key={item.transact_id} onPress={() => viewPurchaseDetails(item.transact_id)}>
                        <View style={[styles.card]}>
                            <View style={styles.row}>
                                <View style={styles.rowLeft}>
                                    <Text style={styles.text_secondary} numberOfLines={1}>
                                        {item.supplier_name || "Unknown Supplier"}
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
                ))}
                {!showOfflinePurchases ? (
                    <TouchableOpacity style={styles.button} onPress={() => setShowOfflinePurchases(true)}>
                        <Text style={styles.text_secondary}>Show Offline Purchases ({offlinePurchasesList.length})</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        {offlinePurchasesList.map(item => (
                            <Pressable key={`offline_${item.transact_id}`}>
                                <View style={[styles.card]}>
                                    <View style={styles.row}>
                                        <View style={styles.rowLeft}>
                                            <Text style={styles.text_secondary} numberOfLines={1}>
                                                {item.supplier_id}
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
                        ))}
                        <Pressable style={styles.button} onPress={() => setShowOfflinePurchases(false)}>
                            <Text style={styles.text_secondary}>Hide Offline Purchases</Text>
                        </Pressable>
                    </>
                )}
            </ScrollView>
            <TouchableOpacity style={styles.button} onPress={() => setSyncPurchaseModalVisible(true)}>
                <Text style={styles.text_secondary}>Sync Purchases ({offlinePurchasesList.length})</Text>
            </TouchableOpacity>
            {purchasesList !== undefined && metadata !== undefined && (
                <View style={{ position: "static", bottom: 10, left: 0, right: 0 }}>
                    <PaginationButtons currentPage={metadata.pageNo} totalPages={metadata.totalPages} onPageChange={(page) => setPageNo(page)} />
                    <Text style={styles.text_secondary_mini}>
                        Showing{" "}
                        {purchasesList.length === 0
                            ? "0"
                            : `${(metadata.pageNo - 1) * metadata.pageSize + 1} - ${(metadata.pageNo - 1) * metadata.pageSize + purchasesList.length
                            }`}{" "}
                        of {metadata.totalCount}{" "}
                        {searchStringQuery.trim()
                            ? `for search result: ${searchStringQuery}`
                            : "results"}
                    </Text>
                </View>
            )}
            <Pressable style={styles.fab} onPress={() => router.push('/views/transactions/purchases/PurchasesCreateScreen')}>
                <FontAwesome name="plus-circle" color={SystemColorTheme.Secondary} size={56}></FontAwesome>
            </Pressable>
            <Modal style={styles.modal} animationType="slide" visible={syncPurchaseModalVisible} onRequestClose={() => {
                handleResetSyncTarget();
                setSyncPurchaseModalVisible(false);
            }}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Sync Purchase</Text>
                    <Pressable>
                        <FontAwesome style={styles.icon} name="close" onPress={() => {
                            handleResetSyncTarget();
                            setSyncPurchaseModalVisible(false)
                        }} />
                    </Pressable>
                </View>
                {offlinePurchases.isLoading ? (
                    <View style={{ flex: 1 }}>
                        <Text style={styles.text_secondary}>Loading...</Text>
                    </View>
                ) : offlinePurchasesList.length === 0 ? (
                    <View style={{ flex: 1 }}>
                        <Text style={styles.text_secondary}>No offline purchases found</Text>
                    </View>
                ) : (syncPurchaseTarget === null ?
                    <FlatList
                        data={offlinePurchasesList}
                        renderItem={({ item }) => (
                            <View key={`offline_purchase_${item.transact_id}`} style={[styles.modalCard, styles.border]}>
                                <View style={[styles.row]}>
                                    <Text style={styles.text_secondary}>Transact ID: {item.transact_id}</Text>
                                    {renderStatusPill(item.transact_status)}
                                </View>
                                <Text style={styles.text_secondary}>Date: {item.transact_date != null ?
                                    new Date(item.transact_date).toLocaleDateString("en-CA", {
                                        hour: "numeric",
                                        minute: "numeric",
                                        hour12: false
                                    }).replaceAll(",", "") : "N/A"
                                }</Text>
                                <Text style={styles.text_secondary}>Supplier ID: {item.supplier_id}</Text>
                                <HorizontalLine marginVertical={5} />
                                <View style={styles.row}>
                                    <Text style={styles.text_secondary}>Total Quantity:</Text>
                                    <Text style={styles.text_secondary}>{item.total_quantity.toFixed(2)}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.text_secondary}>Total Amount:</Text>
                                    <Text style={styles.text_secondary}>RM{item.transact_total_amount.toFixed(2)}</Text>
                                </View>
                                <TouchableOpacity style={[styles.button, styles.bg_info]} onPress={() => handleSelectSyncTarget(item)}>
                                    <Text style={styles.text_secondary}>Sync</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                    :
                    <View style={{ flex: 1, alignItems: "center" }}>
                        <View style={[styles.modalBody, styles.border, { flex: 1 }]}>
                            <View style={{ flex: 1 }}>
                                <View style={[styles.row, { gap: 5, marginBottom: 5 }]}>
                                    <Text style={styles.text_secondary}>Transact ID: {syncPurchaseTarget.transact_id}</Text>
                                    {renderStatusPill(syncPurchaseTarget.transact_status)}
                                </View>
                                <View style={[styles.row, { gap: 5, marginBottom: 5 }]}>
                                    <Text style={styles.text_secondary}>Date:</Text>
                                    <Text style={[styles.text_secondary, { flex: 1 }]}>{syncPurchaseTarget.transact_date !== undefined && new Date(syncPurchaseTarget.transact_date).toLocaleString("en-GB").replaceAll(",", "")}</Text>
                                </View>
                                <Pressable onPress={() => {
                                    if (supplierMatch !== null) {
                                        supplierMatchListRef.current?.scrollToItem({
                                            item: supplierMatch,
                                            animated: true,
                                        })
                                    }
                                }}>
                                    <Text style={[
                                        styles.text_secondary,
                                        (supplierSearch !== null && supplierSearch.length === 0 || supplierMatch === null) && styles.text_warning,
                                        { marginBottom: 5 }
                                    ]} numberOfLines={1}>Supplier: {
                                            (supplierSearch === null || supplierSearch.length === 0) ? "No suppliers found" :
                                                supplierMatch !== null ? supplierMatch.supplier_name : ""
                                        }</Text>
                                </Pressable>
                                <View style={{ flex: 1 }}>
                                    {supplierSearch !== null && supplierSearch.length > 0 ? (
                                        <FlatList
                                            ref={supplierMatchListRef}
                                            data={supplierSearch}
                                            renderItem={({ item: supplier, index }) => (
                                                <View
                                                    key={`supplier_search_${supplier.id}`}
                                                    style={[
                                                        styles.border,
                                                        styles.container,
                                                        styles.bg_primary,
                                                        supplierMatch !== null && supplierMatch === supplier && styles.bg_info,
                                                        index < supplierSearch.length - 1 && { marginBottom: 5 }
                                                    ]}
                                                    ref={(ref) => {
                                                        supplierMatchRef.current[supplier.id] = ref;
                                                    }}
                                                >
                                                    <TouchableOpacity
                                                        onPress={() => handleSupplierMatch(supplier)}
                                                    >
                                                        <Text style={styles.text_secondary} numberOfLines={1}>ID: {supplier.id}</Text>
                                                        <Text style={styles.text_secondary} numberOfLines={1}>Supplier ID: {supplier.supplier_id}</Text>
                                                        <Text style={styles.text_secondary} numberOfLines={1}>Supplier Name: {supplier.supplier_name}</Text>
                                                        <Text style={styles.text_secondary} numberOfLines={1}>Supplier Phone: {supplier.supplier_phone}</Text>
                                                        <Text style={styles.text_secondary} numberOfLines={1}>Last Transaction: {supplier.last_transact_date ?? "N/A"}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        />
                                    ) : (
                                        <View style={{ flex: 1 }}>
                                            <TouchableOpacity style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                                <Text style={[styles.text_secondary, { textDecorationLine: "underline" }]}>Add {syncPurchaseTarget.supplier_id} as supplier</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <HorizontalLine marginVertical={5} />
                            <View>
                                <View style={[styles.row, { gap: 5, marginBottom: 5 }]}>
                                    <Text style={styles.text_secondary}>Total Quantity:</Text>
                                    <Text style={styles.text_secondary}>{syncPurchaseTarget.total_quantity.toFixed(2) ?? "N/A"}</Text>
                                </View>
                                <View style={[styles.row, { gap: 5, marginBottom: 5 }]}>
                                    <Text style={styles.text_secondary}>Total Amount:</Text>
                                    <Text style={styles.text_secondary}>RM {syncPurchaseTarget.transact_total_amount.toFixed(2)}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ marginTop: 5, alignSelf: "flex-end", flexDirection: "row", gap: 10 }}>
                            <TouchableOpacity onPress={() => handleResetSyncTarget()} style={[styles.button, styles.bg_danger]}>
                                <Text style={styles.text_secondary}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    { flexDirection: "row", gap: 5 },
                                    supplierMatch === null ? styles.bg_primary : styles.bg_info
                                ]}
                                onPress={() => handleSyncPurchase()}
                            >
                                <FontAwesome name={supplierMatch === null ? "close" : "check"} style={styles.icon} />
                                <Text style={styles.text_secondary}>Sync</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </Modal>
        </SafeAreaView>
    );
};
