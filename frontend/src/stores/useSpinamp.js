import {
  fetchAllPlatforms,
  fetchAllTracks,
  fetchArtistBySlug,
  fetchTrackById,
  fetchTrackBySlug,
  fetchTracksByIds,
} from '@spinamp/spinamp-sdk';
import { matchSorter } from 'match-sorter';
import { create } from 'zustand';
import useAudio from './useAudio';
import useInteract from './useInteract';

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

  // Platforms
  platforms: [],

  // Modal
  modalContent: null,
  setModalContent: (value) => set({ modalContent: value }),

  /**
   * @notice Fetch paginated tracks
   */
  fetchTracks: async (pageReq = 0) => {
    const { rememberTracks, updatePlatformId } = get();
    set({ loadingTracks: true, tracks: {} });
    // Was this page already fetched?
    if (rememberTracks[pageReq]) {
      set({ tracks: rememberTracks[pageReq], page: pageReq });
      updatePlatformId();
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

    updatePlatformId();
  },

  /**
   * @notice Fetch all tracks in the background to prepare for search and navigation
   */
  fetchRemainingTracks: async () => {
    // Fetch tracks by batch of 1000
    let allTracks = [];
    let hasNextPage = true;
    let offset = 100; // first 100 tracks are already fetched
    let totalCount = 0;

    while (hasNextPage) {
      const res = await fetchAllTracks({
        first: 1000,
        offset,
      }).catch((err) => {
        console.log('err', err);
        set({ errorAllTracks: true });
      });

      allTracks.push(...res.items);
      hasNextPage = res.pageInfo.hasNextPage;
      offset += 1000;
      if (!totalCount) totalCount = res.totalCount;
    }

    // Create pages of 100 tracks with pagination info
    const pagesAmount = Math.ceil(allTracks.length / 100);
    const pages = [];
    for (let i = 0; i < pagesAmount; i++) {
      pages.push({
        items: allTracks.slice(i * 100, (i + 1) * 100),
        pageInfo: {
          hasNextPage: i < pagesAmount - 1,
          hasPreviousPage: true, // i > 0 but here there is always page 0
        },
        totalCount,
      });
    }

    pages.forEach((page, i) => {
      set({
        rememberTracks: { ...get().rememberTracks, [i + 1]: page },
      });
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
   * @notice Update platformId on all tracks with the appropriate name
   */
  updatePlatformId: async () => {
    const { platforms, tracks } = get();
    const platformsLocal = platforms.length
      ? platforms
      : await fetchAllPlatforms();

    const updatedTracks = tracks.items.map((track) => {
      const platform = platformsLocal.find(
        (platform) => platform.id === track.platformId,
      );

      const updatedProfiles = Object.values(track.artist.profiles).map(
        (profile) => {
          const platform = platformsLocal.find(
            (platform) => platform.id === profile.platformId,
          );

          return { ...profile, platformId: platform.name };
        },
      );

      return {
        ...track,
        platformId: platform.name,
        artist: { ...track.artist, profiles: updatedProfiles },
      };
    });

    set({
      platforms: platformsLocal,
      tracks: { ...tracks, items: updatedTracks },
    });

    // const updatedTracks = unpaginatedTracks.map((track) => {
    //   const platform = platforms.find(
    //     (platform) => platform.id === track.platformId,
    //   );
    //   return { ...track, platformId: platform.name };
    // });

    // // Do the same for pages
    // const updatedPages = Object.values(rememberTracks).map((page) => ({
    //   ...page,
    //   items: page.items.map((track) => {
    //     const platform = platforms.find(
    //       (platform) => platform.id === track.platformId,
    //     );
    //     return { ...track, platformId: platform.name };
    //   }),
    // }));

    // set({
    //   unpaginatedTracks: updatedTracks,
    //   rememberTracks: updatedPages,
    //   tracks: updatedPages[page],
    // });
  },

  /**
   * @notice Fetch tracks by search
   * @dev Will fetch all tracks to be able to filter them
   * On first search, it will take some time to fetch all tracks,
   * then set all tracks so nothing will need to be fetched again even in paginated results
   */
  onSearchTrack: async (value) => {
    const { unpaginatedTracks, rememberTracks, page, updatePlatformId } = get();
    // If there is no search, display recent tracks
    if (!value || value.length < 3) {
      set({ tracks: rememberTracks[page] });
      return;
    }
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
      loadingTracks: false,
    });

    updatePlatformId();
  },

  /**
   * @notice Filter tracks by artist or platform
   */
  filterBy: async (type, value) => {
    const { unpaginatedTracks } = get();
    const { favorites } = useInteract.getState();

    let filtered;
    if (type === 'artist') {
      filtered = unpaginatedTracks.filter(
        (track) => track.artist.name === value,
      );
    } else if (type === 'platform') {
      filtered = unpaginatedTracks.filter(
        (track) => track.platformId === value,
      );
    } else if (type === 'favorites') {
      filtered = unpaginatedTracks.filter((track) =>
        favorites.includes(track.id),
      );
    }

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
    set({
      tracks: pages[pageReq],
      page: pageReq,
    });
  },

  /**
   * @notice Retrieve multiple tracks informations by ids
   * @param {array} trackIds
   * @returns {array} tracks
   */
  retrieveMultipleTracks: async (trackIds) => {
    const { loadingAllTracks, errorAllTracks, unpaginatedTracks } = get();

    if (loadingAllTracks || errorAllTracks) {
      return await fetchTracksByIds(trackIds);
    } else {
      return trackIds.map((id) =>
        unpaginatedTracks.find((track) => track.id === id),
      );
    }
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
