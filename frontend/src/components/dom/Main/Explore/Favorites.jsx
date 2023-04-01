import { Tooltip } from 'antd';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import stores from '@/stores';

const FavoritesIcon = ({ id }) => {
  const { isAllowed, isFavorite } = stores.useInteract((state) => ({
    isAllowed: state.isAllowed,
    isFavorite: state.isFavorite,
  }));

  if (!isAllowed())
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
  const { isAllowed, favoritesLoaded, isFavorite } = stores.useInteract(
    (state) => ({
      isAllowed: state.isAllowed,
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
          isAllowed()
            ? favoritesLoaded
              ? isFavorite(id)
                ? 'remove from favorites'
                : 'add to favorites'
              : 'favorites are loading...'
            : 'you need to sign in & be in the allowlist to perform this action'
        }>
        {isFavorite(id) ? (
          <AiFillHeart className={isAllowed() ? '' : 'disabled'} size={20} />
        ) : (
          <AiOutlineHeart className={isAllowed() ? '' : 'disabled'} size={20} />
        )}
      </Tooltip>
    );

  return (
    <Tooltip
      title={
        isAllowed()
          ? favoritesLoaded
            ? null
            : 'favorites are loading...'
          : 'you need to sign in & be in the allowlist to perform this action'
      }>
      {isFavorite(id) ? 'remove from favorites' : 'add to favorites'}
    </Tooltip>
  );
};

export { FavoritesIcon, FavoritesLabel };
