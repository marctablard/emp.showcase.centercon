import { cache } from 'react';

// Theme is used to store the current theme of the application
// used for SSR Mode, since we don't have access to ThemeContext yet

type themeObjectType = {
  theme: string | undefined;
};

const themeObject = cache(() => {
  return { theme: undefined } as themeObjectType;
});

export const getTheme = () => {
  return themeObject().theme;
};

export const setRequestTheme = (theme: string) => {
  themeObject().theme = theme;
};
