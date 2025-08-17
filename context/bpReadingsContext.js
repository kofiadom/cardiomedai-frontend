import { createContext } from "react";
import useSWR from "swr";

const BpReaderProvider = createContext();

const ENDPOINT = "https://cardiomedai-api.onrender.com/bp/readings/1";

const fetcher = async (url) => {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await res.json();
  return data;
}

export const BpReaderContext = ({ children }) => {
  const { data, error, isLoading: bpReaderLoading, mutate } = useSWR(ENDPOINT, fetcher);

  // Ensure data is always an array to prevent undefined errors
  const safeData = Array.isArray(data) ? data : [];

  return (
    <BpReaderProvider.Provider value={{ data: safeData, error, bpReaderLoading, mutate }}>
      {children}
    </BpReaderProvider.Provider>
  )
}

export default BpReaderProvider;