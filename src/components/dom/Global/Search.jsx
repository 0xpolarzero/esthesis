import { useEffect, useState } from 'react';
import { AutoComplete, Input } from 'antd';
import stores from '@/stores';
import hooks from '@/hooks';

const { Search: SearchBar } = Input;

const Search = () => {
  const { onSearchTrack, unpaginatedTracks, loadingAllTracks, errorAllTracks } =
    stores.useSpinamp((state) => ({
      onSearchTrack: state.onSearchTrack,
      unpaginatedTracks: state.unpaginatedTracks,
      loadingAllTracks: state.loadingAllTracks,
      errorAllTracks: state.errorAllTracks,
    }));
  const { isMobile } = hooks.useWindowSize();
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (!unpaginatedTracks) return;

    let list = { titles: [], artists: [] };
    unpaginatedTracks.map((track) => {
      const { title, artist, id } = track;
      list.titles.push({ value: title, key: `${id}-title` });

      if (list.artists.find((a) => a.value === artist)) return;
      list.artists.push({ value: artist.name, key: `${id}-artist` });
    });

    // Format
    const options = list.titles
      .map((title) => ({
        value: title.value,
        key: title.key,
        label: (
          <span
            className={`option-label title ${isMobile ? 'mobile' : 'desktop'}`}>
            {title.value}
          </span>
        ),
      }))
      .concat(
        list.artists.map((artist) => ({
          value: artist.value,
          key: artist.key,
          label: (
            <span
              className={`option-label artist ${
                isMobile ? 'mobile' : 'desktop'
              }`}>
              {artist.value}
            </span>
          ),
        })),
      );

    setOptions(options);
  }, [unpaginatedTracks]);

  if (errorAllTracks) return 'error';
  if (loadingAllTracks || !options.length) return 'loading...';

  return (
    <>
      <div className='search'>
        <AutoComplete
          options={options}
          style={{
            width: isMobile ? '90%' : '100%',
          }}
          onSelect={onSearchTrack}
          filterOption={(inputValue, option) =>
            option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
          }>
          <SearchBar
            size='medium'
            placeholder='Search a track or artist'
            allowClear
            onSearch={onSearchTrack}
          />
        </AutoComplete>
      </div>
      {isMobile ? <span className='separator horizontal' /> : null}
    </>
  );
};

export default Search;
