import { useInsertSupplier } from "@/hooks/clients/suppliers/useSupplierMutations";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import type { Supplier, SupplierVehicles } from "@/types/clientType";
import { AlphaNumericString, PositiveIntegerString } from "@/utils/FormatStrings";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
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

export default function SupplierCreateScreen() {
	const [supplierInsertData, setSupplierInsertData] = useState<{ supplier: Supplier, vehicles: Pick<SupplierVehicles, "plate_no">[] }>({
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
	const [formValidation, setFormValidation] = useState({
		supplier_id: true,
		supplier_name: true
	});
	const createSupplier = useInsertSupplier();

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

	const focusField = (y: number) => {
		scrollRef.current?.scrollTo({
			y: y - 200,
			animated: true
		});
	};

	const handleSubmit = () => {
		if (!handleFormValidation()) return;
		const supplier_id = supplierInsertData.supplier.supplier_id;
		const supplierPayload = supplierInsertData.supplier;
		const vehiclesPayload = supplierInsertData.vehicles.map(v => {
			return {
				supplier_id,
				plate_no: v.plate_no
			};
		});

		createSupplier.mutateAsync({
			supplier: supplierInsertData.supplier,
			vehicles: vehiclesPayload,
		}).then(() => {
			Toast.show({
				type: "success",
				text1: "Success",
				text2: `Successfully created supplier ${supplierPayload.supplier_id}`,
			})
			router.push({
				pathname: "/views/clients/suppliers/SupplierDetailScreen",
				params: { supplier_id: supplierPayload.supplier_id },
			})
		});

	};

	const handleVehicleChange = (
		index: number,
		value: string
	) => {
		const vehicles = supplierInsertData.vehicles.flatMap(v => v.plate_no);
		const updated = [...vehicles];
		updated[index] = value.toUpperCase();
		setSupplierInsertData(prev => ({
			...prev,
			vehicles: updated.map(v => ({
				plate_no: v
			}))
		}))
	};

	const addVehicle = () => {
		const vehicles = supplierInsertData.vehicles;
		const last = vehicles[vehicles.length - 1];
		if (vehicles.length !== 0 && (!last || last.plate_no.trim() === "")) return;

		setSupplierInsertData(prev => ({
			...prev,
			vehicles: [
				...prev.vehicles,
				{ plate_no: "" }
			]
		}))
	};

	const removeVehicle = (plate_no: string) => {
		setSupplierInsertData(prev => {
			return {
				...prev,
				vehicles: prev.vehicles.filter(v => v.plate_no !== plate_no),
			}
		});
	};

	useFocusEffect(
		useCallback(() => {
			return () => {
				setSupplierInsertData({
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
			};
		}, [])
	);

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
										supplierInsertData.supplier.supplier_id_type === type && {
											backgroundColor: SystemColorTheme.Secondary
										}
									]}
									onPress={() => setSupplierInsertData(prev => ({
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
											supplierInsertData.supplier.supplier_id_type === type && {
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
							<Text style={styles.text_secondary}>{supplierInsertData.supplier.supplier_id_type}:</Text>
							<TextInput
								ref={(ref) => {
									inputRefs.current[inputFieldKeys.supplier_id] = ref;
								}}
								keyboardType={supplierInsertData.supplier.supplier_id_type === "NRIC" ? "numeric" : "default"}
								placeholder={`Enter ${supplierInsertData.supplier.supplier_id_type}...`}
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={supplierInsertData.supplier.supplier_id}
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
									const clientID = supplierInsertData.supplier.supplier_id_type === "NRIC" ?
										PositiveIntegerString(text) : AlphaNumericString(text);
									setSupplierInsertData(prev => ({
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
								value={supplierInsertData.supplier.supplier_name}
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
									setSupplierInsertData(prev => ({
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

						{/* Phone + Email */}
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
								value={supplierInsertData.supplier.supplier_phone}
								onChangeText={(text) => {
									setSupplierInsertData(prev => ({
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
								value={supplierInsertData.supplier.supplier_email}
								onChangeText={(text) => setSupplierInsertData(prev => ({
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
								value={supplierInsertData.supplier.supplier_address}
								onChangeText={(text) => setSupplierInsertData(prev => ({
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
								value={supplierInsertData.supplier.supplier_tin}
								onChangeText={(text) => setSupplierInsertData(prev => ({
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

						{supplierInsertData.vehicles.map((vehicle, index) => (
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
								onPress={handleSubmit}
							>
								<Text style={styles.buttonText}>
									Save Supplier
								</Text>
							</Pressable>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
