import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

interface HeaderLogoProps {
  small?: boolean;
  width?: number;
  height?: number;
  className?: string;
  title?: string;
}

export const HeaderLogo = ({ small = false, width, height, className, title }: HeaderLogoProps) => {
  const t = useTranslations('common');

  // Default dimensions based on logo variant
  const defaultDimensions = small
    ? { width: 25, height: 22, className: 'min-w-[25px] min-h-[22px]' }
    : { width: 108, height: 16, className: 'min-w-[108px] min-h-[16px]' };

  // Use provided values or defaults
  const imageWidth = width !== undefined ? width : defaultDimensions.width;
  const imageHeight = height !== undefined ? height : defaultDimensions.height;
  const imageClassName = className || defaultDimensions.className;
  const linkTitle = title || t('home');

  // Logo source based on variant
  const logoSrc = small ? '/images/logo_small.svg' : '/images/logo.svg';

  return (
    <Link href="/" title={linkTitle}>
      <Image src={logoSrc} alt="Logo" width={imageWidth} height={imageHeight} className={imageClassName} />
    </Link>
  );
};
