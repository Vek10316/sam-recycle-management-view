// app/providers/ApiHealthProvider.tsx

import useApiHealth from "@/hooks/health/useApiHealth";
import React, { createContext, useContext } from "react";

const ApiHealthContext = createContext({
    isOnline: false,
});

export function useApiHealthContext() {
    return useContext(ApiHealthContext);
}

export default function ApiHealthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const apiHealth = useApiHealth();

    return (
        <ApiHealthContext.Provider
            value={{
                isOnline: apiHealth.isOnline,
            }}
        >
            {children}
        </ApiHealthContext.Provider>
    );
}