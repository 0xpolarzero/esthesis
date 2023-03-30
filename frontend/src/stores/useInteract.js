import { create } from 'zustand';
import { toast } from 'react-toastify';
import useAudio from './useAudio';
import useSwarm from './useSwarm';
import { callBackendFunction } from '@/systems/utils';
import config from '@/data';

const { shaders: OPTIONS_SHADERS } = config.options;

export default create((set, get) => ({
  // Connection status
  connected: false,
  setConnected: (connected) => set({ connected }),
  address: '',
  setAddress: (address) => set({ address }),
  isAllowlisted: () => config.allowlist.includes(get().address),
  isAllowed: () => get().connected && get().isAllowlisted(),

  // Favorites
  favorites: [],
  favoritesLoaded: false,
  isFavorite: (id) => get().favorites.includes(id),
  setFavorites: async (address) => {
    if (address) {
      let favorites = await callBackendFunction('getFavorites', [address]);
      if (!favorites.success) {
        console.error(favorites.error);
        favorites = [];
      }
      set({ favorites: favorites.data, favoritesLoaded: true });
    } else {
      set({ favorites: [], favoritesLoaded: true });
    }
  },
  toggleFavorite: async (id) => {
    const { connected, address, isFavorite, favorites } = get();
    if (!connected) return;

    if (!isFavorite(id)) {
      // OR
      const notif = toast.loading('Adding to favorites...');
      const { success, error } = await callBackendFunction('addFavorite', [
        address,
        id,
      ]);
      if (success) {
        toast.update(notif, {
          render: 'Added to favorites',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
        set((state) => ({ favorites: [...favorites, id] }));
      } else {
        toast.update(notif, {
          render: 'error creating link',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        });
        console.error(error);
      }
    } else {
      const notif = toast.loading('Removing from favorites...');
      const { success, error } = await callBackendFunction('removeFavorite', [
        address,
        id,
      ]);
      if (success) {
        toast.update(notif, {
          render: 'Removed from favorites',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
        set((state) => ({ favorites: favorites.filter((f) => f !== id) }));
      } else {
        toast.update(notif, {
          render: 'Error removing from favorites',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        });
        console.error(error);
      }
    }
  },
  // Get the exhaustive args for the link
  getLink: (track) => {
    const {
      colorA,
      colorB,
      background,
      initialTheme,
      pattern,
      count,
      effects,
      artworkBg,
      blurBg,
    } = useSwarm.getState();

    const patternIndex = OPTIONS_SHADERS.vertex.findIndex(
      (p) => p.name === pattern.name,
    );
    const preview = () => {
      if (!track) return null;

      const url = new URL(`${window.location.href}shared/`);
      url.searchParams.set('colorA', `${colorA.dark},${colorA.light}`);
      url.searchParams.set('colorB', `${colorB.dark},${colorB.light}`);
      url.searchParams.set(
        'background',
        `${background.dark},${background.light}`,
      );
      url.searchParams.set('initialTheme', `${initialTheme}`);
      url.searchParams.set('pattern', `${patternIndex}`);
      url.searchParams.set('count', `${count}`);
      Object.keys(effects).forEach((key) => {
        url.searchParams.set(key, `${effects[key]}`);
      });
      url.searchParams.set('artworkBg', `${artworkBg}`);
      url.searchParams.set('blurBg', `${blurBg}`);
      url.searchParams.set('sound', `${track.id}`);

      return url;
    };

    const shareable = () => {
      if (!track) return null;

      return JSON.stringify({
        colorA,
        colorB,
        background,
        initialTheme,
        pattern: patternIndex,
        count,
        effects,
        artworkBg,
        blurBg,
        sound: track.id,
      });
    };

    return { preview, shareable };
  },

  // Create a shareable link (minified with a reference to Google Spreadsheet)
  createShareableLink: async (track) => {
    const { getLink, connected } = get();
    if (!connected) return;
    const link = getLink(track).shareable();

    if (!link)
      return {
        data: null,
        error: true,
        message: 'you need to choose a song first',
      };

    const notif = toast.loading('creating link...');
    const res = await callBackendFunction('createLink', [link, get().address]);

    if (res.success) {
      toast.update(notif, {
        render: 'link created!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      const linkNotif = toast.info(
        <div>
          <em>{res.data}</em>
          <br />
          <br />
          <a
            onClick={() => {
              navigator.clipboard.writeText(res?.data);
              toast.update(linkNotif, {
                render: 'copied to clipboard',
                type: 'success',
                isLoading: false,
                autoClose: 3000,
              });
            }}>
            Copy
          </a>
        </div>,
        {
          autoClose: false,
        },
      );
    } else if (res.error !== 'rejected transaction') {
      toast.update(notif, {
        render: 'error creating link',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
      console.error(res.error);
    } else {
      toast.dismiss(notif);
    }

    return res;
  },

  // Create a preview link (no need to write to Google Spreadsheet)
  createPreviewLink: (track) => {
    const { getLink } = get();
    const link = getLink(track).preview();

    if (!link)
      return {
        data: null,
        error: true,
        message: 'you need to choose a song first',
      };

    return { data: link, error: false, message: 'success' };
  },

  // Retrieve the link from the ID
  retrieveLink: async (id) =>
    await (
      await callBackendFunction('getShortenedUrl', [id])
    ).data,
  // Retrieve all links for a given address
  retrieveLinksForUser: async () => {
    const { connected, address } = get();
    if (!connected) return [];

    const links = await callBackendFunction('getShortenedUrlsForAddress', [
      address,
    ]);
    if (!links.success) {
      console.error(links.error);
      return [];
    }

    return links.data;
  },
}));
