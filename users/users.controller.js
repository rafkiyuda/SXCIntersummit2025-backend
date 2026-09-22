const messages = require("../constants/messages");
const {
	getProfile,
	updateProfile,
	checkProfile,
	updateStatus,
	deleteIdcard,
	findProgramByName,
	verifyReferral,
	relUserReferral,
	findReferral,
	getUserSeminar,
	getUserTeam,
	getProgrambyTeamId,
} = require("./users.service");
const jwt = require("jsonwebtoken");

exports.getProfile = async (req, res) => {
	try {
		const user = await getProfile(req.user.id);
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: "Failed to retrieve profile data" });
	}
};

exports.updateProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		const {
			name,
			email,
			birthdate,
			domicile,
			institution,
			institution_name,
			major,
			wa_number,
			line_id,
			insta_acc,
		} = req.body;
		// Ubah birthdate ke DateTime lengkap, misalnya tambahkan jam 00:00:00 di server
		let birthdateWithTime = null;
		if (birthdate) {
			birthdateWithTime = new Date(birthdate + "T00:00:00.000Z");
		}

		// Siapkan objek data yang akan dikirim ke updateProfile
		const dataToUpdate = {
			name,
			email,
			birthdate: birthdateWithTime,
			domicile,
			institution: institution,
			institution_name,
			major,
			wa_number,
			line_id,
			insta_acc,
		};

		// Panggil fungsi updateProfile dengan userId dan data objek
		const updated = await updateProfile(userId, dataToUpdate);
		res.cookie("token", updated.token, {
			httpOnly: true, // Cookie tidak bisa diakses oleh JavaScript di browser (keamanan)
			secure: process.env.NODE_ENV === "production",
			maxAge: 24 * 3600 * 1000, // durasi cookie, misal 1 hari (sesuaikan dengan expiresIn JWT)
			path: "/",
			sameSite: "lax",
		});
		const profileCheck = await checkProfile(userId);

		// Jika semua data sudah lengkap (semua field tidak null/undefined)
		const allFilled = Object.values(profileCheck).every(
			(value) => value !== null && value !== undefined && value !== ""
		);

		if (allFilled) {
			const code = "1";
			const statusUpdate = await updateStatus(userId, code);
			if (!statusUpdate) {
				res.status(400).json({ message: "Failed to update status" });
			}
		}

		res.status(200).json({ message: "Profile Updated", updated });
	} catch (error) {
		console.error("Error update Profile :", error);
		res.status(500).json({ message: "Failed to update profile" });
	}
};

exports.deleteIdcard = async (req, res) => {
	try {
		const userId = req.user.id;
		const checkUser = await getProfile(userId);
		if (!checkUser) {
			res.status(404).json({ message: "user not found" });
		}

		const removeIdcard = await deleteIdcard(userId);

		res.status(200).json(removeIdcard);
	} catch (err) {
		console.error("Error delete Id card :", err);
		res.status(500).json({ message: "Failed to Delete Profile" });
	}
};

exports.registeredProgram = async (req, res) => {
	try {
		const userId = req.user.id;

		const seminar = await getUserSeminar(userId);
		const compe = await getUserTeam(userId);

		let compeProgram = [];
		if (Array.isArray(compe) && compe.length > 0) {
			for (const team of compe) {
				if (team && team.teamId) {
					const program = await getProgrambyTeamId(team.teamId);
					// if (program) {
					//   compeProgram.push({
					//     teamId: team.teamId,
					//     program,
					//   });
					// }
					compeProgram.push(...program);
				}
			}
		}
		// console.log(userId, seminar, compe, compe.teamId, compeProgram);

		res.status(200).json({
			seminar: seminar.map((s) => ({
				programId: s.programId,
				programcode: s.program,
				type: s.type,
			})),
			compeProgram: compeProgram.map((c) => ({
				programId: c.programId,
				programcode: c.programcode,
			})),
		});
	} catch (error) {
		console.error("Error getting registered programs:", error);
		res.status(500).json({ message: "Failed to get registered programs" });
	}
};

exports.referral = async (req, res) => {
	try {
		const program = req.params.name?.toUpperCase();
		const code = req.body.code;
		const userId = req.user.id;

		const checkProgram = await findProgramByName(program);
		if (!checkProgram) {
			return res.status(404).json({ message: "Program not found" });
		}
		const referral = await findReferral(code);
		if (!referral) {
			return res.status(404).json({ message: "Referral not found" });
		}

		const checkReferral = await verifyReferral(checkProgram.id, referral.id);
		if (!checkReferral) {
			return res
				.status(404)
				.json({ message: "Referral not valid for this program" });
		}

		const insertRelation = await relUserReferral(userId, referral.id);
		if (!insertRelation) {
			return res
				.status(500)
				.json({ message: "Failed to insert referral relation" });
		}

		res.status(200).json({ message: "Referral Correct", referral: referral });
	} catch (error) {
		console.error("Error checking referral:", error);
		res.status(500).json({ message: "Failed to check referral" });
	}
};
