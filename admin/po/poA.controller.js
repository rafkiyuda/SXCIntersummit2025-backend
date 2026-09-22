const service = require('./poA.service');

exports.AllBMC= async (req, res) => {
  try {
    const program = req.program
    const { page = 1, limit = 10 } = req.query;
    const teams = await service.getAllBMC(+page, +limit, program);
    res.json(teams);
  } catch (err) {
    console.error('Error get all participants BMC:', err);
    res.status(500).json({ message: 'Gagal mengambil participants BMC' });
  }
};