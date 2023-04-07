import config from '@/data';
import {
  createPlaylist,
  fetchAllArtists,
  fetchAllPlatforms,
  fetchAllTracks,
  fetchArtistBySlug,
  fetchCollectorPlaylists,
  fetchPlaylistById,
  fetchTrackById,
  fetchTrackBySlug,
  fetchTracksByIds,
  updatePlaylist,
} from '@spinamp/spinamp-sdk';
import { fetchSigner } from '@wagmi/core';
import { matchSorter } from 'match-sorter';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { RiPlayListAddLine } from 'react-icons/ri';
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
    const { afterTracksFetched, playlists } = get();
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
    } else if (type === 'playlist') {
      const tracks = await fetchPlaylistById(id);
      console.log(tracks);
      filtered = {
        items: tracks.playlistTracks,
        totalCount: tracks.playlistTracks.length,
      };
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
  retrieveMultipleTracks: async (trackIds) => await fetchTracksByIds(trackIds),

  /// Playlists
  playlists: [],
  playlistsLoaded: false,
  inPlaylist: (trackId, playlistId) => {
    const { playlists } = get();
    const playlist = playlists.find((p) => p.id === playlistId);
    return playlist.trackIds.includes(trackId);
  },
  newPlaylistModalStatus: { open: false, trackId: null },
  setNewPlaylistModalStatus: (open, trackId) =>
    set({ newPlaylistModalStatus: { open, trackId } }),

  initPlaylists: async () => {
    const { address } = useInteract.getState();

    if (address) {
      const playlists = await fetchCollectorPlaylists(address);
      set({ playlists, playlistsLoaded: true });
    } else {
      set({ playlists: [], playlistsLoaded: true });
    }
  },
  resetPlaylists: () => set({ playlists: [] }),

  /**
   * @notice Create a new playlist
   */
  createPlaylist: async (title) => {
    const { newPlaylistModalStatus } = get();

    try {
      const signer = await fetchSigner();

      const playlist = {
        title,
        trackIds: newPlaylistModalStatus.trackId
          ? [newPlaylistModalStatus.trackId]
          : [],
      };
      const { id } = await createPlaylist(playlist, signer);

      if (id) {
        set((state) => ({
          playlists: [...state.playlists, { id, title }],
        }));

        return true;
      }

      return false;
    } catch (err) {
      console.error('err', err);
      return false;
    }
  },

  /**
   * @notice Interact with a playlist (add/remove track)
   */
  interactPlaylist: async (playlist, trackId) => {
    const { playlists } = get();
    let updatedPlaylist = {};
    console.log(playlist);

    try {
      const signer = await fetchSigner();

      if (playlist.trackIds.find((t) => t === trackId)) {
        const newPlaylist = {
          id: playlist.id,
          title: playlist.title,
          trackIds: playlist.trackIds.filter((t) => t !== trackId),
        };
        // Remove track from playlist
        updatedPlaylist = await updatePlaylist(
          playlist.id,
          newPlaylist,
          signer,
        );
      } else {
        const newPlaylist = {
          // id: playlist.id,
          // title: playlist.title,
          ...playlist,
          trackIds: [...playlist.trackIds, trackId],
        };
        console.log(playlist.id, newPlaylist, signer);
        // Add track to playlist
        updatedPlaylist = await updatePlaylist(
          playlist.id,
          newPlaylist,
          signer,
        );
      }

      if (updatedPlaylist) {
        const newPlaylists = playlists.map((p) =>
          p.id === updatedPlaylist.id ? updatedPlaylist : p,
        );
        set({ playlists: newPlaylists });
      }
    } catch (err) {
      console.error('err', err);
    }
  },

  /**
   * @notice Get playlists menu items
   */
  getPlaylistsMenu: (trackId = null) => {
    const {
      playlists,
      setNewPlaylistModalStatus,
      filterBy,
      interactPlaylist,
      inPlaylist,
    } = get();

    const baseItems = [
      {
        key: 'create',
        label: 'new playlist',
        icon: <AiOutlinePlus size={20} />,
        onClick: (e) => setNewPlaylistModalStatus(true, trackId),
      },
    ];
    const playlistItems = playlists.map((playlist) => ({
      key: playlist.id,
      label: playlist.title,
      onClick: () =>
        trackId
          ? interactPlaylist(playlist, trackId)
          : filterBy('playlist', playlist.title, playlist.id),
      icon: trackId ? (
        inPlaylist(trackId, playlist.id) ? (
          <AiOutlineMinus size={20} />
        ) : (
          <AiOutlinePlus size={20} />
        )
      ) : null,
    }));

    if (playlistItems.length) return [...baseItems, ...playlistItems];
    return baseItems;
  },

  /**
   * @notice Do any formatting/updates after retrieving & displaying tracks
   */
  afterTracksFetched: () => {
    const { tracks } = get();
    if (!tracks?.items.length) return;
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
