import Link from 'next/link';
import { ArrowRight, Trash2 } from 'lucide-react';

export default function LinkStyleGuide() {
  return (
    <div className="py-12">
      <h4 className="text-3xl/5 lg:text-4xl font-bold text-headlines font-headlines mb-3">Links</h4>
      <p className="text-base mb-2">
        There is no ui-component for links. You can either use the Link from next.js or HTML a-Tag and also button-Tag
        is possible. Just use all tailwindcss classes used below:
      </p>
      <p>primary:</p>
      <div className="p-4 grid grid-cols-[1fr] md:grid-cols-[1fr_1fr_1fr] gap-6 mb-2 items-start">
        <div>
          <Link
            href="#"
            className="text-sm inline-flex items-center gap-1 text-primary font-bold underline hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <Trash2 />
            Link S
            <ArrowRight />
          </Link>
        </div>
        <div>
          <Link
            href="#"
            className="text-base inline-flex items-center gap-1 text-primary font-bold underline hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <Trash2 />
            Link M
            <ArrowRight />
          </Link>
        </div>
        <div>
          <Link
            href="#"
            className="text-xl inline-flex items-center gap-1 text-primary font-bold underline hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <Trash2 />
            Link L
            <ArrowRight />
          </Link>
        </div>
      </div>
      <p>secondary:</p>
      <div className="p-4 grid grid-cols-[1fr] md:grid-cols-[1fr_1fr_1fr] gap-6 mb-2 items-start">
        <div>
          <Link
            href="#"
            className="text-sm inline-flex items-center gap-1 hover:underline hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <Trash2 />
            Link S
            <ArrowRight />
          </Link>
        </div>
        <div>
          <Link
            href="#"
            className="text-base inline-flex items-center gap-1 hover:underline hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <Trash2 />
            Link M
            <ArrowRight />
          </Link>
        </div>
        <div>
          <Link
            href="#"
            className="text-xl inline-flex items-center gap-1 hover:underline hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <Trash2 />
            Link L
            <ArrowRight />
          </Link>
        </div>
      </div>
      <p className="text-base mb-2">If you use buttons they can be also disabled:</p>
      <p>primary:</p>
      <div className="p-4 grid grid-cols-[1fr] md:grid-cols-[1fr_1fr_1fr] gap-6 mb-2 items-start">
        <button
          disabled
          className="text-sm inline-flex items-center gap-1 text-primary font-bold underline disabled:text-neutral-300 disabled:[&_svg]:text-neutral-600 hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <Trash2 />
          Link S
          <ArrowRight />
        </button>
        <button
          disabled
          className="text-base inline-flex items-center gap-1 text-primary font-bold underline disabled:text-neutral-300 disabled:[&_svg]:text-neutral-600 hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <Trash2 />
          Link M
          <ArrowRight />
        </button>
        <button
          disabled
          className="text-xl inline-flex items-center gap-1 text-primary font-bold underline disabled:text-neutral-300 disabled:[&_svg]:text-neutral-600 hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <Trash2 />
          Link L
          <ArrowRight />
        </button>
      </div>
      <p>secondary:</p>
      <div className="p-4 grid grid-cols-[1fr] md:grid-cols-[1fr_1fr_1fr] gap-6 mb-2 items-start">
        <button
          disabled
          className="text-sm inline-flex items-center gap-1 hover:underline disabled:text-neutral-300 disabled:[&_svg]:text-neutral-600 hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <Trash2 />
          Link S
          <ArrowRight />
        </button>
        <button
          disabled
          className="text-base inline-flex items-center gap-1 hover:underline disabled:text-neutral-300 disabled:[&_svg]:text-neutral-600 hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <Trash2 />
          Link M
          <ArrowRight />
        </button>
        <button
          disabled
          className="text-xl inline-flex items-center gap-1 hover:underline disabled:text-neutral-300 disabled:[&_svg]:text-neutral-600 hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <Trash2 />
          Link L
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}
