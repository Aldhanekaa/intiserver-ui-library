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
        <div className="flex items-center space-x-4">
          <a
            target="_blank"
            href="https://github.com/chaibuilder/chai-ui-blocks"
            className="hover:text-gray-300">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 448 512"
              height="35"
              width="35"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M448 96c0-35.3-28.7-64-64-64H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96zM265.8 407.7c0-1.8 0-6 .1-11.6c.1-11.4 .1-28.8 .1-43.7c0-15.6-5.2-25.5-11.3-30.7c37-4.1 76-9.2 76-73.1c0-18.2-6.5-27.3-17.1-39c1.7-4.3 7.4-22-1.7-45c-13.9-4.3-45.7 17.9-45.7 17.9c-13.2-3.7-27.5-5.6-41.6-5.6s-28.4 1.9-41.6 5.6c0 0-31.8-22.2-45.7-17.9c-9.1 22.9-3.5 40.6-1.7 45c-10.6 11.7-15.6 20.8-15.6 39c0 63.6 37.3 69 74.3 73.1c-4.8 4.3-9.1 11.7-10.6 22.3c-9.5 4.3-33.8 11.7-48.3-13.9c-9.1-15.8-25.5-17.1-25.5-17.1c-16.2-.2-1.1 10.2-1.1 10.2c10.8 5 18.4 24.2 18.4 24.2c9.7 29.7 56.1 19.7 56.1 19.7c0 9 .1 21.7 .1 30.6c0 4.8 .1 8.6 .1 10c0 4.3-3 9.5-11.5 8C106 393.6 59.8 330.8 59.8 257.4c0-91.8 70.2-161.5 162-161.5s166.2 69.7 166.2 161.5c.1 73.4-44.7 136.3-110.7 158.3c-8.4 1.5-11.5-3.7-11.5-8zm-90.5-54.8c-.2-1.5 1.1-2.8 3-3.2c1.9-.2 3.7 .6 3.9 1.9c.3 1.3-1 2.6-3 3c-1.9 .4-3.7-.4-3.9-1.7zm-9.1 3.2c-2.2 .2-3.7-.9-3.7-2.4c0-1.3 1.5-2.4 3.5-2.4c1.9-.2 3.7 .9 3.7 2.4c0 1.3-1.5 2.4-3.5 2.4zm-14.3-2.2c-1.9-.4-3.2-1.9-2.8-3.2s2.4-1.9 4.1-1.5c2 .6 3.3 2.1 2.8 3.4c-.4 1.3-2.4 1.9-4.1 1.3zm-12.5-7.3c-1.5-1.3-1.9-3.2-.9-4.1c.9-1.1 2.8-.9 4.3 .6c1.3 1.3 1.8 3.3 .9 4.1c-.9 1.1-2.8 .9-4.3-.6zm-8.5-10c-1.1-1.5-1.1-3.2 0-3.9c1.1-.9 2.8-.2 3.7 1.3c1.1 1.5 1.1 3.3 0 4.1c-.9 .6-2.6 0-3.7-1.5zm-6.3-8.8c-1.1-1.3-1.3-2.8-.4-3.5c.9-.9 2.4-.4 3.5 .6c1.1 1.3 1.3 2.8 .4 3.5c-.9 .9-2.4 .4-3.5-.6zm-6-6.4c-1.3-.6-1.9-1.7-1.5-2.6c.4-.6 1.5-.9 2.8-.4c1.3 .7 1.9 1.8 1.5 2.6c-.4 .9-1.7 1.1-2.8 .4z"></path>
            </svg>
          </a>
          <a
            target="_blank"
            href="https://github.com/chaibuilder/chai-ui-blocks">
            <button className="flex items-center rounded bg-blue-500 px-3 py-1 hover:bg-blue-600">
              <Plus size={18} className="mr-1" /> Contribute
            </button>
          </a>
          <a href="/builder">
            <button className="flex items-center rounded bg-white px-3 py-1 text-blue-600">
              <Eye size={18} className="mr-1" /> View in Builder
            </button>
          </a>
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
