import type { MetadataRoute } from "next";

// Static export를 위한 설정
export const dynamic = "force-static";


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
