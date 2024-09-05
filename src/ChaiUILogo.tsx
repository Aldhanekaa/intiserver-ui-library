export const Logo = () => {
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
      <h2 className="text-xl tracking-tight ml-1">Chai UI Blocks</h2>
    </a>
  );
};
