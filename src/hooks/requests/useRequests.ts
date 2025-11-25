import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Request = Tables<"requests"> & {
  category: {
    id: string;
    label: string;
    category: string;
  };
  advice: {
    id: string;
    name: string;
    description: string;
  } | null;
};

const ITEMS_PER_PAGE = 10;

export const useRequests = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["requests"],
    queryFn: async ({ pageParam = 0 }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: requests, error } = await supabase
        .from("requests")
        .select(`
          *,
          category:categories!inner (
            id,
            label,
            category
          ),
          advice:category_advices (
            id,
            name,
            description
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + ITEMS_PER_PAGE - 1);

      if (error) throw error;

      return {
        requests: (requests || []) as Request[],
        nextPage: requests && requests.length === ITEMS_PER_PAGE ? pageParam + ITEMS_PER_PAGE : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  const requests = data?.pages.flatMap((page) => page.requests) || [];

  return {
    requests,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  };
};

