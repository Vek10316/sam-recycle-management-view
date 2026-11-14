const DEFAULT_TIMEOUT = 10_000;

const apiFetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
    timeout?: number,
): Promise<Response> => {
    if (timeout === undefined) timeout = DEFAULT_TIMEOUT;
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
        controller.abort();
    }, timeout);

    try {
        return await fetch(input, {
            ...init,
            signal: controller.signal
        });
    } finally {
        clearTimeout(timeoutId);
    }
};

export default apiFetch;