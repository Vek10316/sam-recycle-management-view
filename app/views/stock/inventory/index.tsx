import LoadingScreen from "@/app/components/LoadingScreen";
import useStockList from "@/hooks/stock/useStockList";
import SystemColorTheme from '@/styles/system-color-theme';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

export default function CategoryScreen() {
	const router = useRouter();
	const pageNo = 1;
	const pageSize = 100;
	const { categories } = useStockList(pageNo, pageSize);

	const stockCategories = categories.data?.data ?? [];

	if (categories.isLoading) {
		return <LoadingScreen />;
	};

	return (
		<View style={{ flex: 1, padding: 16, backgroundColor: SystemColorTheme.Background }}>
			<FlatList
				data={stockCategories}
				ListEmptyComponent={<Text style={{ fontSize: 18, color: SystemColorTheme.Secondary }}>No stock items found</Text>}
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
			<Pressable style={{
				position: "absolute",
					right: "5%",
					bottom: "5%",
					width: 56,
					height: 56,
					justifyContent: "center",
					backgroundColor: SystemColorTheme.Background,
					alignItems: "center",
					borderWidth: 1,
					borderColor: "black",
					borderRadius: 100,
			}} onPress={() => router.push('/views/stock/inventory/StockCreateScreen')}>
				<FontAwesome name="plus-circle" color={SystemColorTheme.Secondary} size={56}></FontAwesome>
			</Pressable>
		</View>
	);
}