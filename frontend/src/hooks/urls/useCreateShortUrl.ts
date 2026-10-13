import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { urlService } from "@/services/urls";
import { handleError } from "@/utils/error-handler";
import type { shortUrlResponseType } from "@/utils/types";

const useCreateShortUrl = () => {
  return useMutation({
    mutationFn: urlService.createShortUrl,
    onSuccess: (data: shortUrlResponseType) => {
      if (data.success) {
        toast.success("Link shortened");
      } else {
        toast.error("sorry, something went wrong");
      }
    },
    onError: handleError,
  });
};

export default useCreateShortUrl;
