'use client';

import { useRef, useState } from 'react';
import { storyblokEditable } from '@storyblok/react/rsc';
import { CirclePause, CirclePlay } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button, { ButtonData } from './button';

interface HeroProps {
  blok: {
    headline: string;
    description: string;
    main_button: ButtonData[];
    image: {
      filename: string;
      alt?: string;
    };
    video_url?: string;
  };
}

const Hero = ({ blok }: HeroProps) => {
  if (!blok.image?.filename) {
    return null;
  }

  const button = blok.main_button[0];

  const iframeRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    const iframe: any = iframeRef.current;
    const video = iframe?.contentWindow.document.querySelector('video');
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div {...storyblokEditable(blok)} className={cn('relative mb-10 sm:mb-20 lg:md:mb-10')}>
      <div className="w-full flex justify-end">
        <div className="mb-75 sm:mb-45 md:mb-0 h-120 sm:h-150 md:h-120 lg:h-200 xl:h-175 2xl:h-220">
          {blok.image && (
            <svg className="h-[100%] " viewBox="0 0 1573 735">
              <defs>
                <clipPath id="shape">
                  <path
                    d="M575.995 711.064L0.5 0H1572.5V525.401C1572.5 556.733 1549.82 583.458 1518.9 588.55L636.144 733.95C613.438 737.69 590.472 728.952 575.995 711.064Z"
                    fill="#0F77D9"
                  />
                </clipPath>
              </defs>

              {blok.image && !blok.video_url && (
                <image
                  clipPath="url(#shape)"
                  xlinkHref={blok.image.filename}
                  className="w-full translate-x-20 md:translate-x-0"
                ></image>
              )}
              {blok.video_url && (
                <foreignObject
                  width="100%"
                  height="100%"
                  clipPath="url(#shape)"
                  className="w-full translate-x-20 md:translate-x-0"
                >
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full"
                    src={blok.video_url}
                    title="YouTube video player"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  ></iframe>
                </foreignObject>
              )}
            </svg>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 sm:-bottom-10 lg:bottom-20 px-9">
        <div className="flex flex-col gap-4 bg-white opacity-85 md:w-1/2 xl:w-4/7 rounded-ss-xl rounded-ee-xl shadow-lg p-6">
          <h1 className="text-5xl lg:text-8xl font-bold text-headlines font-headlines">{blok.headline}</h1>
          <div className="w-20 h-2 bg-primary-500 rounded-xl"></div>
          <p className=" text-base lg:text-xl text-neutral-800">{blok.description}</p>

          {blok.main_button && <Button blok={button} />}
        </div>
      </div>
      {blok.video_url && (
        <div
          className="absolute flex rounded-3xl shadow-xl w-12 h-12 bg-white right-0 bottom-0 cursor-pointer me-9 mb-14 p-3 text-primary-500 hover:text-primary-700"
          onClick={handlePlayPause}
        >
          {isPlaying && <CirclePlay />}
          {!isPlaying && <CirclePause />}
        </div>
      )}
    </div>
  );
};

export default Hero;
