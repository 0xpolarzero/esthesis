import Image from 'next/image';
import { Dropdown, Tooltip } from 'antd';
import {
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
  const { isMobile } = hooks.useWindowSize();

  const infoDropdown = [
    {
      key: '1',
      label: 'more info',
      icon: <AiOutlineInfoCircle size={20} />,
      onClick: () => setModalContent(track),
      mobile: (
        <span className='with-icon'>
          <AiOutlineInfoCircle size={20} /> more
        </span>
      ),
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
    },
    {
      key: '3',
      label: 'add to favorites',
      icon: <AiOutlineHeart size={20} />,
      mobile: <AiOutlineHeart size={20} />,
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
            <>
              {track.title.substring(0, 40)}
              <span className='emphasize'>...</span>
            </>
          ) : (
            track.title
          )}
        </div>
      </Tooltip>
      <div className='track-row__artist'>
        <Dropdown menu={{ items: artistDropdown }}>
          <a className='with-icon'>
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
      <div className='track-row__more'>
        {isMobile ? (
          infoDropdown.map((item, index) => item.mobile)
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
