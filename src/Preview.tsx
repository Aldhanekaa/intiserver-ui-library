import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { isEmpty } from "lodash";
import { load } from "js-yaml";
import PreviewWeb from "./preview/WebPreview.tsx";
import theme from "../chai.config.json";

const extractMetadata = (htmlContent: string) => {
  const blockMeta = htmlContent.match(/---([\s\S]*?)---/);
  if (blockMeta) {
    try {
      return load(blockMeta[1]);
    } catch (_er) {
      console.log(_er);
    }
  }
  return {};
};

export default function Preview() {
  const [params] = useSearchParams();
  const path = params.get("path") as string;
  const [html, setHtml] = useState("");
  useEffect(() => {
    (async () => {
      const response = await fetch("/blocks/" + path);
      const previewHtml = await response.text();
      setHtml(previewHtml);
    })();
  }, [path]);

  const initialContent = useMemo(() => {
    return html.replace(/---([\s\S]*?)---/g, "");
  }, [html]);

  const metadata = useMemo(() => {
    return extractMetadata(html);
  }, [html]);

  if (isEmpty(html)) return null;

  return (
    <PreviewWeb
      metadata={metadata as Record<string, string>}
      html={initialContent}
      theme={theme as unknown as Record<string, string>}
    />
  );
}
