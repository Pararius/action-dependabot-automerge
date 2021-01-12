const semver = require("semver");

const weights = {
  major: 3,
  minor: 2,
  patch: 1,
}

const versionRegex = /v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[a-zA-Z0-9-]+)?/;
const titleRegex = new RegExp(`from (?<from>${versionRegex.source}) to (?<to>${versionRegex.source})`);

const levelWeight = level => {
  if (!weights.hasOwnProperty(level)) {
    throw new Error(`Invalid level specified: "${level}". Please set level to "major", "minor", or "patch".`);
  }

  return weights[level];
};

const extractVersions = title => {
  const result = title.match(titleRegex);
  if (!result) {
    throw new Error("The pull request had an unexpected title format");
  }

  return [result.groups.from, result.groups.to];
};

const levelIncludesUpgrade = (oldVersion, newVersion, level="minor") => {
  const threshold = levelWeight(level);

  // only handle upgrades
  if (semver.gte(oldVersion, newVersion)) {
    return false;
  }

  const upgrade = semver.diff(oldVersion, newVersion);

  if (upgrade.startsWith('pre')) {
    // Pre-releases are not subject to auto approve/merge
    return false;
  }

  return levelWeight(upgrade) <= threshold;
};

module.exports = {
  extractVersions,
  levelIncludesUpgrade
};
