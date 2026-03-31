import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  lang?: string;
}

export async function CodeBlock({ code, lang = "typescript" }: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang,
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
    defaultColor: false,
  });

  return (
    <div
      className="my-8 overflow-x-auto text-[0.8125rem] [&_pre]:border [&_pre]:border-border [&_pre]:p-5 [&_pre]:leading-relaxed dark:[&_pre]:border-border-dark"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
