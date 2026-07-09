export type NewsApiSource = {
  id: string | null;
  name: string;
};

export type NewsApiArticle = {
  source: NewsApiSource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
};

type NewsApiResponse = {
  status: string;
  totalResults?: number;
  articles: NewsApiArticle[];
};

async function fetchNewsApi(
  path: string,
  params: Record<string, string>
): Promise<NewsApiArticle[]> {
  const apiKey = process.env.NEWSAPI_API_KEY;
  if (!apiKey) return [];

  const query = new URLSearchParams(params);
  const res = await fetch(`https://newsapi.org/v2/${path}?${query.toString()}`, {
    headers: { "X-Api-Key": apiKey },
    next: { revalidate: 300 },
  });

  if (!res.ok) return [];

  const json = (await res.json()) as NewsApiResponse;
  if (json.status !== "ok") return [];
  return json.articles ?? [];
}

export async function fetchNewsApiFinance(limit = 25): Promise<NewsApiArticle[]> {
  const pageSize = String(Math.min(limit, 50));

  const [headlines, everything] = await Promise.all([
    fetchNewsApi("top-headlines", {
      category: "business",
      language: "en",
      pageSize,
    }),
    fetchNewsApi("everything", {
      q: "stock market OR forex OR bitcoin OR federal reserve OR earnings",
      language: "en",
      sortBy: "publishedAt",
      pageSize,
    }),
  ]);

  const seen = new Set<string>();
  const merged: NewsApiArticle[] = [];

  for (const article of [...headlines, ...everything]) {
    if (!article.title || !article.url || seen.has(article.url)) continue;
    seen.add(article.url);
    merged.push(article);
  }

  return merged.slice(0, limit);
}
