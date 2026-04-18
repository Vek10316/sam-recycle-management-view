import { SystemColorTheme as Colors } from "@/styles/system-color-theme";
import Fontawesome from "@expo/vector-icons/FontAwesome";
import { Pressable, Text, View } from "react-native";
import { styles } from "../styles/_styles";

export default function Index() {
  const iconSize_L = 20;
  const iconSize_S = 10;
  return (
    <View style={styles.container}>
      {/* Inventory category */}
      <View style={styles.categoryContainer}>
        <View style={styles.categoryTitle}>
          <Fontawesome name="archive" size={iconSize_L} color={Colors.Secondary} style={styles.categoryTitleIcon}></Fontawesome>
          <Text style={[styles.categoryTitleLabel, styles.text_secondary]}>Inventory</Text>
        </View>
          <View style={styles.categoryContent_lg}>
            <Pressable style={[styles.button, styles.button_lg]} onPress={onPress}>
              <Fontawesome name="search" size={iconSize_L} color={Colors.Secondary} style={styles.buttonIcon}></Fontawesome>
              <Text style={[styles.buttonLabel, styles.text_secondary]}>View inventory</Text>
            </Pressable>
          </View>
          <View style={styles.categoryContent_md}>
            <Pressable style={[styles.button, styles.button_md]} onPress={onPress}>
              <Fontawesome name="minus-circle" size={iconSize_L} color={Colors.Secondary} style={styles.buttonIcon}></Fontawesome>
              <Text style={[styles.buttonLabel, styles.text_secondary]}>Stock out</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.button_md]} onPress={onPress}>
              <Fontawesome name="plus-circle" size={iconSize_L} color={Colors.Secondary} style={styles.buttonIcon}></Fontawesome>
              <Text style={[styles.buttonLabel, styles.text_secondary]}>Stock in</Text>
            </Pressable>
          </View>
      </View>
      {/* Transactions category */}
      <View style={styles.categoryContainer}>
        <View style={styles.categoryTitle}>
          <Fontawesome name="book" size={iconSize_L} color={Colors.Secondary} style={styles.categoryTitleIcon}></Fontawesome>
          <Text style={[styles.categoryTitleLabel, styles.text_secondary]}>Transactions</Text>
        </View>
          <View style={styles.categoryContent_lg}>
            <Pressable style={[styles.button, styles.button_lg]} onPress={onPress}>
              <Fontawesome name="search" size={iconSize_L} color={Colors.Secondary} style={styles.buttonIcon}></Fontawesome>
              <Text style={[styles.buttonLabel, styles.text_secondary]}>View transactions</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.button_lg]} onPress={onPress}>
              <Fontawesome name="plus" size={iconSize_L} color={Colors.Secondary} style={styles.buttonIcon}></Fontawesome>
              <Text style={[styles.buttonLabel, styles.text_secondary]}>New transaction</Text>
            </Pressable>
          </View>
      </View>
      {/* Clients category */}
      <View style={styles.categoryContainer}>
        <View style={styles.categoryTitle}>
          <Fontawesome name="users" size={iconSize_L} color={Colors.Secondary} style={styles.categoryTitleIcon} />
          <Text style={[styles.categoryTitleLabel, styles.text_secondary]}>Clients</Text>
        </View>
        <View style={styles.categoryContent_md}>
          <Pressable style={[styles.button, styles.button_md]} onPress={onPress}>
            <Fontawesome name="user" size={iconSize_L} color={Colors.Secondary}></Fontawesome>
            <Fontawesome name="minus" size={iconSize_S} color={Colors.Secondary} style={[styles.buttonIcon, {alignSelf: "flex-start"}]}></Fontawesome>
            <Text style={[styles.buttonLabel, styles.text_secondary]}>Buyers</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.button_md]} onPress={onPress}>
            <Fontawesome name="user" size={iconSize_L} color={Colors.Secondary}></Fontawesome>
            <Fontawesome name="plus" size={iconSize_S} color={Colors.Secondary} style={[styles.buttonIcon, {alignSelf: "flex-start"}]}></Fontawesome>
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