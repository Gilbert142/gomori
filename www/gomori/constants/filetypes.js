const FILE_TYPE_MAP = {
	plugins: { encrypted: "OMORI", decrypted: "js", dir: "js/plugins", conflicts: true, patch: true },
	text: { encrypted: "HERO", decrypted: "yml", dir: "languages/en", conflicts: true, patch: true },
	data: { encrypted: "KEL", decrypted: "json", dir: "data", conflicts: true, patch: true },
	maps: { encrypted: "AUBREY", decrypted: "json", dir: "maps", conflicts: true, patch: true },
	assets: { conflicts: true, patch: true },
	exec: { conflicts: false, require: true, patch: false },
};

module.exports = { FILE_TYPE_MAP };
