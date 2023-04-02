import Image from 'next/image';
import { Dropdown, Tooltip } from 'antd';
import { AiOutlineFilter, AiOutlineInfoCircle } from 'react-icons/ai';
import { CiCircleMore } from 'react-icons/ci';
import { RiExternalLinkLine, RiPlayFill, RiPlayListLine } from 'react-icons/ri';
import { RxDisc, RxPerson, RxRocket, RxTimer } from 'react-icons/rx';
import ElapsedTime from '../../Utils/ElapsedTime';
import stores from '@/stores';
import hooks from '@/hooks';
import { FavoritesIcon, FavoritesLabel } from './Favorites';
import { getPlatformName } from '@/systems/utils';

const TrackRow = ({ track, onClick, setModalContent }) => {
  const { playing, start } = stores.useAudio((state) => ({
    playing: state.playing,
    start: state.start,
  }));
  const { filterBy, platforms, getPlaylistsMenu } = stores.useSpinamp(
    (state) => ({
      filterBy: state.filterBy,
      platforms: state.platforms,
      getPlaylistsMenu: state.getPlaylistsMenu,
    }),
  );
  const { isAllowed, favoritesLoaded, toggleFavorite } = stores.useInteract(
    (state) => ({
      isAllowed: state.isAllowed,
      favoritesLoaded: state.favoritesLoaded,
      toggleFavorite: state.toggleFavorite,
    }),
  );
  const { isMobile, isWideScreen } = hooks.useWindowSize();

  const infoDropdown = [
    {
      key: '1',
      label: 'more info',
      icon: <AiOutlineInfoCircle size={20} />,
      mobile: (
        <span className='with-icon'>
          <AiOutlineInfoCircle size={20} /> more
        </span>
      ),
      large: (
        <Tooltip title='more info'>
          <AiOutlineInfoCircle
            size={20}
            onClick={() => setModalContent(track)}
          />
        </Tooltip>
      ),
      onClick: () => setModalContent(track),
      disabled: false,
    },
    {
      key: '2',
      label: (
        <a
          href={track.websiteUrl}
          target='_blank'
          rel='noreferrer'
          style={{ opacity: 1 }}>
          open in {getPlatformName(track)}
        </a>
      ),
      icon: <RiExternalLinkLine size={20} />,
      mobile: (
        <a href={track.websiteUrl} target='_blank' rel='noreferrer'>
          <RiExternalLinkLine size={20} />
        </a>
      ),
      large: (
        <Tooltip title={`open in ${getPlatformName(track)}`}>
          <a href={track.websiteUrl} target='_blank' rel='noreferrer'>
            <RiExternalLinkLine size={20} />
          </a>
        </Tooltip>
      ),
      onClick: null,
      disabled: false,
    },
    {
      key: '3',
      label: <FavoritesLabel id={track.id} type='default' />,
      icon: <FavoritesIcon id={track.id} />,
      mobile: <FavoritesIcon id={track.id} />,
      large: (
        <FavoritesLabel
          id={track.id}
          type='extended'
          onClick={() => toggleFavorite(track.id)}
        />
      ),
      onClick: () => toggleFavorite(track.id),
      disabled: !isAllowed() || !favoritesLoaded,
    },
    {
      key: '4',
      label: (
        <Dropdown menu={{ items: getPlaylistsMenu(track.id) }}>
          <span>playlist</span>
        </Dropdown>
      ),
      icon: <RiPlayListLine size={20} />,
      mobile: (
        <Dropdown menu={{ items: getPlaylistsMenu(track.id) }}>
          <RiPlayListLine size={20} />
        </Dropdown>
      ),
      large: (
        <Tooltip title='playlist'>
          <Dropdown menu={{ items: getPlaylistsMenu(track.id) }}>
            <RiPlayListLine size={20} />
          </Dropdown>
        </Tooltip>
      ),
      onClick: null,
      disabled: !isAllowed(),
    },
  ];

  const artistDropdown = [
    {
      key: '1',
      label: (
        <a
          onClick={(e) => {
            e.stopPropagation();
            filterBy('artist', track.artist.name, track.artistId);
          }}
          /* className={loadingAllTracks ? 'disabled' : ''} */
        >
          tracks by {track.artist.name}
        </a>
      ),
      icon: <AiOutlineFilter size={20} />,
      // disabled: loadingAllTracks,
    },
    {
      key: '2',
      type: 'group',
      label: `open profile on`,
      icon: <AiOutlineInfoCircle size={20} />,
      children: Object.keys(track.artist.profiles).map((profile) => ({
        key: getPlatformName(track.artist.profiles[profile]),
        label: (
          <a
            href={track.artist.profiles[profile].websiteUrl}
            target='_blank'
            rel='noreferrer'>
            {getPlatformName(track.artist.profiles[profile])}
          </a>
        ),
        icon: <RiExternalLinkLine size={20} />,
      })),
    },
  ];

  const platformDropdown = [
    {
      key: '1',
      label: (
        <a
          onClick={(e) => {
            e.stopPropagation();
            filterBy(
              'platform',
              getPlatformName(track, platforms),
              track.platformId,
            );
          }}
          /* className={loadingAllTracks ? 'disabled' : ''} */
        >
          tracks on {getPlatformName(track)}
        </a>
      ),
      icon: <AiOutlineFilter size={20} />,
      // disabled: loadingAllTracks,
    },
    {
      key: '2',
      label: (
        <a href={track.websiteUrl} target='_blank' rel='noreferrer'>
          open in {getPlatformName(track)}
        </a>
      ),
      icon: <RiExternalLinkLine size={20} />,
      disabled: false,
    },
  ];

  return (
    <>
      <Tooltip
        title={
          isMobile ? null : (
            <Image
              src={track.lossyArtworkUrl}
              alt={`Album image for ${track.title} from ${track.artist.name}`}
              width={200}
              height={200}
              placeholder='blur'
              blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMyflfDwAFWwJQh9q4ZQAAAABJRU5ErkJggg=='
            />
          )
        }
        arrow={false}>
        <div
          className={`track-row__title ${
            playing?.data?.id === track.id ? 'active' : ''
          }`}
          onClick={onClick}>
          {isMobile ? <RxDisc size={20} /> : <RiPlayFill size={20} />}
          {track.title.length > 40 ? (
            <span>
              {track.title.substring(0, 40)}
              <span className='emphasize'>...</span>
            </span>
          ) : (
            track.title
          )}
          {isMobile ? (
            <button
              className='button-primary small'
              onClick={() => start(track)}>
              <RiPlayFill size={20} />
            </button>
          ) : null}
        </div>
      </Tooltip>
      <div className='track-row__artist'>
        <Dropdown menu={{ items: artistDropdown }}>
          <a className='with-icon' onClick={(e) => e.stopPropagation()}>
            {isMobile ? <RxPerson size={20} /> : null}
            {track.artist.name.length > 20
              ? `${track.artist.name.substring(
                  0,
                  6,
                )}...${track.artist.name.substring(
                  track.artist.name.length - 4,
                )}`
              : track.artist.name}
          </a>
        </Dropdown>
      </div>
      <div className='track-row__platform'>
        <Dropdown menu={{ items: platformDropdown }}>
          <a className='with-icon' onClick={(e) => e.stopPropagation()}>
            {/* RxDashboard, RxGlobe, RxLayers */}
            {isMobile ? <RxRocket size={20} /> : null}
            {getPlatformName(track).length > 20 ? (
              <Tooltip title={getPlatformName(track)} arrow={false}>
                {getPlatformName(track).substring(0, 6)}...
                {getPlatformName(track).substring(
                  getPlatformName(track).length - 4,
                )}
              </Tooltip>
            ) : (
              getPlatformName(track)
            )}
          </a>
        </Dropdown>
      </div>
      <div className='track-row__date'>
        <span className='with-icon'>
          {isMobile ? <RxTimer size={20} /> : null}
          <ElapsedTime time={new Date(track.createdAtTime)} />
        </span>
      </div>
      <div className='track-row__more interact-svg'>
        {isMobile ? (
          infoDropdown.map((item, index) => (
            <Tooltip
              key={index}
              title={
                item.disabled
                  ? 'You need to sign in & be in the allowlist to use this feature'
                  : null
              }>
              <a
                onClick={item.onClick}
                className={item.disabled ? 'disabled' : ''}>
                {item.mobile}
              </a>
            </Tooltip>
          ))
        ) : isWideScreen ? (
          <div className='with-icon'>
            {infoDropdown.map((item, index) => (
              <a key={index} onClick={item.onClick}>
                {item.large}
              </a>
            ))}
          </div>
        ) : (
          <Dropdown menu={{ items: infoDropdown }} placement='bottomLeft'>
            <CiCircleMore size={20} onClick={() => setModalContent(track)} />
          </Dropdown>
        )}
      </div>
    </>
  );
};

export default TrackRow;
