import { styles } from "@/styles/_styles";
import SystemColorTheme from "@/styles/system-color-theme";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function LoadingScreen(message?: string) {
    const router = useRouter();
    return (
        <View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: SystemColorTheme.Background}}>
            <Text style={styles.text_secondary}>{message ?? "Loading..."}</Text>
            <Pressable onPress={() => router.back()}>
                <Text style={[styles.text_secondary, { textDecorationLine: "underline" }]}>
                    Go back
                </Text>
            </Pressable>
        </View>
    );
};