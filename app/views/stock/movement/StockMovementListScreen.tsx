import LoadingScreen from "@/app/components/DetailsLoadingScreen";
import useStockMovement from "@/hooks/stock/useStockMovement";
import { styles } from "@/styles/_styles";
import SystemColorTheme from "@/styles/system-color-theme";
import type { StockMovement } from "@/types/stockType";
import type { Column } from "@coligo/react-native-table";
import { Table } from "@coligo/react-native-table";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Text, TextStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StockMovementList() {
    const [initialized, setInitialized] = useState<boolean>(false);
    const { stockMovementList, loading, error, load } = useStockMovement();

    useFocusEffect(
        useCallback(() => {
            load();
        }, []));

    useEffect(() => {
        if (loading) return;
        setInitialized(true);
    }, [loading])

    if (!initialized) return LoadingScreen();

    const renderTable = () => {
        const data = stockMovementList.map(m => {
            return {
                ...m,
                remarks: m.remarks ?? ""
            };
        });

        const cellStyle: TextStyle = {
            color: "#fff"
        };

        const columns: Column<StockMovement>[] = [
            {
                label: "ID",
                key: "movement_id",
                sortable: true,
                width: 50,
                render: (_, rowData) => <Text style={[cellStyle, { maxWidth: 50 }]}>{rowData.movement_id}</Text>,
                header: (label) => <Text numberOfLines={1} style={{ fontWeight: "bold", maxWidth: 50 }}>{label}</Text>,
            },
            { label: "Transact ID", key: "transact_id", sortable: true, render: (_, rowData) => <Text numberOfLines={1} style={cellStyle}>{rowData.transact_id}</Text>, header: (label) => <Text numberOfLines={1} style={{ fontWeight: "bold" }}>{label}</Text> },
            { label: "Direction", key: "direction", sortable: true, render: (_, rowData) => <Text numberOfLines={1} style={cellStyle}>{rowData.direction}</Text> },
            { label: "Stock", key: "stock_id", sortable: true, render: (_, rowData) => <Text numberOfLines={1} style={cellStyle}>{rowData.stock_id}</Text> },
            { label: "Quantity", key: "quantity_change", sortable: true, render: (_, rowData) => <Text numberOfLines={1} style={cellStyle}>{rowData.quantity_change}</Text> },
            { label: "Date", key: "movement_date", flex: 2, sortable: true, render: (_, rowData) => <Text numberOfLines={1} style={[cellStyle, { textOverflow: "ellipsis", overflow: "hidden", minWidth: 150 }]}>{new Date(rowData.movement_date).toLocaleDateString("en-GB")}</Text> },
            { label: "Remarks", key: "remarks", flex: 3, render: (_, rowData) => <Text numberOfLines={1} style={cellStyle}>{rowData.remarks}</Text> },
        ];

        return <Table
            data={data}
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
            {renderTable()}
        </SafeAreaView>
    )

};