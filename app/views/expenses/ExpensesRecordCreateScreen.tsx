import { useInsertExpenseRecord } from "@/hooks/expenses/useEexpensesRecordMutation";
import { useExpensesRecordList } from "@/hooks/expenses/useExpensesRecord";
import { styles } from "@/styles/_styles";
import SystemColorTheme from "@/styles/system-color-theme";
import type { ExpensesRecord } from "@/types/expensesRecordType";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
    const { expensesRecord, loading, error } = useExpensesRecordList(pageNo, pageSize);
    const [categories, setCategories] = useState<{ label: string, value: string }[]>([]);
    const [categorySearch, setCategorySearch] = useState<string>("");
    const [createNewCategory, setCreateNewCategory] = useState<boolean>(false);

    useEffect(() => {
        if (loading) return;
        setCategories([...new Set(expensesRecord.map(e => e.expense_category.toUpperCase()).concat("CUSTOM"))]
            .map(e => ({
                label: e,
                value: e
            })));
    }, [loading, expensesRecord]);

    const [insertData, setInsertData] = useState<Omit<ExpensesRecord, "expense_id" | "expense_amount"> & { expense_amount: string }>({
        expense_date: new Date().toLocaleDateString("en-CA"),
        expense_category: "",
        expense_amount: "0.00",
        expense_description: "",
    });

    const handleNumericInput = (text: string) => {
        if (text === "") return text;

        // Allow only numbers + optional decimal
        const cleaned = text.replace(/[^0-9.]/g, "");

        // Prevent multiple dots
        if ((cleaned.match(/\./g) || []).length > 1) return text;

        return cleaned;
    };

    const handleSave = async () => {
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
            onChange: (event, date) => setInsertData(prev => ({ ...prev, expense_date: date?.toLocaleDateString("en-CA") ?? new Date().toLocaleDateString("en-CA") })),
        })
    }

    const handleResetCategory = () => {
        setCreateNewCategory(false);
        setInsertData(prev => ({ ...prev, expense_category: "" }));
    };

    if (error) {
        Toast.show({
            type: "error",
            text1: "Unknown error",
            text2: error
        })
    }

    if (!loading) return (
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
                                    value={insertData.expense_category}
                                    search
                                    searchQuery={(keyword, labelValue) => {
                                        return labelValue.toLowerCase().includes(keyword.toLowerCase()) || labelValue === "CUSTOM";
                                    }}
                                    style={[styles.input, styles.bg_default, { flex: 1 }]}
                                    containerStyle={[styles.bg_default]}
                                    inputSearchStyle={[styles.text_secondary]}
                                    selectedTextStyle={styles.text_secondary}
                                    data={categories}
                                    onChangeText={searchText => {
                                        setCategorySearch(searchText.trim().toUpperCase());
                                    }}
                                    onChange={value => {
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
                                style={styles.input}
                                onChangeText={value => {
                                    const numeric = handleNumericInput(value);

                                    setInsertData(prev => ({ ...prev, expense_amount: numeric }))
                                }}
                                onBlur={() => setInsertData(prev => ({ ...prev, expense_amount: Number.parseFloat(prev.expense_amount).toFixed(2) }))}
                                keyboardType="decimal-pad"
                            />
                        </View>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>Description:</Text>
                            <TextInput
                                placeholder="Enter Description..."
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                value={insertData.expense_description ?? ""}
                                style={styles.input}
                                onChangeText={value => setInsertData(prev => ({ ...prev, expense_description: value }))}
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