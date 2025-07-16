import Image from 'next/image';
import { storyblokEditable } from '@storyblok/react/rsc';
import { cn } from '@/lib/utils';
import { Headline } from '../ui/headline';
import Button, { ButtonData } from './button';
import { TextEditorData } from './hero';

export enum ImagePosition {
  Right = 'Right',
  Left = 'Left',
}

interface MediaTextProps {
  blok: {
    overline?: string;
    headline: string;
    text: TextEditorData;
    main_button?: ButtonData[];
    image: {
      filename: string;
      alt?: string;
    };
    video_url?: string;
    has_background?: boolean;
    image_position: ImagePosition;
  };
}

const MediaText = ({ blok }: MediaTextProps) => {
  const button = blok.main_button ? blok.main_button[0] : null;
  const text = blok.text.content[0].content[0].text;

  const isVideo = false; /* needs to be removed when video functionality is working */

  return (
    <div
      {...storyblokEditable(blok)}
      className={cn(
        'flex gap-5 align-center py-8',
        blok.has_background && 'bg-primary-50',
        blok.has_background &&
          blok.image_position === ImagePosition.Right &&
          ' bg-[url("/images/text-media-left-bg.svg")] bg-no-repeat bg-left-top',
        blok.has_background &&
          blok.image_position === ImagePosition.Left &&
          'bg-right-top bg-[url("/images/text-media-right-bg.svg")] bg-no-repeat ',
      )}
    >
      <div className={cn('w-full grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto')}>
        <div
          className={cn(
            'row-start-2 md:row-span-2',
            blok.image_position === ImagePosition.Left && 'md:col-start-1 me-4 md:me-0 ms-4 lg:ms-8',
            blok.image_position === ImagePosition.Right && 'md:col-start-2 ms-4 md:ms-0 me-4 lg:me-8',
            'content-center rounded-ss-3xl rounded-ee-3xl',
          )}
        >
          {blok.image && (
            <div className="h-full m-auto rounded-[inherit]">
              {!isVideo && (
                <Image
                  src={blok.image.filename}
                  alt={blok.image.alt || ''}
                  className="w-full h-auto rounded-[inherit]"
                  width={1000}
                  height={1000}
                />
              )}
              {isVideo && blok.video_url && (
                <div className="h-full rounded-[inherit]">
                  <iframe src={blok.video_url} className="w-full h-[500px] rounded-[inherit]" />
                </div>
              )}
            </div>
          )}
        </div>
        <div
          className={cn(
            'col-start-1 row-start-1 content-end',
            blok.image_position === ImagePosition.Left && 'md:col-start-2 ms-4 md:ms-0 me-4 lg:me-8',
            blok.image_position === ImagePosition.Right && 'md:col-start-1 me-4 md:me-0 ms-4 lg:ms-8',
          )}
        >
          {blok.overline && (
            <Headline variant="overline" as="h4" className="mb-3">
              {blok.overline}
            </Headline>
          )}
          {blok.headline && (
            <Headline variant="h2" as="h3">
              {blok.headline}
            </Headline>
          )}
        </div>
        <div
          className={cn(
            'col-start-1',
            blok.image_position === ImagePosition.Left && 'md:col-start-2 ms-4 md:ms-0 me-4 lg:me-8',
            blok.image_position === ImagePosition.Right && 'md:col-start-1 me-4 md:me-0 ms-4 lg:ms-8',
          )}
        >
          <p className=" text-base lg:text-xl text-neutral-800 pb-4">{text}</p>
          {button && <Button blok={button} />}
        </div>
      </div>
    </div>
  );
};

export default MediaText;
