import config from '@/data';
import {
  fetchAllArtists,
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
  filteredBy: null,

  // Platforms
  platforms: [],
  fetchPlatforms: async () => set({ platforms: await fetchAllPlatforms() }),

  // Modal
  modalContent: null,
  setModalContent: (value) => set({ modalContent: value }),

  /**
   * @notice Fetch paginated tracks
   */
  fetchTracks: async (pageReq = 0) => {
    const { rememberTracks, afterTracksFetched } = get();
    set({ loadingTracks: true, tracks: {} });
    // Was this page already fetched?
    if (rememberTracks[pageReq]) {
      set({
        tracks: rememberTracks[pageReq],
        page: pageReq,
        loadingTracks: false,
      });
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

    afterTracksFetched();
  },

  /**
   * @notice Fetch tracks by search
   * @dev Will fetch all tracks with filters
   */
  onSearchTrack: async (value) => {
    const { rememberTracks, page, afterTracksFetched } = get();
    // If there is no search, display recent tracks
    if (!value || value.length < 3) {
      set({ tracks: rememberTracks[page] });
      return;
    }
    set({ loadingTracks: true });

    const searchTracks = await fetchAllTracks({
      filter: {
        or: [
          { title: { includesInsensitive: value } },
          { artistByArtistId: { name: { includesInsensitive: value } } },
        ],
      },
    });

    // Sort by most accurate match
    const sorted = matchSorter(
      searchTracks.items /* ...searchArtists.items */,
      value,
      { keys: ['title', 'artist.name'] },
    ).slice(0, 100);

    // Set tracks & remember them
    set({
      tracks: {
        items: sorted,
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
      },
      filteredBy: null,
      loadingTracks: false,
    });

    afterTracksFetched();
  },

  /**
   * @notice Filter tracks by artist or platform
   */
  filterBy: async (type, value, id) => {
    const { afterTracksFetched } = get();
    const { favorites } = useInteract.getState();
    set({ loadingTracks: true });

    let filtered;
    if (type === 'artist') {
      filtered = await fetchAllTracks({
        filter: { artistId: { equalToInsensitive: id } },
      });
    } else if (type === 'platform') {
      filtered = await fetchAllTracks({
        filter: { platformId: { equalTo: id } },
      });
    } else if (type === 'favorites') {
      filtered = favorites.length
        ? await fetchAllTracks({
            filter: { id: { in: favorites } },
          })
        : { items: [], totalCount: 0 };
    }

    // Create pages of 100 tracks with pagination info
    const pagesAmount = Math.ceil(filtered.totalCount / 100);
    const pages = [];
    for (let i = 0; i < pagesAmount; i++) {
      pages.push({
        items: filtered?.items.slice(i * 100, (i + 1) * 100),
        pageInfo: {
          hasNextPage: i < pagesAmount - 1,
          hasPreviousPage: i > 0,
        },
        totalCount: filtered.totalCount,
      });
    }

    // Set tracks & remember them
    set({
      tracks: pages[0],
      page: 0,
      totalCount: filtered.totalCount,
      filteredBy: {
        type,
        value,
        pages,
      },
      loadingTracks: false,
    });

    afterTracksFetched();
  },

  /**
   * @notice Filter back to all tracks
   */
  filterAll: async () => {
    const { rememberTracks, afterTracksFetched } = get();
    set({
      tracks: rememberTracks[0],
      filteredBy: null,
      totalCount: rememberTracks[0].totalCount,
      page: 0,
    });

    afterTracksFetched();
  },

  navigatePage: async (direction = null) => {
    const { filteredBy, page, fetchTracks, afterTracksFetched } = get();

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

    afterTracksFetched();
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
   * @notice Do any formatting/updates after retrieving & displaying tracks
   */
  afterTracksFetched: () => {
    const { tracks } = get();
    const referrals = config.referrals;

    // Update tracks with referral links if needed
    const updatedTracks = tracks.items.map((track) => {
      const referral = referrals.find(
        (referral) => referral.platform === track.platformId,
      );
      if (referral) {
        track.websiteUrl = referral.url(track.websiteUrl);
      }
      return track;
    });

    set({ tracks: { ...tracks, items: updatedTracks } });
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
