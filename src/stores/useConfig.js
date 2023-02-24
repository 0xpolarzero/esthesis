import { create } from 'zustand';
import { ConfigProvider, theme as antdTheme } from 'antd';

/**
 * @notice Set up providers
 */

/**
 * @notice Themes
 */
const lightProperties = [
  { '--text-main': 'rgba(0, 0, 0, 0.8)' },
  { '--text-main-full': 'rgba(0, 0, 0, 1)' },
  { '--text-main-rgb': '0, 0, 0' },
  { '--background-main': '#e9e9e9' },
  { '--background-main-rgb': '233, 233, 233' },
  { '--text-link-hover': '#747bff' },
  { '--background-button': '#f9f9f9' },
  { '--button-border': 'rgba(0, 0, 0, 0.1)' },
  // {
  //   '--cursor': `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="10" fill="%23101010B3" /></svg>') 5 5, auto`,
  // },
  // {
  //   '--cursor-hover': `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="10" fill="%23101010FF" /></svg>') 5 5, auto`,
  // },
];

const darkProperties = [
  { '--text-main': 'rgba(255, 255, 255, 0.87)' },
  { '--text-main-full': 'rgba(255, 255, 255, 1)' },
  { '--text-main-rgb': '255, 255, 255' },
  { '--background-main': '#101010' },
  { '--background-main-rgb': '16, 16, 16' },
  { '--text-link-hover': '#535bf2' },
  { '--background-button': '#1a1a1a' },
  { '--button-border': 'rgba(255, 255, 255, 0.1)' },
  // {
  //   '--cursor': `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="10" fill="%23e9e9e9B3" /></svg>') 5 5, auto`,
  // },
  // {
  //   '--cursor-hover': `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="10" fill="%23e9e9e9FF" /></svg>') 5 5, auto`,
  // },
];

export default create((set, get) => ({
  /**
   * @notice Providers configuration
   */
  Config: ({ children }) => {
    const { theme } = get();

    return (
      <ConfigProvider
        theme={{
          algorithm:
            theme === 'dark'
              ? antdTheme.darkAlgorithm
              : antdTheme.defaultAlgorithm,
          token: {
            ...antdTheme.defaultAlgorithm.token,
            fontFamily: 'var(--font-main)',
            colorPrimary: '#646cff',
          },
        }}>
        {children}
      </ConfigProvider>
    );
  },

  /**
   * @notice Theme configuration
   */
  theme: 'dark',
  // Init
  initTheme: async () => {
    const { updateTheme } = get();

    // Not a good practice, but it will avoid an hydration issue
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get the user's preferred theme
    const userPrefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = userPrefersDark ? 'dark' : 'light';

    updateTheme(theme);
    return theme;
  },

  // Update
  updateTheme: (newTheme) => {
    const { setLight, setDark } = get();

    const themeString =
      typeof newTheme === 'string'
        ? newTheme
        : newTheme.light
        ? 'light'
        : 'dark';
    let newBg = typeof newTheme === 'string' ? null : newTheme.hex;

    set({ theme: themeString });
    themeString === 'light' ? setLight() : setDark();
    if (newBg)
      document.documentElement.style.setProperty('--background-main', newBg);
  },

  // Light theme
  setLight: () => {
    lightProperties.forEach((property) => {
      const key = Object.keys(property)[0];
      const value = Object.values(property)[0];

      document.documentElement.style.setProperty(key, value);
    });
  },

  // Dark theme
  setDark: () => {
    darkProperties.forEach((property) => {
      const key = Object.keys(property)[0];
      const value = Object.values(property)[0];

      document.documentElement.style.setProperty(key, value);
    });
  },
}));
