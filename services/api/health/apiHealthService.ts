const API_URL = process.env.EXPO_PUBLIC_API_URL;

const checkApiHealth = async (): Promise<boolean> => {
    const response = await fetch(`${API_URL}/health`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error("API is unavailable");
    }
    return true;
};

export default checkApiHealth;