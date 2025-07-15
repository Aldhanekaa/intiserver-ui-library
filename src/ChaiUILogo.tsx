export const Logo = () => {
  return (
    <a
      href="/"
      className="flex flex-none items-center rounded-xl font-semibold focus:opacity-80 focus:outline-none"
      aria-label="IntiServer UI">
      <img
        className="h-[30px] w-[30px] rounded-md lg:h-[30px] lg:w-[30px] xl:w-[30px]"
        src="https://intiserver.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fintiserver-logo.bb93b0d2.png&w=48&q=75"
        alt=""
        loading="lazy"
        height=""
        width=""
      />
      <h2 className="ml-1 text-xl tracking-tight">IntiServer UI</h2>
    </a>
  );
};
