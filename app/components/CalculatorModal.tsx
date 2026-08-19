import { AntDesign, Entypo, FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import isNullOrUndefined from "../utils/IsNullOrUndefined";

const CalculatorModal = ({
    value: total,
    visible,
    onClose,
}: {
    value?: number;
    visible: boolean;
    onClose: (value?: number) => void;
}) => {
    const [localTotal, setLocalTotal] = useState(total ?? 0);
    const [calcString, setCalcString] = useState<string | null>(null);
    const [calcOperator, setCalcOperator] = useState<
        "ADD" | "DEDUCT" | "MULTIPLY" | "DIVIDE" | null
    >(null);
    const [calcOperand, setCalcOperand] = useState<number | null>(null);
    const [calcHistory, setCalcHistory] = useState<string[]>([]);

    const handleNumber = (num: string) => {
        setCalcString((prev) => {
            if (prev === null || prev === "0") {
                return num;
            }
            return prev + num;
        });
    };

    const handleDot = () => {
        setCalcString((prev) => {
            if (prev === null) {
                return "0.";
            }
            if (prev.includes(".")) {
                return prev;
            }
            return prev + ".";
        });
    };

    const performCalculation = (op1: number, op2: number, op: "ADD" | "DEDUCT" | "MULTIPLY" | "DIVIDE"): number => {
        switch (op) {
            case "ADD":
                return op1 + op2;
            case "DEDUCT":
                return op1 - op2;
            case "MULTIPLY":
                return op1 * op2;
            case "DIVIDE":
                return op2 !== 0 ? op1 / op2 : 0;
            default:
                return op2;
        }
    };

    const handleOperator = (op: "ADD" | "DEDUCT" | "MULTIPLY" | "DIVIDE") => {
        let operand = calcOperand;
        let currentVal = localTotal;
        if (calcString !== null) {
            const entered = parseFloat(calcString);
            if (!isNaN(entered)) {
                if (calcOperator && operand !== null) {
                    currentVal = performCalculation(operand, entered, calcOperator);
                    setCalcHistory(prev => !isNullOrUndefined(prev) ? [...prev!, `${operatorSymbol} ${entered}`] : [`${operatorSymbol} ${entered}`]);
                } else {
                    currentVal = entered;
                    setCalcHistory([currentVal.toString()]);
                }
            }
            setCalcString(null);
        }

        setLocalTotal(currentVal);
        setCalcOperand(currentVal);
        setCalcOperator(op);
    };

    const handleEquals = () => {
        if (calcOperator !== null && calcOperand !== null && calcString !== null) {
            const entered = parseFloat(calcString);
            if (!isNaN(entered)) {
                const result = performCalculation(calcOperand, entered, calcOperator);
                setLocalTotal(result);
                setCalcOperand(result);
                setCalcHistory(prev => !isNullOrUndefined(prev) ? [...prev!, `${operatorSymbol} ${entered}`] : [`${operatorSymbol} ${entered}`]);
                setCalcOperator(null);
                setCalcString(null);
            }
        } else if (calcString !== null) {
            const entered = parseFloat(calcString);
            if (!isNaN(entered)) {
                setLocalTotal(entered);
                setCalcHistory([entered.toString()]);
                setCalcString(null);
            }
        }
    };

    const handleClear = () => {
        setCalcString(null);
        setCalcOperator(null);
        setCalcOperand(null);
        setCalcHistory([]);
        setLocalTotal(0);
    };

    const handleClose = (value?: number) => {
        handleClear();
        onClose(value);
    };

    const handleBackspace = () => {
        setCalcString((prev) => {
            if (prev === null || prev.length <= 1) {
                return null;
            }
            return prev.slice(0, -1);
        });
    };

    const handlePercent = () => {
        setCalcString((prev) => {
            if (prev !== null) {
                const val = parseFloat(prev);
                if (!isNaN(val)) {
                    return (val / 100).toString();
                }
            }
            return prev;
        });
    };

    const operatorSymbol =
        calcOperator === "ADD" ? "+" :
            calcOperator === "DEDUCT" ? "-" :
                calcOperator === "MULTIPLY" ? "x" :
                    calcOperator === "DIVIDE" ? "/" :
                        "";

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={() => handleClose()}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Calculation & result */}
                    <View style={[styles.equationContainer, {
                        marginBottom: 10,
                    }]}>
                        <Text style={[styles.equationText, styles.equationResultText]}>
                            {localTotal}
                        </Text>
                        <Text style={[styles.equationText, styles.equationHistoryText]}>
                            {calcHistory?.join(" ")}
                        </Text>
                        <Text style={[styles.equationText, styles.equationCalcText]}>
                            {operatorSymbol} {calcString}
                        </Text>
                    </View>

                    {/* Calculator UI placeholder */}
                    <View style={styles.calculatorContainer}>
                        <View style={[styles.row, { marginBottom: 10 }]}>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={handleClear}>
                                <Text numberOfLines={1} ellipsizeMode="clip" style={[styles.text, styles.functionalText]}>AC</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={handleBackspace}>
                                <FontAwesome5 name="backspace" style={[styles.text, styles.functionalText]} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={handlePercent}>
                                <AntDesign name="percentage" style={[styles.text, styles.functionalText]} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={() => handleOperator("DIVIDE")}>
                                <FontAwesome6 name="divide" style={[styles.text, styles.functionalText]} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.row, { marginBottom: 10 }]}>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={() => handleNumber("7")}>
                                <Text style={[styles.text, styles.numericText]}>7</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={() => handleNumber("8")}>
                                <Text style={[styles.text, styles.numericText]}>8</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={() => handleNumber("9")}>
                                <Text style={[styles.text, styles.numericText]}>9</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={() => handleOperator("MULTIPLY")}>
                                <Ionicons name="close" style={[styles.text, styles.functionalText, { fontSize: 40 }]} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.row, { marginBottom: 10 }]}>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={() => handleNumber("4")}>
                                <Text style={[styles.text, styles.numericText]}>4</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={() => handleNumber("5")}>
                                <Text style={[styles.text, styles.numericText]}>5</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={() => handleNumber("6")}>
                                <Text style={[styles.text, styles.numericText]}>6</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={() => handleOperator("DEDUCT")}>
                                <AntDesign name="minus" style={[styles.text, styles.functionalText]} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.row, { marginBottom: 10 }]}>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={() => handleNumber("1")}>
                                <Text style={[styles.text, styles.numericText]}>1</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={() => handleNumber("2")}>
                                <Text style={[styles.text, styles.numericText]}>2</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={() => handleNumber("3")}>
                                <Text style={[styles.text, styles.numericText]}>3</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={() => handleOperator("ADD")}>
                                <AntDesign name="plus" style={[styles.text, styles.functionalText]} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.row}>
                            <TouchableOpacity style={[styles.calcButton, { flex: 2, paddingHorizontal: 25 }]} onPress={() => handleNumber("0")}>
                                <Text style={[styles.text, styles.numericText]}>0</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={handleDot}>
                                <Entypo name="dot-single" style={[styles.text, styles.numericText]} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.calcButton, { flex: 1 }]} onPress={handleEquals}>
                                <FontAwesome6 name="equals" style={[styles.text, styles.functionalText]} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ alignSelf: "flex-end" }}>
                        <View style={[styles.row, { gap: 20 }]}>
                            <TouchableOpacity style={styles.modalButton} onPress={() => handleClose()}>
                                <Text style={styles.modalButtonText}>BACK</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={() => handleClose(localTotal)}>
                                <Text style={styles.modalButtonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal >
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        width: "70%",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
        boxShadow: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    equationContainer: {
        width: "100%",
        backgroundColor: "rgb(25, 25, 25)",
        padding: 5,
        paddingHorizontal: 10,
        alignItems: "flex-end",
        borderRadius: 5,
        height: 130
    },
    equationText: {
        color: "white",
        textAlign: "right",
    },
    equationCalcText: {
        fontSize: 20,
    },
    equationHistoryText: {
        fontSize: 20,
        color: "#bcbcbc",
    },
    equationResultText: {
        fontSize: 40,
    },
    calculatorContainer: {
        width: "100%",
        marginBottom: 20,
    },
    calcButton: {
        backgroundColor: "rgb(40, 40, 40)",
        padding: 10,
        borderRadius: 5,
        height: 62,
        justifyContent: "center",
    },
    text: {
        fontSize: 32,
        textAlign: "center",
        overflow: "visible",
    },
    functionalText: {
        color: "rgba(112, 157, 255, 0.75)",
        fontWeight: "bold"
    },
    numericText: {
        color: "white",
    },
    modalButton: {
        backgroundColor: "rgb(40, 40, 40)",
        borderRadius: 5,
        padding: 10,
    },
    modalButtonText: {
        fontSize: 24,
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    row: {
        flexDirection: "row",
        gap: 10,
    }
});

export default CalculatorModal;