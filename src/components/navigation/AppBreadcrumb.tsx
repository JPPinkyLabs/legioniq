import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  platform: "Platform",
  history: "History",
  usage: "Usage",
  account: "Account",
  admin: "Admin",
  prompts: "Prompts",
  requests: "Requests",
};

// Routes that exist and can be navigated to
const validRoutes = new Set([
  "/platform",
  "/platform/history",
  "/platform/usage",
  "/platform/account",
  "/admin/prompts",
  "/admin/requests",
]);

function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbSegment[] = [];

  // Handle root platform route
  if (pathname === "/platform") {
    return [{ label: "New Analysis" }];
  }

  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Skip "platform" in breadcrumb display but keep in path
    if (segment === "platform") {
      continue;
    }

    // Check if this is a dynamic segment (UUID or ID)
    const isId = /^[0-9a-f-]{36}$/.test(segment) || /^\d+$/.test(segment);

    if (isId) {
      // For IDs, show "Details" as the label (not clickable)
      breadcrumbs.push({ label: "Details" });
    } else {
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      const isLast = i === segments.length - 1;
      
      // Make it clickable if:
      // 1. The route exists in validRoutes, OR
      // 2. It's not the last segment and the next segment is an ID (dynamic route)
      const nextSegmentIsId = i + 1 < segments.length && /^[0-9a-f-]{36}$/.test(segments[i + 1]);
      const shouldBeClickable = validRoutes.has(currentPath) || (!isLast && nextSegmentIsId);

      breadcrumbs.push({
        label,
        href: shouldBeClickable ? currentPath : undefined,
      });
    }
  }

  return breadcrumbs;
}

export function AppBreadcrumb() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={`${crumb.label}-${index}`}>
              {index > 0 && <BreadcrumbSeparator className="mr-0" />}
              <BreadcrumbItem className="gap-1.5">
                {isLast || !crumb.href ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

