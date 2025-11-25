export const useFormatResetTime = () => {
  const formatResetTime = (resetAt: Date | null) => {
    if (!resetAt) return "N/A";
    const now = new Date();
    const diff = resetAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return { formatResetTime };
};

