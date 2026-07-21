import { useEffect, useState } from "react";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
}

function parseJwt(token: string): AdminProfile | null {
  try {
    const base64 = token.split(".")[1];
    const decoded = JSON.parse(atob(base64));
    return {
      id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
      name: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
      isSuperAdmin: decoded["is_super_admin"] === "true",
    };
  } catch {
    return null;
  }
}

export function useAdminProfile() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setProfile(parseJwt(token));
    }
  }, []);

  return profile;
}
