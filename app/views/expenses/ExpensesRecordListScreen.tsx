import CheckBox from "@/app/components/CheckBox";
import LoadingScreen from "@/app/components/LoadingScreen";
import { useExpensesRecordList } from "@/hooks/expenses/useExpensesRecord";
import { styles } from "@/styles/_styles";
import SystemColorTheme from "@/styles/system-color-theme";
import { ExpensesRecord } from "@/types/expensesRecordType";
import type { Column } from "@coligo/react-native-table";
import { Table } from "@coligo/react-native-table";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextStyle, View } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";

type VisibleColumns = {
    expense_id: boolean;
    expense_date: boolean;
    expense_category: boolean;
    expense_amount: boolean;
    expense_description: boolean;
};

const columnLabels: Record<keyof VisibleColumns, string> = {
    expense_id: "ID",
    expense_date: "Date",
    expense_category: "Category",
    expense_amount: "Amount",
    expense_description: "Description",
};

export default function ExpensesRecordListScreen() {
    const router = useRouter();
    const [initialized, setInitialized] = useState<boolean>(false);
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(100);
    const { expensesRecord, metadata, loading, error, reload } = useExpensesRecordList(pageNo, pageSize);

    const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
        expense_id: true,
        expense_date: true,
        expense_category: true,
        expense_amount: true,
        expense_description: false,
    });

    const viewExpenseDetails = (expense_id: string) => {
        router.push({
            pathname: "/views/expenses/ExpensesRecordDetailScreen",
            params: { expense_id }
        });
    };

    useFocusEffect(
        useCallback(() => {
            reload();
        }, []));

    useEffect(() => {
        if (loading) return;
        setInitialized(true);
    }, [loading])

    const cellStyle: TextStyle = {
        color: "#fff"
    };

    const columns: Column<ExpensesRecord>[] = useMemo<Column<ExpensesRecord>[]>(() => [
        {
            label: columnLabels.expense_id,
            key: "expense_id" as keyof ExpensesRecord,
            sortable: true,
            width: 50,
            render: (_: unknown, rowData: ExpensesRecord) =>
                <Pressable style={{ flex: 1 }} onPress={() => viewExpenseDetails(rowData.expense_id.toString())}>
                    <Text style={[cellStyle, { maxWidth: 50 }]}>
                        {rowData.expense_id}
                    </Text>
                </Pressable>,
            header: (label: string) =>
                <Text numberOfLines={1} style={{ fontWeight: "bold", maxWidth: 50 }}>
                    {label}
                </Text>,
        },
        {
            label: columnLabels.expense_date,
            key: "expense_date" as keyof ExpensesRecord,
            flex: 2,
            sortable: true,
            render: (_: unknown, rowData: ExpensesRecord) =>
                <Pressable style={{ flex: 1 }} onPress={() => viewExpenseDetails(rowData.expense_id.toString())}>
                    <Text numberOfLines={1} style={[cellStyle, { textOverflow: "ellipsis", overflow: "hidden", minWidth: 150 }]}>
                        {new Date(rowData.expense_date).toLocaleDateString("en-GB")}
                    </Text>
                </Pressable>,
            header: (label: string) =>
                <Text numberOfLines={1} style={{ fontWeight: "bold", maxWidth: 50 }}>
                    {label}
                </Text>,
        },
        {
            label: columnLabels.expense_category,
            key: "expense_category" as keyof ExpensesRecord,
            flex: 2,
            sortable: true,
            render: (_: unknown, rowData: ExpensesRecord) =>
                <Pressable style={{ flex: 1 }} onPress={() => viewExpenseDetails(rowData.expense_id.toString())}>
                    <Text numberOfLines={1} style={[cellStyle, { textOverflow: "ellipsis", overflow: "hidden", minWidth: 150 }]}>
                        {rowData.expense_category}
                    </Text>
                </Pressable>,
            header: (label: string) =>
                <Text numberOfLines={1} style={{ fontWeight: "bold", maxWidth: 50 }}>
                    {label}
                </Text>,
        },
        {
            label: columnLabels.expense_amount,
            key: "expense_amount" as keyof ExpensesRecord,
            flex: 2,
            sortable: true,
            render: (_: unknown, rowData: ExpensesRecord) =>
                <Pressable style={{ flex: 1 }} onPress={() => viewExpenseDetails(rowData.expense_id.toString())}>
                    <Text numberOfLines={1} style={[cellStyle, { textOverflow: "ellipsis", overflow: "hidden", minWidth: 150 }]}>
                        {rowData.expense_amount.toFixed()}
                    </Text>
                </Pressable>,
            header: (label: string) =>
                <Text numberOfLines={1} style={{ fontWeight: "bold", maxWidth: 50 }}>
                    {label}
                </Text>,
        },
        {
            label: columnLabels.expense_description,
            key: "expense_description" as keyof ExpensesRecord,
            flex: 2,
            sortable: true,
            render: (_: unknown, rowData: ExpensesRecord) =>
                <Pressable style={{ flex: 1 }} onPress={() => viewExpenseDetails(rowData.expense_id.toString())}>
                    <Text numberOfLines={1} style={[cellStyle, { textOverflow: "ellipsis", overflow: "hidden", minWidth: 150 }]}>
                        {rowData.expense_description}
                    </Text>
                </Pressable>,
            header: (label: string) =>
                <Text numberOfLines={1} style={{ fontWeight: "bold", maxWidth: 50 }}>
                    {label}
                </Text>,
        },
    ].filter(c => visibleColumns[c.key as keyof VisibleColumns]), [visibleColumns]);

    if (!initialized) return LoadingScreen();

    const renderTable = () => {
        return <Table
            data={expensesRecord}
            columns={columns}
            keyExtractor="expense_id"
            borderStyle={{
                borderWidth: 1,
                borderColor: "#2e2e2e",
                showHorizontalBody: true,
                showHorizontalHeader: true,
            }}
            style={{
                backgroundColor: SystemColorTheme.Primary,
                borderWidth: 1,
                borderColor: SystemColorTheme.Secondary,
                borderRadius: 8
            }}
            cellPadding={{
                paddingHorizontal: 5,
                paddingVertical: 5,
            }}
            stickyHeader />
    };

    return (
        <SafeAreaView style={[styles.container]}>
            <View style={{ alignItems: "flex-end" }}>
                <MultiSelect
                    data={Object.entries(columnLabels).map(([key, label]) => {
                        return { key, label };
                    })}
                    labelField="label"
                    valueField="key"
                    placeholder="Toggle Columns"
                    placeholderStyle={{ color: "#fff", textAlign: "center" }}
                    style={{
                        backgroundColor: SystemColorTheme.Primary,
                        padding: 10,
                        marginBottom: 5,
                        borderWidth: 1,
                        borderRadius: 5,
                        borderColor: "#fff",
                        width: 200
                    }}
                    containerStyle={{
                        borderBottomStartRadius: 5,
                        borderBottomEndRadius: 5,
                        borderWidth: 2
                    }}
                    itemContainerStyle={{ backgroundColor: SystemColorTheme.Primary }}
                    renderItem={item => (
                        <View style={{ flexDirection: "row", padding: 10, gap: 10 }}>
                            <CheckBox
                                value={visibleColumns[item.key as keyof VisibleColumns]}
                                onValueChange={(value) => setVisibleColumns(prev => ({
                                    ...prev,
                                    [item.key as keyof VisibleColumns]: !value
                                }))} />
                            <Text style={{ color: SystemColorTheme.Secondary }}>{item.label}</Text>
                        </View>
                    )}
                    onChange={([key]) => {
                        setVisibleColumns(prev => ({
                            ...prev,
                            [key as keyof VisibleColumns]: !visibleColumns[key as keyof VisibleColumns]
                        }));
                    }}
                    renderLeftIcon={() => (
                        <FontAwesome name="gear" size={20} color={SystemColorTheme.Secondary} />
                    )}
                    visibleSelectedItem={false}
                />
            </View>
            {renderTable()}
        </SafeAreaView>
    )

};