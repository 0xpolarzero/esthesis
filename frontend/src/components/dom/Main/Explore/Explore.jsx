import Search from './Search';
import Utils from '../../Utils';
import stores from '@/stores';
import hooks from '@/hooks';
import More from './More';
import Navigation from './Navigation';
import TrackRow from './TrackRow';

const { TableSkeleton } = Utils;

const Explore = () => {
  const { tracks, errorTracks, loadingTracks, setModalContent } =
    stores.useSpinamp((state) => ({
      tracks: state.tracks,
      errorTracks: state.errorTracks,
      loadingTracks: state.loadingTracks,
      setModalContent: state.setModalContent,
    }));
  const start = stores.useAudio((state) => state.start);
  const { isMobile, windowSize } = hooks.useWindowSize();

  return (
    <div className='explore'>
      <Search />

      <Navigation />

      {errorTracks ? (
        <div>
          There was an error loading tracks. Please try to reload the page.
        </div>
      ) : tracks?.items && !loadingTracks ? (
        tracks.items.map((track) =>
          // Render a card on mobile, a row on desktop
          isMobile ? (
            <>
              <div className='track-card' key={track.id}>
                <TrackRow track={track} setModalContent={setModalContent} />
              </div>
              {tracks.items.indexOf(track) !== tracks.items.length - 1 ? (
                <span className='separator horizontal' />
              ) : null}
            </>
          ) : (
            <TrackRow
              key={track.id}
              track={track}
              onClick={() => start(track)}
              setModalContent={setModalContent}
            />
          ),
        )
      ) : loadingTracks ? (
        isMobile ? (
          <TableSkeleton colCount={1} rowCount={10} noHeader={true} />
        ) : (
          <TableSkeleton
            colCount={4}
            rowCount={10}
            style={{ gridColumn: 'span 4' }}
            noHeader={true}
          />
        )
      ) : (
        'no tracks yet'
      )}
      <More />
    </div>
  );
};

export default Explore;
