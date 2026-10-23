import useApiHealth from "@/hooks/health/useApiHealth";
import { useOfflineStockCategories } from "@/hooks/offlineDatabase/stock/useOfflineStock";
import { useOverwriteAllStock } from "@/hooks/offlineDatabase/stock/useOfflineStockMutations";
import useStockList from "@/hooks/stock/useStockList";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoryScreen() {
	const router = useRouter();
	const pageNo = 1;
	const pageSize = 100;
	const { categories } = useStockList(pageNo, pageSize);
	const offlineCategories = useOfflineStockCategories();
	const overwriteAllStock = useOverwriteAllStock();
	const [displayOffline, setDisplayOffline] = useState<boolean>(false);
	const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false);

	// const handleOverwriteAllStock = async () => await overwriteAllStock.mutate()

	const { isOnline } = useApiHealth();

	const stockCategories = categories.data?.data ?? [];
	const offlineStockCategories = offlineCategories?.data?.sort((a, b) => a.localeCompare(b)) ?? [];

	return (
		<SafeAreaView edges={["bottom"]} style={{ flex: 1, padding: 16, backgroundColor: SystemColorTheme.Background }}>
			<FlatList
				data={!displayOffline && isOnline ? stockCategories : offlineStockCategories}
				ListEmptyComponent={<Text style={{ fontSize: 18, color: SystemColorTheme.Secondary }}>No {!isOnline && "offline"} items found</Text>}
				renderItem={({ item }) => (
					<Pressable
						onPress={() => router.push(`/views/stock/inventory/${item}`)}
						style={{
							padding: 16,
							marginBottom: 10,
							backgroundColor: SystemColorTheme.Primary,
							borderRadius: 8,
						}}
					>
						<Text style={{ fontSize: 18, color: SystemColorTheme.Secondary }}>{item}</Text>
					</Pressable>
				)}
			/>
			<Pressable style={[styles.fab, { right: "22%" }]} onPress={() => setConfirmModalVisible(prev => !prev)}>
				<FontAwesome name="refresh" color={SystemColorTheme.Secondary} size={56}></FontAwesome>
			</Pressable>
			<Pressable style={styles.fab} onPress={() => router.push('/views/stock/inventory/StockCreateScreen')}>
				<FontAwesome name="plus-circle" color={SystemColorTheme.Secondary} size={56}></FontAwesome>
			</Pressable>
			<Modal visible={confirmModalVisible} animationType="fade" transparent={true}>
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<View style={{
						width: "70%",
						backgroundColor: "rgba(0, 0, 0, 0.75)",
						borderRadius: 10,
						padding: 10,
						alignItems: "center",
						boxShadow: "#000",
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: 0.25,
						shadowRadius: 4,
						elevation: 5,
					}}>
						<Text style={styles.text_secondary}>Confirm overwrite stock?</Text>
						<View style={{ alignSelf: "flex-end", justifyContent: "flex-end", gap: 10, flexDirection: "row" }}>
							<Pressable style={[styles.button, styles.bg_danger, { paddingHorizontal: 15 }]} onPress={() => setConfirmModalVisible(false)}>
								<Text style={styles.text_secondary}>No</Text>
							</Pressable>
							<View style={[styles.button, styles.bg_info, { paddingHorizontal: 15 }]}>
								<Text style={styles.text_secondary}>Yes</Text>
							</View>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}