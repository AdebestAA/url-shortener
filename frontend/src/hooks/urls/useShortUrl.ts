import { useQuery } from "@tanstack/react-query";

import { urlService } from "@/services/urls";

const useShortUrl = (id?: string) => {
  return useQuery({
    queryKey: ["urls", "detail", id],
    queryFn: () => urlService.getShortUrl(id as string),
    enabled: !!id,
    retry: 1,
  });
};

export default useShortUrl;
