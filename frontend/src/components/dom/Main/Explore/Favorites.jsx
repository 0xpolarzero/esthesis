import { Tooltip } from 'antd';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import stores from '@/stores';

const FavoritesIcon = ({ id }) => {
  const { connected, isFavorite } = stores.useInteract((state) => ({
    connected: state.connected,
    isFavorite: state.isFavorite,
  }));

  if (!connected)
    return (
      <AiOutlineHeart
        size={20}
        className='disabled ant-dropdown-menu-item-icon'
      />
    );
  if (isFavorite(id))
    return (
      <AiFillHeart
        size={20}
        className='emphasize ant-dropdown-menu-item-icon'
      />
    );

  return <AiOutlineHeart size={20} className='ant-dropdown-menu-item-icon' />;
};

const FavoritesLabel = ({ id, type }) => {
  const { connected, favoritesLoaded, isFavorite } = stores.useInteract(
    (state) => ({
      connected: state.connected,
      favoritesLoaded: state.favoritesLoaded,
      isFavorite: state.isFavorite,
    }),
  );

  if (type === 'minimal')
    return isFavorite(id) ? 'remove from favorites' : 'add to favorites';

  if (type === 'extended')
    return (
      <Tooltip
        title={
          connected
            ? favoritesLoaded
              ? isFavorite(id)
                ? 'remove from favorites'
                : 'add to favorites'
              : 'favorites are loading...'
            : 'you need to connect to interact'
        }>
        <AiOutlineHeart className={connected ? '' : 'disabled'} size={20} />
      </Tooltip>
    );

  return (
    <Tooltip
      title={
        connected
          ? favoritesLoaded
            ? null
            : 'favorites are loading...'
          : 'you need to be connected to perform this action.'
      }>
      {isFavorite(id) ? 'remove from favorites' : 'add to favorites'}
    </Tooltip>
  );
};

export { FavoritesIcon, FavoritesLabel };
