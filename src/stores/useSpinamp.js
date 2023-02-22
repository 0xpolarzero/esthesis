import { fetchAllTracks } from '@spinamp/spinamp-sdk';
import { create } from 'zustand';

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
  search: '',
  setSearch: (search) => set({ search }),
  unpaginatedTracks: [],
  loadingAllTracks: true,
  errorAllTracks: false,

  /**
   * @notice Fetch paginated tracks
   */
  fetchTracks: async () => {
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
    const unpaginatedTracks = Object.values(oldPages).reduce(
      (acc, page) => [...acc, ...page.items],
      [],
    );

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
  onSearchTrack: async () => {
    const { search, unpaginatedTracks } = get();
  },
}));
