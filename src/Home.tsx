import { Eye, Plus } from "lucide-react";
import { useBlocks } from "./useBlocks.ts";
import { capitalize, filter, isEmpty, uniq } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "./ChaiUILogo.tsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import theme from "../chai.config.json";
import PreviewWeb from "./preview/WebPreview.tsx";
import { load } from "js-yaml";

export const extractMetadata = (htmlContent: string) => {
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

const useBlockData = () => {
  const [params] = useSearchParams();
  const path = params.get("path") as string;
  const [html, setHtml] = useState("");
  useEffect(() => {
    (async () => {
      if (!path) return;
      setHtml("");
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
  const file = path
    ? path.indexOf("/") !== -1
      ? path?.split("/").pop()
      : ""
    : "";
  const group = path
    ? path.indexOf("/") !== -1
      ? path?.split("/")[0]
      : path
    : "";
  return { initialContent, metadata, group, file, path };
};

export default function Home() {
  const { data: blocks } = useBlocks();
  const groups = uniq(blocks.map((block) => block.group));
  const data = useBlockData();

  const navigate = useNavigate();
  const group = data?.group || "";
  return (
    <div className="flex h-screen flex-col">
      {/* Topbar */}
      <div className="flex h-[60px] items-center justify-between bg-gray-800 px-4 text-white">
        <div className="text-xl font-bold">
          <Logo />
        </div>
       
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 overflow-y-auto bg-gray-100 p-4">
          <select
            value={group}
            onChange={(e) => navigate(`/?path=${e.target.value}`)}
            className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Choose a group</option>
            {groups.map((_group, index) => (
              <option key={index} value={_group}>
                {capitalize(_group)}
              </option>
            ))}
          </select>
          <hr className="py-2" />
          <ul>
            {filter(blocks, (block) => block.group === group).map((block) => (
              <li className="mb-2">
                <button
                  onClick={() => navigate(`/?path=${block.path}`)}
                  className={
                    "text-left hover:underline" +
                    (block.path === data?.path
                      ? " text-blue-600 underline"
                      : "")
                  }>
                  {capitalize(block.name)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Main content area */}
        {data?.initialContent && data?.file !== "" ? (
          <div className="flex-1 overflow-y-auto p-6">
            <PreviewWeb
              metadata={data?.metadata as Record<string, string>}
              html={data?.initialContent || ""}
              theme={theme as unknown as Record<string, string>}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
