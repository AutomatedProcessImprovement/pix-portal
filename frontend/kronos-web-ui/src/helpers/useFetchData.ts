import { useQuery } from 'react-query';

const BASE_URL = "http://193.40.11.233/db-api";

export function useFetchData(endpoint: string) {
    const fullUrl = `${BASE_URL}${endpoint}`;

    const { data, isLoading, isError, error } = useQuery(endpoint, async () => {
        const response = await fetch(fullUrl, {
            headers: {
                'Accept': 'application/json',
            }
        });

        const text = await response.text();
        console.log("Raw response:", text);

        if (!response.ok) {
            console.error("Error status:", response.status);
            console.error("Error status text:", response.statusText);
            console.error("Error response body:", text);
            throw new Error(`Network error: ${response.status} - ${text}`);
        }

        let jsonData;
        try {
            jsonData = JSON.parse(text);
        } catch (jsonError) {
            console.error("JSON parsing error:", jsonError);
            throw jsonError;
        }

        console.log("Parsed data:", jsonData);
        return jsonData;

    }, {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });

    console.log("React-Query state:", { data, isLoading, isError, error });

    if (data === undefined) {
        console.warn("Fetched data is undefined.");
    }

    if (isLoading) return null;
    if (isError) {
        console.error(error);
        return null;
    }

    return data;
}
