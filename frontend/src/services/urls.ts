import apiClient from "@/axios-instances/url-shortener-instance";
import type {
  createShortUrlType,
  shortUrlResponseType,
  typeResponse,
} from "@/utils/types";

export const urlService = {
  createShortUrl: async (
    payload: createShortUrlType,
  ): Promise<shortUrlResponseType> => {
    const res = await apiClient.post("/urls", payload);
    return res.data;
  },

  getShortUrl: async (
    shortId: string,
  ): Promise<typeResponse<shortUrlResponseType>> => {
    const res = await apiClient.get(`/urls/${shortId}`);
    return res.data;
  },
};
