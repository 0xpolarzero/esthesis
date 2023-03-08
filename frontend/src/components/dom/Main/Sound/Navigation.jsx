import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import stores from '@/stores';

const Navigation = () => {
  const {
    tracks,
    errorTracks,
    page,
    navigatePage,
    totalCount,
    filterAll,
    filteredBy,
    isSearching,
  } = stores.useSpinamp((state) => ({
    tracks: state.tracks,
    errorTracks: state.errorTracks,
    page: state.page,
    navigatePage: state.navigatePage,
    totalCount: state.totalCount,
    filterAll: state.filterAll,
    filteredBy: state.filteredBy,
    isSearching: state.isSearching,
  }));

  if (errorTracks) return null;

  return (
    <>
      {isSearching ? (
        <div className='filter'>
          {tracks.items.length === 100 ? (
            <span>
              showing 100 most accurate results for{' '}
              <span className='emphasize'>{isSearching}</span> ; try to be more
              specific to get better results.
            </span>
          ) : (
            <span>
              showing all results for{' '}
              <span className='emphasize'>{isSearching}</span>
            </span>
          )}
        </div>
      ) : filteredBy ? (
        <div className='filter'>
          <span>
            showing tracks {filteredBy.type === 'artist' ? 'from' : 'on'}{' '}
            <span className='emphasize'>{filteredBy.value}</span>
          </span>
          <button className='button-primary' onClick={filterAll}>
            Clear
          </button>
        </div>
      ) : (
        <div className='filter'>showing most recent tracks</div>
      )}

      {tracks ? (
        <div className='filter' style={{ marginBottom: '1rem' }}>
          <span style={{ opacity: 0.7 }}>
            {isSearching
              ? tracks.items.length === 100
                ? 'more than 100 results'
                : `${tracks.items.length} results`
              : `${page * 100 + 1}-${page * 100 + 100} of ${
                  totalCount || '...'
                } results`}
          </span>
          <div className='navigation'>
            <button
              className='button-primary'
              onClick={() => navigatePage('prev')}
              disabled={!tracks.pageInfo?.hasPreviousPage}>
              <AiOutlineLeft size={20} />
            </button>
            <button
              className='button-primary'
              onClick={() => navigatePage('next')}
              disabled={!tracks.pageInfo?.hasNextPage}>
              <AiOutlineRight size={20} />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Navigation;
