import { styles } from "@/styles/_styles";
import SystemColorTheme from "@/styles/system-color-theme";
import { AntDesign, Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
    const router = useRouter();

    return (
        <SafeAreaView edges={["bottom"]} style={[styles.container]}>
            <View style={{ flex: 1, gap: 10 }}>
                <View style={overviewStyles.menuRow_lg}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push("/views/reports/ReportsOverview")}>
                        <View style={[overviewStyles.menuButton]}>
                            <AntDesign name="line-chart" style={overviewStyles.menuButtonIcon_lg} />
                            <Text style={overviewStyles.menuButtonText}>Reports</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push("/views/expenses/ExpensesRecordListScreen")}>
                        <View style={[overviewStyles.menuButton]}>
                            <Ionicons name="cash-outline" style={overviewStyles.menuButtonIcon_lg} />
                            <Text style={overviewStyles.menuButtonText}>Expenses</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={overviewStyles.menuRow_lg}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push("/views/stock/inventory")}>
                        <View style={[overviewStyles.menuButton]}>
                            <FontAwesome5 name="box" style={overviewStyles.menuButtonIcon_lg} />
                            <Text style={overviewStyles.menuButtonText}>Inventory</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{ flex: 1, flexDirection: "row", gap: 10 }}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push("/views/transactions/sales/SalesListScreen")}>
                            <View style={[overviewStyles.menuButton]}>
                                <View style={{ flexDirection: "row", alignSelf: "center" }}>
                                    <MaterialCommunityIcons name="file-document" style={overviewStyles.menuButtonIcon_sm} />
                                    <AntDesign name="dollar-circle" style={[overviewStyles.menuButtonIcon_mini, { alignSelf: "flex-end" }]} />
                                </View>
                                <Text style={overviewStyles.menuButtonText}>Sales</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push("/views/transactions/purchases/PurchasesListScreen")}>
                            <View style={[overviewStyles.menuButton]}>
                                <View style={{ flexDirection: "row", alignSelf: "center" }}>
                                    <MaterialCommunityIcons name="file-document" style={overviewStyles.menuButtonIcon_sm} />
                                    <Feather name="archive" style={[overviewStyles.menuButtonIcon_mini, { alignSelf: "flex-end" }]} />
                                </View>
                                <Text style={overviewStyles.menuButtonText}>Purchases</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={overviewStyles.menuRow_lg}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push("/views/transactions/sales/SalesCreateScreen")}>
                        <View style={[overviewStyles.menuButton]}>
                            <MaterialCommunityIcons name="invoice-arrow-right" style={overviewStyles.menuButtonIcon_lg} />
                            <Text style={overviewStyles.menuButtonText}>New Sale</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push("/views/transactions/purchases/PurchasesCreateScreen")}>
                        <View style={[overviewStyles.menuButton]}>
                            <MaterialCommunityIcons name="invoice-arrow-left" style={overviewStyles.menuButtonIcon_lg} />
                            <Text style={overviewStyles.menuButtonText}>New Purchase</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={overviewStyles.menuRow_sm}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push("/views/clients/buyers/BuyerListScreen")}>
                        <View style={overviewStyles.menuButton}>
                            <View style={{ flexDirection: "row", gap: 5, alignSelf: "center" }}>
                                <FontAwesome5 name="user" style={overviewStyles.menuButtonIcon_sm} />
                                <AntDesign name="dollar-circle" style={[overviewStyles.menuButtonIcon_mini, { alignSelf: "flex-end" }]} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push("/views/transactions/sales/SalesListScreen")}>
                        <View style={overviewStyles.menuButton}>
                            <View style={{ flexDirection: "row", alignSelf: "center" }}>
                                <MaterialCommunityIcons name="invoice-text-outline" style={overviewStyles.menuButtonIcon_sm} />
                                <AntDesign name="dollar-circle" style={[overviewStyles.menuButtonIcon_mini, { alignSelf: "flex-end" }]} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push("/views/clients/suppliers/SupplierListScreen")}>
                        <View style={overviewStyles.menuButton}>
                            <View style={{ flexDirection: "row", gap: 5, alignSelf: "center" }}>
                                <FontAwesome5 name="user" style={overviewStyles.menuButtonIcon_sm} />
                                <Feather name="archive" style={[overviewStyles.menuButtonIcon_mini, { alignSelf: "flex-end" }]} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push("/views/transactions/purchases/PurchasesListScreen")}>
                        <View style={overviewStyles.menuButton}>
                            <View style={{ flexDirection: "row", alignSelf: "center" }}>
                                <MaterialCommunityIcons name="invoice-text-outline" style={overviewStyles.menuButtonIcon_sm} />
                                <Feather name="archive" style={[overviewStyles.menuButtonIcon_mini, { alignSelf: "flex-end" }]} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const overviewStyles = StyleSheet.create({
    menuButton: {
        backgroundColor: SystemColorTheme.Primary,
        alignContent: "center",
        justifyContent: "center",
        flex: 1,
    },
    menuButtonIcon_lg: {
        color: SystemColorTheme.Secondary,
        fontSize: 60,
        textAlign: "center",
    },
    menuButtonIcon_sm: {
        color: SystemColorTheme.Secondary,
        fontSize: 45,
        textAlign: "center",
    },
    menuButtonIcon_mini: {
        color: SystemColorTheme.Secondary,
        fontSize: 20,
        textAlign: "center",
    },
    menuButtonText: {
        textAlign: "center",
        color: SystemColorTheme.Secondary,
        fontSize: 24,
        fontWeight: "bold",
    },
    menuRow_lg: {
        flexDirection: "row",
        flex: 1,
        gap: 10,
        maxHeight: "20%"
    },
    menuRow_sm: {
        flexDirection: "row",
        flex: 1,
        gap: 10,
        maxHeight: "10%"
    },
});