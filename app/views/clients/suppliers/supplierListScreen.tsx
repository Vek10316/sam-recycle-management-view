import SystemColorTheme from '@/styles/system-color-theme';
import type { Supplier, SupplierVehicles } from "@/types/clientType";
import FontAwesome, { default as Fontawesome } from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const DUMMY_SUPPLIERS: Supplier[] = [
  {
    supplier_id: "SUP-001",
    supplier_id_type: "BRN",
    supplier_name: "ABC Trading Sdn Bhd",
    supplier_phone: "012-3456789",
    supplier_email: "abc@trade.com",
    supplier_address: "Johor Bahru, Johor",
  },
  {
    supplier_id: "SUP-002",
    supplier_id_type: "BRN",
    supplier_name: "Global Parts Supply",
    supplier_phone: "013-9876543",
    supplier_email: "contact@globalparts.com",
    supplier_address: "Skudai, Johor",
  },
  {
    supplier_id: "SUP-003",
    supplier_id_type: "BRN",
    supplier_name: "Sunrise Hardware",
    supplier_phone: "019-1122334",
    supplier_email: "sales@sunrise.com",
    supplier_address: "Pasir Gudang, Johor",
  },
  {
    supplier_id: "SUP-004",
    supplier_id_type: "BRN",
    supplier_name: "Metro Auto Parts",
    supplier_phone: "014-5566778",
    supplier_email: "support@metroauto.com",
    supplier_address: "Batu Pahat, Johor",
  },
  {
    supplier_id: "SUP-005",
    supplier_id_type: "BRN",
    supplier_name: "Eastern Industrial Supply",
    supplier_phone: "017-8899001",
    supplier_email: "sales@easternind.com",
    supplier_address: "Kulai, Johor",
  },
  {
    supplier_id: "SUP-006",
    supplier_id_type: "BRN",
    supplier_name: "Prime Hardware & Tools",
    supplier_phone: "011-2233445",
    supplier_email: "contact@primehw.com",
    supplier_address: "Muar, Johor",
  },
  {
    supplier_id: "SUP-007",
    supplier_id_type: "BRN",
    supplier_name: "Southern Steel Trading",
    supplier_phone: "019-6677889",
    supplier_email: "info@southernsteel.com",
    supplier_address: "Pasir Gudang, Johor",
  },
  {
    supplier_id: "SUP-008",
    supplier_id_type: "BRN",
    supplier_name: "Eco Building Materials",
    supplier_phone: "013-4455667",
    supplier_email: "sales@ecobuild.com",
    supplier_address: "Skudai, Johor",
  },
  {
    supplier_id: "SUP-009",
    supplier_id_type: "BRN",
    supplier_name: "KSL Components Supply",
    supplier_phone: "012-9988776",
    supplier_email: "ksl@components.com",
    supplier_address: "Johor Bahru City",
  },
  {
    supplier_id: "SUP-010",
    supplier_id_type: "BRN",
    supplier_name: "Vision Engineering Supplies",
    supplier_phone: "018-3344556",
    supplier_email: "hello@visioneng.com",
    supplier_address: "Senai, Johor",
  },
  {
    supplier_id: "SUP-011",
    supplier_id_type: "BRN",
    supplier_name: "Titan Machinery Parts",
    supplier_phone: "016-7788990",
    supplier_email: "support@titanparts.com",
    supplier_address: "Gelang Patah, Johor",
  },
  {
    supplier_id: "SUP-012",
    supplier_id_type: "BRN",
    supplier_name: "Alpha Electrical Supplies",
    supplier_phone: "014-1122334",
    supplier_email: "alpha@electrical.com",
    supplier_address: "Tebrau, Johor",
  },
  {
    supplier_id: "SUP-013",
    supplier_id_type: "BRN",
    supplier_name: "Nexus Supply Chain",
    supplier_phone: "019-4455667",
    supplier_email: "contact@nexussupply.com",
    supplier_address: "Johor Bahru Central",
  }
];

const DUMMY_VEHICLES: SupplierVehicles[] = [
  { vehicle_id: 1, supplier_id: "SUP-001", plate_no: "JHK1234" },
  { vehicle_id: 2, supplier_id: "SUP-001", plate_no: "JLM5678" },

  { vehicle_id: 3, supplier_id: "SUP-002", plate_no: "JXP8899" },

  { vehicle_id: 4, supplier_id: "SUP-003", plate_no: "JQA2211" },
  { vehicle_id: 5, supplier_id: "SUP-003", plate_no: "JRS7788" },
  { vehicle_id: 6, supplier_id: "SUP-003", plate_no: "JTU5566" },

  { vehicle_id: 7, supplier_id: "SUP-004", plate_no: "JVV1122" },
  { vehicle_id: 8, supplier_id: "SUP-005", plate_no: "JWX3344" },
];

const getSupplierVehicles = (supplier_id: string) => {
  return DUMMY_VEHICLES
    .filter((v) => v.supplier_id === supplier_id)
    .map((v) => v.plate_no);
};

export default function SupplierListScreen() {  
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const router = useRouter();
  const filteredSuppliers = DUMMY_SUPPLIERS
    .filter((item) =>
      item.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier_id.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortAsc
        ? a.supplier_name.localeCompare(b.supplier_name)
        : b.supplier_name.localeCompare(a.supplier_name)
    );

  const renderItem = ({ item }: { item: Supplier }) => (
    <View style={styles.card}>
      <Pressable>
        <Text style={styles.name}>{item.supplier_name}</Text>
      </Pressable>

      <Text style={styles.text}>ID: {item.supplier_id}</Text>
      <Text style={styles.text}>📞 {item.supplier_phone}</Text>
      <Text style={styles.text}>✉️ {item.supplier_email}</Text>
      <Text style={styles.text}>📍 {item.supplier_address}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
        {getSupplierVehicles(item.supplier_id).map((plate) => (
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
          placeholder="Search suppliers..."
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
        data={filteredSuppliers}
        keyExtractor={(item) => item.supplier_id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 0 }}
      />

      <Pressable style={styles.fab} onPress={() => router.push('/views/clients/suppliers/supplierCreateScreen')}>
        <FontAwesome name="plus-circle" color={SystemColorTheme.Secondary} size={56}></FontAwesome>
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
  right: "5%",
  bottom: "5%",
  width: 56,
  height: 56,
  backgroundColor: SystemColorTheme.Background,
  justifyContent: "center",
  alignItems: "center"
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