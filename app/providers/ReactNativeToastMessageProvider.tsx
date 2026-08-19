// app/providers/ReactNativeToastMessageProvider.tsx
import Toast, {
    BaseToast,
    ErrorToast,
    InfoToast,
    ToastConfig,
} from "react-native-toast-message";

const toastColors = {
  base: {
    primary: "#3f51b5",
    secondary: "#555FBC",
  },

  success: {
    primary: "#35B200",
    secondary: "#66C145",
  },

  error: {
    primary: "#BA342D",
    secondary: "#C34A3E",
  },
};

const toastConfig: ToastConfig = {
  info: (props) => (
    <InfoToast
      {...props}
      style={{
        borderLeftColor: toastColors.base.primary,
        backgroundColor: toastColors.base.secondary,
      }}
      text1Style={{
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
      }}
      text2Style={{
        fontSize: 13,
        color: "#fff",
      }}
    />
  ),

  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: toastColors.success.primary,
        backgroundColor: toastColors.success.secondary,
      }}
      text1Style={{
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
      }}
      text2Style={{
        fontSize: 13,
        color: "#fff",
      }}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: toastColors.error.primary,
        backgroundColor: toastColors.error.secondary,
      }}
      text1Style={{
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
      }}
      text2Style={{
        fontSize: 13,
        color: "#fff",
      }}
    />
  ),
};

export default function ReactNativeToastMessageProvider() {
  return <Toast config={toastConfig} />;
}