import expensesRecordKeys from "@/app/queries/expensesRecord.keys";
import * as service from "@/services/api/expenses/expensesRecordService";
import type { ExpensesRecord } from "@/types/expensesRecordType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

export function useInsertExpenseRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (insertData: Omit<ExpensesRecord, "expense_id">) => service.insertNewExpenseRecord(insertData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [expensesRecordKeys]
            });
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
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables: {id: string, updateData: Partial<ExpensesRecord>},) => service.updateExpenseRecord(variables.id, variables.updateData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: [expensesRecordKeys]
            });
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