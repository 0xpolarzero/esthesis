import { fetchAllTracks, fetchTrackById } from '@spinamp/spinamp-sdk';
import { matchSorter } from 'match-sorter';
import { create } from 'zustand';
import useAudio from './useAudio';

export default create((set, get) => ({
  // Tracks
  tracks: [],
  setTracks: (tracks) => set({ tracks }),
  loadingTracks: true,
  errorTracks: false,

  // Pagination
  page: 0,
  oldPages: {},
  setPage: (page) => set({ page }),
  hasNextPage: () => get().tracks.pageInfo.hasNextPage,
  hasPreviousPage: () => get().tracks.pageInfo.hasPreviousPage,

  // Search
  unpaginatedTracks: [],
  loadingAllTracks: true,
  errorAllTracks: false,
  filteredByArtist: null,

  /**
   * @notice Fetch paginated tracks
   */
  fetchTracks: async (pageReq) => {
    const { page, oldPages } = get();

    // Was this page already fetched?
    if (oldPages[page]) {
      set({ tracks: oldPages[page] });
      return;
    }

    // Fetch tracks
    set({ loadingTracks: true });
    const tracks = await fetchAllTracks({
      first: 100,
      offset: page * 100,
    }).catch((err) => {
      console.log('err', err);
      set({ errorTracks: true });
    });

    // Set tracks & remember them
    set({
      tracks,
      oldPages: { ...oldPages, [page]: tracks },
      loadingTracks: false,
    });
  },

  /**
   * @notice Fetch all tracks in the background to prepare for search
   */
  fetchRemainingTracks: async () => {
    const { oldPages } = get();

    const allTracks = await fetchAllTracks().catch((err) => {
      console.log('err', err);
      set({ errorAllTracks: true });
    });

    // Set tracks & remember them
    const pagesAmount = Math.ceil(allTracks.totalCount / 100);

    // Set up pages with 100 tracks each so it won't need to be fetched again
    for (let i = 0; i < pagesAmount; i++) {
      oldPages[i] = {
        items: allTracks.items.slice(i * 100, (i + 1) * 100),
        pageInfo: {
          hasNextPage: i < pagesAmount - 1,
          hasPreviousPage: i > 0,
        },
      };
    }

    // Set all tracks in one array for search
    const unpaginatedTracks = Object.values(oldPages)
      .reduce((acc, page) => [...acc, ...page.items], [])
      .sort((a, b) => b.createdAt - a.createdAt);

    set({
      loadingAllTracks: false,
      unpaginatedTracks,
    });
  },

  /**
   * @notice Fetch tracks by search
   * @dev Will fetch all tracks to be able to filter them
   * On first search, it will take some time to fetch all tracks,
   * then set all tracks so nothing will need to be fetched again even in paginated results
   */
  onSearchTrack: async (value) => {
    const { unpaginatedTracks, oldPages } = get();
    // If there is no search, display recent tracks
    if (!value || value.length < 3) {
      set({ tracks: oldPages[0] });
      return;
    }

    // const filtered = unpaginatedTracks.filter(
    //   (track) =>
    //     track.title.toLowerCase().includes(value.toLowerCase()) ||
    //     track.artist.name.toLowerCase().includes(value.toLowerCase()),
    // );
    // Sort by most accurate match
    const sorted = matchSorter(unpaginatedTracks, value, {
      keys: ['title', 'artist.name'],
    }).slice(0, 100);

    // Set tracks & remember them
    set({ tracks: { items: sorted }, filteredByArtist: null });
  },

  /**
   * @notice Filter tracks by artist
   */
  filterByArtist: async (artistName) => {
    const { unpaginatedTracks } = get();
    const filtered = unpaginatedTracks.filter(
      (track) => track.artist.name === artistName,
    );

    set({ tracks: { items: filtered }, filteredByArtist: artistName });
  },

  /**
   * @notice Filter back to all tracks
   */
  filterAll: async () => {
    const { oldPages } = get();
    set({ tracks: oldPages[0], filteredByArtist: null });
  },

  /**
   * @notice Init sound based on track id
   */
  initSound: async (trackId) => {
    const { start } = useAudio.getState();
    try {
      const track = await fetchTrackById(trackId);
      start(track, true /* meaning don't try to init the audio context yet */);
      return true;
    } catch (err) {
      console.log('err', err);
      return false;
    }
  },
}));
