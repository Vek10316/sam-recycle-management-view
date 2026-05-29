import LoadingScreen from '@/app/components/DetailsLoadingScreen';
import useStockList from '@/app/hooks/stock/useStockList';
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from 'react';
import { FlatList, Pressable, Text, View } from "react-native";

export default function ItemScreen() {
  const router = useRouter();
  const { stockList, pricingHistory } = useStockList();
  const { category } = useLocalSearchParams();
  const items = useMemo(() => {
    return stockList.data?.filter((item) => item.stock_category === category);
  }, [stockList]);

  const prices = useMemo(() => {
    const sorted = pricingHistory.data?.sort((a, b) => {
      return (
        new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
      );
    });
    
    const latestMap = new Map();

    sorted?.forEach((price => {
      if (!latestMap.has(price.stock_id)) {
        latestMap.set(price.stock_id, price);
      }
    }));

    return Array.from(latestMap.values());
  }, [pricingHistory.data])

  if (stockList.isLoading || pricingHistory.isLoading) {
    return LoadingScreen();
  };

  return (
    <>
      <Stack.Screen options={{ title: `Category - ${category}` }} />
      <View style={{ flex: 1, padding: 16, backgroundColor: SystemColorTheme.Background }}>
        <View style={{ flexDirection: "row", justifyContent: "flex-start", position: "static", marginLeft: 15, marginBottom: 15, gap: 20, alignItems: "center"}}>
          <Pressable onPress={() => {
            router.push("/views/stock/inventory");
          }}>
            <FontAwesome name="reply" color={SystemColorTheme.Secondary} size={32}></FontAwesome>
          </Pressable>
          <Text style={{color: SystemColorTheme.Secondary, fontSize: 32}}>{category}</Text>
        </View>
        <FlatList
          data={items}
          keyExtractor={(item) => item.stock_id}
          ListEmptyComponent={<Text style={{fontSize: 18, color: SystemColorTheme.Secondary}}>No items found</Text>}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push({
              pathname: "/views/stock/inventory/StockDetailScreen",
              params: {stock_id: item.stock_id}
            })}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                padding: 16,
                marginBottom: 10,
                backgroundColor: SystemColorTheme.Primary,
                borderRadius: 8,
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <Text style={styles.text_secondary}>{`${item.stock_id} - ${item.stock_description}`}</Text>
              <View style={{
                flexDirection: "column",
                alignItems: "flex-end",
              }}>
                <Text style={styles.text_secondary}>{item.current_quantity} {item.stock_uom}</Text>
                <View style={{
                  flexDirection: "row",
                  gap: 8
                }}>
                  <Text style={styles.text_secondary}>B: {(prices.find(p => p.stock_id === item.stock_id)?.buy_price.toFixed(2) ?? "0")}</Text>
                  <Text style={styles.text_secondary}>S: {(prices.find(p => p.stock_id === item.stock_id)?.sell_price.toFixed(2) ?? "0")}</Text>
                </View>
              </View>
            </View>
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
        }} onPress={() => router.push('/views/stock/inventory/StockCreateScreen')}>
          <FontAwesome name="plus-circle" color={SystemColorTheme.Secondary} size={56}></FontAwesome>
        </Pressable>
      </View>
    </>
  );
}