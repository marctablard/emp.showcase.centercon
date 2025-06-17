'use client';

import { storyblokEditable } from '@storyblok/react/rsc';
import { CirclePause } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button, { ButtonData } from './button';

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
    video_url?: string;
  };
}

const Hero = ({ blok }: HeroProps) => {
  if (!blok.image?.filename) {
    return null;
  }

  const button = blok.main_button[0];
  const text = blok.text.content[0].content[0].text;

  const isVideo = false; /* needs to be removed when video functionality is working */

  return (
    <div {...storyblokEditable(blok)} className={cn('relative mb-10 sm:mb-20 lg:md:mb-10')}>
      <div className="w-full flex justify-end">
        <div className="mb-75 sm:mb-45 md:mb-0 h-120 sm:h-145 lg:h-185">
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

              {blok.image && !isVideo && (
                <image
                  clipPath="url(#shape)"
                  xlinkHref={blok.image.filename}
                  className="w-full translate-x-20 md:translate-x-0"
                ></image>
              )}
              {isVideo && blok.video_url && (
                <foreignObject
                  width="100%"
                  height="100%"
                  clipPath="url(#shape)"
                  className="w-full translate-x-20 md:translate-x-0"
                >
                  <iframe
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
      <div className="w-full max-w-6xl mx-auto">
        <div className="ms-auto absolute bottom-0 sm:-bottom-10 lg:bottom-20 px-9">
          <div className="flex flex-col gap-4 bg-white opacity-85 md:w-1/2 xl:w-4/7 rounded-ss-xl rounded-ee-xl shadow-lg p-6">
            <h1 className="text-5xl lg:text-8xl font-bold text-headlines font-headlines">{blok.headline}</h1>
            <div className="w-20 h-2 bg-primary-500 rounded-xl"></div>
            <p className=" text-base lg:text-xl text-neutral-800">{text}</p>

            {blok.main_button && <Button blok={button} />}
          </div>
        </div>
        {isVideo && blok.video_url && (
          <div className="absolute flex rounded-3xl shadow-xl w-12 h-12 bg-white right-0 bottom-0 cursor-pointer me-9 mb-14 p-3 text-primary-500 transition hover:text-primary-700">
            {<CirclePause />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
