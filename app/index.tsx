// app/index.tsx
import SystemColorTheme from '@/styles/system-color-theme';
import Fontawesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { styles } from "../styles/_styles";

export default function Index() {
  const iconSize_L = 20;
  const iconSize_S = 10;
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Inventory category */}
      <View style={styles.categoryContainer}>
        <View style={styles.categoryTitle}>
          <Fontawesome name="archive" size={iconSize_L} color={SystemColorTheme.Secondary} style={styles.categoryTitleIcon}></Fontawesome>
          <Text style={[styles.categoryTitleLabel, styles.text_secondary]}>Inventory</Text>
        </View>
          <View style={styles.categoryContent_lg}>
            <Pressable style={[styles.button, styles.button_lg]} onPress={() => router.push("/views/stock/inventory")}>
              <Fontawesome name="search" size={iconSize_L} color={SystemColorTheme.Secondary} style={styles.buttonIcon}></Fontawesome>
              <Text style={[styles.buttonLabel, styles.text_secondary]}>View inventory</Text>
            </Pressable>
          </View>
          <View style={styles.inputRow}>
            <Pressable style={[styles.button, styles.button_md]} onPress={onPress}>
              <Fontawesome name="minus-circle" size={iconSize_L} color={SystemColorTheme.Secondary} style={styles.buttonIcon}></Fontawesome>
              <Text style={[styles.buttonLabel, styles.text_secondary]}>Stock out</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.button_md]} onPress={onPress}>
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
          <Pressable onPress={() => router.push("/views/transactions/sales/salesListScreen")}>
            <View style={[styles.button, styles.button_md]}>
              <Fontawesome name="dollar" size={iconSize_L} color={SystemColorTheme.Secondary}></Fontawesome>
              <Fontawesome name="plus" size={iconSize_S} color={SystemColorTheme.Secondary} style={[styles.buttonIcon, {alignSelf: "flex-start"}]}></Fontawesome>
              <Text style={[styles.buttonLabel, styles.text_secondary]}>Sales</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => router.push("/views/transactions/purchases/purchasesListScreen")}>
            <View style={[styles.button, styles.button_md]}>
              <Fontawesome name="dollar" size={iconSize_L} color={SystemColorTheme.Secondary}></Fontawesome>
              <Fontawesome name="minus" size={iconSize_S} color={SystemColorTheme.Secondary} style={[styles.buttonIcon, {alignSelf: "flex-start"}]}></Fontawesome>
              <Text style={[styles.buttonLabel, styles.text_secondary]}>Purchases</Text>
            </View>
          </Pressable>
        </View>
        <View style={styles.inputRow}>
          <Pressable onPress={() => router.push("/views/transactions/sales/salesListScreen")}>
            <View style={[styles.button, styles.button_md]}>
              <Text style={[styles.buttonLabel, styles.text_secondary]}>New Sale</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => router.push("/views/transactions/purchases/purchasesCreateScreen")}>
            <View style={[styles.button, styles.button_md]}>
              <Text style={[styles.buttonLabel, styles.text_secondary]}>New Purchase</Text>
            </View>
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
          <Pressable style={[styles.button, styles.button_md]} onPress={() => router.push("/views/clients/buyers/buyerListScreen")}>
            <Fontawesome name="user" size={iconSize_L} color={SystemColorTheme.Secondary}></Fontawesome>
            <Fontawesome name="minus" size={iconSize_S} color={SystemColorTheme.Secondary} style={[styles.buttonIcon, {alignSelf: "flex-start"}]}></Fontawesome>
            <Text style={[styles.buttonLabel, styles.text_secondary]}>Buyers</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.button_md]} onPress={() => router.push("/views/clients/suppliers/supplierListScreen")}>
            <Fontawesome name="user" size={iconSize_L} color={SystemColorTheme.Secondary}></Fontawesome>
            <Fontawesome name="plus" size={iconSize_S} color={SystemColorTheme.Secondary} style={[styles.buttonIcon, {alignSelf: "flex-start"}]}></Fontawesome>
            <Text style={[styles.buttonLabel, styles.text_secondary]}>Suppliers</Text>
          </Pressable>
        </View>
      </View>
      
    </View>
  );
}

function onPress() {
  alert("You pressed a button!");
}