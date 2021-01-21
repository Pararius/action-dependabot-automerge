const semver = require("semver");

const weights = {
  major: 3,
  minor: 2,
  patch: 1,
}

const number = `(0|[1-9]\\d*)`;
const version = `v?${number}(\\.${number}(\\.${number})?)?`;
const release = `${version}(-[a-zA-Z0-9-]+)?`
const titleRegex = new RegExp(`from (?<from>${release}) to (?<to>${release})`);

const levelWeight = level => {
  const weight = weights[level] || undefined;

  if (!weight) {
    throw new Error(`Invalid level specified: "${level}". Please set level to "major", "minor", or "patch".`);
  }

  return weight;
};

const normalizeVersion = version => {
  const normalized = semver.clean(version) || version;
  if (semver.valid(normalized)) {
    return semver.parse(normalized);
  }

  return semver.coerce(normalized);
}

const extractVersions = title => {
  const result = title.match(titleRegex);
  if (!result) {
    throw new Error("The pull request had an unexpected title format");
  }

  return [
    result.groups.from,
    result.groups.to,
  ];
};

const levelIncludesUpgrade = (oldVersion, newVersion, level="minor") => {
  oldVersion = normalizeVersion(oldVersion);
  newVersion = normalizeVersion(newVersion);

  const threshold = levelWeight(level);

  // only handle upgrades
  if (semver.gte(oldVersion, newVersion)) {
    return false;
  }

  let upgrade = semver.diff(oldVersion, newVersion);

  // see if the update involves a pre-release
  if (upgrade.startsWith('pre')) {
    upgrade = upgrade.substring(3);

    // only allow when we aren't currently on this pre-release
    if (oldVersion.prerelease.toString() !== newVersion.prerelease.toString()) {
      return false;
    }
  }

  return levelWeight(upgrade) <= threshold;
};

module.exports = {
  extractVersions,
  levelIncludesUpgrade
};
