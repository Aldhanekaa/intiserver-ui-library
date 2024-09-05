import "./chaibuilder.tailwind.css";
import "@chaibuilder/sdk/styles";
import "@chaibuilder/sdk/web-blocks";
import { ChaiBlock, ChaiBuilderEditor } from "@chaibuilder/sdk";
import { getBlocksFromHTML } from "@chaibuilder/sdk/lib";

const Logo = () => {
  return (
    <a
      href="https://chaibuilder.com"
      target="_blank"
      className="flex-none rounded-xl font-semibold focus:outline-none focus:opacity-80 flex items-center"
      aria-label="Chai Builder"
    >
      <img
        className="w-[30px] h-[30px] rounded-md lg:w-[30px] lg:h-[30px] xl:w-[30px]"
        src="https://fldwljgzcktqnysdkxnn.supabase.co/storage/v1/object/public/chaibuilder-blob-storage/175ac8d8-37fe-4707-bb4a-3c0cd6a6db75/gVH7O-Ir_400x400.png"
        alt=""
        loading="lazy"
        height=""
        width=""
      />
      <h2 className="text-xl tracking-tight ml-1">Chai UI Library Builder</h2>
    </a>
  );
};

function Builder() {
  return (
    <>
      <ChaiBuilderEditor
        topBarComponents={{
          left: [Logo],
        }}
        uiLibraries={[{ uuid: "Chai UI", name: "Chai UI", url: "/" }]}
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
