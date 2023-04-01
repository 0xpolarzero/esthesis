import { useEffect, useState } from 'react';
import { AutoComplete, Input, Skeleton, Tooltip } from 'antd';
import stores from '@/stores';
import hooks from '@/hooks';

const { Search: SearchBar } = Input;

const Search = () => {
  const { onSearchTrack, setIsSearching } = stores.useSpinamp((state) => ({
    onSearchTrack: state.onSearchTrack,
    setIsSearching: state.setIsSearching,
  }));
  const { isMobile } = hooks.useWindowSize();
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (searchValue.length < 3) {
      setIsSearching(null);
    } else {
      setIsSearching(searchValue);
    }
  }, [searchValue]);

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
