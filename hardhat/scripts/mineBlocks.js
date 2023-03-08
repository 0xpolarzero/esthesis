module.exports = async (n) => {
  for (let i = 0; i < n; i++) {
    await network.provider.request({
      method: 'evm_mine',
      params: [],
    });
  }
};
