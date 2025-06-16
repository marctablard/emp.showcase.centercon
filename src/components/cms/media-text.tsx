import { storyblokEditable } from '@storyblok/react/rsc';
import { cn } from '@/lib/utils';
import Button, { ButtonData, ButtonProps } from './button';

export enum ImagePosition {
  Right = 'Right',
  Left = 'Left',
}

interface MediaTextProps {
  blok: {
    overline?: string;
    headline: string;
    text: string;
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

  return (
    <div
      {...storyblokEditable(blok)}
      className={cn('flex gap-5 align-center px-4 py-8', blok.has_background && 'bg-primary-50')}
    >
      <div className={cn('w-full grid grid-cols-1 md:grid-cols-2 gap-5')}>
        <div
          className={cn(
            'row-start-2 md:row-span-2',
            blok.image_position === ImagePosition.Left && 'md:col-start-1',
            blok.image_position === ImagePosition.Right && 'md:col-start-2',
            'content-center rounded-ss-3xl rounded-ee-3xl',
          )}
        >
          {blok.image && (
            <div className="h-full m-auto rounded-[inherit]">
              {!blok.video_url && <img src={blok.image.filename} className="rounded-[inherit]" />}
              {blok.video_url && (
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
            blok.image_position === ImagePosition.Left && 'md:col-start-2',
            blok.image_position === ImagePosition.Right && 'md:col-start-1',
          )}
        >
          <p className="text-primary-500 font-bold uppercase pb-3">{blok.overline}</p>
          <h1 className="text-5xl lg:text-8xl font-bold text-headlines font-headlines">{blok.headline}</h1>
        </div>
        <div
          className={cn(
            'col-start-1',
            blok.image_position === ImagePosition.Left && 'md:col-start-2',
            blok.image_position === ImagePosition.Right && 'md:col-start-1',
          )}
        >
          <p className=" text-base lg:text-xl text-neutral-800 pb-3">{blok.text}</p>
          {button && <Button blok={button} />}
        </div>
      </div>
    </div>
  );
};

export default MediaText;
