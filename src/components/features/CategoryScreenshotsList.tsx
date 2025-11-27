import { useCategoryScreenshots } from "@/hooks/other/useCategoryScreenshots";
import { CategoryScreenshotsSkeleton } from "@/components/skeletons/CategoryScreenshotsSkeleton";

interface CategoryScreenshotsListProps {
  selectedCategoryId: string | undefined;
}

export const CategoryScreenshotsList = ({
  selectedCategoryId,
}: CategoryScreenshotsListProps) => {
  const { screenshots, isLoading } = useCategoryScreenshots({
    categoryId: selectedCategoryId,
    enabled: !!selectedCategoryId,
  });

  if (!selectedCategoryId) {
    return null;
  }

  if (isLoading) {
    return <CategoryScreenshotsSkeleton />;
  }

  if (screenshots.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1.5 md:space-y-2">
      <h3 className="text-xs md:text-sm font-medium text-muted-foreground">Required Screenshots</h3>
      <ul className="space-y-1 md:space-y-1.5 list-none">
        {screenshots.map((screenshot) => (
          <li key={screenshot.id} className="flex items-start gap-1.5 md:gap-2 text-xs md:text-sm">
            <span className="text-muted-foreground mt-0.5">•</span>
            <div className="flex-1 min-w-0">
              <span className="font-medium">{screenshot.name}:</span>
              <span className="text-muted-foreground ml-1">
                {screenshot.description}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

