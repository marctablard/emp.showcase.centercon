'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group w-full m-0"
      data-x-position="right"
      style={
        {
          '--width': '100%',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
