import SystemColorTheme from '@/styles/system-color-theme';
import type { Buyer, BuyerVehicles } from "@/types/clientType";
import Fontawesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const DUMMY_BUYERS: Buyer[] = [
  {
    buyer_id: "SUP-001",
    buyer_id_type: "BRN",
    buyer_name: "ABC Trading Sdn Bhd",
    buyer_phone: "012-3456789",
    buyer_email: "abc@trade.com",
    buyer_address: "Johor Bahru, Johor",
  },
  {
    buyer_id: "SUP-002",
    buyer_id_type: "BRN",
    buyer_name: "Global Parts Supply",
    buyer_phone: "013-9876543",
    buyer_email: "contact@globalparts.com",
    buyer_address: "Skudai, Johor",
  },
  {
    buyer_id: "SUP-003",
    buyer_id_type: "BRN",
    buyer_name: "Sunrise Hardware",
    buyer_phone: "019-1122334",
    buyer_email: "sales@sunrise.com",
    buyer_address: "Pasir Gudang, Johor",
  },
  {
  buyer_id: "SUP-004",
  buyer_id_type: "BRN",
  buyer_name: "Metro Auto Parts",
  buyer_phone: "014-5566778",
  buyer_email: "support@metroauto.com",
  buyer_address: "Batu Pahat, Johor",
},
{
  buyer_id: "SUP-005",
  buyer_id_type: "BRN",
  buyer_name: "Eastern Industrial Supply",
  buyer_phone: "017-8899001",
  buyer_email: "sales@easternind.com",
  buyer_address: "Kulai, Johor",
},
{
  buyer_id: "SUP-006",
  buyer_id_type: "BRN",
  buyer_name: "Prime Hardware & Tools",
  buyer_phone: "011-2233445",
  buyer_email: "contact@primehw.com",
  buyer_address: "Muar, Johor",
},
{
  buyer_id: "SUP-007",
  buyer_id_type: "BRN",
  buyer_name: "Southern Steel Trading",
  buyer_phone: "019-6677889",
  buyer_email: "info@southernsteel.com",
  buyer_address: "Pasir Gudang, Johor",
},
{
  buyer_id: "SUP-008",
  buyer_id_type: "BRN",
  buyer_name: "Eco Building Materials",
  buyer_phone: "013-4455667",
  buyer_email: "sales@ecobuild.com",
  buyer_address: "Skudai, Johor",
},
{
  buyer_id: "SUP-009",
  buyer_id_type: "BRN",
  buyer_name: "KSL Components Supply",
  buyer_phone: "012-9988776",
  buyer_email: "ksl@components.com",
  buyer_address: "Johor Bahru City",
},
{
  buyer_id: "SUP-010",
  buyer_id_type: "BRN",
  buyer_name: "Vision Engineering Supplies",
  buyer_phone: "018-3344556",
  buyer_email: "hello@visioneng.com",
  buyer_address: "Senai, Johor",
},
{
  buyer_id: "SUP-011",
  buyer_id_type: "BRN",
  buyer_name: "Titan Machinery Parts",
  buyer_phone: "016-7788990",
  buyer_email: "support@titanparts.com",
  buyer_address: "Gelang Patah, Johor",
},
{
  buyer_id: "SUP-012",
  buyer_id_type: "BRN",
  buyer_name: "Alpha Electrical Supplies",
  buyer_phone: "014-1122334",
  buyer_email: "alpha@electrical.com",
  buyer_address: "Tebrau, Johor",
},
{
  buyer_id: "SUP-013",
  buyer_id_type: "BRN",
  buyer_name: "Nexus Supply Chain",
  buyer_phone: "019-4455667",
  buyer_email: "contact@nexussupply.com",
  buyer_address: "Johor Bahru Central",
}
];

const DUMMY_VEHICLES: BuyerVehicles[] = [
  { vehicle_id: 1, buyer_id: "SUP-001", plate_no: "JHK1234" },
  { vehicle_id: 2, buyer_id: "SUP-001", plate_no: "JLM5678" },

  { vehicle_id: 3, buyer_id: "SUP-002", plate_no: "JXP8899" },

  { vehicle_id: 4, buyer_id: "SUP-003", plate_no: "JQA2211" },
  { vehicle_id: 5, buyer_id: "SUP-003", plate_no: "JRS7788" },
  { vehicle_id: 6, buyer_id: "SUP-003", plate_no: "JTU5566" },

  { vehicle_id: 7, buyer_id: "SUP-004", plate_no: "JVV1122" },
  { vehicle_id: 8, buyer_id: "SUP-005", plate_no: "JWX3344" },
];

