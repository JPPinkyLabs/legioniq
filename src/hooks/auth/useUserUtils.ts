import { useAuth } from "./useAuth";

export const getInitials = (name: string | null | undefined): string => {
  if (!name || !name.trim()) return "U";
  
  return name
    .trim()
    .split(" ")
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getInitialsFromEmail = (email: string | null | undefined): string => {
  if (!email) return "U";
  return email.substring(0, 2).toUpperCase();
};

export const useUserUtils = () => {
  const { user } = useAuth();

  const getUserInitials = (): string => {
    if (user?.user_metadata?.name) {
      return getInitials(user.user_metadata.name);
    }
    return "U";
  };

  const getUserName = (): string => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    return "User";
  };

  const getJoinDate = (): string => {
    if (!user?.created_at) return "N/A";
    return new Date(user.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return {
    getUserInitials,
    getUserName,
    getJoinDate,
    getInitials,
    getInitialsFromEmail,
  };
};

