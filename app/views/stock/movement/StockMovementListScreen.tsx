import CheckBox from "@/app/components/CheckBox";
import LoadingScreen from "@/app/components/LoadingScreen";
import useStockMovement from "@/hooks/stock/useStockMovement";
import { styles } from "@/styles/_styles";
import SystemColorTheme from "@/styles/system-color-theme";
import type { StockMovement } from "@/types/stockType";
import type { Column } from "@coligo/react-native-table";
import { Table } from "@coligo/react-native-table";
import { FontAwesome } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";

type VisibleColumns = {
    movement_id: boolean;
    transact_id: boolean;
    direction: boolean;
    stock_id: boolean;
    quantity_change: boolean;
    movement_date: boolean;
    remarks: boolean;
};

const columnLabels: Record<keyof VisibleColumns, string> = {
    movement_id: "Movement ID",
    transact_id: "Transact ID",
    direction: "Direction",
    stock_id: "Stock",
    quantity_change: "Quantity",
    movement_date: "Date",
    remarks: "Remarks",
};

export default function StockMovementList() {
    const [pageNo] = useState(1);
    const [pageSize] = useState(100);
    const stockMovementList = useStockMovement(pageNo, pageSize);
    const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
        movement_id: false,
        transact_id: true,
        direction: true,
        stock_id: true,
        quantity_change: true,
        movement_date: true,
        remarks: true,
    });

    const columns: Column<StockMovement>[] = useMemo<Column<StockMovement>[]>(() => [
        {
            label: "ID",
            key: "movement_id" as keyof StockMovement,
            sortable: true,
            width: 50,
            render: (_: unknown, rowData: StockMovement) => <Text style={[{ maxWidth: 50, color: "#fff" }]}>{rowData.movement_id}</Text>,
            header: (label: string) => <Text numberOfLines={1} style={{ fontWeight: "bold", maxWidth: 50 }}>{label}</Text>,
        },
        { label: "Transact ID", key: "transact_id" as keyof StockMovement, sortable: true, render: (_: unknown, rowData: StockMovement) => <Text numberOfLines={1} style={{ color: "#fff" }}>{rowData.transact_id}</Text>, header: (label: string) => <Text numberOfLines={1} style={{ fontWeight: "bold" }}>{label}</Text> },
        { label: "Direction", key: "direction" as keyof StockMovement, sortable: true, render: (_: unknown, rowData: StockMovement) => <Text numberOfLines={1} style={{ color: "#fff" }}>{rowData.direction}</Text>, header: (label: string) => <Text numberOfLines={1} style={{ fontWeight: "bold" }}>{label}</Text> },
        { label: "Stock", key: "stock_id" as keyof StockMovement, sortable: true, render: (_: unknown, rowData: StockMovement) => <Text numberOfLines={1} style={{ color: "#fff" }}>{rowData.stock_id}</Text>, header: (label: string) => <Text numberOfLines={1} style={{ fontWeight: "bold" }}>{label}</Text> },
        { label: "Quantity", key: "quantity_change" as keyof StockMovement, sortable: true, render: (_: unknown, rowData: StockMovement) => <Text numberOfLines={1} style={{ color: "#fff" }}>{rowData.quantity_change}</Text>, header: (label: string) => <Text numberOfLines={1} style={{ fontWeight: "bold" }}>{label}</Text> },
        { label: "Date", key: "movement_date" as keyof StockMovement, flex: 2, sortable: true, render: (_: unknown, rowData: StockMovement) => <Text numberOfLines={1} style={[{ color: "#fff", textOverflow: "ellipsis", overflow: "hidden", minWidth: 150 }]}>{new Date(rowData.movement_date).toLocaleDateString("en-CA")}</Text> },
        { label: "Remarks", key: "remarks" as keyof StockMovement, flex: 3, render: (_: unknown, rowData: StockMovement) => <Text numberOfLines={1} style={{ color: "#fff" }}>{rowData.remarks}</Text>, header: (label: string) => <Text numberOfLines={1} style={{ fontWeight: "bold" }}>{label}</Text> },
    ].filter(c => visibleColumns[c.key as keyof VisibleColumns]), [visibleColumns]);

    const data = useMemo(() => {
        return stockMovementList.data?.map(m => {
            return {
                ...m,
                remarks: m.remarks ?? ""
            };
        });
    }, [stockMovementList]);

    if (stockMovementList.isLoading) return LoadingScreen();

    const renderTable = () => {
        return <Table
            data={data ?? []}
            columns={columns}
            keyExtractor="movement_id"
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