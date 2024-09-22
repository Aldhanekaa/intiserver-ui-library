import "./chaibuilder.tailwind.css";
import "@chaibuilder/sdk/styles";
import { loadWebBlocks } from "@chaibuilder/sdk/web-blocks";
import { ChaiBuilderEditor, getBlocksFromHTML } from "@chaibuilder/sdk";
import type { ChaiBlock } from "@chaibuilder/sdk";
import { Logo } from "./ChaiUILogo.tsx";

loadWebBlocks();

function Builder() {
  return (
    <>
      <ChaiBuilderEditor
        topBarComponents={{
          left: [Logo],
        }}
        uiLibraries={[{ uuid: "merakiui", name: "Meraki UI", url: "/" }]}
        // @ts-ignore
        getUILibraryBlock={async (uiLibrary: any, uiLibBlock: any) => {
          const response = await fetch("/blocks/" + uiLibBlock.path);
          const html = await response.text();
          console.log(html);
          const htmlWithoutChaiStudio = html.replace(/---([\s\S]*?)---/g, "");
          return getBlocksFromHTML(`${htmlWithoutChaiStudio}`) as ChaiBlock[];
        }}
        getUILibraryBlocks={async () => {
          try {
            const response = await fetch("/blocks.json");
            const blocks = await response.json();
            return blocks.map((b: any) => ({
              ...b,
              preview: b.preview,
            }));
          } catch (e) {
            return [];
          }
        }}
        blocks={[]}
        onSave={async ({ blocks, providers, brandingOptions }) => {
          console.log(blocks, providers, brandingOptions);
          return true;
        }}
      />
    </>
  );
}

export default Builder;
