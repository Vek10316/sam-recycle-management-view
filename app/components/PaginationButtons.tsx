import { styles } from '@/styles/_styles';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from "react-native";

type Props = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
};

const PaginationButtons: React.FC<Props> = ({ currentPage, totalPages, onPageChange, className }) => {
    const goFirst = () => onPageChange(1);
    const goPrev = () => onPageChange(Math.max(1, currentPage - 1));
    const goNext = () => onPageChange(Math.min(totalPages, currentPage + 1));
    const goLast = () => onPageChange(totalPages);

    const disabledFirst = currentPage <= 1;
    const disabledPrev = currentPage <= 1;
    const disabledNext = currentPage >= totalPages;
    const disabledLast = currentPage >= totalPages;

    return (
        <View className={className} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "center", marginVertical: 10 }}>
            <Pressable
                onPress={goFirst}
                disabled={disabledFirst}
                style={[styles.button, { opacity: disabledFirst ? 0.5 : 1, padding: 10, minWidth: 0, marginHorizontal: 5 }]}
            >
                <FontAwesome name={"angle-double-left"} color={"#fff"} size={20}/>
            </Pressable>

            <Pressable
                onPress={goPrev}
                disabled={disabledPrev}
                style={[styles.button, { opacity: disabledPrev ? 0.5 : 1, padding: 10, minWidth: 0, marginHorizontal: 5 }]}
            >
                <FontAwesome name={"angle-left"} color={"#fff"} size={20}/>
            </Pressable>

            <Text style={[styles.text_secondary_sm, { marginHorizontal: 8 }]}>
                {currentPage} / {totalPages}
            </Text>

            <Pressable
                onPress={goNext}
                disabled={disabledNext}
                style={[styles.button, { opacity: disabledNext ? 0.5 : 1, padding: 10, minWidth: 0, marginHorizontal: 5 }]}
            >
                <FontAwesome name={"angle-right"} color={"#fff"} size={20}/>
            </Pressable>

            <Pressable
                onPress={goLast}
                disabled={disabledLast}
                style={[styles.button, { opacity: disabledLast ? 0.5 : 1, padding: 10, minWidth: 0, marginHorizontal: 5 }]}
            >
                <FontAwesome name={"angle-double-right"} color={"#fff"} size={20}/>
            </Pressable>
        </View>
    );
};

export default PaginationButtons;
