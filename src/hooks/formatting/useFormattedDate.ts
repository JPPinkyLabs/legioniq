import { format } from "date-fns";

export const useFormattedDate = (date: string | null | undefined): string => {
  if (!date) return "Unknown date";
  
  try {
    return format(new Date(date), "MMM dd, yyyy 'at' HH:mm");
  } catch {
    return "Unknown date";
  }
};

