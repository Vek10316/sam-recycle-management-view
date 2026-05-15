import SystemColorTheme from '@/styles/system-color-theme';
import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: "Page not found!" }}/>
            <View style={styles.container}>
                <Link style={styles.button} href="/">
                    Go back to home screen.
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: SystemColorTheme.Background,
    },
    button: {
        fontSize: 20,
        textDecorationLine: "underline",
        color: "#fff",
    }
});