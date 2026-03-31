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
  });

  return (
    <div
      className="my-6 overflow-x-auto rounded-lg text-sm [&_pre]:p-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
