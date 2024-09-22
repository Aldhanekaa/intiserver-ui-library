import { useEffect, useState } from "react";

type Block = {
  group: string;
  uuid: string;
  path: string;
  name: string;
  preview: string;
};

export const useBlocks = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  useEffect(() => {
    (async () => {
      const response = await fetch("/blocks.json");
      const data = await response.json();
      setBlocks(data);
    })();
  }, []);
  return { data: blocks };
};
