import Link from 'next/link';

export default function TextStyleGuide() {
  return (
    <div className="py-12">
      <h4 className="text-3xl/5 md:text-4xl font-bold text-headlines font-headlines mb-3">Typography</h4>
      <div className="p-4 grid grid-cols-[1fr] gap-6 mb-2">
        <h1 className="text-5xl md:text-8xl font-bold text-headlines font-headlines">
          H1 - The quick brown fox jumps over...
        </h1>
        <h2 className="text-5xl/8 md:text-7xl font-bold text-headlines font-headlines">
          H2 - The quick brown fox jumps over...
        </h2>
        <h3 className="text-4xl/7 md:text-6xl font-bold text-headlines font-headlines">
          H3 - The quick brown fox jumps over...
        </h3>
        <h4 className="text-3xl/5 md:text-4xl font-bold text-headlines font-headlines">
          H4 - The quick brown fox jumps over...
        </h4>
        <h5 className="text-2xl/4 md:text-3xl font-bold text-headlines font-headlines">
          H5 - The quick brown fox jumps over...
        </h5>
        <h6 className="text-xs/3 md:text-2xl font-bold text-headlines font-headlines">
          H6 - The quick brown fox jumps over...
        </h6>
        <h4 className="text-xs/3 md:text-base font-bold text-headlines md:text-primary-500 uppercase tracking-widest font-headlines">
          overline
        </h4>
      </div>
      <div className="p-4 grid grid-cols-[1fr] gap-6 mb-2">
        <p className="text-xl">
          Body L <br /> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt
          ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
          rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
          <br />
          <Link
            href="#"
            className="text-primary underline hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            text link
          </Link>
        </p>
        <p className="text-xl italic">
          Body L Italic
          <br /> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
          labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
          rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
          <br />
          <Link
            href="#"
            className="text-primary underline hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            text link
          </Link>
        </p>
        <p className="text-xl font-bold">
          Body L Bold
          <br /> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
          labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
          rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
          <br />
          <Link
            href="#"
            className="text-primary underline hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            text link
          </Link>
        </p>
        <p className="text-base">
          Body M <br /> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt
          ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
          rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
          <br />
          <Link
            href="#"
            className="text-primary underline hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            text link
          </Link>
        </p>
        <p className="text-base italic">
          Body M Italic
          <br /> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
          labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
          rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
          <br />
          <Link
            href="#"
            className="text-primary underline hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            text link
          </Link>
        </p>
        <p className="text-base font-bold">
          Body M Bold
          <br /> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
          labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
          rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
          <br />
          <Link
            href="#"
            className="text-primary underline hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            text link
          </Link>
        </p>
        <p className="text-sm">
          Body S <br /> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt
          ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
          rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
          <br />
          <Link
            href="#"
            className="text-primary underline hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            text link
          </Link>
        </p>
        <p className="text-sm italic">
          Body S Italic
          <br /> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
          labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
          rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
          <br />
          <Link
            href="#"
            className="text-primary underline hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            text link
          </Link>
        </p>
        <p className="text-sm font-bold">
          Body S Bold
          <br /> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
          labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
          rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
          <br />
          <Link
            href="#"
            className="text-primary underline hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            text link
          </Link>
        </p>
      </div>
    </div>
  );
}
