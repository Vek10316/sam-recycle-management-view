import expensesRecordKeys from "@/app/queries/expensesRecord.keys";
import * as service from "@/services/api/expenses/expensesRecordService";
import { useQuery } from "@tanstack/react-query";

export function useExpensesRecordList(pageNo: number, pageSize: number, searchQuery?: string) {
    const expenses = useQuery({
        queryKey: expensesRecordKeys.all,
        queryFn: () => service.readAllExpenses()
    });

    return expenses;
}

export function useExpensesRecordDetails(expense_id: string) {
    const expenseDetail = useQuery({
        queryKey: expensesRecordKeys.detail(expense_id),
        queryFn: () => service.readExpenseRecordByID(expense_id)
    });

    return expenseDetail;
};