const getBuyerVehicles = (buyer_id: string) => {
  return DUMMY_VEHICLES
    .filter((v) => v.buyer_id === buyer_id)
    .map((v) => v.plate_no);
};

export default function BuyerListScreen() {  
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const router = useRouter();
  const filteredBuyers = DUMMY_BUYERS
    .filter((item) =>
      item.buyer_name.toLowerCase().includes(search.toLowerCase()) ||
      item.buyer_id.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortAsc
        ? a.buyer_name.localeCompare(b.buyer_name)
        : b.buyer_name.localeCompare(a.buyer_name)
    );

  const renderItem = ({ item }: { item: Buyer }) => (
    <View style={styles.card}>
      <Pressable>
        <Text style={styles.name}>{item.buyer_name}</Text>
      </Pressable>

      <Text style={styles.text}>ID: {item.buyer_id}</Text>
      <Text style={styles.text}>📞 {item.buyer_phone}</Text>
      <Text style={styles.text}>✉️ {item.buyer_email}</Text>
      <Text style={styles.text}>📍 {item.buyer_address}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
        {getBuyerVehicles(item.buyer_id).map((plate) => (
            <View key={plate} style={styles.vehicleTag}>
            <Text style={styles.vehicleText}>{plate}</Text>
            </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.deleteBtn}>
          <Text style={styles.btnText}>Delete</Text>
        </Pressable>

        <Pressable style={styles.editBtn}>
          <Text style={styles.btnText}>Edit</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>

      <View style={styles.searchBar}>
        <Fontawesome name="search" size={24} color={SystemColorTheme.Secondary}></Fontawesome>

        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
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
        data={filteredBuyers}
        keyExtractor={(item) => item.buyer_id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Pressable style={styles.fab} onPress={() => router.push('/views/clients/buyers/buyerCreateScreen')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SystemColorTheme.Background,
    padding: 16,
    paddingBottom: 128
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: SystemColorTheme.Secondary,
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: SystemColorTheme.Secondary,
    backgroundColor: SystemColorTheme.Primary,
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: SystemColorTheme.Secondary,
    marginBottom: 6,
  },
  text: {
    color: SystemColorTheme.Secondary,
    fontSize: 13,
  },
  actions: {
  flexDirection: "row",
  justifyContent: "flex-end",
  marginTop: 10,
  gap: 15
},
editBtn: {
  backgroundColor: "#2E6F95",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 6,
},
deleteBtn: {
  backgroundColor: "#A94442",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 6,
},
btnText: {
  color: SystemColorTheme.Secondary,
  fontSize: 15,
  fontWeight: "600",
},
fab: {
  position: "absolute",
  right: 20,
  bottom: 50,
  width: 56,
  height: 56,
  borderRadius: 28,
  borderWidth: 1,
  borderColor: SystemColorTheme.Secondary,
  backgroundColor: SystemColorTheme.Background,
  justifyContent: "center",
  alignItems: "center",
  elevation: 5,
},
fabText: {
    color: SystemColorTheme.Secondary,
    fontSize: 28,
    lineHeight: 30
},
searchBar: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: SystemColorTheme.Primary,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: SystemColorTheme.Secondary,
  paddingHorizontal: 10,
  marginBottom: 12
},
searchInput: {
  flex: 1,
  color: SystemColorTheme.Secondary,
  padding: 8,
  margin: 8
},
sortBtn: {
  paddingHorizontal: 10,
  paddingVertical: 6,
  backgroundColor: SystemColorTheme.Background,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: SystemColorTheme.Secondary,
  marginLeft: 8,
},

sortText: {
  color: SystemColorTheme.Secondary,
  fontSize: 12,
  fontWeight: "600",
},
vehicleTag: {
  backgroundColor: SystemColorTheme.Background,
  borderWidth: 1,
  borderColor: SystemColorTheme.Secondary,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
},

vehicleText: {
  color: SystemColorTheme.Secondary,
  fontSize: 12,
  fontWeight: "500",
},
});