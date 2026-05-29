const useApiTest = () => {
    const testApi = async () => {
        try {
            let res = await fetch('http://192.168.0.99:3000/');
            console.log(await res.text());
            res = await fetch('http://192.169.0.99:3000/api/test/test-api-call', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: 'Hello from the client!' }),
            })
            console.log(await res.json());
        } catch (err) {
            console.error(`API test failed: ${err}`);
        }
    }
    return (
        testApi
    );
};

export default useApiTest;