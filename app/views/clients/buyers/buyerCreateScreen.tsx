import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Buyer = {
    buyer_id: string;
    buyer_id_type: "NRIC" | "BRN" | "PASSPORT";
    buyer_name: string;
    buyer_address?: string;
    buyer_phone?: string;
    buyer_email?: string;
    buyer_tin?: string;
};

export default function BuyerCreateScreen() {
    useFocusEffect(
        useCallback(() => {
            return () => {
                handleFormClose();
            }
        }, [])
    );

    const [buyerData, setBuyerData] = useState<Buyer>({
        buyer_id: "",
        buyer_id_type: "NRIC",
        buyer_name: "",
        buyer_address: "",
        buyer_phone: "",
        buyer_email: "",
        buyer_tin: ""
    });

    const [buyerVehicles, setBuyerVehicles] = useState<string[]>([""]);

    const scrollRef = useRef<ScrollView>(null);
    const fieldRefs = useRef<Record<string, number>>({});

    const focusField = (y: number) => {
        scrollRef.current?.scrollTo({
            y: y - 200,
            animated: true
        });
    };

    const handleSubmit = () => {
        const buyerPayload = {
            buyer_id: buyerData.buyer_id,
            buyer_id_type: buyerData.buyer_id_type,
            buyer_name: buyerData.buyer_name,
            buyer_address: buyerData.buyer_address,
            buyer_phone: buyerData.buyer_phone,
            buyer_email: buyerData.buyer_email,
            buyer_tin: buyerData.buyer_tin,
        };

        console.log("Submitting buyer:", JSON.stringify(buyerPayload));
        if (buyerVehicles && buyerVehicles.length > 0) {
            const vehiclesPayload = {
                buyer_id: buyerData.buyer_id,
                plate_no: buyerVehicles
            }
        }
    };

    const handleVehicleChange = (
        index: number,
        value: string
    ) => {
        const updated = [...buyerVehicles];
        updated[index] = value.toUpperCase();
        setBuyerVehicles(updated);
    };

    const addVehicle = () => {
        const last = buyerVehicles[buyerVehicles.length - 1];
        if (!last || last.trim() === "") return;

        setBuyerVehicles([
            ...buyerVehicles, ""
        ]);
    };

    const handleCancel = () => {
        handleFormClose();
        router.push("/views/clients/buyers/buyerListScreen");
    }

    const handleFormClose = () => {
        setBuyerData({
            buyer_id: "",
            buyer_id_type: "NRIC",
            buyer_name: "",
            buyer_address: "",
            buyer_phone: "",
            buyer_email: "",
            buyer_tin: ""
        });
        setBuyerVehicles([""]);
    }

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: SystemColorTheme.Background }}
            edges={["bottom"]}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" || Platform.OS === "android" ? "padding" : undefined}
            >
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.formContainer}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                >

                    {/* Buyer Info */}
                    <View style={styles.categoryContainer}>

                        <Text style={styles.formTitle}>
                        <FontAwesome name="user" size={20}></FontAwesome>
                            Buyer Info
                        </Text>

                        <View style={styles.inputRow}>
                            {(["NRIC", "BRN", "PASSPORT"] as const).map((type) => (
                                <Pressable
                                    key={type}
                                    style={[
                                        styles.button,
                                        styles.formSelectButtons,
                                        buyerData.buyer_id_type === type && {
                                            backgroundColor: SystemColorTheme.Secondary
                                        }
                                    ]}
                                    onPress={() => {
                                        setBuyerData({...buyerData, buyer_id: "", buyer_id_type: type});
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            buyerData.buyer_id_type === type && {
                                                color: SystemColorTheme.Primary
                                            }
                                        ]}
                                    >
                                        {type}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {/* Buyer ID */}
                        <View
                            onLayout={(e) => {
                                fieldRefs.current["buyer_id"] =
                                    e.nativeEvent.layout.y;
                            }}
                        >
                            <TextInput
                                placeholder={`Enter ${buyerData.buyer_id_type}...`}
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                value={buyerData.buyer_id}
                                onChangeText={(text) => setBuyerData({...buyerData, buyer_id: text})}
                                style={styles.input}
                                onFocus={() => {
                                    const y = fieldRefs.current["buyer_id"];
                                    if (y !== undefined) focusField(y);
                                }}
                            />
                        </View>

                        {/* Name */}
                        <View
                            onLayout={(e) => {
                                fieldRefs.current["buyer_name"] =
                                    e.nativeEvent.layout.y;
                            }}
                        >
                            <TextInput
                                placeholder="Buyer Name..."
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                value={buyerData.buyer_name}
                                onChangeText={(text) => setBuyerData({...buyerData, buyer_name: text})}
                                style={styles.input}
                                onFocus={() => {
                                    const y = fieldRefs.current["buyer_name"];
                                    if (y !== undefined) focusField(y);
                                }}
                            />
                        </View>

                        {/* Phone + Email */}
                        <View
                            style={styles.inputRow}
                            onLayout={(e) => {
                                fieldRefs.current["contactRow"] =
                                    e.nativeEvent.layout.y;
                            }}
                        >
                            <TextInput
                                placeholder="Phone..."
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                value={buyerData.buyer_phone}
                                onChangeText={(text) => setBuyerData({...buyerData, buyer_phone: text})}
                                style={[styles.input, { flex: 1 }]}
                            />

                            <TextInput
                                placeholder="Email..."
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                value={buyerData.buyer_email}
                                onChangeText={(text) => setBuyerData({...buyerData, buyer_email: text})}
                                style={[styles.input, { flex: 1 }]}
                            />
                        </View>

                        {/* Address */}
                        <View
                            onLayout={(e) => {
                                fieldRefs.current["buyer_address"] =
                                    e.nativeEvent.layout.y;
                            }}
                        >
                            <TextInput
                                placeholder="Address..."
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                value={buyerData.buyer_address}
                                onChangeText={(text) => setBuyerData({...buyerData, buyer_address: text})}
                                style={styles.input}
                                onFocus={() => {
                                    const y = fieldRefs.current["buyer_address"];
                                    if (y !== undefined) focusField(y);
                                }}
                            />
                        </View>

                        {/* TIN */}
                        <View
                            onLayout={(e) => {
                                fieldRefs.current["buyer_tin"] =
                                    e.nativeEvent.layout.y;
                            }}
                        >
                            <TextInput
                                placeholder="TIN..."
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                value={buyerData.buyer_tin}
                                onChangeText={(text) => setBuyerData({...buyerData, buyer_tin: text})}
                                style={styles.input}
                                onFocus={() => {
                                    const y = fieldRefs.current["buyerTin"];
                                    if (y !== undefined) focusField(y);
                                }}
                            />
                        </View>

                    </View>

                    {/* Vehicles */}
                    <View style={styles.categoryContainer}>

                        <Text style={styles.formTitle}>
                            <FontAwesome name="car" size={20}></FontAwesome>
                            Vehicles
                        </Text>

                        {buyerVehicles.map((vehicle, index) => (
                            <View
                                key={index}
                                style={styles.vehicleRow}
                                onLayout={(e) => {
                                    fieldRefs.current[`vehicle-${index}`] =
                                        e.nativeEvent.layout.y;
                                }}
                            >
                                <Text style={styles.vehicleLabel}>
                                    {index + 1}.
                                </Text>

                                <TextInput
                                    placeholder="Vehicle plate..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={vehicle}
                                    onChangeText={(text) =>
                                        handleVehicleChange(index, text)
                                    }
                                    style={[styles.input, styles.vehicleInput]}
                                    onFocus={() => {
                                        const y =
                                            fieldRefs.current[`vehicle-${index}`];
                                        if (y !== undefined) focusField(y);
                                    }}
                                />
                            </View>
                        ))}

                        <Pressable
                            style={styles.button}
                            onPress={addVehicle}
                        >
                            <Text style={styles.buttonText}>
                                + Add Vehicle
                            </Text>
                        </Pressable>
                        <View style={styles.inputRow}>
                            <Pressable
                                style={[styles.button, styles.formSelectButtons, styles.bg_danger]}
                                onPress={handleCancel}
                            >
                                <Text style={styles.buttonText}>
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.formSelectButtons]}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.buttonText}>
                                    Save Buyer
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}