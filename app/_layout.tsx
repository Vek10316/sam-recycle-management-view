//app/_layout.tsx
import SystemColorTheme from '@/styles/system-color-theme';
import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from "./components/CustomDrawerContent";

export default function RootLayout() {
  return (
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
    <Drawer.Screen name="views/clients/suppliers/supplierListScreen" options={{ title: 'Suppliers' }} />
    <Drawer.Screen name="views/clients/suppliers/supplierCreateScreen" options={{ title: 'Create Supplier' }} />
    <Drawer.Screen name="views/clients/buyers/buyerListScreen" options={{ title: 'Buyers' }} />
    <Drawer.Screen name="views/clients/buyers/buyerCreateScreen" options={{ title: 'Create Buyer' }} />
    <Drawer.Screen name="views/transactions/purchases/purchasesListScreen" options={{ title: 'Purchases' }} />
    <Drawer.Screen name="views/transactions/sales/salesListScreen" options={{ title: 'Sales' }} />
    <Drawer.Screen name="views/transactions/purchases/purchasesDetailScreen" options={{ title: 'Purchase Details' }} />
    <Drawer.Screen name="views/transactions/purchases/purchasesCreateScreen" options={{ title: 'New Purchase' }} />
    <Drawer.Screen name="views/stock/inventory/index" options={{ title: 'Inventory - Categories' }} />
  </Drawer>
  );
}