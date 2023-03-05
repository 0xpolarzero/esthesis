import { fetchAllTracks, fetchTrackById } from '@spinamp/spinamp-sdk';
import { matchSorter } from 'match-sorter';
import { create } from 'zustand';
import useAudio from './useAudio';

export default create((set, get) => ({
  // Tracks
  tracks: {},
  rememberTracks: {},
  totalCount: 0,
  loadingTracks: true,
  errorTracks: false,

  // Pagination
  page: 0,
  hasNextPage: () => get().rememberTracks[get().page].pageInfo.hasNextPage,
  hasPreviousPage: () =>
    get().rememberTracks[get().page].pageInfo.hasPreviousPage,

  // Search
  isSearching: null,
  setIsSearching: (value) => set({ isSearching: value }),
  unpaginatedTracks: [],
  loadingAllTracks: true,
  errorAllTracks: false,
  filteredBy: null,

  /**
   * @notice Fetch paginated tracks
   */
  fetchTracks: async (pageReq = 0) => {
    const { rememberTracks } = get();
    // Was this page already fetched?
    if (rememberTracks[pageReq]) {
      set({ tracks: rememberTracks[pageReq], page: pageReq });
      return;
    }

    // Fetch tracks
    set({ loadingTracks: true });
    const res = await fetchAllTracks({
      first: 100,
      offset: pageReq * 100,
    }).catch((err) => {
      console.log('err', err);
      set({ errorTracks: true });
    });

    set({
      tracks: res,
      rememberTracks: { ...rememberTracks, [pageReq]: res },
      totalCount: res.totalCount,
      loadingTracks: false,
    });
  },

  /**
   * @notice Fetch all tracks in the background to prepare for search and navigation
   */
  fetchRemainingTracks: async () => {
    // let latest = { pageInfo: { hasNextPage: true } };
    // let i = 1;
    // while (latest.pageInfo.hasNextPage) {
    //   const res = await fetchAllTracks({
    //     first: 100,
    //     offset: i * 100,
    //   }).catch((err) => {
    //     console.log('err', err);
    //     set({ errorAllTracks: true });
    //   });
    //   console.log(i, res);

    //   set({
    //     rememberTracks: { ...get().rememberTracks, [i]: res },
    //   });
    //   latest = res;
    //   i++;
    // }

    // Or fetch all tracks in one request and then paginate them
    const res = await fetchAllTracks().catch((err) => {
      console.log('err', err);
      set({ errorAllTracks: true });
    });

    // Create pages of 100 tracks with pagination info
    const pagesAmount = Math.ceil(res.items.length / 100);
    const pages = [];
    for (let i = 0; i < pagesAmount; i++) {
      pages.push({
        items: res.items.slice(i * 100, (i + 1) * 100),
        pageInfo: {
          hasNextPage: i < pagesAmount - 1,
          hasPreviousPage: i > 0,
        },
        totalCount: res.totalCount,
      });
    }

    set({
      rememberTracks: pages,
    });

    // Set all tracks in one array for search
    const unpaginatedTracks = Object.values(get().rememberTracks)
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
    const { unpaginatedTracks, tracks, rememberTracks, page } = get();
    // If there is no search, display recent tracks
    if (!value || value.length < 3) {
      set({ tracks: rememberTracks[page] });
      return;
    }

    // const filtered = unpaginatedTracks.filter(
    //   (track) =>
    //     track.title.toLowerCase().includes(value.toLowerCase()) ||
    //     track.artist.name.toLowerCase().includes(value.toLowerCase()),
    // );
    // Sort by most accurate match
    const sorted = matchSorter(unpaginatedTracks, value, {
      keys: ['title', 'artist.name', 'platformId'],
    }).slice(0, 100);

    // Set tracks & remember them
    set({
      tracks: {
        items: sorted,
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
      },
      filteredBy: null,
    });
  },

  /**
   * @notice Filter tracks by artist or platform
   */
  filterBy: async (type, value) => {
    const { unpaginatedTracks } = get();

    const filtered =
      type === 'artist'
        ? unpaginatedTracks.filter((track) => track.artist.name === value)
        : unpaginatedTracks.filter((track) => track.platformId === value);

    // Create pages of 100 tracks with pagination info
    const pagesAmount = Math.ceil(filtered.length / 100);
    const pages = [];
    for (let i = 0; i < pagesAmount; i++) {
      pages.push({
        items: filtered.slice(i * 100, (i + 1) * 100),
        pageInfo: {
          hasNextPage: i < pagesAmount - 1,
          hasPreviousPage: i > 0,
        },
        totalCount: filtered.length,
      });
    }

    // Set tracks & remember them
    set({
      tracks: pages[0],
      page: 0,
      totalCount: filtered.length,
      filteredBy: {
        type,
        value,
        pages,
      },
    });
  },

  /**
   * @notice Filter back to all tracks
   */
  filterAll: async () => {
    const { rememberTracks, page } = get();
    set({
      tracks: rememberTracks[page],
      filteredBy: null,
      totalCount: rememberTracks[page].totalCount,
      page: 0,
    });
  },

  navigatePage: async (direction = null) => {
    const { filteredBy, page, fetchTracks } = get();

    const pageReq = direction
      ? direction === 'next'
        ? page + 1
        : page - 1
      : 0;

    // If there is no filter, fetch prev/next page
    if (!filteredBy) {
      fetchTracks(pageReq);
      set({ page: pageReq });
      return;
    }

    // If there is a filter, navigate through filtered pages
    const { pages } = filteredBy;
    console.log(pages);

    set({
      tracks: pages[pageReq],
      page: pageReq,
    });
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
