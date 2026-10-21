export function Logo() {
  return (
    <div className="hidden flex-col items-center py-8 sm:flex">
      <h1
        className="text-8xl font-semibold leading-none tracking-tight"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Setup<em className="font-normal">Rank</em>
      </h1>
      <p
        className="text-xs uppercase tracking-widest mt-6 text-zinc-200"
        style={{
          letterSpacing: "0.15em",
        }}
      >
        thesetuprank.com
      </p>
      <p
        className="mt-3 uppercase text-zinc-300 font-light"
        style={{
          fontSize: "10px",
          letterSpacing: "0.25em",
        }}
      >
        rate the best battlestations
      </p>
    </div>
  );
}
