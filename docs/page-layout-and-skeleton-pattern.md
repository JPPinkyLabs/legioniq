# Page Layout and Skeleton Pattern

## Overview

This document describes the standard pattern for implementing page layouts and loading skeletons across the application. Following this pattern ensures consistency in user experience and code structure.

## Core Principles

1. **Always Visible Elements**: Navigation elements (Back button, page title, description) should always be visible, even during loading states. **Never use early returns that prevent the header from rendering.**
2. **Content-Only Skeletons**: Skeletons should only represent the dynamic content that is being loaded, not static UI elements (Back button, static titles).
3. **Progressive Loading**: Show static elements immediately, then progressively reveal content as data loads.
4. **Consistent Order**: Always follow the same conditional rendering order: `isLoading` → `error` → `!data` → `content`.

## Standard Page Structure

### Layout Container with ScrollArea

All pages should use ScrollArea to replace the native browser scrollbar and use the following container structure:

```tsx
import { ScrollArea } from "@/components/ui/scroll-area";

// ... component code ...

return (
  <ScrollArea className="h-full">
    <div className="px-5 mx-4 md:mx-6 lg:mx-8 max-w-5xl md:max-w-5xl lg:max-w-5xl xl:max-w-5xl 2xl:max-w-8xl 2xl:mx-auto py-3">
      <div className="space-y-6">
        {/* Header Section - Always Visible */}
        <div className="space-y-3">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold">Page Title</h1>
            <p className="text-muted-foreground mt-1">
              Page description text
            </p>
          </div>
        </div>

        {/* Content Section - Conditional Rendering */}
        {isLoading ? (
          <ContentSkeleton />
        ) : error ? (
          <ErrorEmpty ... />
        ) : !data ? (
          <ErrorEmpty ... />
        ) : (
          <ActualContent />
        )}
      </div>
    </div>
  </ScrollArea>
);
```

**Note**: The Home page (`/platform`) is an exception and does NOT use ScrollArea because it has a fixed input area at the bottom that requires native scroll behavior.

## Implementation Guidelines

### 1. Back Button Component

Create a reusable `BackButton` component within each page:

```tsx
const BackButton = () => (
  <Button
    variant="ghost"
    size="sm"
    onClick={() => navigate("/previous-route")}
    className="text-muted-foreground hover:text-foreground -ml-2"
  >
    <ArrowLeft className="w-4 h-4 mr-2" />
    Back
  </Button>
);
```

### 2. Header Section

The header section (Back button + Title + Description) should:
- **Always be rendered first**, before any conditional logic
- **Never be inside early returns** - the header must be in the main return statement
- Be placed before any conditional content rendering
- Use consistent spacing (`space-y-3` for header, `space-y-6` for main container)

**⚠️ CRITICAL**: Never use early returns (like `if (loading) return <Skeleton />`) that prevent the header from rendering. Always structure your component so the header renders first, then conditionally render content below it.

### 3. Title and Description Handling

