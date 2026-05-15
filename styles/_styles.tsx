// app/styles/_styles.tsx
import SystemColorTheme from '@/styles/system-color-theme';
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    text_secondary: {
        color: SystemColorTheme.Secondary,
        fontSize: 18
    },
    container: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        backgroundColor: SystemColorTheme.Background
    },
    categoryContainer: {
        marginHorizontal: "3%",
        padding: 10,
        backgroundColor: SystemColorTheme.Primary,
        borderWidth: 1,
        borderColor: SystemColorTheme.Secondary,
        borderRadius: 8,
        marginVertical: 5,
        maxWidth: 440,
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
        backgroundColor: SystemColorTheme.Background,
        borderWidth: 1,
        borderColor: SystemColorTheme.Secondary,
        borderRadius: 5,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        marginVertical: 3
    },
    button_lg: {
        minWidth: 310,
    },
    button_md: {
        minWidth: 150,
    },
    buttonIcon: {
        paddingRight: 5,
    },
    buttonLabel: {
        fontSize: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: SystemColorTheme.Secondary,
        marginVertical: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: SystemColorTheme.Secondary,
        borderRadius: 5,
        padding: 10,
        marginVertical: 5,
        color: SystemColorTheme.Secondary,
        backgroundColor: SystemColorTheme.Background
    },
    buttonText: {
        fontSize: 18,
        color: SystemColorTheme.Secondary,
    },
    formContainer: {
        padding: 16,
        backgroundColor: SystemColorTheme.Background
    },

    formSection: {
        marginBottom: 20,
    },

    formTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: SystemColorTheme.Secondary,
        marginBottom: 10,
    },

    inputRow: {
        flexDirection: "row",
        gap: 8,
        width: "100%"
    },

    formSelectButtons: {
        flex: 1,
        paddingVertical: 12
    },

    vehicleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },

    vehicleLabel: {
        color: SystemColorTheme.Secondary,
        width: 20,
        textAlign: "center",
        fontWeight: "bold",
    },

    vehicleInput: {
        flex: 1,
    },

    bg_danger: {
        backgroundColor: "#A31800"
    }
});