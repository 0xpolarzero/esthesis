import { useEffect, useState } from 'react';
import { AutoComplete, Input, Skeleton, Tooltip } from 'antd';
import stores from '@/stores';
import hooks from '@/hooks';

const { Search: SearchBar } = Input;

const Search = () => {
  const {
    tracks,
    onSearchTrack,
    unpaginatedTracks,
    loadingTracks,
    errorTracks,
    errorAllTracks,
    setIsSearching,
  } = stores.useSpinamp((state) => ({
    tracks: state.tracks,
    onSearchTrack: state.onSearchTrack,
    unpaginatedTracks: state.unpaginatedTracks,
    loadingTracks: state.loadingTracks,
    errorTracks: state.errorTracks,
    errorAllTracks: state.errorAllTracks,
    setIsSearching: state.setIsSearching,
  }));
  const { isMobile } = hooks.useWindowSize();
  const [options, setOptions] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  // useEffect(() => {
  //   if (!unpaginatedTracks) return;

  //   let list = { titles: [], artists: [], platforms: [] };
  //   unpaginatedTracks.map((track) => {
  //     const { title, artist, id, platformId } = track;
  //     list.titles.push({ value: title, key: `${id}-title` });

  //     if (!list.artists.find((a) => a.value === artist.name)) {
  //       list.artists.push({ value: artist.name, key: artist.id });
  //     }

  //     if (!list.platforms.find((p) => p.value === platformId)) {
  //       list.platforms.push({ value: platformId, key: platformId });
  //     }
  //   });

  //   // Format
  //   const options = list.titles
  //     .map((title) => ({
  //       value: title.value,
  //       key: title.key,
  //       label: (
  //         <span
  //           className={`option-label title ${isMobile ? 'mobile' : 'desktop'}`}>
  //           {title.value}
  //         </span>
  //       ),
  //     }))
  //     .concat(
  //       list.artists.map((artist) => ({
  //         value: artist.value,
  //         key: artist.key,
  //         label: (
  //           <span
  //             className={`option-label artist ${
  //               isMobile ? 'mobile' : 'desktop'
  //             }`}>
  //             {artist.value}
  //           </span>
  //         ),
  //       })),
  //     )
  //     .concat(
  //       list.platforms.map((platform) => ({
  //         value: platform.value,
  //         key: platform.key,
  //         label: (
  //           <span
  //             className={`option-label platform ${
  //               isMobile ? 'mobile' : 'desktop'
  //             }`}>
  //             {platform.value}
  //           </span>
  //         ),
  //       })),
  //     );

  //   setOptions(options);
  // }, [unpaginatedTracks]);

  useEffect(() => {
    if (searchValue.length < 3) {
      setIsSearching(null);
    } else {
      setIsSearching(searchValue);
    }
  }, [searchValue]);

  if (errorAllTracks && !errorTracks)
    return (
      <div className='search'>
        Error loading all tracks. Search not available, try to reload the page.
      </div>
    );

  // if (loadingAllTracks)
  //   return (
  //     <div className='search'>
  //       <Skeleton.Input
  //         style={{ width: isMobile ? '90%' : '100%' }}
  //         size='small'
  //         active
  //       />
  //     </div>
  //   );

  return (
    <>
      <div className='search'>
        {searchValue.length !== 0 && searchValue.length < 3 ? (
          <span className='status'>
            enter at least 3 characters{isMobile ? '' : ' to search'}
          </span>
        ) : null}
        <AutoComplete
          // options={options}
          style={{
            width: isMobile ? '90%' : '100%',
          }}
          onSearch={onSearchTrack}
          onSelect={onSearchTrack}
          filterOption={(inputValue, option) =>
            option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
          }>
          <SearchBar
            size='medium'
            placeholder='search a track or artist'
            allowClear
            onSearch={onSearchTrack}
            onChange={(e) => setSearchValue(e.target.value)}
            status={
              searchValue.length !== 0 && searchValue.length < 3
                ? 'warning'
                : 'success'
            }
          />
        </AutoComplete>
      </div>
      {isMobile ? <span className='separator horizontal' /> : null}
    </>
  );
};

export default Search;
