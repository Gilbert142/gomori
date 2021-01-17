const FILE_TYPE_MAP = {
	plugins: { encrypted: "OMORI", decrypted: "js", dir: "js/plugins", conflicts: true, patch: true, delta: false },
	text: { encrypted: "HERO", decrypted: "yml", dir: "languages/en", conflicts: true, patch: true, delta: false },
	data: { encrypted: "KEL", decrypted: "json", dir: "data", conflicts: true, patch: true, delta: false },
	maps: { encrypted: "AUBREY", decrypted: "json", dir: "maps", conflicts: true, patch: true, delta: false },
	assets: { conflicts: true, patch: true, delta: false },
	exec: { conflicts: false, require: true, patch: false },
	plugins_delta: { encrypted: "OMORI", decrypted: "jsd", dir: "js/plugins", conflicts: false, patch: false, delta: true },
	text_delta: { encrypted: "HERO", decrypted: "ymld", dir: "languages/en", conflicts: false, patch: true, delta: true },
	data_delta: { encrypted: "KEL", decrypted: "jsond", dir: "data", conflicts: false, patch: true, delta: true },
	maps_delta: { encrypted: "AUBREY", decrypted: "jsond", dir: "maps", conflicts: false, patch: true, delta: true },
};

module.exports = { FILE_TYPE_MAP };
