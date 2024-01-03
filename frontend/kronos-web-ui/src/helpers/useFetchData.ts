import { useEffect, useState } from "react";

const BASE_URL = process.env.REACT_APP_KRONOS_HTTP_URL;
console.log("Kronos HTTP URL:", BASE_URL);

export function useFetchData(endpoint: string) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    const fullUrl = `${BASE_URL}${endpoint}`;
    (async () => {
      const data = await fetchBackend(fullUrl);
      setData(data);
    })();
  }, [endpoint]);
  return data;
}

export async function fetchBackend(endpoint: string) {
  const url = new URL(endpoint, BASE_URL);
  console.log("Fetching", url);
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    console.error(`Request to ${url} failed with status ${response.status}:`, response.statusText);
    const text = await response.text();
    console.log("Response body:", text);
    throw new Error(`Network error: ${response.status} - ${text}`);
  }
  const data = response.json();
  return data;
}
