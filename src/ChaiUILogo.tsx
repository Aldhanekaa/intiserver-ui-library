export const Logo = () => {
  return (
    <a
      href="/"
      className="flex flex-none items-center rounded-xl font-semibold focus:opacity-80 focus:outline-none"
      aria-label="Chai Builder">
      <img
        className="h-[30px] w-[30px] rounded-md lg:h-[30px] lg:w-[30px] xl:w-[30px]"
        src="https://fldwljgzcktqnysdkxnn.supabase.co/storage/v1/object/public/chaibuilder-blob-storage/175ac8d8-37fe-4707-bb4a-3c0cd6a6db75/gVH7O-Ir_400x400.png"
        alt=""
        loading="lazy"
        height=""
        width=""
      />
      <h2 className="ml-1 text-xl tracking-tight">Chai UI Blocks</h2>
    </a>
  );
};
