import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchRenterProfileId, fetchListingIds } from "@/lib/api";

interface ActiveRoleContextProps {
  isRenter: boolean;
  resourceId: number;
  renterProfileId: number | null;
  listingIds: number[];
  setIsRenter: (isRenter: boolean) => void;
  setResourceId: (id: number) => void;
  setRole: (args: { isRenter: boolean; resourceId: number }) => void;
  fetchResources: () => Promise<void>;
}

const ActiveRoleContext = createContext<ActiveRoleContextProps | undefined>(
  undefined
);

export const ActiveRoleProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isRenter, setIsRenter] = useState<boolean>(true);
  const [renterProfileId, setRenterProfileId] = useState<number | null>(null);
  const [listingIds, setListingIds] = useState<number[]>([]);
  const [resourceId, setResourceId] = useState<number>(0);
  const [hasUserSetRole, setHasUserSetRole] = useState<boolean>(false);
  const [hasAutoDetected, setHasAutoDetected] = useState<boolean>(false);

  const fetchResources = async () => {
    if (!user) return; // Guard clause for when user is null
    const [profileId, ids] = await Promise.all([
      fetchRenterProfileId(user.id),
      fetchListingIds(user.id),
    ]);

    setRenterProfileId(profileId);
    setListingIds(ids);

    // Only auto-detect if user hasn't explicitly set their role
    if (!hasUserSetRole) {
      // Auto-detect role based on available resources
      const hasRenterProfile = profileId !== null;
      const hasListings = ids.length > 0;

      if (hasRenterProfile && !hasListings) {
        setIsRenter(true);
        setResourceId(profileId);
      } else if (!hasRenterProfile && hasListings) {
        setIsRenter(false);
        setResourceId(ids[0]);
      } else if (hasRenterProfile && hasListings) {
        setIsRenter(true);
        setResourceId(profileId);
      } else {
        setIsRenter(true);
        setResourceId(0);
      }
    } else {
      // User has explicitly set their role - use current settings
      if (isRenter && profileId !== null) {
        setResourceId(profileId);
      } else if (!isRenter && ids.length > 0) {
        setResourceId(ids[0]);
      } else {
        setResourceId(0);
      }
    }

    setHasAutoDetected(true);
  };

  useEffect(() => {
    if (!user || hasAutoDetected) return;
    fetchResources();
  }, [user, hasUserSetRole, hasAutoDetected]);

  // const setResourceId = (id: number) => {
  //   fetchResources();
  //   if (isRenter) {
  //     if (id === renterProfileId && id !== null) {
  //       setResourceId(id);
  //     } else {
  //       // console.warn(
  //       //   `Invalid resourceId ${id} for renter role. Must be renterProfileId.`
  //       // );
  //     }
  //   } else {
  //     if (listingIds.includes(id)) {
  //       setResourceId(id);
  //     } else {
  //       // console.warn(
  //       //   `Invalid resourceId ${id} for landlord role. Must be in listingIds.`
  //       // );
  //     }
  //   }
  // };

  const setIsRenterWithTracking = (value: boolean) => {
    setIsRenter(value);
    setHasUserSetRole(true);
  };

  const setRole = ({
    isRenter,
    resourceId,
  }: {
    isRenter: boolean;
    resourceId: number;
  }) => {
    setIsRenter(isRenter);
    setResourceId(resourceId);
    setHasUserSetRole(true);
  };

  return (
    <ActiveRoleContext.Provider
      value={{
        isRenter,
        resourceId,
        renterProfileId,
        listingIds,
        setIsRenter: setIsRenterWithTracking,
        setResourceId,
        setRole,
        fetchResources,
      }}
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
