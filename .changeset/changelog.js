/** @type {import("@changesets/types").ChangelogFunctions} */
const { getInfo, getInfoFromPullRequest } = require("@changesets/get-github-info");

async function getReleaseLine(changeset, type, options) {
	if (!options || !options.repo) {
		throw new Error(
			'Please provide a repo to this changelog generator like this:\n"changelog": ["@changesets/changelog-github", { "repo": "org/repo" }]'
		);
	}

	let prFromSummary;
	let commitFromSummary;
	const replacedChangelog = changeset.summary
		.replace(/^\s*(?:pr|pull|pull\s+request):\s*#?(\d+)/im, (_, pr) => {
			let num = Number(pr);
			if (!isNaN(num)) prFromSummary = num;
			return "";
		})
		.replace(/^\s*commit:\s*([^\s]+)/im, (_, commit) => {
			commitFromSummary = commit;
			return "";
		})
		.trim();

	const [firstLine, ...futureLines] = replacedChangelog
		.split("\n")
		.map((l) => l.trimRight());

	const links = await (async () => {
		if (prFromSummary !== undefined) {
			let { links } = await getInfoFromPullRequest({
				repo: options.repo,
				pull: prFromSummary,
			});
			return links;
		}
		if (commitFromSummary) {
			let { links } = await getInfo({
				repo: options.repo,
				commit: commitFromSummary,
			});
			return links;
		}
		return {
			commit: null,
			pull: null,
			user: null,
		};
	})();

	const suffix = links.pull
		? ` (${links.pull})`
		: links.commit
			? ` (${links.commit})`
			: "";

	return `\n\n- ${firstLine}${suffix}${futureLines.length > 0
			? `\n${futureLines.map((l) => `  ${l}`).join("\n")}`
			: ""
		}`;
}

async function getDependencyReleaseLine(changesets, dependenciesUpdated, options) {
	if (!options || !options.repo) {
		throw new Error(
			'Please provide a repo to this changelog generator like this:\n"changelog": ["@changesets/changelog-github", { "repo": "org/repo" }]'
		);
	}
	if (dependenciesUpdated.length === 0) return "";

	const changesetLink = `- Updated dependencies [${changesets
		.map((cs) => {
			if (cs.commit) {
				return `[\`${cs.commit}\`](https://github.com/${options.repo}/commit/${cs.commit})`;
			}
			return null;
		})
		.filter((_) => _)
		.join(", ")}]:`;

	const updatedDepenenciesList = dependenciesUpdated.map(
		(dependency) => `  - ${dependency.name}@${dependency.newVersion}`
	);

	return [changesetLink, ...updatedDepenenciesList].join("\n");
}

module.exports = {
	getReleaseLine,
	getDependencyReleaseLine,
};