import { create } from 'zustand';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { ToastContainer } from 'react-toastify';
import useSwarm from './useSwarm';
import hooks from '@/hooks';

/**
 * @notice Set up providers
 */

/**
 * @notice Themes
 */
const getLightProperties = (background) => [
  { '--text-main': 'rgba(0, 0, 0, 0.8)' },
  { '--text-main-full': 'rgba(0, 0, 0, 1)' },
  { '--text-main-rgb': '0, 0, 0' },
  { '--background-main': background },
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

const getDarkProperties = (background) => [
  { '--text-main': 'rgba(255, 255, 255, 0.87)' },
  { '--text-main-full': 'rgba(255, 255, 255, 1)' },
  { '--text-main-rgb': '255, 255, 255' },
  { '--background-main': background },
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
    const { isMobile } = hooks.useWindowSize();

    return (
      <>
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
              colorWarning: '#ff9e00',
            },
          }}>
          {children}
        </ConfigProvider>
        <ToastContainer
          position={isMobile ? 'top-left' : 'bottom-left'}
          autoClose={5000}
          newestOnTop
          theme={theme}
        />
      </>
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
    const { background } = useSwarm.getState();

    newTheme === 'light'
      ? setLight(background.light || '#e9e9e9')
      : setDark(background.dark || '#101010');
    set({ theme: newTheme });
  },

  // Light theme
  setLight: (background) => {
    getLightProperties(background).forEach((property) => {
      const key = Object.keys(property)[0];
      const value = Object.values(property)[0];

      document.documentElement.style.setProperty(key, value);
    });
  },

  // Dark theme
  setDark: (background) => {
    getDarkProperties(background).forEach((property) => {
      const key = Object.keys(property)[0];
      const value = Object.values(property)[0];

      document.documentElement.style.setProperty(key, value);
    });
  },

  /**
   * @notice Graphics
   */
  // highGraphics: true,
  // setHighGraphics: (value) => set({ highGraphics: value }),
  // toggleHighGraphics: () =>
  //   set((state) => ({ highGraphics: !state.highGraphics })),
}));
