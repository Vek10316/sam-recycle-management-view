import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";

type Props = {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
};

const CheckBox = ({ value, onValueChange, disabled }: Props) => {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(opacity, {
            toValue: value ? 1 : 0,
            duration: 120,
            useNativeDriver: true,
        }).start();
    }, [value, opacity]);

    const handlePress = () => {
        if (disabled) return;

        Animated.sequence([
            Animated.timing(scale, {
                toValue: 0.92,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 1,
                duration: 80,
                useNativeDriver: true,
            }),
        ]).start();

        onValueChange(!value);
    };

    return (
        <Pressable
            onPress={handlePress}
            android_ripple={
                !disabled
                    ? { color: "rgba(0,0,0,0.15)", borderless: false }
                    : undefined
            }
            style={({ pressed }) => [
                styles.box,
                value && styles.boxChecked,
                disabled && styles.disabled,
                pressed && Platform.OS === "ios" && { opacity: 0.7 },
            ]}
        >
            <Animated.View style={{ transform: [{ scale }] }}>
                <View style={styles.inner}>
                    <Animated.View style={{ opacity }}>
                        <Ionicons name="checkmark" size={18} color="white" />
                    </Animated.View>
                </View>
            </Animated.View>
        </Pressable>
    );
};

export default CheckBox;

const SIZE = 22;

const styles = StyleSheet.create({
    box: {
        width: SIZE,
        height: SIZE,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#999",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        overflow: "hidden",
    },
    boxChecked: {
        backgroundColor: "#2563eb",
        borderColor: "#2563eb",
    },
    inner: {
        alignItems: "center",
        justifyContent: "center",
    },
    disabled: {
        opacity: 0.4,
    },
});