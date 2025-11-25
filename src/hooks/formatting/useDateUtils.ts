/**
 * Hook para utilitários de data
 */
export const useDateUtils = () => {
  const getCurrentYear = (): number => {
    return new Date().getFullYear();
  };

  const getCurrentDate = (): string => {
    return new Date().toLocaleDateString();
  };

  const getFormattedDate = (date: string | Date, format: "short" | "long" = "short"): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    
    if (format === "long") {
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    
    return dateObj.toLocaleDateString();
  };

  return {
    getCurrentYear,
    getCurrentDate,
    getFormattedDate,
  };
};

