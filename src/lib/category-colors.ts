/**
 * Maps category color values to Tailwind CSS classes for badges and UI elements.
 * Colors are stored in the categories table and retrieved dynamically.
 */

const colorMap: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  green: "bg-green-500/10 text-green-500 border-green-500/20",
  purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  red: "bg-red-500/10 text-red-500 border-red-500/20",
  orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  pink: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  teal: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  cyan: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  // fallback
  gray: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

/**
 * Returns Tailwind CSS classes for styling category badges based on the color value.
 * @param color - The color value from the categories table (e.g., "blue", "green", "purple")
 * @returns Tailwind CSS classes for background, text, and border colors
 */
export function getCategoryColorClasses(color: string | undefined | null): string {
  if (!color) return colorMap.gray;
  return colorMap[color.toLowerCase()] || colorMap.gray;
}

