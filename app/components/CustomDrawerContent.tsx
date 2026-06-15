// app/components/CustomDrawerContent.tsx
import SystemColorTheme from '@/styles/system-color-theme';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function CustomDrawerContent(props: any) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<boolean[]>(
    new Array(5).fill(true)
  );

  const toggleCollapse = (index: number) => {
    setCollapsed(prev =>
      prev.map((value, i) =>
        i === index ? !value : true
      )
    );
  };

  const collapseAll = () => {
    setCollapsed(new Array(5).fill(true));
  }

  return (
    <DrawerContentScrollView {...props}>
      {/* Overview */}
      <View style={{ borderWidth: 1, borderColor: SystemColorTheme.Secondary, borderRadius: 5, marginBottom: 5 }}>
        <DrawerItem
          label="Overview"
          labelStyle={{ color: SystemColorTheme.Secondary, fontSize: 32 }}
          onPress={() => {
            collapseAll();
            router.push('/');
          }}
        />
      </View>

      {/* Category */}
      <View style={{ borderWidth: 1, borderColor: SystemColorTheme.Secondary, borderRadius: 5, marginBottom: 10 }}>
        <Text style={{ color: SystemColorTheme.Secondary, fontSize: 32, margin: 17, marginBottom: 0, fontWeight: "bold" }}>Inventory</Text>

        <Pressable onPress={() => {
          router.push("/views/stock/inventory");
        }}>
          <Text style={{ color: SystemColorTheme.Secondary, fontSize: 24, margin: 17 }}>
            View list
          </Text>
        </Pressable>

        {/* Purchases collapsible */}
        <Pressable onPress={() => router.push("/")}>
          <Text style={{ color: SystemColorTheme.Secondary, fontSize: 24, margin: 17 }}>
            Pricing
          </Text>
        </Pressable>

        {/* Movement collapsible */}
        <Pressable onPress={() => {
          toggleCollapse(0);
        }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: SystemColorTheme.Secondary, fontSize: 24, margin: 17, marginRight: 5 }}>
              Movement
            </Text>
            <FontAwesome size={12} color={SystemColorTheme.Secondary} name={(collapsed[0] ? "chevron-up" : "chevron-down")}></FontAwesome>
          </View>
        </Pressable>

        {!collapsed[0] && (
          <View style={{ marginLeft: 20 }}>
            <DrawerItem
              label="List"
              labelStyle={{ color: SystemColorTheme.Secondary, fontSize: 16 }}
              onPress={() => {
                collapseAll();
                router.push('/views/stock/movement/StockMovementListScreen');
              }}
            />
            <DrawerItem
              label="Stock In"
              labelStyle={{ color: SystemColorTheme.Secondary, fontSize: 16 }}
              onPress={() => {
                collapseAll();
                router.push('/views/transactions/sales/salesListScreen');
              }
              }
            />
            <DrawerItem
              label="Stock Out"
              labelStyle={{ color: SystemColorTheme.Secondary, fontSize: 16 }}
              onPress={() => {
                collapseAll();
                router.push('/')
              }
              }
            />
          </View>
        )}
      </View>

      {/* Category */}
      <View style={{ borderWidth: 1, borderColor: SystemColorTheme.Secondary, borderRadius: 5, marginBottom: 10 }}>
        <Text style={{ color: SystemColorTheme.Secondary, fontSize: 32, margin: 17, marginBottom: 0, fontWeight: "bold" }}>Transactions</Text>

        {/* Purchases collapsible */}
        <Pressable onPress={() => {
          toggleCollapse(1);
        }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: SystemColorTheme.Secondary, fontSize: 24, margin: 17, marginRight: 5 }}>
              Purchases
            </Text>
            <FontAwesome size={12} color={SystemColorTheme.Secondary} name={(collapsed[1] ? "chevron-up" : "chevron-down")}></FontAwesome>
          </View>
        </Pressable>

        {!collapsed[1] && (
          <View style={{ marginLeft: 20 }}>
            <DrawerItem
              label="Purchases list"
              labelStyle={{ color: SystemColorTheme.Secondary, fontSize: 16 }}
              onPress={() => {
                collapseAll();
                router.push('/views/transactions/purchases/PurchasesListScreen');
              }
              }
            />
            <DrawerItem
              label="New purchase"
              labelStyle={{ color: SystemColorTheme.Secondary, fontSize: 16 }}
              onPress={() => {
                collapseAll();
                router.push('/views/transactions/purchases/PurchasesCreateScreen')
              }
              }
            />
          </View>
        )}

        {/* Sales collapsible */}
        <Pressable onPress={() => {
          toggleCollapse(2);
        }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: SystemColorTheme.Secondary, fontSize: 24, margin: 17, marginRight: 5 }}>
              Sales
            </Text>
            <FontAwesome size={12} color={SystemColorTheme.Secondary} name={(collapsed[2] ? "chevron-up" : "chevron-down")}></FontAwesome>
          </View>
        </Pressable>

        {!collapsed[2] && (
          <View style={{ marginLeft: 20 }}>
            <DrawerItem
              label="Sales list"
              labelStyle={{ color: SystemColorTheme.Secondary, fontSize: 16 }}
              onPress={() => {
                collapseAll();
                router.push('/views/transactions/sales/salesListScreen');
              }
              }
            />
            <DrawerItem
              label="New sales"
              labelStyle={{ color: SystemColorTheme.Secondary, fontSize: 16 }}
              onPress={() => {
                collapseAll();
                router.push('/')
              }
              }
            />
          </View>
        )}
      </View>

      {/* Category */}
      <View style={{ borderWidth: 1, borderColor: SystemColorTheme.Secondary, borderRadius: 5, marginBottom: 10 }}>
        <Text style={{ color: SystemColorTheme.Secondary, fontSize: 32, margin: 17, marginBottom: 0, fontWeight: "bold" }}>Clients</Text>

        {/* Suppliers collapsible */}
        <Pressable onPress={() => {
          toggleCollapse(3);
        }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: SystemColorTheme.Secondary, fontSize: 24, margin: 17, marginRight: 5 }}>
              Suppliers
            </Text>
            <FontAwesome size={12} color={SystemColorTheme.Secondary} name={(collapsed[3] ? "chevron-up" : "chevron-down")}></FontAwesome>
          </View>
        </Pressable>

        {!collapsed[3] && (
          <View style={{ marginLeft: 20 }}>
            <DrawerItem
              label="Supplier list"
              labelStyle={{ color: SystemColorTheme.Secondary, fontSize: 16 }}
              onPress={() => {
                collapseAll();
                router.push('/views/clients/suppliers/SupplierListScreen');
              }
              }
            />
            <DrawerItem
              label="Create supplier"
              labelStyle={{ color: SystemColorTheme.Secondary, fontSize: 16 }}
              onPress={() => {
                collapseAll();
                router.push('/views/clients/suppliers/SupplierCreateScreen');
              }
              }
            />
          </View>
        )}

        {/* Buyers collapsible */}
        <Pressable onPress={() => {
          toggleCollapse(4);
        }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: SystemColorTheme.Secondary, fontSize: 24, margin: 17, marginRight: 5 }}>
              Buyers
            </Text>
            <FontAwesome size={12} color={SystemColorTheme.Secondary} name={(collapsed[4] ? "chevron-up" : "chevron-down")}></FontAwesome>
          </View>
        </Pressable>

        {!collapsed[4] && (
          <View style={{ marginLeft: 20 }}>
            <DrawerItem
              label="Buyer list"
              labelStyle={{ color: SystemColorTheme.Secondary, fontSize: 16 }}
              onPress={() => {
                collapseAll();
                router.push('/views/clients/buyers/buyerListScreen');
              }
              }
            />
            <DrawerItem
              label="Create buyer"
              labelStyle={{ color: SystemColorTheme.Secondary, fontSize: 16 }}
              onPress={() => {
                collapseAll();
                router.push('/views/clients/buyers/buyerCreateScreen')
              }
              }
            />
          </View>
        )}
      </View>

    </DrawerContentScrollView>
  );
}