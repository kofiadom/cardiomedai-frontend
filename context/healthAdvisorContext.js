import { createContext } from "react";
import useSWR from "swr";

const HealthAdvisorProvider = createContext();

const ENDPOINT = "https://cardiomedai-api.onrender.com/health-advisor/advice/1";

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

  const advisor = await res.json();
  return advisor;
}

export const HealthAdvisorContext = ({ children }) => {
  const { data: advisor, error, isLoading, mutate } = useSWR(ENDPOINT, fetcher);
  return (
    <HealthAdvisorProvider.Provider value={{ advisor, error, isLoading, mutate }}>
      {children}
    </HealthAdvisorProvider.Provider>
  )
}

export default HealthAdvisorProvider;