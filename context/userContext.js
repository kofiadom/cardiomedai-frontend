import { createContext } from "react";
import useSWR from "swr";

const UserProvider = createContext();

const ENDPOINT = "https://cardiomedai-api.onrender.com/users/";

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

export const UserContext = ({ children }) => {
  const { data, error, isLoading: userLoading, mutate } = useSWR(ENDPOINT, fetcher);
  return (
    <UserProvider.Provider value={{ data, error, userLoading, mutate }}>
      {children}
    </UserProvider.Provider>
  )
}

export default UserProvider;