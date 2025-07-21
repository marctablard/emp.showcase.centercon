import { storyblokEditable } from '@storyblok/react/rsc';

export interface VideoData {
  video_file: {
    filename: string;
    alt?: string;
  };
  autoplay: boolean;
  loop: boolean;
  mute: boolean;
  controls: boolean;
  alt_text?: string;
}
export interface VideoProps {
  blok: {
    video_file: {
      filename: string;
      alt?: string;
    };
    autoplay: boolean;
    loop: boolean;
    mute: boolean;
    controls: boolean;
    alt_text?: string;
  };
  controls?: boolean;
}

const Video = ({ blok, controls }: VideoProps) => {
  return (
    <div {...storyblokEditable(blok)} className="w-full h-full">
      <video
        height={'100%'}
        width={'100%'}
        muted={blok.mute || blok.autoplay}
        controls={blok.controls && controls}
        loop={blok.loop}
        autoPlay={blok.autoplay}
        className="w-full h-full object-cover"
        aria-label={blok.alt_text || blok.video_file.alt || 'Video'}
      >
        <source src={blok.video_file.filename} type="video/mp4" />
      </video>
    </div>
  );
};

export default Video;
