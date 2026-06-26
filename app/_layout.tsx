//app/_layout.tsx
import SystemColorTheme from '@/styles/system-color-theme';
import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from "./components/CustomDrawerContent";
import ReactNativeToastMessageProvider from './providers/ReactNativeToastMessageProvider';
import ReactQueryProvider from './providers/ReactQueryProvider';

export default function RootLayout() {
  return (
    <>
      <ReactQueryProvider>
        <Drawer
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerStyle: { backgroundColor: SystemColorTheme.Primary },
            headerTintColor: SystemColorTheme.Secondary,
            headerTitleStyle: { fontWeight: "bold", fontSize: 24 },
            drawerStyle: { backgroundColor: SystemColorTheme.Background, borderRightWidth: 1, borderRightColor: SystemColorTheme.Secondary },
            drawerActiveTintColor: "#ece"
          }}
        >
          <Drawer.Screen name="index" options={{ title: 'Overview' }} />
          <Drawer.Screen name="views/clients/suppliers/SupplierListScreen" options={{ title: 'Suppliers' }} />
          <Drawer.Screen name="views/clients/suppliers/SupplierCreateScreen" options={{ title: 'Create Supplier' }} />
          <Drawer.Screen name="views/clients/suppliers/SupplierDetailScreen" options={{ title: 'Supplier Details' }} />
          <Drawer.Screen name="views/clients/buyers/BuyerListScreen" options={{ title: 'Buyers' }} />
          <Drawer.Screen name="views/clients/buyers/BuyerCreateScreen" options={{ title: 'Create Buyer' }} />
          <Drawer.Screen name="views/clients/buyers/BuyerDetailScreen" options={{ title: 'Buyer Details' }} />
          <Drawer.Screen name="views/transactions/purchases/PurchasesListScreen" options={{ title: 'Purchases' }} />
          <Drawer.Screen name="views/transactions/purchases/PurchasesDetailScreen" options={{ title: 'Purchase Details' }} />
          <Drawer.Screen name="views/transactions/purchases/PurchasesCreateScreen" options={{ title: 'New Purchase' }} />
          <Drawer.Screen name="views/transactions/sales/SalesListScreen" options={{ title: 'Sales' }} />
          <Drawer.Screen name="views/transactions/sales/SalesDetailScreen" options={{ title: 'Purchase Details' }} />
          <Drawer.Screen name="views/transactions/sales/SalesCreateScreen" options={{ title: 'New Purchase' }} />
          <Drawer.Screen name="views/stock/inventory/index" options={{ title: 'Inventory - Categories' }} />
          <Drawer.Screen name="views/stock/inventory/StockCreateScreen" options={{ title: 'New Stock' }} />
          <Drawer.Screen name="views/stock/inventory/StockDetailScreen" options={{ title: 'Stock Details' }} />
          <Drawer.Screen name="views/stock/movement/StockMovementCreateScreen" options={{ title: 'New Stock Movement' }} />
          <Drawer.Screen name="views/stock/movement/StockMovementListScreen" options={{ title: 'Stock Movement' }} />
          <Drawer.Screen name="views/expenses/ExpensesRecordListScreen" options={{ title: 'Expenses Record' }} />
          <Drawer.Screen name="views/expenses/ExpensesRecordCreateScreen" options={{ title: 'Insert New Expense' }} />
          <Drawer.Screen name="views/expenses/ExpensesRecordDetailScreen" options={{ title: 'Expense Details' }} />
        </Drawer>
      </ReactQueryProvider>
      <ReactNativeToastMessageProvider />
    </>
  );
}