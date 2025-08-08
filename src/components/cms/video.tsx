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

const Video = ({ video_file, autoplay, loop, mute, controls, alt_text }: VideoProps) => {
  return (
    <div className="w-full h-full">
      <video
        height={'100%'}
        width={'100%'}
        muted={mute || autoplay}
        controls={controls && controls}
        loop={loop}
        autoPlay={autoplay}
        className="w-full h-full object-cover"
        aria-label={alt_text || video_file?.alt || 'Video'}
      >
        <source src={video_file?.filename} type="video/mp4" />
      </video>
    </div>
  );
};

export default Video;
