import apiFetch from "@/utils/ApiFetch";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const checkApiHealth = async (): Promise<boolean> => {
    try {
        const response = await apiFetch(`${API_URL}/health`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.log("API is unavailable");
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
};

export default checkApiHealth;