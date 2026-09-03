import { useInsertBuyer } from "@/hooks/clients/buyers/useBuyerMutations";
import { styles } from "@/styles/_styles";
import SystemColorTheme from '@/styles/system-color-theme';
import type { Buyer, BuyerVehicles } from "@/types/clientType";
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

export default function BuyerCreateScreen() {
	const [buyerInsertData, setBuyerInsertData] = useState<{ buyer: Buyer, vehicles: Pick<BuyerVehicles, "plate_no">[] }>({
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
	const [formValidation, setFormValidation] = useState({
		buyer_id: true,
		buyer_name: true
	});
	const createBuyer = useInsertBuyer();

	const router = useRouter();

	const scrollRef = useRef<ScrollView>(null);
	const inputRefs = useRef<Record<string, TextInput | null>>({});

	const inputFieldKeys = {
		buyer_id: "buyer_id",
		buyer_name: "buyer_name",
		buyer_phone: "buyer_phone",
		buyer_email: "buyer_email",
		buyer_address: "buyer_address",
		buyer_tin: "buyer_tin"
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
		const buyer_id = buyerInsertData.buyer.buyer_id;
		const buyerPayload = buyerInsertData.buyer;
		const vehiclesPayload = buyerInsertData.vehicles.map(v => {
			return {
				buyer_id,
				plate_no: v.plate_no
			};
		});

		createBuyer.mutateAsync({
			buyer: buyerInsertData.buyer,
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
		const vehicles = buyerInsertData.vehicles.flatMap(v => v.plate_no);
		const updated = [...vehicles];
		updated[index] = value.toUpperCase();
		setBuyerInsertData(prev => ({
			...prev,
			vehicles: updated.map(v => ({
				plate_no: v
			}))
		}))
	};

	const addVehicle = () => {
		const vehicles = buyerInsertData.vehicles;
		const last = vehicles[vehicles.length - 1];
		if (vehicles.length !== 0 && (!last || last.plate_no.trim() === "")) return;

		setBuyerInsertData(prev => ({
			...prev,
			vehicles: [
				...prev.vehicles,
				{ plate_no: "" }
			]
		}))
	};

	const removeVehicle = (plate_no: string) => {
		setBuyerInsertData(prev => {
			return {
				...prev,
				vehicles: prev.vehicles.filter(v => v.plate_no !== plate_no),
			}
		});
	};

	useFocusEffect(
		useCallback(() => {
			return () => {
				setBuyerInsertData({
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
										buyerInsertData.buyer.buyer_id_type === type && {
											backgroundColor: SystemColorTheme.Secondary
										}
									]}
									onPress={() => setBuyerInsertData(prev => ({
										...prev,
										buyer: {
											...prev.buyer,
											buyer_id: "",
											buyer_id_type: type,
										}
									}))}
								>
									<Text
										style={[
											styles.buttonText,
											buyerInsertData.buyer.buyer_id_type === type && {
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
							<Text style={styles.text_secondary}>{buyerInsertData.buyer.buyer_id_type}:</Text>
							<TextInput
								ref={(ref) => {
									inputRefs.current[inputFieldKeys.buyer_id] = ref;
								}}
								keyboardType={buyerInsertData.buyer.buyer_id_type === "NRIC" ? "numeric" : "default"}
								placeholder={`Enter ${buyerInsertData.buyer.buyer_id_type}...`}
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={buyerInsertData.buyer.buyer_id}
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
									const clientID = buyerInsertData.buyer.buyer_id_type === "NRIC" ?
										PositiveIntegerString(text) : AlphaNumericString(text);
									setBuyerInsertData(prev => ({
										...prev,
										buyer: {
											...prev.buyer,
											buyer_id: clientID
										}
									}))
								}}
								style={[styles.input, !formValidation.buyer_id && styles.border_danger]}
								onFocus={(e) => {
									e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
										if (pageY !== undefined) {
											focusField(pageY);
										}
									});
								}}
								onSubmitEditing={() => {
									inputRefs.current[inputFieldKeys.buyer_name]?.focus();
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
									inputRefs.current[inputFieldKeys.buyer_name] = ref;
								}}
								placeholder="Buyer Name..."
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={buyerInsertData.buyer.buyer_name}
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
									setBuyerInsertData(prev => ({
										...prev,
										buyer: {
											...prev.buyer,
											buyer_name: text
										}
									}))
								}}
								style={[styles.input, !formValidation.buyer_name && styles.border_danger]}
								onFocus={(e) => {
									e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
										if (pageY !== undefined) {
											focusField(pageY);
										}
									});
								}}
								onSubmitEditing={() => {
									inputRefs.current[inputFieldKeys.buyer_phone]?.focus();
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
									inputRefs.current[inputFieldKeys.buyer_phone] = ref;
								}}
								placeholder="Phone..."
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={buyerInsertData.buyer.buyer_phone}
								onChangeText={(text) => {
									setBuyerInsertData(prev => ({
										...prev,
										buyer: {
											...prev.buyer,
											buyer_phone: PositiveIntegerString(text)
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
									inputRefs.current[inputFieldKeys.buyer_email]?.focus();
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
									inputRefs.current[inputFieldKeys.buyer_email] = ref;
								}}
								placeholder="Email..."
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={buyerInsertData.buyer.buyer_email}
								onChangeText={(text) => setBuyerInsertData(prev => ({
									...prev,
									buyer: {
										...prev.buyer,
										buyer_email: text
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
									inputRefs.current[inputFieldKeys.buyer_address]?.focus();
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
									inputRefs.current[inputFieldKeys.buyer_address] = ref;
								}}
								placeholder="Address..."
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={buyerInsertData.buyer.buyer_address}
								onChangeText={(text) => setBuyerInsertData(prev => ({
									...prev,
									buyer: {
										...prev.buyer,
										buyer_address: text
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
									inputRefs.current[inputFieldKeys.buyer_tin]?.focus();
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
									inputRefs.current[inputFieldKeys.buyer_tin] = ref;
								}}
								placeholder="TIN..."
								placeholderTextColor={SystemColorTheme.Placeholder}
								value={buyerInsertData.buyer.buyer_tin}
								onChangeText={(text) => setBuyerInsertData(prev => ({
									...prev,
									buyer: {
										...prev.buyer,
										buyer_tin: text
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
									inputRefs.current["buyer_vehicles_0"]?.focus();
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

						{buyerInsertData.vehicles.map((vehicle, index) => (
							<View
								key={index}
								style={styles.vehicleRow}
							>
								<Text style={styles.text_secondary}>
									{index + 1}.
								</Text>

								<TextInput
									ref={(ref) => {
										inputRefs.current[`buyer_vehicles_${index}`] = ref;
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
										inputRefs.current[`buyer_vehicles_${index + 1}`]?.focus();
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
								onPress={() => router.push("/views/clients/buyers/BuyerListScreen")}
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
