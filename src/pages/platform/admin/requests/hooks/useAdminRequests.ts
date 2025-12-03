import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type AdminRequest = Tables<"requests"> & {
  category: {
    id: string;
    label: string;
    color: string;
  };
  advice: {
    id: string;
    name: string;
    description: string;
  } | null;
  user: {
    id: string;
    name: string | null;
  } | null;
};

const ITEMS_PER_PAGE = 10;

export const useAdminRequests = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["admin-requests"],
    queryFn: async ({ pageParam = 0 }) => {
      const { data: requestsData, error } = await supabase
        .from("requests")
        .select(`
          *,
          category:categories!inner (
            id,
            label,
            color
          ),
          advice:category_advices (
            id,
            name,
            description
          )
        `)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + ITEMS_PER_PAGE - 1);

      if (error) throw error;
      if (!requestsData) {
        return {
          requests: [],
          nextPage: null,
        };
      }

      // Fetch user profiles separately
      const userIds = [...new Set(requestsData.map(r => r.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", userIds);

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, { id: p.id, name: p.name }])
      );

      const requests: AdminRequest[] = requestsData.map(request => ({
        ...request,
        user: profilesMap.get(request.user_id) || null,
      })) as AdminRequest[];

      return {
        requests,
        nextPage: requestsData.length === ITEMS_PER_PAGE ? pageParam + ITEMS_PER_PAGE : null,
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

