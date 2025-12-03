import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorEmpty } from "@/components/ErrorEmpty";
import { useAdminRequests } from "./hooks/useAdminRequests";
import { AdminRequestList } from "@/components/requests/AdminRequestListItem";
import { AdminRequestListSkeleton } from "@/components/skeletons/AdminRequestListSkeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

const Requests = () => {
  const navigate = useNavigate();
  const { requests, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } = useAdminRequests();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  return (
    <ScrollArea className="h-full">
      <div className="px-5 mx-4 md:mx-6 lg:mx-8 max-w-5xl md:max-w-5xl lg:max-w-5xl xl:max-w-5xl 2xl:max-w-8xl 2xl:mx-auto py-3">
        <div className="space-y-6">
          <div className="space-y-3">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold">Requests</h1>
              <p className="text-muted-foreground mt-1">
                View all requests made by users
              </p>
            </div>
          </div>

          {isLoading ? (
            <AdminRequestListSkeleton />
          ) : error ? (
            <ErrorEmpty
              icon={AlertCircle}
              title="Error loading requests"
              description={
                error instanceof Error
                  ? error.message
                  : "Failed to load requests. Please try again."
              }
              buttons={[
                {
                  label: "Try Again",
                  onClick: () => refetch(),
                  variant: "default",
                },
                {
                  label: "Go Back",
                  onClick: () => navigate("/platform"),
                  variant: "outline",
                },
              ]}
            />
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No requests found.</p>
              <p className="text-sm mt-2">Requests will appear here once users start making them.</p>
            </div>
          ) : (
            <>
              <AdminRequestList requests={requests} />
              {isFetchingNextPage && <AdminRequestListSkeleton />}
              <div ref={loadMoreRef} className="h-4" />
            </>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default Requests;

