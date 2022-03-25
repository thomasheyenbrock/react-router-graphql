import React, { createContext, useContext, useState } from "react";

export type DataStore = Record<string, Record<string, any> | null | undefined>;

const DataContext = createContext<{
  data: DataStore;
  setData(newData: DataStore): void;
}>({ data: {}, setData: () => {} });

export function useDataContext() {
  return useContext(DataContext);
}

export function DataContextProvider(props: { children: React.ReactNode }) {
  const [data, setData] = useState<DataStore>({});
  return (
    <DataContext.Provider
      value={{
        data,
        setData(newData) {
          setData((current) => ({ ...current, ...newData }));
        },
      }}
    >
      {props.children}
    </DataContext.Provider>
  );
}