**Static Titles**: If the title and description are static (don't come from API), they should always be visible:

```tsx
<div>
  <h1 className="text-3xl font-bold">Static Title</h1>
  <p className="text-muted-foreground mt-1">
    Static description
  </p>
</div>
```

**Dynamic Titles**: If the title comes from API data, show a skeleton for it during loading:

```tsx
<div>
  {isLoading ? (
    <>
      <Skeleton className="h-9 w-64 bg-muted-foreground/30" />
      <Skeleton className="h-5 w-96 mt-1 bg-muted-foreground/30" />
    </>
  ) : (
    <>
      <h1 className="text-3xl font-bold">{dynamicTitle}</h1>
      <p className="text-muted-foreground mt-1">
        {dynamicDescription}
      </p>
    </>
  )}
</div>
```

### 4. Skeleton Component Structure

Skeleton components should:
- **NOT** include the page container (`h-full px-5 mx-4...`)
- **NOT** include Back button or static titles
- **ONLY** include the content that will be replaced
- Use `bg-muted-foreground/30` for better visibility in light mode
- Match the structure of the actual content

**Example - Content-Only Skeleton:**

```tsx
export const ContentSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Only skeleton content here */}
      <Card>
        <CardHeader>
          <CardTitle>...</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full bg-muted-foreground/30" />
        </CardContent>
      </Card>
    </div>
  );
};
```

### 6. Conditional Rendering Pattern

**⚠️ IMPORTANT**: Always follow this exact order for conditional rendering. This ensures consistent behavior across all pages.

Use the following pattern for conditional content rendering:

```tsx
{isLoading ? (
  <ContentSkeleton />
) : error ? (
  <ErrorEmpty
    icon={AlertCircle}
    title="Error loading data"
    description="Error message here"
    buttons={[
      {
        label: "Try Again",
        onClick: () => refetch(),
        variant: "default",
      },
    ]}
  />
) : !data ? (
  <ErrorEmpty
    icon={Activity}
    title="No data available"
    description="No data message here"
  />
) : (
  <>
    {/* Actual content */}
  </>
)}
```

**Order is critical**: 
1. `isLoading` - Show skeleton first
2. `error` - Show error state second
3. `!data` - Show empty state third
4. `content` - Show actual content last

### 7. Data-Dependent Calculations

When calculations depend on fetched data, ensure they only run when data exists:

```tsx
{data && (() => {
  const calculatedValue = calculateSomething(data);
  const metrics = getMetrics(data);
  
  return (
    <>
      {/* Use calculatedValue and metrics here */}
    </>
  );
})()}
```

Or use conditional rendering:

```tsx
{data && (
  <>
    {(() => {
      const calculatedValue = calculateSomething(data);
      return <Component value={calculatedValue} />;
    })()}
  </>
)}
```

## Examples

### Example 1: Static Title Page (Usage, Account, History)

```tsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageSkeleton } from "@/components/skeletons/UsageSkeleton";
import { ErrorEmpty } from "@/components/ErrorEmpty";

const Usage = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useData();

  // Define BackButton component inside the page component
  const BackButton = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate("/platform")}
      className="text-muted-foreground hover:text-foreground -ml-2"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </Button>
  );

  // ⚠️ NEVER use early returns here - header must always render
  return (
    <ScrollArea className="h-full">
      <div className="px-5 mx-4 md:mx-6 lg:mx-8 max-w-5xl md:max-w-5xl lg:max-w-5xl xl:max-w-5xl 2xl:max-w-8xl 2xl:mx-auto py-3">
        <div className="space-y-6">
        {/* Always visible header - MUST be first */}
        <div className="space-y-3">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold">Usage & Analytics</h1>
            <p className="text-muted-foreground mt-1">
              View your account usage statistics and daily limits
            </p>
          </div>
        </div>

        {/* Conditional content - Follow exact order */}
        {isLoading ? (
          <UsageSkeleton />
        ) : error ? (
          <ErrorEmpty
            icon={AlertCircle}
            title="Error loading usage data"
            description={
              error instanceof Error
                ? error.message
                : "Failed to load your usage statistics. Please try again."
            }
            buttons={[
              {
                label: "Try Again",
                onClick: () => refetch(),
                variant: "default",
              },
            ]}
          />
        ) : !data ? (
          <ErrorEmpty
            icon={Activity}
            title="No usage data available"
            description="We couldn't find any usage statistics for your account."
          />
        ) : (
          <>
            {/* Actual content here */}
            <ActualContent data={data} />
          </>
        )}
      </div>
    </div>
  );
};
```

### Example 2: Dynamic Title Page (Request Details)

```tsx
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RequestDetailsSkeleton } from "@/components/skeletons/RequestDetails2Skeleton";
import { ErrorEmpty } from "@/components/ErrorEmpty";

const RequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { request, isLoading, error, refetch } = useRequest(id);

  const BackButton = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate("/platform/history")}
      className="text-muted-foreground hover:text-foreground -ml-2"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </Button>
  );

  // ⚠️ NEVER use early returns here - header must always render
  return (
    <ScrollArea className="h-full">
      <div className="px-5 mx-4 md:mx-6 lg:mx-8 max-w-5xl md:max-w-5xl lg:max-w-5xl xl:max-w-5xl 2xl:max-w-8xl 2xl:mx-auto py-3">
        <div className="space-y-6">
        {/* Always visible header - Back button always visible, title shows skeleton when loading */}
        <div className="space-y-3">
          <BackButton />
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1">
              {isLoading ? (
                <>
                  <Skeleton className="h-9 w-64 bg-muted-foreground/30" />
                  <Skeleton className="h-5 w-40 bg-muted-foreground/30" />
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold">
                    {request?.user_message || categoryLabel || 'Request Details'}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-muted-foreground">
                      {formattedDate}
                    </p>
                  </div>
                </>
              )}
            </div>
            {!isLoading && request && (
              <Badge variant="outline" className={categoryColor}>
                {categoryLabel}
              </Badge>
            )}
          </div>
        </div>

        {/* Conditional content - Follow exact order */}
        {isLoading ? (
          <RequestDetailsSkeleton />
        ) : error ? (
          <ErrorEmpty
            icon={AlertCircle}
            title="Error loading request"
            description={
              error instanceof Error
                ? error.message
                : "Failed to load the request. Please try again."
            }
            buttons={[
              {
                label: "Try Again",
                onClick: () => refetch(),
                variant: "default",
              },
              {
                label: "Go Back",
                onClick: () => navigate("/platform/history"),
                variant: "outline",
              },
            ]}
          />
        ) : !request ? (
          <ErrorEmpty
            icon={AlertCircle}
            title="Request not found"
            description="The request you're looking for doesn't exist or has been removed."
            buttons={[
              {
                label: "Go Back",
                onClick: () => navigate("/platform/history"),
                variant: "outline",
              },
            ]}
          />
        ) : (
          <>
            {/* Actual content here */}
            <ActualContent request={request} />
          </>
        )}
        </div>
      </div>
    </ScrollArea>
  );
};
```

## Skeleton Best Practices

1. **Colors**: Always use `bg-muted-foreground/30` for skeleton elements to ensure visibility in both light and dark modes.

2. **Spacing**: Match the spacing of actual content. Use `space-y-6` for main sections, `space-y-3` for headers.

3. **Sizes**: Skeleton sizes should approximate the actual content size:
   - Titles: `h-9 w-64` or similar
   - Descriptions: `h-5 w-96` or similar
   - Text lines: `h-4 w-full` or `h-4 w-3/4` for varied widths

4. **Structure**: Keep skeleton structure simple. Don't replicate complex nested structures unless necessary.

5. **No Containers**: Skeletons should not include page-level containers or ScrollArea. The page component handles both.
6. **ScrollArea**: Always wrap page content with ScrollArea (except Home page) for consistent scrollbar styling.

## Common Mistakes to Avoid

1. ❌ **Including Back button in skeleton** - Back button should always be visible
2. ❌ **Including static title in skeleton** - Static titles should always be visible
3. ❌ **Early returns before header** - **CRITICAL**: Never use `if (loading) return <Skeleton />` or similar early returns. Header must always render first.
4. ❌ **Wrong conditional order** - Always use: `isLoading` → `error` → `!data` → `content`
5. ❌ **Calculating with undefined data** - Always check data exists before calculations
6. ❌ **Skeleton with page container** - Skeletons should only contain content (no `px-5 mx-4...` wrapper)
7. ❌ **Missing ScrollArea** - All pages (except Home) must wrap content with ScrollArea
8. ❌ **Missing error states** - Always handle loading, error, and empty states
9. ❌ **Header inside conditional** - Header should be outside all conditionals, always visible
10. ❌ **ScrollArea in skeleton** - Skeletons should not include ScrollArea wrapper

### ❌ WRONG - Early Return Pattern (DO NOT USE)

```tsx
// ❌ WRONG - Header never renders during loading
if (isLoading) {
  return <Skeleton />; // Header is missing!
}

if (error) {
  return <ErrorEmpty />; // Header is missing!
}

return (
  <div>
    <BackButton /> {/* Only renders when not loading/error */}
    ...
  </div>
);
```

### ✅ CORRECT - Header Always Renders

```tsx
// ✅ CORRECT - Header always renders
return (
  <div>
    <BackButton /> {/* Always visible */}
    <Title /> {/* Always visible */}
    {isLoading ? (
      <Skeleton />
    ) : error ? (
      <ErrorEmpty />
    ) : (
      <Content />
    )}
  </div>
);
```

## Checklist

When implementing a new page or updating an existing one:

- [ ] **No early returns** - Header always renders first
- [ ] **ScrollArea wrapper** - Page content wrapped with `<ScrollArea className="h-full">` (except Home page)
- [ ] Back button is always visible (never in skeleton)
- [ ] Static title/description are always visible (never in skeleton)
- [ ] Dynamic title/description show skeleton when loading (but Back button still visible)
- [ ] Conditional rendering follows exact order: `isLoading` → `error` → `!data` → `content`
- [ ] Skeleton component only contains content, not UI elements (no Back button, no static titles, no ScrollArea)
- [ ] Skeleton does NOT include page container (`px-5 mx-4...`)
- [ ] Skeleton uses `bg-muted-foreground/30` for visibility in light mode
- [ ] Error states are handled properly with appropriate buttons
- [ ] Empty states are handled properly
- [ ] Data-dependent calculations only run when data exists (use IIFE or conditional)
- [ ] Page container structure matches standard pattern
- [ ] Spacing follows standard pattern (`space-y-6` main, `space-y-3` header)
- [ ] BackButton component is defined inside the page component

## Implementation Summary

**Key Rules**: 
1. The header section (Back button + Title) **MUST** be in the main return statement, never inside early returns or conditionals. Only the content below the header should be conditionally rendered.
2. **All pages must use ScrollArea** (except Home page) to replace native browser scrollbar for consistent styling.

**Standard Structure**:
1. Import ScrollArea component
2. Define hooks and BackButton component
3. Main return with ScrollArea wrapper
4. Page container div with spacing classes
5. Header section (always visible)
6. Conditional content section (isLoading → error → !data → content)

**Exception**: The Home page (`/platform`) does NOT use ScrollArea because it requires native scroll behavior for the fixed input area at the bottom.

