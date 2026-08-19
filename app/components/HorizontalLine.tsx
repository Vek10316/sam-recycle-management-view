import { ColorValue, View } from "react-native";

type Props = {
    marginVertical?: number,
    lineSize?: number,
    lineColor?: ColorValue
}

const HorizontalLine = ({
    marginVertical,
    lineSize,
    lineColor
}: Props) => (
    <View style={{
        marginVertical: marginVertical,
        borderWidth: lineSize ?? 1,
        borderColor: lineColor ?? "#fff",
    }} />
);

export default HorizontalLine;