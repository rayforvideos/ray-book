import fs from "fs";
import path from "path";
import type { Series } from "@/types/post";
import { getPostsBySeries } from "./posts";

const SERIES_FILE = path.join(process.cwd(), "content/series.json");

export function getAllSeries(): Series[] {
  if (!fs.existsSync(SERIES_FILE)) return [];
  const raw = fs.readFileSync(SERIES_FILE, "utf-8");
  return JSON.parse(raw) as Series[];
}

export function getSeriesBySlug(slug: string): Series | undefined {
  return getAllSeries().find((s) => s.slug === slug);
}

export function getAllSeriesSlugs(): string[] {
  return getAllSeries().map((s) => s.slug);
}

export function getSeriesWithPosts() {
  return getAllSeries().map((series) => ({
    ...series,
    posts: getPostsBySeries(series.slug),
  }));
}
