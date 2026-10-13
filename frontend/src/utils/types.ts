export type typeResponse<T> = { status: string; data: T };

export type createShortUrlType = {
  url: string;
};

export type shortUrlResponseType = {
  param?: string;
  message?: string;
  success?: string;
  long_url?: string;
};
