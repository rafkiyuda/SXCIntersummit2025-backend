const prisma = require('../config/db')



// set stage di parameter seperti registration, seminar, final
async function setProgramParam(req,res,next){
    try {
        // Tangani kemungkinan req.params.program kosong dengan optional chaining dan uppercase
        const name = req.params.program?.toUpperCase();

        // Ambil data program dari database dengan await (async)
        const program = await prisma.Program.findUnique({
        where: { name: name }
        });

        if (!program) {
        return res.status(400).json({ message: 'invalid Program name' });
        }

        // Set programId di req.body, pastikan req.body sudah ada
        req.program = program.id;

        next();
    } catch (error) {
        // Tangani error jika ada
        console.error('Error in setProgramParam:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    };
}


module.exports = {setProgramParam};