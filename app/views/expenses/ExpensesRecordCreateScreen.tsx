import isNullOrUndefined from "@/app/utils/IsNullOrUndefined";
import { useInsertExpenseRecord } from "@/hooks/expenses/useEexpensesRecordMutation";
import { useExpensesRecordList } from "@/hooks/expenses/useExpensesRecord";
import { styles } from "@/styles/_styles";
import SystemColorTheme from "@/styles/system-color-theme";
import type { ExpensesRecord } from "@/types/expensesRecordType";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function ExpensesRecordCreateScreen() {
    const router = useRouter();
    const insertExpenseRecord = useInsertExpenseRecord();
    const [pageNo] = useState(1);
    const [pageSize] = useState(100);
    const expensesRecordList = useExpensesRecordList(pageNo, pageSize);
    const [categorySearch, setCategorySearch] = useState<string>("");
    const [createNewCategory, setCreateNewCategory] = useState<boolean>(false);

    const categories = useMemo(() => {
        if (expensesRecordList.data === undefined) return [{
            label: "CUSTOM",
            value: "CUSTOM",
        }];
        return [...new Set(expensesRecordList.data.data.map(e => e.expense_category.toUpperCase()).concat("CUSTOM"))]
            .map(e => ({
                label: e,
                value: e
            }));
    }, [expensesRecordList])

    const [insertData, setInsertData] = useState<Omit<ExpensesRecord, "expense_id" | "expense_amount"> & { expense_amount: string }>({
        expense_date: new Date().toLocaleDateString("en-CA"),
        expense_category: "",
        expense_amount: "0.00",
        expense_description: "",
    });

    const [formValidation, setFormValidation] = useState({
        expense_category: true,
        expense_amount: true,
        expense_description: true,
    });

    const handleFormValidation = () => {
        const validation = {
            expense_category: insertData.expense_category.trim() !== "",
            expense_amount: insertData.expense_amount.trim() !== "",
            expense_description: !isNullOrUndefined(insertData.expense_description) && insertData.expense_description?.trim() !== ""
        };

        setFormValidation(validation);
        return !(Object.values(validation).includes(false));
    }

    const handleNumericInput = (text: string) => {
        if (text === "") return text;

        // Allow only numbers + optional decimal
        const cleaned = text.replace(/[^0-9.]/g, "");

        // Prevent multiple dots
        if ((cleaned.match(/\./g) || []).length > 1) return text;

        return cleaned;
    };

    const handleSave = async () => {
        if (!handleFormValidation()) {
            Toast.show({
                type: "error",
                text1: "Form incomplete"
            });
            return;
        }

        await insertExpenseRecord.mutateAsync({
            expense_date: insertData.expense_date,
            expense_category: insertData.expense_category,
            expense_amount: Number.parseFloat(insertData.expense_amount),
            expense_description: insertData.expense_description,
        }).then((res) => {
            if (res) router.push({
                pathname: "/views/expenses/ExpensesRecordListScreen",
            })
        });
    };

    const showDatePicker = () => {
        DateTimePickerAndroid.open({
            value: new Date(insertData.expense_date),
            mode: "date",
            display: "calendar",
            is24Hour: true,
            maximumDate: new Date(),
            design: "material",
            onValueChange: (event, date) => setInsertData(prev => ({ ...prev, expense_date: date?.toLocaleDateString("en-CA") ?? new Date().toLocaleDateString("en-CA") })),
        })
    }

    const handleResetCategory = () => {
        setCreateNewCategory(false);
        setInsertData(prev => ({ ...prev, expense_category: "" }));
    };

    return (
        <SafeAreaView style={[styles.formContainer, { flex: 1 }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" || Platform.OS === "android" ? "padding" : undefined}
            >
                <ScrollView keyboardDismissMode="interactive">
                    <View style={styles.categoryContainer}>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>Date:</Text>
                            <Pressable style={{ flex: 1 }} onPress={showDatePicker}>
                                <View style={styles.button}>
                                    <Text style={styles.text_secondary}>{insertData.expense_date}</Text>
                                </View>
                            </Pressable>
                        </View>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>Category:</Text>
                            {!createNewCategory && (
                                <Dropdown
                                    mode="auto"
                                    labelField="label"
                                    valueField="value"
                                    value={insertData.expense_category ?? undefined}
                                    search
                                    searchQuery={(keyword, labelValue) => {
                                        return labelValue.toLowerCase().includes(keyword.toLowerCase()) || labelValue === "CUSTOM";
                                    }}
                                    style={[styles.input, styles.bg_default, { flex: 1 }, !formValidation.expense_category && styles.border_danger]}
                                    containerStyle={[styles.bg_default]}
                                    inputSearchStyle={[styles.text_secondary]}
                                    selectedTextStyle={styles.text_secondary}
                                    data={categories}
                                    onChangeText={searchText => {
                                        setCategorySearch(searchText.trim().toUpperCase());
                                    }}
                                    onChange={value => {
                                        setFormValidation(prev => ({ ...prev, expense_category: value !== undefined && value.value.trim() !== "" }))
                                        if (value.label === "CUSTOM") {
                                            setCreateNewCategory(true);
                                            setInsertData(prev => ({
                                                ...prev,
                                                expense_category: categorySearch
                                            }));
                                            return;
                                        }

                                        setInsertData(prev => ({
                                            ...prev,
                                            expense_category: value.value
                                        }));
                                    }}
                                    searchPlaceholder="Search..."
                                    placeholder="Select Category..."
                                    placeholderStyle={[styles.text_secondary, { color: SystemColorTheme.Placeholder }]}
                                    renderItem={(item, selected) => {
                                        if (item.label === "CUSTOM") {
                                            return categorySearch.trim() !== "" ? (
                                                <View style={[styles.bg_default, styles.dropdownContainer]}>
                                                    <Text
                                                        style={[
                                                            styles.text_secondary,
                                                            {
                                                                color: selected
                                                                    ? SystemColorTheme.Info
                                                                    : SystemColorTheme.Secondary
                                                            }
                                                        ]}
                                                    >
                                                        {`Add "${categorySearch.toUpperCase()}"`}
                                                    </Text>
                                                </View>
                                            ) : null;
                                        }

                                        return (
                                            <View style={[styles.bg_default, styles.dropdownContainer]}>
                                                <Text
                                                    style={[
                                                        styles.text_secondary,
                                                        {
                                                            color: selected
                                                                ? SystemColorTheme.Info
                                                                : SystemColorTheme.Secondary
                                                        }
                                                    ]}
                                                >
                                                    {item.label}
                                                </Text>
                                            </View>
                                        );
                                    }}
                                />
                            )}
                            {createNewCategory && (
                                <Pressable style={{ flex: 1 }} onLongPress={() => {
                                    handleResetCategory()
                                }}>
                                    <View style={styles.input}>
                                        <Text style={[styles.text_secondary]}>{insertData.expense_category.toUpperCase()}</Text>
                                    </View>
                                </Pressable>
                            )}
                        </View>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>Amount (RM):</Text>
                            <TextInput
                                placeholder="Enter Amount..."
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                value={insertData.expense_amount ?? "0.00"}
                                style={[styles.input, !formValidation.expense_amount && styles.border_danger]}
                                onChangeText={value => {
                                    setFormValidation(prev => ({ ...prev, expense_amount: value.trim() !== "" }))
                                    const numeric = handleNumericInput(value);
                                    setInsertData(prev => ({ ...prev, expense_amount: numeric }));
                                }}
                                onBlur={() => {
                                    setInsertData(prev => ({ ...prev, expense_amount: !isNaN(Number.parseFloat(prev.expense_amount)) ? Number.parseFloat(prev.expense_amount).toFixed(2) : "0.00" }))
                                    handleFormValidation();
                                }}
                                keyboardType="decimal-pad"
                            />
                        </View>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>Description:</Text>
                            <TextInput
                                placeholder="Enter Description..."
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                value={insertData.expense_description ?? ""}
                                style={[styles.input, !formValidation.expense_description && styles.border_danger]}
                                onChangeText={value => {
                                    setFormValidation(prev => ({ ...prev, expense_description: value.trim() !== "" }))
                                    setInsertData(prev => ({ ...prev, expense_description: value }));
                                }}
                            />
                        </View>
                        <View style={[styles.inputRow]}>
                            <Pressable
                                style={{ flex: 1 }}
                                onPress={() => router.push("/views/expenses/ExpensesRecordListScreen")}
                            >
                                <View style={[styles.flexButton, styles.bg_danger]}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </View>
                            </Pressable>
                            <Pressable style={{ flex: 1 }} onPress={handleSave}>
                                <View style={[styles.flexButton]}>
                                    <Text style={styles.buttonText}>Save</Text>
                                </View>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
};