export default function TextStyleGuide() {
  return (
    <div className="py-12">
      <h3 className="mb-4">Headlines</h3>
      <div className="p-4 grid grid-cols-[1fr] gap-6 mb-2">
        <h1 className="text-5xl md:text-8xl font-bold text-headlines">H1 - The quick brown fox jumps over...</h1>
        <h2 className="text-5xl/8 md:text-7xl font-bold text-headlines">H2 - The quick brown fox jumps over...</h2>
        <h3 className="text-4xl/7 md:text-6xl font-bold text-headlines">H3 - The quick brown fox jumps over...</h3>
        <h4 className="text-3xl/5 md:text-4xl font-bold text-headlines">H4 - The quick brown fox jumps over...</h4>
        <h5 className="text-2xl/4 md:text-3xl font-bold text-headlines">H5 - The quick brown fox jumps over...</h5>
        <h6 className="text-xs/3 md:text-2xl font-bold text-headlines">H6 - The quick brown fox jumps over...</h6>
      </div>
    </div>
  );
}
