import LoadingScreen from "@/app/components/DetailsLoadingScreen";
import useBuyerDetails from "@/hooks/clients/buyers/useBuyerDetails";
import { useUpdateBuyer } from "@/hooks/clients/buyers/useBuyerMutations";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import { BuyerVehicles, type Buyer } from "@/types/clientType";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function BuyerDetailScreen() {
    const [enableKeyboardAvoidView, setEnableKeyboardAvoidView] = useState<boolean>(false);
    const router = useRouter();
    const { buyer_id } = useLocalSearchParams<{ buyer_id: string }>();
    if (!buyer_id || buyer_id.trim() === "") {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: SystemColorTheme.Background,
                }}>
                <Text style={styles.text_secondary}>
                    Invalid buyer ID
                </Text>
                <Link href="/views/clients/buyers/BuyerListScreen" style={{ textDecorationLine: "underline" }}>
                    Go back
                </Link>
            </View>
        )
    }

    const [initialized, setInitialized] = useState(false);
    const [buyerUpdateData, setBuyerUpdateData] = useState<{ buyer: Buyer, vehicles: Pick<BuyerVehicles, "plate_no">[] }>({
        buyer: {
            buyer_id: "",
            buyer_id_type: "NRIC",
            buyer_name: "",
            buyer_address: "",
            buyer_phone: "",
            buyer_email: "",
            buyer_tin: "",
        },
        vehicles: []
    });

    const { buyer, vehicles, loading, error } = useBuyerDetails(buyer_id);

    useEffect(() => {
        if (loading || initialized) return;

        if (!buyer) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: `Failed to load buyer ${buyer_id}`
            });
            handleFormClose;
            router.replace({
                pathname: "/views/clients/buyers/BuyerListScreen"
            });
        }

        setBuyerUpdateData(prev => buyer ? {
            buyer: buyer,
            vehicles: vehicles
        } : prev);

        setInitialized(true);
    }, [loading]);

    const editBuyerDetails = useUpdateBuyer();

    useFocusEffect(
        useCallback(() => {
            return () => {
                handleFormClose();
            }
        }, [])
    );

    const inputRefs = useRef<Record<string, TextInput | null>>({});
    const scrollRef = useRef<ScrollView>(null);
    const fieldRefs = useRef<Record<string, number>>({});

    const focusField = (y: number) => {
        scrollRef.current?.scrollTo({
            y: y - 100,
            animated: true
        });
    };

    const handleUpdate = async () => {
        const buyerPayload = {
            buyer_id: buyerUpdateData.buyer.buyer_id,
            buyer_id_type: buyerUpdateData.buyer.buyer_id_type,
            buyer_name: buyerUpdateData.buyer.buyer_name,
            buyer_address: buyerUpdateData.buyer.buyer_address,
            buyer_phone: buyerUpdateData.buyer.buyer_phone,
            buyer_email: buyerUpdateData.buyer.buyer_email,
            buyer_tin: buyerUpdateData.buyer.buyer_tin,
        };

        const vehiclesPayload = buyerUpdateData.vehicles.map(v => {
            return {
                buyer_id: buyerUpdateData.buyer.buyer_id,
                plate_no: v.plate_no
            };
        })

        const update = await editBuyerDetails.mutateAsync({
            id: buyer_id,
            buyer: buyerPayload,
            vehicles: vehiclesPayload,
        });

        if (update?.buyer?.buyer_id?.trim() !== "") {
            Toast.show({
                type: "success",
                text1: "Update success",
                text2: `Successfully updated buyer ${buyer_id}`,
            })
        }
    };

    const handleVehicleChange = (
        index: number,
        value: string
    ) => {
        const updated = [...buyerUpdateData.vehicles];
        updated[index] = {
            plate_no: value.toUpperCase()
        };
        setBuyerUpdateData((prev) => {
            return {
                buyer: prev.buyer,
                vehicles: updated
            }
        });
    };

    const addVehicle = () => {
        const last = buyerUpdateData.vehicles[buyerUpdateData.vehicles.length - 1];
        if (last && last.plate_no.trim() === "") return;

        setBuyerUpdateData(prev => {
            return {
                buyer: prev.buyer,
                vehicles: [
                    ...prev.vehicles,
                    { plate_no: "" },
                ]
            }
        });
    };

    const removeVehicle = (plate_no: string) => {
        setBuyerUpdateData(prev => {
            return {
                buyer: prev.buyer,
                vehicles: prev.vehicles.filter(v => v.plate_no !== plate_no),
            }
        });
    };

    const handleCancel = () => {
        handleFormClose();
        router.push("/views/clients/buyers/BuyerListScreen");
    };

    const handleFormClose = () => {
        setBuyerUpdateData({
            buyer: {
                buyer_id: "",
                buyer_id_type: "NRIC",
                buyer_name: "",
                buyer_address: "",
                buyer_phone: "",
                buyer_email: "",
                buyer_tin: ""
            },
            vehicles: []
        });
        setInitialized(false);
    }

    if (loading) {
        return LoadingScreen();
    } else {
        return (
            <SafeAreaView
                style={{ flex: 1, backgroundColor: SystemColorTheme.Background }}
                edges={["bottom"]}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1, height: 0 }}
                    behavior={"padding"}
                    keyboardVerticalOffset={100}
                    enabled={enableKeyboardAvoidView}
                >
                    <ScrollView
                        ref={scrollRef}
                        contentContainerStyle={styles.formContainer}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="none"
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
                                            styles.flexButton,
                                            styles.formSelectButtons,
                                            buyerUpdateData.buyer.buyer_id_type === type && {
                                                backgroundColor: SystemColorTheme.Secondary
                                            }
                                        ]}
                                        onPress={() => {
                                            setBuyerUpdateData(prev => {
                                                return {
                                                    buyer: {
                                                        ...prev.buyer,
                                                        buyer_id_type: type
                                                    },
                                                    vehicles: prev.vehicles
                                                };
                                            })
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                buyerUpdateData.buyer.buyer_id_type === type && {
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
                                style={styles.inputSection}
                            >
                                <Text style={styles.text_secondary}>{buyerUpdateData.buyer.buyer_id_type}:</Text>
                                <TextInput
                                    placeholder={`Enter ${buyerUpdateData.buyer.buyer_id_type}...`}
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={buyerUpdateData.buyer.buyer_id}
                                    onChangeText={(text) => setBuyerUpdateData(prev => prev ? {
                                        ...prev, buyer: {
                                            ...prev.buyer,
                                            buyer_id: text,
                                        }
                                    } : prev)}
                                    style={styles.input}
                                    ref={(ref) => {
                                        inputRefs.current[`buyer_id`] = ref;
                                    }}
                                    onFocus={() => {
                                        setEnableKeyboardAvoidView(true);
                                        const y =
                                            fieldRefs.current["buyer_id"];

                                        if (y !== undefined) {
                                            focusField(y);
                                        }
                                    }}
                                    onEndEditing={() => setEnableKeyboardAvoidView(false)}
                                />
                            </View>

                            {/* Name */}
                            <View
                                style={styles.inputSection}
                            >
                                <Text style={styles.text_secondary}>Name:</Text>
                                <TextInput
                                    placeholder="Buyer Name..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={buyerUpdateData.buyer.buyer_name}
                                    onChangeText={(text) => setBuyerUpdateData((prev) => prev ? {
                                        ...prev,
                                        buyer: {
                                            ...prev.buyer,
                                            buyer_name: text
                                        },
                                    } : prev)}
                                    style={styles.input}
                                    ref={(ref) => {
                                        inputRefs.current[`buyer_name`] = ref;
                                    }}
                                    onFocus={() => {
                                        setEnableKeyboardAvoidView(true);
                                        const y =
                                            fieldRefs.current["buyer_name"];

                                        if (y !== undefined) {
                                            focusField(y);
                                        }
                                    }}
                                    onEndEditing={() => setEnableKeyboardAvoidView(false)}
                                />
                            </View>

                            <View
                                style={styles.inputSection}
                            >
                                <Text style={styles.text_secondary}>Phone:</Text>
                                <TextInput
                                    placeholder="Phone..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={buyerUpdateData.buyer.buyer_phone}
                                    onChangeText={(text) => setBuyerUpdateData(prev => prev ? {
                                        ...prev,
                                        buyer: {
                                            ...prev.buyer,
                                            buyer_phone: text,
                                        },
                                    } : prev)}
                                    style={[styles.input, { flex: 1 }]}
                                    ref={(ref) => {
                                        inputRefs.current[`buyer_phone`] = ref;
                                    }}
                                    onFocus={() => {
                                        setEnableKeyboardAvoidView(true);
                                        const y =
                                            fieldRefs.current["buyer_phone"];

                                        if (y !== undefined) {
                                            focusField(y);
                                        }
                                    }}
                                    onEndEditing={() => setEnableKeyboardAvoidView(false)}
                                />
                            </View>

                            <View
                                style={styles.inputSection}
                            >
                                <Text style={styles.text_secondary}>Email:</Text>
                                <TextInput
                                    placeholder="Email..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={buyerUpdateData.buyer.buyer_email}
                                    onChangeText={(text) => setBuyerUpdateData(prev => prev ? {
                                        ...prev,
                                        buyer: {
                                            ...prev.buyer,
                                            buyer_email: text,
                                        }
                                    } : prev)}
                                    style={[styles.input, { flex: 1 }]}
                                    ref={(ref) => {
                                        inputRefs.current[`buyer_email`] = ref;
                                    }}
                                    onFocus={() => {
                                        setEnableKeyboardAvoidView(true);
                                        const y =
                                            fieldRefs.current["buyer_email"];

                                        if (y !== undefined) {
                                            focusField(y);
                                        }
                                    }}
                                    onEndEditing={() => setEnableKeyboardAvoidView(false)}
                                />

                            </View>

                            {/* Address */}
                            <View
                                style={styles.inputSection}
                            >
                                <Text style={styles.text_secondary}>Address:</Text>
                                <TextInput
                                    placeholder="Address..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={buyerUpdateData.buyer.buyer_address}
                                    onChangeText={(text) => setBuyerUpdateData(prev => prev ? {
                                        ...prev,
                                        buyer: {
                                            ...prev.buyer,
                                            buyer_address: text
                                        }
                                    } : prev)}
                                    style={styles.input}
                                    ref={(ref) => {
                                        inputRefs.current[`buyer_address`] = ref;
                                    }}
                                    onFocus={() => {
                                        setEnableKeyboardAvoidView(true);
                                        const y =
                                            fieldRefs.current["buyer_address"];

                                        if (y !== undefined) {
                                            focusField(y);
                                        }
                                    }}
                                    onEndEditing={() => setEnableKeyboardAvoidView(false)}
                                />
                            </View>

                            {/* TIN */}
                            <View
                                style={styles.inputSection}
                            >
                                <Text style={styles.text_secondary}>TIN:</Text>
                                <TextInput
                                    placeholder="TIN..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={buyerUpdateData.buyer.buyer_tin}
                                    onChangeText={(text) => setBuyerUpdateData(prev => prev ? {
                                        ...prev,
                                        buyer: {
                                            ...prev.buyer,
                                            buyer_tin: text,
                                        }
                                    } : prev)}
                                    style={styles.input}
                                    ref={(ref) => {
                                        inputRefs.current[`buyer_tin`] = ref;
                                    }}
                                    onFocus={() => {
                                        setEnableKeyboardAvoidView(true);
                                        const y =
                                            fieldRefs.current["buyer_tin"];

                                        if (y !== undefined) {
                                            focusField(y);
                                        }
                                    }}
                                    onEndEditing={() => setEnableKeyboardAvoidView(false)}
                                />
                            </View>

                        </View>

                        {/* Vehicles */}
                        <View style={styles.categoryContainer}>

                            <Text style={styles.formTitle}>
                                <FontAwesome name="car" size={20}></FontAwesome>
                                Vehicles
                            </Text>

                            {buyerUpdateData.vehicles.map((vehicle, index) => (
                                <View
                                    key={index}
                                    style={styles.vehicleRow}
                                >
                                    <Text style={styles.text_secondary}>
                                        {index + 1}.
                                    </Text>

                                    <TextInput
                                        placeholder="Vehicle plate..."
                                        placeholderTextColor={SystemColorTheme.Placeholder}
                                        value={vehicle.plate_no}
                                        onChangeText={(text) =>
                                            handleVehicleChange(index, text)
                                        }
                                        style={[styles.input, styles.vehicleInput]}
                                        ref={(ref) => {
                                            inputRefs.current[`vehicle-${index}`] = ref;
                                        }}
                                        onFocus={() => {
                                            setEnableKeyboardAvoidView(true);
                                            const y =
                                                fieldRefs.current[`vehicle-${index}`];

                                            if (y !== undefined) {
                                                focusField(y);
                                            }
                                        }}
                                        onEndEditing={() => {
                                            setEnableKeyboardAvoidView(false)
                                        }}
                                    />
                                    <Pressable style={[styles.flexButton, { width: 40 }]} onLongPress={() => removeVehicle(vehicle.plate_no)}>
                                        <FontAwesome name="trash" size={20} color={SystemColorTheme.Secondary} />
                                    </Pressable>
                                </View>
                            ))}

                            <Pressable
                                style={styles.flexButton}
                                onPress={addVehicle}
                            >
                                <Text style={styles.buttonText}>
                                    + Add Vehicle
                                </Text>
                            </Pressable>
                            <View style={styles.inputRow}>
                                <Pressable
                                    style={[styles.flexButton, styles.formSelectButtons, styles.bg_danger]}
                                    onPress={handleCancel}
                                >
                                    <Text style={styles.buttonText}>
                                        Cancel
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.flexButton, styles.formSelectButtons]}
                                    onPress={handleUpdate}
                                >
                                    <Text style={styles.buttonText}>
                                        Update Buyer
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}