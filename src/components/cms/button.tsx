import { storyblokEditable } from '@storyblok/react/rsc';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button as UiButton } from '../ui/button';

const IconVariant = {
  ArrowRight: ArrowRight,
  ArrowLeft: ArrowLeft,
} as const;
interface ButtonProps {
  blok: {
    title: string;
    link: string;
    iconLeft?: string;
    iconRight?: string;
  };
}

const Button = ({ blok }: ButtonProps) => {
  const IconLeft = blok.iconLeft && IconVariant[blok.iconLeft as keyof typeof IconVariant];
  const IconRight = blok.iconRight && IconVariant[blok.iconRight as keyof typeof IconVariant];

  return (
    <div {...storyblokEditable(blok)}>
      <UiButton onClick={() => (window.location.href = blok.link)}>
        {IconLeft && <IconLeft />}
        {blok.title}
        {IconRight && <IconRight />}
      </UiButton>
    </div>
  );
};

export default Button;
