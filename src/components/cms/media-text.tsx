import { storyblokEditable } from '@storyblok/react/rsc';
import { cn } from '@/lib/utils';
import Button, { ButtonProps } from './button';

export enum ImagePosition {
  Right = 'Right',
  Left = 'Left',
}

export enum Media {
  Image = 'Image',
  Video = 'Video',
}

interface MediaProps {
  type: Media;
  image?: {
    filename: string;
    alt?: string;
  };
  video_link?: string;
}

interface MediaTextProps {
  blok: {
    overline?: string;
    headline: string;
    text: string;
    main_button?: ButtonProps[];
    media: MediaProps[];
    has_background?: boolean;
    image_position: ImagePosition;
  };
}

const MediaText = ({ blok }: MediaTextProps) => {
  const media = blok.media[0];
  const button = blok.main_button ? blok.main_button[0] : '';
  console.log(blok.image_position + ', ' + ImagePosition.Right);
  console.log(blok.image_position === ImagePosition.Right);

  return (
    <div
      {...storyblokEditable(blok)}
      className={cn('flex gap-5 align-center px-4 py-8', blok.has_background && 'bg-primary-50')}
    >
      <div
        className={cn(
          'flex flex-col md:flex-row gap-5 align-center',
          blok.image_position === ImagePosition.Right && 'md:flex-row-reverse',
        )}
      >
        <div className="flex flex-1 rounded-ss-3xl rounded-ee-3xl">
          {media.type === Media.Image && (
            <div className="w-full m-auto rounded-[inherit]">
              <img src={media?.image?.filename} className="rounded-[inherit]" />
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 justify-center gap-3">
          <p className="text-primary-500 font-bold uppercase">{blok.overline}</p>
          <h1 className="text-5xl lg:text-8xl font-bold text-headlines font-headlines">{blok.headline}</h1>
          <p className=" text-base lg:text-xl text-neutral-800">{blok.text}</p>
          {blok.main_button && <Button blok={button} />}
        </div>
      </div>
    </div>
  );
};

export default MediaText;
