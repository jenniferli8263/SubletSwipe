import React, { createContext, useContext, useState, ReactNode } from "react";

interface ActiveRoleContextProps {
  isRenter: boolean;
  resourceId: number;
  setIsRenter: (isRenter: boolean) => void;
  setResourceId: (id: number) => void;
}

const ActiveRoleContext = createContext<ActiveRoleContextProps | undefined>(
  undefined
);

export const ActiveRoleProvider = ({ children }: { children: ReactNode }) => {
  const [isRenter, setIsRenter] = useState<boolean>(true);
  const [resourceId, setResourceId] = useState<number>(1);

  return (
    <ActiveRoleContext.Provider
      value={{ isRenter, resourceId, setIsRenter, setResourceId }}
    >
      {children}
    </ActiveRoleContext.Provider>
  );
};

export function useActiveRole() {
  const context = useContext(ActiveRoleContext);
  if (!context) {
    throw new Error("useActiveRole must be used within an ActiveRoleProvider");
  }
  return context;
}
