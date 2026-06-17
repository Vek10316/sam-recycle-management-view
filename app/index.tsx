// app/index.tsx
import SystemColorTheme from '@/styles/system-color-theme';
import Fontawesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { styles } from "../styles/_styles";

export default function Index() {
    const iconSize_L = 20;
    const iconSize_S = 10;
    const router = useRouter();
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: SystemColorTheme.Background }}>
            <View style={styles.container}>
                {/* Inventory category */}
                <View style={styles.categoryContainer}>
                    <View style={styles.categoryTitle}>
                        <Fontawesome name="archive" size={iconSize_L} color={SystemColorTheme.Secondary} style={styles.categoryTitleIcon}></Fontawesome>
                        <Text style={[styles.categoryTitleLabel, styles.text_secondary]}>Inventory</Text>
                    </View>
                    <Pressable style={[styles.button]} onPress={() => router.push("/views/stock/inventory")}>
                        <Fontawesome name="search" size={iconSize_L} color={SystemColorTheme.Secondary} style={styles.buttonIcon}></Fontawesome>
                        <Text style={[styles.buttonLabel, styles.text_secondary]}>View inventory</Text>
                    </Pressable>
                    <View style={styles.inputRow}>
                        <Pressable style={[styles.button, { flex: 1 }]} onPress={() => router.push("/views/stock/movement/StockMovementCreateScreen")}>
                            <Fontawesome name="minus-circle" size={iconSize_L} color={SystemColorTheme.Secondary} style={styles.buttonIcon}></Fontawesome>
                            <Text style={[styles.buttonLabel, styles.text_secondary]}>Stock out</Text>
                        </Pressable>
                        <Pressable style={[styles.button, { flex: 1 }]} onPress={() => router.push("/views/stock/movement/StockMovementCreateScreen")}>
                            <Fontawesome name="plus-circle" size={iconSize_L} color={SystemColorTheme.Secondary} style={styles.buttonIcon}></Fontawesome>
                            <Text style={[styles.buttonLabel, styles.text_secondary]}>Stock in</Text>
                        </Pressable>
                    </View>
                </View>
                {/* Transactions category */}
                <View style={styles.categoryContainer}>
                    <View style={styles.categoryTitle}>
                        <Fontawesome name="book" size={iconSize_L} color={SystemColorTheme.Secondary} style={styles.categoryTitleIcon}></Fontawesome>
                        <Text style={[styles.categoryTitleLabel, styles.text_secondary]}>Transactions</Text>
                    </View>
                    <View style={styles.inputRow}>
                        <Pressable style={[styles.button, { flex: 1 }]} onPress={() => router.push("/views/transactions/sales/SalesListScreen")}>
                            <Fontawesome name="dollar" size={iconSize_L} color={SystemColorTheme.Secondary}></Fontawesome>
                            <Fontawesome name="plus" size={iconSize_S} color={SystemColorTheme.Secondary} style={[styles.buttonIcon, { alignSelf: "flex-start" }]}></Fontawesome>
                            <Text style={[styles.buttonLabel, styles.text_secondary]}>Sales</Text>
                        </Pressable>
                        <Pressable style={[styles.button, { flex: 1 }]} onPress={() => router.push("/views/transactions/purchases/PurchasesListScreen")}>
                            <Fontawesome name="dollar" size={iconSize_L} color={SystemColorTheme.Secondary}></Fontawesome>
                            <Fontawesome name="minus" size={iconSize_S} color={SystemColorTheme.Secondary} style={[styles.buttonIcon, { alignSelf: "flex-start" }]}></Fontawesome>
                            <Text style={[styles.buttonLabel, styles.text_secondary]}>Purchases</Text>
                        </Pressable>
                    </View>
                    <View style={styles.inputRow}>
                        <Pressable style={[styles.button, { flex: 1 }]} onPress={() => router.push("/views/transactions/sales/SalesListScreen")}>
                            <Text style={[styles.buttonLabel, styles.text_secondary]}>New Sale</Text>
                        </Pressable>
                        <Pressable style={[styles.button, { flex: 1 }]} onPress={() => router.push("/views/transactions/purchases/PurchasesCreateScreen")}>
                            <Text style={[styles.buttonLabel, styles.text_secondary]}>New Purchase</Text>
                        </Pressable>
                    </View>
                </View>
                {/* Clients category */}
                <View style={styles.categoryContainer}>
                    <View style={styles.categoryTitle}>
                        <Fontawesome name="users" size={iconSize_L} color={SystemColorTheme.Secondary} style={styles.categoryTitleIcon} />
                        <Text style={[styles.categoryTitleLabel, styles.text_secondary]}>Clients</Text>
                    </View>
                    <View style={styles.inputRow}>
                        <Pressable style={[styles.button, { flex: 1 }]} onPress={() => onPress()}>
                            <Fontawesome name="user" size={iconSize_L} color={SystemColorTheme.Secondary}></Fontawesome>
                            <Fontawesome name="minus" size={iconSize_S} color={SystemColorTheme.Secondary} style={[styles.buttonIcon, { alignSelf: "flex-start" }]}></Fontawesome>
                            <Text style={[styles.buttonLabel, styles.text_secondary]}>Buyers</Text>
                        </Pressable>
                        <Pressable style={[styles.button, { flex: 1 }]} onPress={() => router.push("/views/clients/suppliers/SupplierListScreen")}>
                            <Fontawesome name="user" size={iconSize_L} color={SystemColorTheme.Secondary}></Fontawesome>
                            <Fontawesome name="plus" size={iconSize_S} color={SystemColorTheme.Secondary} style={[styles.buttonIcon, { alignSelf: "flex-start" }]}></Fontawesome>
                            <Text style={[styles.buttonLabel, styles.text_secondary]}>Suppliers</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

function onPress() {
    Toast.show({
        type: "error",
        text1: "Hello world",
    });
}