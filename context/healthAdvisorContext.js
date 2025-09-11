import { createContext, useContext } from "react";
import useSWR from "swr";
import { useUser } from "./userContext";

const HealthAdvisorProvider = createContext();

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
  const { currentUser } = useUser();
  const userId = currentUser?.id || 1;
  const ENDPOINT = `https://staging.codinnovations.com/cardiomed/health-advisor/advice/${userId}`;

  const { data: advisor, error, isLoading: advisorLoading, mutate } = useSWR(
    currentUser ? ENDPOINT : null, // Only fetch if user is logged in
    fetcher
  );

  return (
    <HealthAdvisorProvider.Provider value={{ advisor, error, advisorLoading, mutate }}>
      {children}
    </HealthAdvisorProvider.Provider>
  )
}

export default HealthAdvisorProvider;