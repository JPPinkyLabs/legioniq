import { Trophy, Wrench, Brain, type LucideIcon } from "lucide-react";
import { useCategories, type CategoryData } from "@/hooks/other/useCategories";
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
  category: CategoryData;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const Icon = iconMap[category.icon_name] || Trophy;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all shrink-0",
        isSelected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background hover:bg-accent text-foreground"
      )}
      title={category.description}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{category.label}</span>
    </button>
  );
};

interface CategorySelectorProps {
  selectedCategoryId: string | undefined;
  onSelectCategory: (categoryData: CategoryData) => void;
}

export const CategorySelector = ({
  selectedCategoryId,
  onSelectCategory,
}: CategorySelectorProps) => {
  const { categories, isLoading: categoriesLoading } = useCategories();

  if (categoriesLoading) {
    return <CategorySelectorSkeleton />;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Category</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <CategoryBadge
            key={category.id}
            category={category}
            isSelected={selectedCategoryId === category.id}
            onClick={() => onSelectCategory(category)}
          />
        ))}
      </div>
    </div>
  );
};

