import { createContext } from "react";
import useSWR from "swr";

const UserProvider = createContext();

const ENDPOINT = "https://cardiomedai-api.onrender.com/users";

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
  return res.json();
}

export const UserContext = ({ children }) => {
  const { data, error, isLoading, mutate } = useSWR(ENDPOINT, fetcher);
  return (
    <UserProvider.Provider value={{ data, error, isLoading, mutate }}>
      {children}
    </UserProvider.Provider>
  )
}

export default UserProvider;