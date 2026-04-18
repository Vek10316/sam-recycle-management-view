import { StyleSheet } from "react-native";
import { SystemColorTheme as Colors } from "./system-color-theme";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 5,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: Colors.Background,
    },
    categoryContainer: {
        marginHorizontal: "3%",
        padding: 10,
        backgroundColor: Colors.Primary,
        borderWidth: 1,
        borderColor: Colors.Secondary,
        borderRadius: 8,
        marginVertical: 5,
        width: 350,
    },
    categoryTitle: {
        flexDirection: "row",
        alignItems: "center"
    },
    categoryTitleIcon: {
        paddingRight: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    categoryTitleLabel: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.Secondary,
    },
    categoryContent_lg: {
        marginTop: 5,
        alignItems: "center",
    },
    categoryContent_md: {
        marginTop: 5,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-evenly"
    },
    button: {
        backgroundColor: Colors.Background,
        borderWidth: 1,
        borderColor: Colors.Secondary,
        borderRadius: 5,
        padding: 5,
        paddingVertical: 15,
        marginVertical: 5,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    button_lg: {
        width: 310,
    },
    button_md: {
        width: 150,
    },
    buttonIcon: {
        paddingRight: 5,
    },
    buttonLabel: {
        fontSize: 20,
        color: Colors.Secondary
    },
});