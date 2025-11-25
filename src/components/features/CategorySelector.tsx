import { Trophy, Wrench, Brain, type LucideIcon } from "lucide-react";
import { useCategories, type CategoryData } from "@/hooks/other/useCategories";
import { type Category } from "@/types/category";
import { cn } from "@/lib/utils";
import { CategorySelectorSkeleton } from "@/components/skeletons/CategorySelectorSkeleton";

const iconMap: Record<string, LucideIcon> = {
  Trophy,
  Wrench,
  Brain,
};

const CategoryBadge = ({
  category,
  isSelected,
  onClick,
}: {
  category: {
    category: string;
    label: string;
    description: string;
    icon_name: string;
  };
  isSelected: boolean;
  onClick: () => void;
}) => {
  const Icon = iconMap[category.icon_name] || Trophy;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full border text-xs md:text-xs font-medium transition-all shrink-0",
        isSelected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background hover:bg-accent text-foreground"
      )}
      title={category.description}
    >
      <Icon className="h-3.5 w-3.5 md:h-3.5 md:w-3.5 shrink-0" />
      <span>{category.label}</span>
    </button>
  );
};

interface CategorySelectorProps {
  selectedCategory: Category | undefined;
  onSelectCategory: (category: Category, categoryData: CategoryData) => void;
}

export const CategorySelector = ({
  selectedCategory,
  onSelectCategory,
}: CategorySelectorProps) => {
  const { categories, isLoading: categoriesLoading } = useCategories();

  if (categoriesLoading) {
    return <CategorySelectorSkeleton />;
  }

  return (
    <div className="space-y-2 md:space-y-3">
      <h3 className="text-sm md:text-sm font-medium">Category</h3>
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {categories.map((category) => (
          <CategoryBadge
            key={category.category}
            category={category}
            isSelected={selectedCategory === category.category}
            onClick={() => onSelectCategory(category.category as Category, category)}
          />
        ))}
      </div>
    </div>
  );
};

