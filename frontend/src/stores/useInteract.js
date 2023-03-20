import { create } from 'zustand';
import { toast } from 'react-toastify';
import useAudio from './useAudio';
import useSwarm from './useSwarm';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  shortenUrl,
  getShortenedUrl,
  getAllShortenedUrls,
} from '@/systems/interact';
import config from '@/data';

const { shaders: OPTIONS_SHADERS } = config.options;

export default create((set, get) => ({
  // Connection status
  connected: false,
  setConnected: (connected) => set({ connected }),
  address: null,
  setAddress: (address) => set({ address }),
  isAllowlisted: () => config.allowlist.includes(get().address),

  // Favorites
  favorites: [],
  favoritesLoaded: false,
  isFavorite: (id) => get().favorites.includes(id),
  setFavorites: async (address) => {
    if (address) {
      const favorites = await getFavorites(address);
      set({ favorites, favoritesLoaded: true });
    } else {
      set({ favorites: [], favoritesLoaded: true });
    }
  },
  toggleFavorite: async (id) => {
    const { connected, address, isFavorite, favorites, isAllowlisted } = get();
    if (!connected) return;

    if (!isFavorite(id)) {
      // OR
      const notif = toast.loading('Adding to favorites...');
      const { success, error } = await addFavorite(
        address,
        id,
        isAllowlisted(),
      );
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
          render: 'Error adding to favorites',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        });
        console.error(error);
      }
    } else {
      const notif = toast.loading('Removing from favorites...');
      const { success, error } = await removeFavorite(
        address,
        id,
        isAllowlisted(),
      );
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
    const { colorA, colorB, background, pattern, count, effects } =
      useSwarm.getState();

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
      url.searchParams.set('pattern', `${patternIndex}`);
      url.searchParams.set('count', `${count}`);
      Object.keys(effects).forEach((key) => {
        url.searchParams.set(key, `${effects[key]}`);
      });
      url.searchParams.set('sound', `${track.id}`);

      return url;
    };

    const shareable = () => {
      if (!track) return null;

      return JSON.stringify({
        colorA,
        colorB,
        background,
        pattern: patternIndex,
        count,
        effects,
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

    // Call api to write to spreadsheet
    // const res = await fetch('/api/google-api', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     functionName: 'write',
    //     arg: link,
    //   }),
    // });

    // const data = await res.json();
    // if (data.statusCode === 500) return { data, error: true, message: 'error' };

    // const newLink = new URL(`${window.location.href}shared?id=${data}`);

    // return { data: newLink, error: false, message: 'success' };
    const notif = toast.loading('creating link...');
    const res = await shortenUrl(link);

    if (res?.success) {
      toast.update(notif, {
        render: 'link created!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      const linkNotif = toast.info(
        <div>
          <em>{res?.data}</em>
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
    } else if (res?.error !== 'rejected transaction') {
      toast.update(notif, {
        render: 'error creating link',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
      console.error(res?.error);
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
  retrieveLink: async (id) => await getShortenedUrl(id),
  // Retrieve all links for a given address
  retrieveLinksForUser: async () => {
    const { connected, address } = get();
    if (!connected) return [];

    const links = await getAllShortenedUrls();
    return links.filter(
      (link) => link.sender.toLowerCase() === address.toLowerCase(),
    );
  },
}));
