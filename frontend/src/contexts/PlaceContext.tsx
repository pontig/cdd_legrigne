import React, { createContext, useContext, useState, ReactNode } from "react";

interface PlaceContextType {
  place: string;
  setPlace: (place: string) => void;
}

const PlaceContext = createContext<PlaceContextType | undefined>(undefined);

interface PlaceProviderProps {
  children: ReactNode;
}

export const PlaceProvider: React.FC<PlaceProviderProps> = ({ children }) => {
  const [place, setPlace] = useState<string>("");

  return (
    <PlaceContext.Provider value={{ place, setPlace }}>
      {children}
    </PlaceContext.Provider>
  );
};

export const usePlace = () => {
  const context = useContext(PlaceContext);
  if (context === undefined) {
    throw new Error("usePlace must be used within a PlaceProvider");
  }
  return context;
};
