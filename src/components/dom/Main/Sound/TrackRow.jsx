import Image from 'next/image';
import { Dropdown, Tooltip } from 'antd';
import {
  AiFillHeart,
  AiOutlineFilter,
  AiOutlineHeart,
  AiOutlineInfoCircle,
} from 'react-icons/ai';
import { CiCircleMore } from 'react-icons/ci';
import { RiExternalLinkLine, RiPlayFill } from 'react-icons/ri';
import { RxDisc, RxPerson, RxRocket, RxTimer } from 'react-icons/rx';
import ElapsedTime from '../../Utils/ElapsedTime';
import stores from '@/stores';
import hooks from '@/hooks';

const TrackRow = ({ track, onClick, setModalContent }) => {
  const playing = stores.useAudio((state) => state.playing);
  const { filterBy, loadingAllTracks } = stores.useSpinamp((state) => ({
    filterBy: state.filterBy,
    loadingAllTracks: state.loadingAllTracks,
  }));
  const { connected, isFavorite, toggleFavorite } = stores.useInteract(
    (state) => ({
      connected: state.connected,
      isFavorite: state.isFavorite,
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
          <AiOutlineInfoCircle size={20} />
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
          open in {track.platformId}
        </a>
      ),
      icon: <RiExternalLinkLine size={20} />,
      mobile: (
        <a href={track.websiteUrl} target='_blank' rel='noreferrer'>
          <RiExternalLinkLine size={20} />
        </a>
      ),
      large: (
        <Tooltip title={`open in ${track.platformId}`}>
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
      label: (
        <Tooltip
          title={
            connected
              ? null
              : 'you need to be connected to perform this action.'
          }>
          {isFavorite(track.id) ? 'remove from favorites' : 'add to favorites'}
        </Tooltip>
      ),
      icon: isFavorite(track.id) ? (
        <AiFillHeart size={20} />
      ) : (
        <AiOutlineHeart size={20} />
      ),
      mobile: isFavorite(track.id) ? (
        <AiFillHeart size={20} />
      ) : (
        <AiOutlineHeart size={20} />
      ),
      large: (
        <Tooltip
          title={
            connected ? 'add to favorites' : 'you need to connect to interact'
          }>
          <AiOutlineHeart className={connected ? '' : 'disabled'} size={20} />
        </Tooltip>
      ),
      onClick: () => toggleFavorite(track.id),
      disabled: !connected,
    },
  ];

  const artistDropdown = [
    {
      key: '1',
      label: (
        <a
          onClick={(e) => {
            e.stopPropagation();
            if (loadingAllTracks) return;
            filterBy('artist', track.artist.name);
          }}
          className={loadingAllTracks ? 'disabled' : ''}>
          tracks by {track.artist.name}
        </a>
      ),
      icon: <AiOutlineFilter size={20} />,
      disabled: loadingAllTracks,
    },
    {
      key: '2',
      type: 'group',
      label: `open profile on`,
      icon: <AiOutlineInfoCircle size={20} />,
      children: Object.keys(track.artist.profiles).map((profile) => ({
        key: track.artist.profiles[profile].platformId,
        label: (
          <a
            href={track.artist.profiles[profile].websiteUrl}
            target='_blank'
            rel='noreferrer'>
            {track.artist.profiles[profile].platformId}
          </a>
        ),
        icon: <RiExternalLinkLine size={20} />,
      })),
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
            <button className='button-primary small'>
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
        <a
          className='with-icon'
          onClick={(e) => {
            e.stopPropagation();
            if (loadingAllTracks) return;
            filterBy('platform', track.platformId);
          }}>
          {/* RxDashboard, RxGlobe, RxLayers */}
          {isMobile ? <RxRocket size={20} /> : null}
          {track.platformId.length > 20 ? (
            <Tooltip title={track.platformId} arrow={false}>
              {track.platformId.substring(0, 6)}...
              {track.platformId.substring(track.platformId.length - 4)}
            </Tooltip>
          ) : (
            track.platformId
          )}
        </a>
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
                  ? 'You need to be connected to perform this action'
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
            {infoDropdown.map((item, index) => item.large)}
          </div>
        ) : (
          <Dropdown menu={{ items: infoDropdown }} placement='bottomLeft'>
            <CiCircleMore size={20} />
          </Dropdown>
        )}
      </div>
    </>
  );
};

export default TrackRow;
