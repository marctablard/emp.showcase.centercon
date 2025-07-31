'use client';

import { StoryblokServerComponent, storyblokEditable } from '@storyblok/react/rsc';

/**
 * Segment component for Storyblok
 * Displays content specific to a customer segment
 */
interface SegmentProps {
  blok: {
    segment_name?: string;
    emporix_segment_id?: string;
    content_blocks?: any[];
    site?: string;
  };
}

const Segment = ({ blok }: SegmentProps) => {
  return (
    <section {...storyblokEditable(blok)} className="segment-container my-8">
      {blok.segment_name && <h2 className="text-xl font-semibold mb-4">{blok.segment_name}</h2>}

      <div className="space-y-6">
        {blok.content_blocks?.map((block) => <StoryblokServerComponent blok={block} key={block._uid} />)}
      </div>
    </section>
  );
};

export default Segment;
