import * as service from "@/services/api/expenses/expensesRecordService";
import type { ExpensesRecord } from "@/types/expensesRecordType";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

export function useInsertExpenseRecord() {
    return useMutation({
        mutationFn: (insertData: Omit<ExpensesRecord, "expense_id">) => service.insertNewExpenseRecord(insertData),
        onSuccess: () => {
            Toast.show({
                type: "success",
                text1: "Insert success",
                text2: "New expense record created"
            });
        },
        onError: () => {
            Toast.show({
                type: "error",
                text1: "Insert failure",
                text2: "Failed to insert expense record",
            })
        }
    });
};

export function useUpdateExpenseRecord() {
    return useMutation({
        mutationFn: (variables: {id: string, updateData: Partial<ExpensesRecord>},) => service.updateExpenseRecord(variables.id, variables.updateData),
        onSuccess: (data, variables) => {
            Toast.show({
                type: "success",
                text1: "Update success",
                text2: `${variables.id} updated successfully`,
            });
            return data;
        },
        onError: (error, variables) => {
            Toast.show({
                type: "error",
                text1: "Update failure",
                text2: error.message,
            })
        }
    })
}