import SystemColorTheme from '@/styles/system-color-theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PropsWithChildren } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = PropsWithChildren<{
    title: string;
    isVisible: boolean;
    onClose: () => void
}>;

export default function CustomModal({title, isVisible, children, onClose}: Props) {
    return (
        <View>
            <Modal animationType='slide' transparent={true} visible={isVisible}>
                <View style={styles.modalContent}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{title}</Text>
                        <Pressable onPress={onClose}>
                            <FontAwesome name="close" color={SystemColorTheme.Secondary} size={20} />
                        </Pressable>
                    </View>
                    {children}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        height: '25%',
        width: '100%',
        backgroundColor: SystemColorTheme.Background,
        position: 'absolute',
        bottom: 0,
        borderTopWidth: 1,
        borderColor: SystemColorTheme.Secondary
    },
    titleContainer: {
        height: '16%',
        backgroundColor: SystemColorTheme.Primary,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: SystemColorTheme.Secondary
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: "bold"
    },
});