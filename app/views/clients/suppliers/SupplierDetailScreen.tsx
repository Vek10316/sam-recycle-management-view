import LoadingScreen from "@/app/components/DetailsLoadingScreen";
import useSupplierDetails from "@/hooks/clients/suppliers/useSupplierDetails";
import { useUpdateSupplier } from "@/hooks/clients/suppliers/useSupplierMutations";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import { SupplierVehicles, type Supplier } from "@/types/clientType";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

export default function SupplierDetailScreen() {
    const router = useRouter();
    const { supplier_id } = useLocalSearchParams<{supplier_id: string}>();
    if (!supplier_id || supplier_id.trim() === "") {
        return (
            <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: SystemColorTheme.Background,
            }}>
                <Text style={styles.text_secondary}>
                    Invalid supplier ID
                </Text>
                <Link href="/views/clients/suppliers/SupplierListScreen" style={{textDecorationLine: "underline"}}>
                    Go back
                </Link>
            </View>
        )
    }

    const [initialized, setInitialized] = useState(false);
    const [supplierUpdateData, setSupplierUpdateData] = useState<{supplier: Supplier, vehicles: Pick<SupplierVehicles, "plate_no">[]}>({
        supplier: {
            supplier_id: "",
            supplier_id_type: "NRIC",
            supplier_name: "",
            supplier_address: "",
            supplier_phone: "",
            supplier_email: "",
            supplier_tin: "",
        },
        vehicles: []
    });
    
    const {supplier, vehicles, loading, error} = useSupplierDetails(supplier_id);

    useEffect(() => {
        if (loading || initialized) return;

        if (!supplier) {
            console.error(error);
            throw new Error("Could not load supplier");
        }

        setSupplierUpdateData({
            supplier: supplier,
            vehicles: vehicles ?? []
        });

        setInitialized(true);
    }, [supplier]);

    const editSupplierDetails = useUpdateSupplier();

    useFocusEffect(
        useCallback(() => {
            return () => {
                handleFormClose();
            }
        }, [])
    );

    const inputRefs = useRef<Record<string, TextInput | null>>({});
    const scrollRef = useRef<ScrollView>(null);

    const focusField = (key: string) => {
        const input = inputRefs.current[key];

        if (input && scrollRef.current) {
            input.measureLayout(
                scrollRef.current.getInnerViewNode(),
                (_x, y) => {
                    scrollRef.current?.scrollTo({
                        y: Math.max(y - 120, 0),
                        animated: true,
                    });
                },
                () => {}
            );
        }
    };

    const handleUpdate = () => {
        const supplierPayload = {
            supplier_id: supplierUpdateData.supplier.supplier_id,
            supplier_id_type: supplierUpdateData.supplier.supplier_id_type,
            supplier_name: supplierUpdateData.supplier.supplier_name,
            supplier_address: supplierUpdateData.supplier.supplier_address,
            supplier_phone: supplierUpdateData.supplier.supplier_phone,
            supplier_email: supplierUpdateData.supplier.supplier_email,
            supplier_tin: supplierUpdateData.supplier.supplier_tin,
        };

        const vehiclesPayload = supplierUpdateData.vehicles.map(v => {
            return {
                supplier_id: supplierUpdateData.supplier.supplier_id,
                plate_no: v.plate_no
            };
        })

        return editSupplierDetails.mutateAsync({
            id: supplier_id,
            supplier: supplierPayload,
            vehicles: vehiclesPayload,
        });
    };

    const handleVehicleChange = (
        index: number,
        value: string
    ) => {
        const updated = [...supplierUpdateData.vehicles];
        updated[index] = {
            plate_no: value.toUpperCase()
        };
        setSupplierUpdateData((prev) => {
            return {
                supplier: prev.supplier,
                vehicles: updated
            }
        });
    };

    const addVehicle = () => {
        const last = supplierUpdateData.vehicles[supplierUpdateData.vehicles.length - 1];
        if (last && last.plate_no.trim() === "") return;

        setSupplierUpdateData(prev => {
            return {
                supplier: prev.supplier,
                vehicles: [
                    ...prev.vehicles,
                    { plate_no: "" },
                ]
            }
        });
    };

    const removeVehicle = (plate_no: string) => {
        setSupplierUpdateData(prev => {
            return {
                supplier: prev.supplier,
                vehicles: prev.vehicles.filter(v => v.plate_no !== plate_no),
            }
        });
    };

    const handleCancel = () => {
        handleFormClose();
        router.push("/views/clients/suppliers/SupplierListScreen");
    };

    const handleFormClose = () => {
        setSupplierUpdateData({
            supplier: {
                supplier_id: "",
                supplier_id_type: "NRIC",
                supplier_name: "",
                supplier_address: "",
                supplier_phone: "",
                supplier_email: "",
                supplier_tin: ""
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
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" || Platform.OS === "android" ? "padding" : undefined}
                >
                    <ScrollView
                        ref={scrollRef}
                        contentContainerStyle={styles.formContainer}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                    >

                        {/* Supplier Info */}
                        <View style={styles.categoryContainer}>

                            <Text style={styles.formTitle}>
                            <FontAwesome name="user" size={20}></FontAwesome>
                                Supplier Info
                            </Text>

                            <View style={styles.inputRow}>
                                {(["NRIC", "BRN", "PASSPORT"] as const).map((type) => (
                                    <Pressable
                                        key={type}
                                        style={[
                                            styles.button,
                                            styles.formSelectButtons,
                                            supplierUpdateData.supplier.supplier_id_type === type && {
                                                backgroundColor: SystemColorTheme.Secondary
                                            }
                                        ]}
                                        onPress={() => {
                                            setSupplierUpdateData(prev => {
                                                return {
                                                    supplier: {
                                                        ...prev.supplier,
                                                        supplier_id_type: type
                                                    },
                                                    vehicles: prev.vehicles
                                                };
                                        })}}
                                    >
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                supplierUpdateData.supplier.supplier_id_type === type && {
                                                    color: SystemColorTheme.Primary
                                                }
                                            ]}
                                        >
                                            {type}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            {/* Supplier ID */}
                            <View
                                style={styles.inputSection}
                            >
                                <Text style={styles.text_secondary}>{supplierUpdateData.supplier.supplier_id_type}:</Text>
                                <TextInput
                                    placeholder={`Enter ${supplierUpdateData.supplier.supplier_id_type}...`}
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={supplierUpdateData.supplier.supplier_id}
                                    onChangeText={(text) => setSupplierUpdateData(prev => prev ? {...prev, supplier_id: text} : prev)}
                                    style={styles.input}
                                    ref={(ref) => {
                                        inputRefs.current[`supplier_id`] = ref;
                                    }}
                                    onFocus={() => focusField(`supplier_id`)}
                                />
                            </View>

                            {/* Name */}
                            <View
                                style={styles.inputSection}
                            >
                                <Text style={styles.text_secondary}>Name:</Text>
                                <TextInput
                                    placeholder="Supplier Name..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={supplierUpdateData.supplier.supplier_name}
                                    onChangeText={(text) => setSupplierUpdateData(prev => prev ? {...prev, supplier_name: text} : prev)}
                                    style={styles.input}
                                    ref={(ref) => {
                                        inputRefs.current[`supplier_name`] = ref;
                                    }}
                                    onFocus={() => focusField(`supplier_name`)}
                                />
                            </View>

                            <View
                                style={styles.inputSection}
                                >
                                <Text style={styles.text_secondary}>Phone:</Text>
                                <TextInput
                                    placeholder="Phone..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={supplierUpdateData.supplier.supplier_phone}
                                    onChangeText={(text) => setSupplierUpdateData(prev => prev ? {...prev, supplier_phone: text} : prev)}
                                    style={[styles.input, { flex: 1 }]}
                                    ref={(ref) => {
                                        inputRefs.current[`supplier_phone`] = ref;
                                    }}
                                    onFocus={() => focusField(`supplier_phone`)}
                                />
                            </View>

                            <View
                                style={styles.inputSection}
                            >
                                <Text style={styles.text_secondary}>Email:</Text>
                                <TextInput
                                    placeholder="Email..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={supplierUpdateData.supplier.supplier_email}
                                    onChangeText={(text) => setSupplierUpdateData(prev => prev ? {...supplierUpdateData, supplier_email: text} : prev)}
                                    style={[styles.input, { flex: 1 }]}
                                    ref={(ref) => {
                                        inputRefs.current[`supplier_email`] = ref;
                                    }}
                                    onFocus={() => focusField(`supplier_email`)}
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
                                    value={supplierUpdateData.supplier.supplier_address}
                                    onChangeText={(text) => setSupplierUpdateData(prev => prev ? {...prev, supplier_address: text} : prev)}
                                    style={styles.input}
                                    ref={(ref) => {
                                        inputRefs.current[`supplier_address`] = ref;
                                    }}
                                    onFocus={() => focusField(`supplier_address`)}
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
                                    value={supplierUpdateData.supplier.supplier_tin}
                                    onChangeText={(text) => setSupplierUpdateData(prev => prev ? {...prev, supplier_tin: text} : prev)}
                                    style={styles.input}
                                    ref={(ref) => {
                                        inputRefs.current[`supplier_tin`] = ref;
                                    }}
                                    onFocus={() => focusField(`supplier_tin`)}
                                />
                            </View>

                        </View>

                        {/* Vehicles */}
                        <View style={styles.categoryContainer}>

                            <Text style={styles.formTitle}>
                                <FontAwesome name="car" size={20}></FontAwesome>
                                Vehicles
                            </Text>

                            {supplierUpdateData.vehicles.map((vehicle, index) => (
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
                                        onFocus={() => focusField(`vehicle-${index}`)}
                                    />
                                    <Pressable style={[styles.button, {width: 40}]} onLongPress={() => removeVehicle(vehicle.plate_no)}>
                                        <FontAwesome name="trash" size={20} color={SystemColorTheme.Secondary}/>
                                    </Pressable>
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
                                    onPress={handleUpdate}
                                >
                                    <Text style={styles.buttonText}>
                                        Update Supplier
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