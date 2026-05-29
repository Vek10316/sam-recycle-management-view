import LoadingScreen from "@/app/components/DetailsLoadingScreen";
import useStockList from "@/app/hooks/stock/useStockList";
import SystemColorTheme from '@/styles/system-color-theme';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

export default function CategoryScreen() {
  const router = useRouter();
  const { stockList } = useStockList();

  const stockCategories = useMemo(() => {
    return [...new Set(stockList.data?.map(s => s.stock_category))];
  }, [stockList.data]);
  
  if (stockList.isLoading) {
    return LoadingScreen();
  };

  return (
    <View style={{flex: 1, padding: 16, backgroundColor: SystemColorTheme.Background }}>
      <FlatList
        data={stockCategories}
        ListEmptyComponent={<Text style={{fontSize: 18, color: SystemColorTheme.Secondary}}>No stock items found</Text>}
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
        backgroundColor: SystemColorTheme.Background,
        justifyContent: "center",
        alignItems: "center"
      }} onPress={() => router.push('/views/stock/inventory/stockCreateScreen')}>
        <FontAwesome name="plus-circle" color={SystemColorTheme.Secondary} size={56}></FontAwesome>
      </Pressable>
    </View>
  );
}