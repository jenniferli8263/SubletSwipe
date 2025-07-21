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
}

const ActiveRoleContext = createContext<ActiveRoleContextProps | undefined>(
  undefined
);

export const ActiveRoleProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isRenter, setIsRenter] = useState<boolean>(true);
  const [renterProfileId, setRenterProfileId] = useState<number | null>(null);
  const [listingIds, setListingIds] = useState<number[]>([]);
  const [resourceId, setResourceIdState] = useState<number>(0);
  const [hasUserSetRole, setHasUserSetRole] = useState<boolean>(false);
  const [hasAutoDetected, setHasAutoDetected] = useState<boolean>(false);

  useEffect(() => {
    if (!user || hasAutoDetected) return;

    const fetchResources = async () => {
      const [profileId, ids] = await Promise.all([
        fetchRenterProfileId(user.id),
        fetchListingIds(user.id),
      ]);
      // console.log("ActiveRole - user.id:", user.id);
      // console.log("ActiveRole - isRenter:", isRenter);
      // console.log("ActiveRole - profileId:", profileId);
      // console.log("ActiveRole - listingIds:", ids);
      // console.log("ActiveRole - hasUserSetRole:", hasUserSetRole);

      setRenterProfileId(profileId);
      setListingIds(ids);

      // Only auto-detect if user hasn't explicitly set their role
      if (!hasUserSetRole) {
        // Auto-detect role based on available resources
        const hasRenterProfile = profileId !== null;
        const hasListings = ids.length > 0;

        if (hasRenterProfile && !hasListings) {
          // User has renter profile but no listings - they're a renter
          //console.log("Auto-detected: Renter (has profile, no listings)");
          setIsRenter(true);
          setResourceIdState(profileId);
        } else if (!hasRenterProfile && hasListings) {
          // User has listings but no renter profile - they're a landlord
          //console.log("Auto-detected: Landlord (has listings, no profile)");
          setIsRenter(false);
          setResourceIdState(ids[0]);
        } else if (hasRenterProfile && hasListings) {
          // User has both - default to renter (most common case)
          //console.log("User has both profiles - defaulting to renter");
          setIsRenter(true);
          setResourceIdState(profileId);
        } else {
          // User has neither - default to renter but set resourceId to 0
          //console.log("No valid resources found - defaulting to renter");
          setIsRenter(true);
          setResourceIdState(0);
        }
      } else {
        // User has explicitly set their role - use current settings
        //console.log("User has set role - using current settings");
        if (isRenter && profileId !== null) {
          //console.log("Setting resourceId to profileId:", profileId);
          setResourceIdState(profileId);
        } else if (!isRenter && ids.length > 0) {
          //console.log("Setting resourceId to first listing:", ids[0]);
          setResourceIdState(ids[0]);
        } else {
          //console.log("No valid resourceId for current role - setting to 0");
          setResourceIdState(0);
        }
      }

      setHasAutoDetected(true);
    };

    fetchResources();
  }, [user, hasUserSetRole, hasAutoDetected]);

  const setResourceId = (id: number) => {
    if (isRenter) {
      if (id === renterProfileId && id !== null) {
        setResourceIdState(id);
      } else {
        // console.warn(
        //   `Invalid resourceId ${id} for renter role. Must be renterProfileId.`
        // );
      }
    } else {
      if (listingIds.includes(id)) {
        setResourceIdState(id);
      } else {
        // console.warn(
        //   `Invalid resourceId ${id} for landlord role. Must be in listingIds.`
        // );
      }
    }
  };

  const setIsRenterWithTracking = (value: boolean) => {
    setIsRenter(value);
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
