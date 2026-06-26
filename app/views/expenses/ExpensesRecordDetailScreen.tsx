import { useUpdateExpenseRecord } from "@/hooks/expenses/useEexpensesRecordMutation";
import { useExpensesRecordDetails, useExpensesRecordList } from "@/hooks/expenses/useExpensesRecord";
import { styles } from "@/styles/_styles";
import SystemColorTheme from "@/styles/system-color-theme";
import type { ExpensesRecord } from "@/types/expensesRecordType";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExpensesRecordDetailScreen() {
    const router = useRouter();
    const expense_id = useLocalSearchParams<{ expense_id: string }>().expense_id;

    if (!expense_id || expense_id.trim() === "") {
        return (
            <>
                <Stack.Screen options={{ title: "Invalid expense_id" }} />
                <View style={[styles.container, { justifyContent: "center" }]}>
                    <Text style={styles.text_secondary}>Invalid expense_id parameter</Text>
                    <Link
                        href="/views/expenses/ExpensesRecordListScreen"
                        style={[styles.text_secondary, { textDecorationLine: "underline" }]}>
                        Go back
                    </Link>
                </View>
            </>
        );
    }

    const updateExpenseReord = useUpdateExpenseRecord();
    const { expensesRecord: expensesRecordList, loading: categoryLoading } = useExpensesRecordList();
    const { expensesRecord: expenseDetails, loading: detailsLoading } = useExpensesRecordDetails(expense_id);
    const [categories, setCategories] = useState<{ label: string, value: string }[]>([]);
    const [categorySearch, setCategorySearch] = useState<string>("");
    const [createNewCategory, setCreateNewCategory] = useState<boolean>(false);

    useEffect(() => {
        if (categoryLoading) return;
        setCategories([...new Set(expensesRecordList.map(e => e.expense_category.toUpperCase()).concat("CUSTOM"))]
            .map(e => ({
                label: e,
                value: e
            })));
    }, [categoryLoading]);


    const [updateData, setUpdateData] = useState<Omit<ExpensesRecord, "expense_id" | "expense_amount"> & { expense_amount: string }>({
        expense_date: new Date().toLocaleDateString("en-CA"),
        expense_category: "",
        expense_amount: "0.00",
        expense_description: "",
    });

    useEffect(() => {
        if (detailsLoading) return;
        setUpdateData({
            expense_date: new Date (expenseDetails?.expense_date ?? new Date().toString()).toLocaleDateString("en-CA"),
            expense_category: expenseDetails?.expense_category ?? "",
            expense_amount: expenseDetails?.expense_amount.toFixed(2) ?? "0.00",
            expense_description: expenseDetails?.expense_description ?? "",
        });
    }, [detailsLoading])

    const handleNumericInput = (text: string) => {
        if (text === "") return text;

        // Allow only numbers + optional decimal
        const cleaned = text.replace(/[^0-9.]/g, "");

        // Prevent multiple dots
        if ((cleaned.match(/\./g) || []).length > 1) return text;

        return cleaned;
    };

    const handleUpdate = async () => {
        await updateExpenseReord.mutateAsync({
            id: expense_id,
            updateData: {
                expense_date: updateData.expense_date,
                expense_category: updateData.expense_category,
                expense_amount: Number.parseFloat(updateData.expense_amount),
                expense_description: updateData.expense_description,
            }
        }).then((res) => {
            router.push("/views/expenses/ExpensesRecordListScreen");
        });
    };

    const handleReset = () => {
        setUpdateData({
            expense_date: new Date (expenseDetails?.expense_date ?? new Date().toString()).toLocaleDateString("en-CA"),
            expense_category: expenseDetails?.expense_category ?? "",
            expense_amount: expenseDetails?.expense_amount.toFixed(2) ?? "0.00",
            expense_description: expenseDetails?.expense_description ?? "",
        });
    };

    const showDatePicker = () => {
        DateTimePickerAndroid.open({
            value: new Date(updateData.expense_date),
            mode: "date",
            display: "calendar",
            is24Hour: true,
            maximumDate: new Date(),
            design: "material",
            onChange: (event, date) => setUpdateData(prev => ({ ...prev, expense_date: date?.toLocaleDateString("en-CA") ?? new Date().toLocaleDateString("en-CA") })),
        })
    }

    const handleResetCategory = () => {
        setCreateNewCategory(false);
        setUpdateData(prev => ({ ...prev, expense_category: "" }));
    };

    if (!categoryLoading && !detailsLoading) return (
        <SafeAreaView style={[styles.formContainer, { flex: 1 }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" || Platform.OS === "android" ? "padding" : undefined}
            >
                <ScrollView keyboardDismissMode="interactive">
                    <View style={styles.categoryContainer}>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>Expense ID:</Text>
                            <View style={styles.input_readonly}>
                                <Text style={styles.text_secondary}>{expense_id}</Text>
                            </View>
                        </View>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>Date:</Text>
                            <Pressable style={{ flex: 1 }} onPress={showDatePicker}>
                                <View style={styles.button}>
                                    <Text style={styles.text_secondary}>{updateData.expense_date}</Text>
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
                                    value={updateData.expense_category}
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
                                            setUpdateData(prev => ({
                                                ...prev,
                                                expense_category: categorySearch
                                            }));
                                            return;
                                        }

                                        setUpdateData(prev => ({
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
                                                        Add "{categorySearch.toUpperCase()}"
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
                                        <Text style={[styles.text_secondary]}>{updateData.expense_category.toUpperCase()}</Text>
                                    </View>
                                </Pressable>
                            )}
                        </View>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>Amount (RM):</Text>
                            <TextInput
                                placeholder="Enter Amount..."
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                value={updateData.expense_amount}
                                style={styles.input}
                                onChangeText={value => {
                                    const numeric = handleNumericInput(value);

                                    setUpdateData(prev => ({ ...prev, expense_amount: numeric }))
                                }}
                                onBlur={() => setUpdateData(prev => ({ ...prev, expense_amount: Number.parseFloat(prev.expense_amount).toFixed(2) }))}
                                keyboardType="decimal-pad"
                            />
                        </View>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>Description:</Text>
                            <TextInput
                                placeholder="Enter Description..."
                                placeholderTextColor={SystemColorTheme.Placeholder}
                                value={updateData.expense_description}
                                style={styles.input}
                                onChangeText={value => setUpdateData(prev => ({ ...prev, expense_description: value }))}
                            />
                        </View>
                        <View style={[styles.inputRow]}>
                            <Pressable
                                style={{ flex: 1 }}
                                onPress={() => handleReset()}
                            >
                                <View style={[styles.flexButton, styles.bg_danger]}>
                                    <Text style={styles.buttonText}>Reset</Text>
                                </View>
                            </Pressable>
                            <Pressable style={{ flex: 1 }} onPress={handleUpdate}>
                                <View style={[styles.flexButton]}>
                                    <Text style={styles.buttonText}>Update</Text>
                                </View>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
};