const PositiveIntegerString = (input: string) => input.replaceAll(/\D/g, "");
const AlphaNumericString = (input: string) => input.replaceAll(/[^a-zA-Z0-9]/g, "");
const DecimalString = (input: string) => {
    const cleaned = input.replaceAll(/[^\d.]/g, "");
    if ((cleaned.match(/\./g) || []).length > 1) return input;
    return cleaned;
};

export {
    AlphaNumericString, DecimalString, PositiveIntegerString
};

