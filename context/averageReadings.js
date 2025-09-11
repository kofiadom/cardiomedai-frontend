import { createContext, useContext } from "react";
import useSWR from "swr";
import { useUser } from "./userContext";

const AverageBpProvider = createContext();

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
  const { currentUser } = useUser();
  const userId = currentUser?.id || 1;
  const ENDPOINT = `https://staging.codinnovations.com/cardiomed/bp/readings/stats/${userId}`;

  const { data: average, error, isLoading: averageLoading, mutate } = useSWR(
    currentUser ? ENDPOINT : null, // Only fetch if user is logged in
    fetcher
  );

  return (
    <AverageBpProvider.Provider value={{ average, error, averageLoading, mutate }}>
      {children}
    </AverageBpProvider.Provider>
  )
}

export default AverageBpProvider;