import { useInsertBuyer } from "@/hooks/clients/buyers/useBuyerMutations";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import type { Buyer } from "@/types/clientType";
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

export default function BuyerCreateScreen() {
	useFocusEffect(
		useCallback(() => {
			return () => {
				handleFormClose();
			}
		}, [])
	);

	const [enableKeyboardAvoidView, setEnableKeyboardAvoidView] = useState(false);
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
	const createBuyer = useInsertBuyer();

	const scrollRef = useRef<ScrollView>(null);
	const fieldRefs = useRef<Record<string, number>>({});
	const inputRefs = useRef<(TextInput | null)[]>([]);

	const [formValidation, setFormValidation] = useState({
		buyer_id: true,
		buyer_name: true
	});

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
		const buyerPayload = {
			buyer_id: buyerData.buyer_id,
			buyer_id_type: buyerData.buyer_id_type,
			buyer_name: buyerData.buyer_name,
			buyer_address: buyerData.buyer_address,
			buyer_phone: buyerData.buyer_phone,
			buyer_email: buyerData.buyer_email,
			buyer_tin: buyerData.buyer_tin,
		};

		const vehiclesPayload = buyerVehicles.map(v => {
			return {
				buyer_id: buyerData.buyer_id,
				plate_no: v
			};
		});

		createBuyer.mutateAsync({
			buyer: buyerPayload,
			vehicles: vehiclesPayload,
		}).then(() => {
			Toast.show({
				type: "success",
				text1: "Success",
				text2: `Successfully created buyer ${buyerPayload.buyer_id}`,
			})
			router.push({
				pathname: "/views/clients/buyers/BuyerDetailScreen",
				params: { buyer_id: buyerPayload.buyer_id },
			})
		});

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
		if (buyerVehicles.length !== 0 && (!last || last.trim() === "")) return;

		setBuyerVehicles([
			...buyerVehicles, ""
		]);
	};

	const handleCancel = () => {
		handleFormClose();
		router.push("/views/clients/buyers/BuyerListScreen");
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
				keyboardVerticalOffset={useHeaderHeight()}
				enabled={enableKeyboardAvoidView}
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
										styles.flexButton,
										styles.formSelectButtons,
										buyerData.buyer_id_type === type && {
											backgroundColor: SystemColorTheme.Secondary
										}
									]}
									onPress={() => {
										setBuyerData({ ...buyerData, buyer_id: "", buyer_id_type: type });
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
						<View>
							<TextInput
								ref={(ref) => {
									inputRefs.current[0] = ref;
								}}
								keyboardType={buyerData.buyer_id_type === "NRIC" ? "numeric" : "default"}
								placeholder={`Enter ${buyerData.buyer_id_type}...`}
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={buyerData.buyer_id}
								onChangeText={(text) => {
									if (text.trim() === "") {
										setFormValidation(prev => ({
											...prev,
											buyer_id: false
										}));
									} else {
										setFormValidation(prev => ({
											...prev,
											buyer_id: true
										}));
									}
									const clientID = buyerData.buyer_id_type === "NRIC" ?
										text.replace(/[^0-9]/g, "") :
										text.replace(/[^a-zA-Z0-9]/g, "");
									setBuyerData({ ...buyerData, buyer_id: clientID })
								}}
								style={[styles.input, !formValidation.buyer_id && styles.border_danger]}
								onFocus={() => {
									setEnableKeyboardAvoidView(true);
									const y =
										fieldRefs.current[`buyer_id`];

									if (y !== undefined) {
										focusField(y);
									}
								}}
								onSubmitEditing={() => {
									inputRefs.current[1]?.focus();
								}}
								returnKeyType="next"
								selectTextOnFocus
							/>
						</View>

						{/* Name */}
						<View>
							<TextInput
								ref={(ref) => {
									inputRefs.current[1] = ref;
								}}
								placeholder="Buyer Name..."
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={buyerData.buyer_name}
								onChangeText={(text) => {
									if (text.trim() === "") {
										setFormValidation(prev => ({
											...prev,
											buyer_name: false
										}));
									} else {
										setFormValidation(prev => ({
											...prev,
											buyer_name: true
										}));
									}
									setBuyerData({ ...buyerData, buyer_name: text })
								}}
								style={[styles.input, !formValidation.buyer_name && styles.border_danger]}
								onFocus={() => {
									setEnableKeyboardAvoidView(true);
									const y =
										fieldRefs.current[`buyer_name`];

									if (y !== undefined) {
										focusField(y);
									}
								}}
								onSubmitEditing={() => {
									inputRefs.current[2]?.focus();
								}}
								returnKeyType="next"
								selectTextOnFocus
							/>
						</View>

						{/* Phone + Email */}
						<View
							style={styles.inputRow}
						>
							<TextInput
								ref={(ref) => {
									inputRefs.current[2] = ref;
								}}
								placeholder="Phone..."
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={buyerData.buyer_phone}
								onChangeText={(text) => setBuyerData({ ...buyerData, buyer_phone: text })}
								onFocus={() => {
									setEnableKeyboardAvoidView(true);
									const y =
										fieldRefs.current[`buyer_phone`];

									if (y !== undefined) {
										focusField(y);
									}
								}}
								style={[styles.input, { flex: 1 }]}
								onSubmitEditing={() => {
									inputRefs.current[3]?.focus();
								}}
								returnKeyType="next"
								selectTextOnFocus
							/>

							<TextInput
								ref={(ref) => {
									inputRefs.current[3] = ref;
								}}
								placeholder="Email..."
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={buyerData.buyer_email}
								onChangeText={(text) => setBuyerData({ ...buyerData, buyer_email: text })}
								onFocus={() => {
									setEnableKeyboardAvoidView(true);
									const y =
										fieldRefs.current[`buyer_email`];

									if (y !== undefined) {
										focusField(y);
									}
								}}
								style={[styles.input, { flex: 1 }]}
								onSubmitEditing={() => {
									inputRefs.current[4]?.focus();
								}}
								returnKeyType="next"
								selectTextOnFocus
							/>
						</View>

						{/* Address */}
						<View>
							<TextInput
								ref={(ref) => {
									inputRefs.current[4] = ref;
								}}
								placeholder="Address..."
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={buyerData.buyer_address}
								onChangeText={(text) => setBuyerData({ ...buyerData, buyer_address: text })}
								style={styles.input}
								onFocus={() => {
									setEnableKeyboardAvoidView(true);
									const y =
										fieldRefs.current[`buyer_address`];

									if (y !== undefined) {
										focusField(y);
									}
								}}
								onSubmitEditing={() => {
									inputRefs.current[5]?.focus();
								}}
								returnKeyType="next"
								selectTextOnFocus
							/>
						</View>

						{/* TIN */}
						<View>
							<TextInput
								ref={(ref) => {
									inputRefs.current[5] = ref;
								}}
								placeholder="TIN..."
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={buyerData.buyer_tin}
								onChangeText={(text) => setBuyerData({ ...buyerData, buyer_tin: text })}
								style={styles.input}
								onFocus={() => {
									setEnableKeyboardAvoidView(true);
									const y =
										fieldRefs.current[`buyer_tin`];

									if (y !== undefined) {
										focusField(y);
									}
								}}
								onSubmitEditing={() => {
									inputRefs.current[6]?.focus();
								}}
								returnKeyType="next"
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

						{buyerVehicles.map((vehicle, index) => (
							<View
								key={index}
								style={styles.vehicleRow}
							>
								<Text style={styles.text_secondary}>
									{index + 1}.
								</Text>

								<TextInput
									ref={(ref) => {
										inputRefs.current[6 + index] = ref;
									}}
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
									onSubmitEditing={() => {
										inputRefs.current[7 + index]?.focus();
									}}
									returnKeyType="next"
									selectTextOnFocus
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