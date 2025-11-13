/** @type {import("@changesets/types").ChangelogFunctions} */
module.exports = {
	getReleaseLine: async (changeset, type) => {
		const commit = changeset.commit ? ` (${changeset.commit})` : "";
		return `- ${changeset.summary}${commit}\n`;
	},

	getDependencyReleaseLine: async () => {
		return "";
	}
};
