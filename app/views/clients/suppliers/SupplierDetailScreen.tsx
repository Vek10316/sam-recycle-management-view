import LoadingScreen from "@/app/components/LoadingScreen";
import useSupplierDetails from "@/hooks/clients/suppliers/useSupplierDetails";
import { useUpdateSupplier } from "@/hooks/clients/suppliers/useSupplierMutations";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import { SupplierVehicles, type Supplier } from "@/types/clientType";
import { AlphaNumericString, PositiveIntegerString } from "@/utils/FormatStrings";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
import Toast from "react-native-toast-message";

export default function SupplierDetailScreen() {
    const [initialized, setInitialized] = useState(false);
    const [supplierUpdateData, setSupplierUpdateData] = useState<{ supplier: Supplier, vehicles: Pick<SupplierVehicles, "plate_no">[] }>({
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
    const [formValidation, setFormValidation] = useState({
        supplier_id: true,
        supplier_name: true
    });
    const editSupplierDetails = useUpdateSupplier();
    const { supplier_id } = useLocalSearchParams<{ supplier_id: string }>();
    const { supplier, vehicles, loading, error } = useSupplierDetails(supplier_id);

    const router = useRouter();

    const scrollRef = useRef<ScrollView>(null);
    const inputRefs = useRef<Record<string, TextInput | null>>({});

    const inputFieldKeys = {
        supplier_id: "supplier_id",
        supplier_name: "supplier_name",
        supplier_phone: "supplier_phone",
        supplier_email: "supplier_email",
        supplier_address: "supplier_address",
        supplier_tin: "supplier_tin"
    } as const;

    const handleFormValidation = () => {
        const validated = !Object.values(formValidation).some(v => v === false);
        if (!validated) {
            Toast.show({
                type: "error",
                text1: "Form incomplete"
            })
            return false;
        } else {
            return true
        };
    }

    useEffect(() => {
        if (loading || initialized) return;

        if (error) {
            Toast.show({
                type: "error",
                text1: "Unknown error",
                text2: `${error}`
            });
            return;
        }

        if (!supplier) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: `Failed to load supplier ${supplier_id}`
            });
            router.replace({
                pathname: "/views/clients/suppliers/SupplierListScreen"
            });
        }

    }, [loading, supplier, supplier_id, error, initialized, router, vehicles]);

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
                <Link href="/views/clients/suppliers/SupplierListScreen" style={{ textDecorationLine: "underline" }}>
                    Go back
                </Link>
            </View>
        )
    }

    const focusField = (y: number) => {
        scrollRef.current?.scrollTo({
            y: y - 200,
            animated: true
        });
    };

    const handleUpdate = async () => {
        if (!handleFormValidation()) return;
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

        const update = await editSupplierDetails.mutateAsync({
            id: supplier_id,
            supplier: supplierPayload,
            vehicles: vehiclesPayload,
        });

        if (update?.supplier?.supplier_id?.trim() !== "") {
            Toast.show({
                type: "success",
                text1: "Update success",
                text2: `Successfully updated supplier ${supplier_id}`,
            })
        }
    };

    const handleVehicleChange = (
        index: number,
        value: string
    ) => {
        const vehicles = supplierUpdateData.vehicles.flatMap(v => v.plate_no);
        const updated = [...vehicles];
        updated[index] = value.toUpperCase();
        setSupplierUpdateData(prev => ({
            ...prev,
            vehicles: updated.map(v => ({
                plate_no: v
            }))
        }))
    };

    const addVehicle = () => {
        const vehicles = supplierUpdateData.vehicles;
        const last = vehicles[vehicles.length - 1];
        if (vehicles.length !== 0 && (!last || last.plate_no.trim() === "")) return;

        setSupplierUpdateData(prev => ({
            ...prev,
            vehicles: [
                ...prev.vehicles,
                { plate_no: "" }
            ]
        }))
    };


    const removeVehicle = (plate_no: string) => {
        setSupplierUpdateData(prev => {
            return {
                ...prev,
                vehicles: prev.vehicles.filter(v => v.plate_no !== plate_no),
            }
        });
    };

    useFocusEffect(
        useCallback(() => {
            setSupplierUpdateData(prev => supplier ? {
                supplier: supplier,
                vehicles: vehicles
            } : prev);

            setInitialized(true);
            return () => {
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
        }, [supplier, vehicles])
    );

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
                    keyboardVerticalOffset={100}
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
                                            styles.flexButton,
                                            styles.formSelectButtons,
                                            supplierUpdateData.supplier.supplier_id_type === type && {
                                                backgroundColor: SystemColorTheme.Secondary
                                            }
                                        ]}
                                        onPress={() => setSupplierUpdateData(prev => ({
                                            ...prev,
                                            supplier: {
                                                ...prev.supplier,
                                                supplier_id: "",
                                                supplier_id_type: type,
                                            }
                                        }))}
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
                                    readOnly
                                    ref={(ref) => {
                                        inputRefs.current[0] = ref;
                                    }}
                                    keyboardType={supplierUpdateData.supplier.supplier_id_type === "NRIC" ? "numeric" : "default"}
                                    placeholder={`Enter ${supplierUpdateData.supplier.supplier_id_type}...`}
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={supplierUpdateData.supplier.supplier_id}
                                    onChangeText={(text) => {
                                        if (text.trim() === "") {
                                            setFormValidation(prev => ({
                                                ...prev,
                                                supplier_id: false
                                            }));
                                        } else {
                                            setFormValidation(prev => ({
                                                ...prev,
                                                supplier_id: true
                                            }));
                                        }
                                        const clientID = supplierUpdateData.supplier.supplier_id_type === "NRIC" ?
                                            PositiveIntegerString(text) : AlphaNumericString(text);
                                        setSupplierUpdateData(prev => ({
                                            ...prev,
                                            supplier: {
                                                ...prev.supplier,
                                                supplier_id: clientID
                                            }
                                        }))
                                    }}
                                    style={[styles.input, !formValidation.supplier_id && styles.border_danger]}
                                    onFocus={(e) => {
                                        e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
                                            if (pageY !== undefined) {
                                                focusField(pageY);
                                            }
                                        });
                                    }}
                                    onSubmitEditing={() => {
                                        inputRefs.current[inputFieldKeys.supplier_name]?.focus();
                                    }}
                                    selectTextOnFocus
                                />
                            </View>

                            {/* Name */}
                            <View
                                style={styles.inputSection}
                            >
                                <Text style={styles.text_secondary}>Name:</Text>
                                <TextInput
                                    ref={(ref) => {
                                        inputRefs.current[inputFieldKeys.supplier_name] = ref;
                                    }}
                                    placeholder="Supplier Name..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={supplierUpdateData.supplier.supplier_name}
                                    onChangeText={(text) => {
                                        if (text.trim() === "") {
                                            setFormValidation(prev => ({
                                                ...prev,
                                                supplier_name: false
                                            }));
                                        } else {
                                            setFormValidation(prev => ({
                                                ...prev,
                                                supplier_name: true
                                            }));
                                        }
                                        setSupplierUpdateData(prev => ({
                                            ...prev,
                                            supplier: {
                                                ...prev.supplier,
                                                supplier_name: text
                                            }
                                        }))
                                    }}
                                    style={[styles.input, !formValidation.supplier_name && styles.border_danger]}
                                    onFocus={(e) => {
                                        e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
                                            if (pageY !== undefined) {
                                                focusField(pageY);
                                            }
                                        });
                                    }}
                                    onSubmitEditing={() => {
                                        inputRefs.current[inputFieldKeys.supplier_phone]?.focus();
                                    }}
                                    selectTextOnFocus
                                />
                            </View>

                            <View
                                style={styles.inputSection}
                            >
                                <Text style={styles.text_secondary}>Phone:</Text>
                                <TextInput
                                    ref={(ref) => {
                                        inputRefs.current[inputFieldKeys.supplier_phone] = ref;
                                    }}
                                    placeholder="Phone..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={supplierUpdateData.supplier.supplier_phone}
                                    onChangeText={(text) => {
                                        setSupplierUpdateData(prev => ({
                                            ...prev,
                                            supplier: {
                                                ...prev.supplier,
                                                supplier_phone: PositiveIntegerString(text)
                                            }
                                        }))
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
                                            if (pageY !== undefined) {
                                                focusField(pageY);
                                            }
                                        });
                                    }}
                                    style={[styles.input, { flex: 1 }]}
                                    onSubmitEditing={() => {
                                        inputRefs.current[inputFieldKeys.supplier_email]?.focus();
                                    }}
                                    keyboardType="number-pad"
                                    selectTextOnFocus
                                />
                            </View>

                            <View
                                style={styles.inputSection}
                            >
                                <Text style={styles.text_secondary}>Email:</Text>
                                <TextInput
                                    ref={(ref) => {
                                        inputRefs.current[inputFieldKeys.supplier_email] = ref;
                                    }}
                                    placeholder="Email..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={supplierUpdateData.supplier.supplier_email}
                                    onChangeText={(text) => setSupplierUpdateData(prev => ({
                                        ...prev,
                                        supplier: {
                                            ...prev.supplier,
                                            supplier_email: text
                                        }
                                    }))}
                                    onFocus={(e) => {
                                        e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
                                            if (pageY !== undefined) {
                                                focusField(pageY);
                                            }
                                        });
                                    }}
                                    style={[styles.input, { flex: 1 }]}
                                    onSubmitEditing={() => {
                                        inputRefs.current[inputFieldKeys.supplier_address]?.focus();
                                    }}
                                    selectTextOnFocus
                                />
                            </View>

                            {/* Address */}
                            <View
                                style={styles.inputSection}
                            >
                                <Text style={styles.text_secondary}>Address:</Text>
                                <TextInput
                                    ref={(ref) => {
                                        inputRefs.current[inputFieldKeys.supplier_address] = ref;
                                    }}
                                    placeholder="Address..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={supplierUpdateData.supplier?.supplier_address?.trim() ?? ""}
                                    onChangeText={(text) => setSupplierUpdateData(prev => ({
                                        ...prev,
                                        supplier: {
                                            ...prev.supplier,
                                            supplier_address: text
                                        }
                                    }))}
                                    style={styles.input}
                                    onFocus={(e) => {
                                        e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
                                            if (pageY !== undefined) {
                                                focusField(pageY);
                                            }
                                        });
                                    }}
                                    onSubmitEditing={() => {
                                        inputRefs.current[inputFieldKeys.supplier_tin]?.focus();
                                    }}
                                    selectTextOnFocus
                                />
                            </View>

                            {/* TIN */}
                            <View
                                style={styles.inputSection}
                            >
                                <Text style={styles.text_secondary}>TIN:</Text>
                                <TextInput
                                    ref={(ref) => {
                                        inputRefs.current[inputFieldKeys.supplier_tin] = ref;
                                    }}
                                    placeholder="TIN..."
                                    placeholderTextColor={SystemColorTheme.Placeholder}
                                    value={supplierUpdateData.supplier.supplier_tin?.trim() ?? ""}
                                    onChangeText={(text) => setSupplierUpdateData(prev => ({
                                        ...prev,
                                        supplier: {
                                            ...prev.supplier,
                                            supplier_tin: text
                                        }
                                    }))}
                                    style={styles.input}
                                    onFocus={(e) => {
                                        e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
                                            if (pageY !== undefined) {
                                                focusField(pageY);
                                            }
                                        });
                                    }}
                                    onSubmitEditing={() => {
                                        inputRefs.current["supplier_vehicles_0"]?.focus();
                                    }}
                                    selectTextOnFocus
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
                                        ref={(ref) => {
                                            inputRefs.current[`supplier_vehicles_${index}`] = ref;
                                        }}
                                        placeholder="Vehicle plate..."
                                        placeholderTextColor={SystemColorTheme.Placeholder}
                                        value={vehicle.plate_no ?? ""}
                                        onChangeText={(text) =>
                                            handleVehicleChange(index, text)
                                        }
                                        style={[styles.input, styles.vehicleInput]}
                                        onFocus={(e) => {
                                            e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
                                                if (pageY !== undefined) {
                                                    focusField(pageY);
                                                }
                                            });
                                        }}
                                        onSubmitEditing={() => {
                                            inputRefs.current[`supplier_vehicles_${index + 1}`]?.focus();
                                        }}
                                        selectTextOnFocus
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
                                    onPress={() => router.push("/views/clients/suppliers/SupplierListScreen")}
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