import { styles } from "@/styles/_styles";
import SystemColorTheme from "@/styles/system-color-theme";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

const LoadingScreen = () => {
    const router = useRouter();
    return (
        <View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: SystemColorTheme.Background}}>
            <Text style={styles.text_secondary}>Loading...</Text>
            <Pressable onPress={() => router.back()}>
                <Text style={[styles.text_secondary, { textDecorationLine: "underline" }]}>
                    Go back
                </Text>
            </Pressable>
        </View>
    );
};

export default LoadingScreen;