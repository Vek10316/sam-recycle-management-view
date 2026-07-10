import { useCreateSupplier } from "@/hooks/clients/suppliers/useSupplierMutations";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import type { Supplier } from "@/types/clientType";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useHeaderHeight } from '@react-navigation/elements';
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
import Toast from "react-native-toast-message";

export default function SupplierCreateScreen() {
	useFocusEffect(
		useCallback(() => {
			return () => {
				handleFormClose();
			}
		}, [])
	);

	const [enableKeyboardAvoidView, setEnableKeyboardAvoidView] = useState(false);
	const [supplierData, setSupplierData] = useState<Supplier>({
		supplier_id: "",
		supplier_id_type: "NRIC",
		supplier_name: "",
		supplier_address: "",
		supplier_phone: "",
		supplier_email: "",
		supplier_tin: ""
	});

	const [supplierVehicles, setSupplierVehicles] = useState<string[]>([""]);
	const createSupplier = useCreateSupplier();

	const scrollRef = useRef<ScrollView>(null);
	const fieldRefs = useRef<Record<string, number>>({});

	const focusField = (y: number) => {
		scrollRef.current?.scrollTo({
			y: y - 200,
			animated: true
		});
	};

	const handleSubmit = () => {
		const supplierPayload = {
			supplier_id: supplierData.supplier_id,
			supplier_id_type: supplierData.supplier_id_type,
			supplier_name: supplierData.supplier_name,
			supplier_address: supplierData.supplier_address,
			supplier_phone: supplierData.supplier_phone,
			supplier_email: supplierData.supplier_email,
			supplier_tin: supplierData.supplier_tin,
		};

		const vehiclesPayload = supplierVehicles.map(v => {
			return {
				supplier_id: supplierData.supplier_id,
				plate_no: v
			};
		});

		createSupplier.mutateAsync({
			supplier: supplierPayload,
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
		const updated = [...supplierVehicles];
		updated[index] = value.toUpperCase();
		setSupplierVehicles(updated);
	};

	const addVehicle = () => {
		const last = supplierVehicles[supplierVehicles.length - 1];
		if (supplierVehicles.length !== 0 && (!last || last.trim() === "")) return;

		setSupplierVehicles([
			...supplierVehicles, ""
		]);
	};

	const handleCancel = () => {
		handleFormClose();
		router.push("/views/clients/suppliers/SupplierListScreen");
	}

	const handleFormClose = () => {
		setSupplierData({
			supplier_id: "",
			supplier_id_type: "NRIC",
			supplier_name: "",
			supplier_address: "",
			supplier_phone: "",
			supplier_email: "",
			supplier_tin: ""
		});
		setSupplierVehicles([]);
	}

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: SystemColorTheme.Background }}
			edges={["bottom"]}
		>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" || Platform.OS === "android" ? "padding" : undefined}
				keyboardVerticalOffset={useHeaderHeight()}
				enabled={enableKeyboardAvoidView}
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
										supplierData.supplier_id_type === type && {
											backgroundColor: SystemColorTheme.Secondary
										}
									]}
									onPress={() => {
										setSupplierData({ ...supplierData, supplier_id: "", supplier_id_type: type });
									}}
								>
									<Text
										style={[
											styles.buttonText,
											supplierData.supplier_id_type === type && {
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
						<View>
							<TextInput
								placeholder={`Enter ${supplierData.supplier_id_type}...`}
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={supplierData.supplier_id}
								onChangeText={(text) => setSupplierData({ ...supplierData, supplier_id: text })}
								style={styles.input}
								onFocus={() => {
									setEnableKeyboardAvoidView(true);
									const y =
										fieldRefs.current[`supplier_id`];

									if (y !== undefined) {
										focusField(y);
									}
								}}
							/>
						</View>

						{/* Name */}
						<View>
							<TextInput
								placeholder="Supplier Name..."
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={supplierData.supplier_name}
								onChangeText={(text) => setSupplierData({ ...supplierData, supplier_name: text })}
								style={styles.input}
								onFocus={() => {
									setEnableKeyboardAvoidView(true);
									const y =
										fieldRefs.current[`supplier_name`];

									if (y !== undefined) {
										focusField(y);
									}
								}}
							/>
						</View>

						{/* Phone + Email */}
						<View
							style={styles.inputRow}
						>
							<TextInput
								placeholder="Phone..."
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={supplierData.supplier_phone}
								onChangeText={(text) => setSupplierData({ ...supplierData, supplier_phone: text })}
								onFocus={() => {
									setEnableKeyboardAvoidView(true);
									const y =
										fieldRefs.current[`supplier_phone`];

									if (y !== undefined) {
										focusField(y);
									}
								}}
								style={[styles.input, { flex: 1 }]}
							/>

							<TextInput
								placeholder="Email..."
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={supplierData.supplier_email}
								onChangeText={(text) => setSupplierData({ ...supplierData, supplier_email: text })}
								onFocus={() => {
									setEnableKeyboardAvoidView(true);
									const y =
										fieldRefs.current[`supplier_email`];

									if (y !== undefined) {
										focusField(y);
									}
								}}
								style={[styles.input, { flex: 1 }]}
							/>
						</View>

						{/* Address */}
						<View>
							<TextInput
								placeholder="Address..."
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={supplierData.supplier_address}
								onChangeText={(text) => setSupplierData({ ...supplierData, supplier_address: text })}
								style={styles.input}
								onFocus={() => {
									setEnableKeyboardAvoidView(true);
									const y =
										fieldRefs.current[`supplier_address`];

									if (y !== undefined) {
										focusField(y);
									}
								}}
							/>
						</View>

						{/* TIN */}
						<View>
							<TextInput
								placeholder="TIN..."
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={supplierData.supplier_tin}
								onChangeText={(text) => setSupplierData({ ...supplierData, supplier_tin: text })}
								style={styles.input}
								onFocus={() => {
									setEnableKeyboardAvoidView(true);
									const y =
										fieldRefs.current[`supplier_tin`];

									if (y !== undefined) {
										focusField(y);
									}
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

						{supplierVehicles.map((vehicle, index) => (
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
									value={vehicle}
									onChangeText={(text) =>
										handleVehicleChange(index, text)
									}
									style={[styles.input, styles.vehicleInput]}
									onFocus={() => {
										setEnableKeyboardAvoidView(true);
										const y =
											fieldRefs.current[`vehicle-${index}`];

										if (y !== undefined) {
											focusField(y);
										}
									}}
								/>
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