import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isDev = process.env.SITE_ENV === "dev";

  return {
    rules: [
      {
        userAgent: "*",
        allow: isDev ? undefined : "/",
        disallow: isDev ? "/" : undefined,
      },
    ],
  };
}
