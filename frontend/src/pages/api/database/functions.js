import { PrismaClient } from '@prisma/client';
import config from '@/data';

let prisma;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

const returnError = (message) => {
  return { data: null, success: false, error: message };
};

const returnSuccess = (data) => {
  return { data, success: true, error: null };
};

const getUser = async (userAddress) => {
  const user = await prisma.user.findUnique({
    where: { address: userAddress },
  });

  if (!user && config.allowlist.includes(userAddress)) {
    const newUser = await prisma.user.create({
      data: {
        address: userAddress,
        favorites: [],
      },
    });

    return newUser;
  }

  return user;
};

const functions = {
  addFavorite: async (userAddress, favoriteId, userInstance = null) => {
    const user = await (userInstance || (await getUser(userAddress)));

    const updatedFavorites = user?.favorites
      ? [...user.favorites, favoriteId]
      : [favoriteId];

    const update = await prisma.user.update({
      where: { address: userAddress },
      data: { favorites: updatedFavorites },
    });

    if (!update) return returnError('error adding favorite');
    return returnSuccess(updatedFavorites);
  },

  removeFavorite: async (userAddress, favoriteId, userInstance = null) => {
    const user = await (userInstance || (await getUser(userAddress)));

    const updatedFavorites =
      user?.favorites.filter((id) => id !== favoriteId) || null;

    const update = await prisma.user.update({
      where: { address: userAddress },
      data: { favorites: updatedFavorites },
    });

    if (!update) return returnError('error removing favorite');
    return returnSuccess(updatedFavorites);
  },

  shortenUrl: async (properties, userAddress) => {
    const shortenedUrl = await prisma.shortenedUrl.create({
      data: {
        properties,
        createdByAddress: userAddress,
      },
    });

    if (!shortenedUrl) return returnError('error shortening url');
    return returnSuccess(
      `${config.baseUrl}shared?id=${shortenedUrl.id.toString()}`,
    );
  },

  getFavorites: async (userAddress, userInstance = null) => {
    const user = await (userInstance || (await getUser(userAddress)));

    if (!user) return returnError('error getting favorites');
    return returnSuccess(user.favorites);
  },

  getShortenedUrl: async (id) => {
    const url = await prisma.shortenedUrl.findUnique({
      where: { id: Number(id) },
    });

    if (!url) return returnError('error getting shortened url');
    return returnSuccess(url.properties);
  },

  getShortenedUrlsForAddress: async (userAddress) => {
    const urls = await prisma.shortenedUrl.findMany({
      where: { createdByAddress: userAddress },
    });

    if (!urls) return returnError('error getting shortened urls');
    return returnSuccess(urls);
  },

  getUser,
};

export default functions;
