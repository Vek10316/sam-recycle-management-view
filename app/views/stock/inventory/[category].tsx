import SystemColorTheme from '@/styles/system-color-theme';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

const allItems = [
  { id: "1", name: "Besi 1", category: "Besi" },
  { id: "2", name: "Besi 2", category: "Besi" },
  { id: "3", name: "Besi 3", category: "Besi" }
];

export default function ItemScreen() {
  const { category } = useLocalSearchParams();
  const router = useRouter();

  const items = allItems.filter(
    (item) => item.category === category
  );

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
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={{fontSize: 18, color: SystemColorTheme.Secondary}}>No items found</Text>}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 16,
                marginBottom: 10,
                backgroundColor: SystemColorTheme.Primary,
                borderRadius: 8
              }}
            >
              <Text style={{fontSize: 18, color: SystemColorTheme.Secondary}}>{item.name}</Text>
            </View>
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
        }} onPress={() => router.push('/views/stock/inventory/createStockScreen')}>
          <FontAwesome name="plus-circle" color={SystemColorTheme.Secondary} size={56}></FontAwesome>
        </Pressable>
      </View>
    </>
  );
}