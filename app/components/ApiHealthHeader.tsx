// app/components/ApiStatusHeader.tsx

import { Text, View } from "react-native";
import { useApiHealthContext } from "../providers/ApiHealthProvider";

export default function ApiStatusHeader() {
    const { isOnline } = useApiHealthContext();

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 16,
            }}
        >
            <View
                style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: isOnline ? "green" : "red",
                    marginRight: 6,
                }}
            />

            <Text style={{color: "white"}}>
                {isOnline ? "Online" : "Offline"}
            </Text>
        </View>
    );
}