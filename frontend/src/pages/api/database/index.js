import functions from './functions';

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const { functionName, args } = req.body;

    if (functions.hasOwnProperty(functionName)) {
      try {
        const result = await functions[functionName](...args);
        res.status(200).json(result);
      } catch (err) {
        res
          .status(500)
          .json({
            message: 'Error executing function',
            error: err.message || err,
          });
      }
    } else {
      res.status(400).json({ message: 'Invalid function name' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;
