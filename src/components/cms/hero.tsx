'use client';

import { useEffect, useRef, useState } from 'react';
import { storyblokEditable } from '@storyblok/react/rsc';
import { CirclePause, CirclePlay } from 'lucide-react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils';
import Button, { ButtonData } from './button';
import Video, { VideoData } from './video';

export interface TextEditorData {
  content: [
    {
      text: string;
      type: string;
      content: [
        {
          text: string;
        },
      ];
    },
  ];
}

interface HeroProps {
  blok: {
    headline: string;
    text: TextEditorData;
    main_button: ButtonData[];
    image: {
      filename: string;
      alt?: string;
    };
    video?: VideoData[];
  };
}

const Hero = ({ blok }: HeroProps) => {
  const button = blok.main_button?.[0];
  const video = blok.video?.[0];
  const text = blok.text?.content?.[0]?.content?.[0].text;
  const isDesktopScreen = useBreakpoint('md');
  const videoPlayer = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(video?.autoplay);

  useEffect(() => {
    videoPlayer?.current?.querySelector('video')?.addEventListener('ended', () => {
      setIsPlaying(false);
    });
  });

  const handleVideoPlay = () => {
    if (isPlaying) {
      videoPlayer?.current?.querySelector('video')?.pause();
      setIsPlaying(false);
    } else {
      videoPlayer?.current?.querySelector('video')?.play();
      setIsPlaying(true);
    }
  };

  return (
    <div
      {...storyblokEditable(blok)}
      className={cn(
        'relative mb-10 sm:mb-20 lg:md:mb-10',
        'xl:bg-[url("/images/hero-pattern.svg")] bg-no-repeat bg-left-top',
        'max-w-[2500px] mx-auto',
      )}
    >
      <div className="w-full flex justify-end">
        <div className="mb-44 sm:mb-32 md:mb-0 h-100 md:h-145 lg:h-185 w-full md:w-auto">
          {blok.image && (
            <svg className="h-full w-full md:w-auto" viewBox={isDesktopScreen ? '0 0 1573 735' : '0 500 1573 735'}>
              <defs>
                <clipPath id="shape">
                  <path
                    className="hidden md:block"
                    d="M575.995 711.064L0.5 0H1572.5V525.401C1572.5 556.733 1549.82 583.458 1518.9 588.55L636.144 733.95C613.438 737.69 590.472 728.952 575.995 711.064Z"
                    fill="#0F77D9"
                  />
                  <path className="w-full md:hidden" d="M0 0H360V220L0 260V0Z" fill="#0F77D9" transform="scale(5)" />
                </clipPath>
              </defs>

              {blok.image && !video?.autoplay && (
                <image
                  clipPath="url(#shape)"
                  xlinkHref={blok.image.filename}
                  className="md:translate-x-0 md:w-full"
                ></image>
              )}
              {video && (
                <foreignObject clipPath="url(#shape)" className="md:translate-x-0 w-full h-[200%] md:h-full">
                  <div className="w-full h-full" ref={videoPlayer}>
                    <Video blok={video} controls={false} />
                  </div>
                </foreignObject>
              )}
            </svg>
          )}
        </div>
      </div>
      <div className="w-full max-w-6xl mx-auto">
        <div className="ms-auto absolute bottom-0 sm:-bottom-10 md:-bottom-10 lg:bottom-20 px-4 lg:px-9">
          {video && !isDesktopScreen && (
            <div
              className="flex rounded-3xl shadow-xl w-12 h-12 bg-white cursor-pointer ms-auto mb-4 p-3 text-primary-500 transition hover:text-primary-700"
              onClick={handleVideoPlay}
            >
              {isPlaying ? <CirclePause /> : <CirclePlay />}
            </div>
          )}
          <div className="flex flex-col gap-4 bg-white/85 md:w-1/2 xl:w-4/7 rounded-ss-2xl md:rounded-ss-4xl rounded-ee-2xl md:rounded-ee-4xl shadow-lg p-4 md:p-6 backdrop-blur-xs">
            <h1 className="text-5xl lg:text-8xl font-bold text-headlines font-headlines">{blok.headline}</h1>
            <div className="w-20 h-2 bg-primary-500 rounded-xl"></div>
            <p className=" text-base lg:text-xl text-neutral-800">{text}</p>

            {button && <Button blok={button} />}
          </div>
        </div>
        {video && isDesktopScreen && (
          <div
            className="absolute flex rounded-3xl shadow-xl w-12 h-12 bg-white right-0 bottom-0 cursor-pointer me-9 mb-14 p-3 text-primary-500 transition hover:text-primary-700"
            onClick={handleVideoPlay}
          >
            {isPlaying ? <CirclePause /> : <CirclePlay />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
