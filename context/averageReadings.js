import { createContext } from "react";
import useSWR from "swr";

const AverageBpProvider = createContext();

const ENDPOINT = "https://cardiomedai-api.onrender.com/bp/readings/stats/1";

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

  const average = await res.json();
  return average;
}

export const AverageBpContext = ({ children }) => {
  const { data: average, error, isLoading, mutate } = useSWR(ENDPOINT, fetcher);
  return (
    <AverageBpProvider.Provider value={{ average, error, isLoading, mutate }}>
      {children}
    </AverageBpProvider.Provider>
  )
}

export default AverageBpProvider;