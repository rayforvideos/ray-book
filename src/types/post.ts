import { z } from "zod";

export const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  series: z.string().optional(),
  seriesOrder: z.number().optional(),
  draft: z.boolean().default(false),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;

export interface Post {
  slug: string;
  frontmatter: Frontmatter;
  content: string;
}

export interface PostMeta {
  slug: string;
  frontmatter: Frontmatter;
}

export interface Series {
  slug: string;
  title: string;
  description: string;
}
