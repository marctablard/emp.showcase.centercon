import { storyblokEditable } from '@storyblok/react/rsc';
import { CirclePause } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button, { ButtonProps } from './button';

interface HeroProps {
  blok: {
    headline: string;
    description: string;
    main_button: ButtonProps[];
    image?: {
      filename: string;
      alt?: string;
    };
    video?: {
      url?: string;
      alt?: string;
    };
    alt_text?: string;
  };
}

const Hero = ({ blok }: HeroProps) => {
  if (!blok.image?.filename) {
    return null;
  }

  const button = blok.main_button[0];
  const isVideo = false;

  return (
    <div {...storyblokEditable(blok)} className={cn('relative mb-10 sm:mb-20 lg:md:mb-10')}>
      <div className="w-full flex justify-end">
        <div className="w-full mb-65 sm:mb-0 xl:w-9/10 h-120 sm:h-130 md:h-120 lg:h-200 xl:h-175 2xl:h-220 ">
          {blok.image && (
            <svg height="100%" className="" viewBox="0 0 1573 735">
              <defs>
                <clipPath id="shape">
                  <path
                    d="M575.995 711.064L0.5 0H1572.5V525.401C1572.5 556.733 1549.82 583.458 1518.9 588.55L636.144 733.95C613.438 737.69 590.472 728.952 575.995 711.064Z"
                    fill="#0F77D9"
                  />
                </clipPath>
              </defs>

              {blok.image && !isVideo && (
                <image
                  clipPath="url(#shape)"
                  xlinkHref={blok.image.filename}
                  className="w-full -translate-x-150 sm:-translate-x-120 md:-translate-x-30 lg:-translate-x-120 xl:translate-x-0"
                ></image>
              )}
              {blok.video && isVideo && (
                <foreignObject
                  width="100%"
                  height="100%"
                  clipPath="url(#shape)"
                  className="w-full -translate-x-150 sm:-translate-x-120 md:-translate-x-30 lg:-translate-x-120 xl:translate-x-0"
                >
                  <video loop autoPlay width="100%">
                    <source src={blok.video.url} type="video/mp4" />
                  </video>
                </foreignObject>
              )}
            </svg>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 sm:-bottom-10 lg:bottom-20 px-4">
        <div className="flex flex-col gap-4 bg-white opacity-85 sm:w-1/2 xl:w-4/7 rounded-ss-xl rounded-ee-xl shadow-lg p-6">
          <h1 className="text-5xl lg:text-8xl font-bold text-headlines font-headlines">{blok.headline}</h1>
          <div className="w-20 h-2 bg-primary-500 rounded-xl"></div>
          <p className=" text-base lg:text-xl text-neutral-800">{blok.description}</p>

          {blok.main_button && <Button blok={button} />}
        </div>
      </div>
      {isVideo && (
        <div className="absolute flex rounded-3xl shadow-xl w-12 h-12 bg-white right-0 bottom-0 me-6 mb-20 p-3 text-primary-500">
          <CirclePause />
        </div>
      )}
    </div>
  );
};

export default Hero;
