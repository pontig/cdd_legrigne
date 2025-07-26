import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SemesterContextType {
  semesterString: string | null;
  semesterNumber: number | null;
  setSemesterString: (semesterString: string | null) => void;
  setSemesterNumber: (semesterNumber: number | null) => void;
}

const SemesterContext = createContext<SemesterContextType | undefined>(
  undefined
);

interface SemesterProviderProps {
  children: ReactNode;
}

export const SemesterProvider: React.FC<SemesterProviderProps> = ({
  children,
}) => {
  const [semesterString, setSemesterStringState] = useState<string | null>(null);
  const [semesterNumber, setSemesterNumberState] = useState<number | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedSemesterString = localStorage.getItem('semesterString');
    const savedSemesterNumber = localStorage.getItem('semesterNumber');
    
    if (savedSemesterString) {
      setSemesterStringState(savedSemesterString);
    }
    if (savedSemesterNumber) {
      setSemesterNumberState(parseInt(savedSemesterNumber, 10));
    }
  }, []);

  const setSemesterString = (value: string | null) => {
    setSemesterStringState(value);
    if (value === null) {
      localStorage.removeItem('semesterString');
    } else {
      localStorage.setItem('semesterString', value);
    }
  };

  const setSemesterNumber = (value: number | null) => {
    setSemesterNumberState(value);
    if (value === null) {
      localStorage.removeItem('semesterNumber');
    } else {
      localStorage.setItem('semesterNumber', value.toString());
    }
  };

  return (
    <SemesterContext.Provider
      value={{
        semesterString,
        semesterNumber,
        setSemesterString,
        setSemesterNumber,
      }}
    >
      {children}
    </SemesterContext.Provider>
  );
};

export const useSemester = () => {
  const context = useContext(SemesterContext);
  if (context === undefined) {
    throw new Error("useSemester must be used within a SemesterProvider");
  }
  return context;
};
