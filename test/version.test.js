const assert = require('assert');
const {extractVersions, levelIncludesUpgrade} = require("../src/version.js");

describe('extract versions from pull request title', function () {
  it('supports default PR titles', function () {
    assert.deepStrictEqual(
      extractVersions("Bump some/dependency from v2.2.1 to v2.7.0"),
      ["v2.2.1", "v2.7.0"]
    )
  });

  it('supports custom PR titles', function () {
    assert.deepStrictEqual(
      extractVersions("chore(deps-dev): Bump eslint from 7.11.0 to 7.13.0"),
      ["7.11.0", "7.13.0"]
    )
  });

  it('supports pre-releases', function () {
    assert.deepStrictEqual(
      extractVersions("Bump some/dependency from v1.2.3 to v2.0.0-BETA3-prerelease"),
      ["v1.2.3", "v2.0.0-BETA3-prerelease"]
    )
  });

  it('supports versions without "v" prefix', function () {
    assert.deepStrictEqual(
      extractVersions("Bump some/dependency from 1.2.3 to 2.0.0"),
      ["1.2.3", "2.0.0"]
    )
  });

  it('supports incomplete semver versions', function () {
    assert.deepStrictEqual(
      extractVersions("Bump some/dependency from v1 to v2"),
      ["v1", "v2"]
    );
    assert.deepStrictEqual(
      extractVersions("Bump some/dependency from v1.1 to v2.2"),
      ["v1.1", "v2.2"]
    );
  });
})

describe('check if upgrade matches given level', function () {
  const includes = [
    ['patch', 'v1.2',   'v1.2.1'],
    ['patch', 'v1.2.0', 'v1.2.1'],

    ['minor', 'v1',     'v1.2.1'],
    ['minor', 'v1.2',   'v1.3.0'],
    ['minor', 'v1.2.0', 'v1.2.1'],
    ['minor', 'v1.2.0', 'v1.3.0'],

    ['major', 'v1',     'v1.2.3'],
    ['major', 'v1.2',   'v1.3.0'],
    ['major', 'v1.2.0', 'v1.2.1'],
    ['major', 'v1.2.0', 'v1.3.0'],
    ['major', 'v1.2.0', 'v2.0.0'],
  ];

  const excludes = [
    ['patch', 'v1',     'v1.2.0'],
    ['patch', 'v1.2',   'v1.3.0'],
    ['patch', 'v1.2.0', 'v1.2.0'],
    ['patch', 'v1.2.0', 'v1.3.0'],
    ['patch', 'v1.2.0', 'v2.0.0'],
    ['patch', 'v1.2.0', 'v1.1.0'],
    ['patch', 'v1.2.0', 'v0.9.0'],
    ['patch', 'v1.2.0', 'v1.2.1-beta'],
    ['patch', 'v1.2.0', 'v1.3.0-beta'],
    ['patch', 'v1.2.0', 'v2.0.0-beta'],

    ['minor', 'v1',     'v2.0.0'],
    ['minor', 'v1.2.0', 'v2.0.0'],
    ['minor', 'v1.2.0', 'v1.1.0'],
    ['minor', 'v1.2.0', 'v0.9.0'],
    ['minor', 'v1.2.0', 'v1.3.0-beta'],
    ['minor', 'v1.2.0', 'v2.0.0-beta'],

    ['major', 'v1.2.0', 'v1.1.0'],
    ['major', 'v1.2.0', 'v0.9.0'],
    ['major', 'v1.2.0', 'v1.3.0-beta'],
    ['major', 'v1.2.0', 'v2.0.0-beta'],
  ];

  includes.forEach(data => {
    it(`includes ${data[0]} upgrade for ${data[1]} => ${data[2]}`, function () {
      assert.ok(levelIncludesUpgrade(data[1], data[2], data[0]));
    })
  })

  excludes.forEach(data => {
    it(`excludes ${data[0]} upgrade for ${data[1]} => ${data[2]}`, function () {
      assert.ok(! levelIncludesUpgrade(data[1], data[2], data[0]));
    })
  })
});

describe('supports suffixes that don\'t denote pre-releases', function () {
  it('extracts versions correctly', function () {
    assert.deepStrictEqual(
      extractVersions("Bump node from 15.5.1-alpine to 15.6.0-alpine"),
      ["15.5.1-alpine", "15.6.0-alpine"]
    )
  });

  it('supports upgrades for "<major>.<minor>.<patch>-alpine" formats', function () {
    assert.ok(levelIncludesUpgrade("15.5.1-alpine", "15.5.2-alpine", "patch"));
    assert.ok(levelIncludesUpgrade("15.5.1-alpine", "15.6.0-alpine", "minor"));
    assert.ok(levelIncludesUpgrade("15.5.1-alpine", "16.0.0-alpine", "major"));
  })
});

describe('level must be valid', function () {
  it('throws when level is not major, minor, or patch', function () {
    assert.throws(() => levelIncludesUpgrade('1.2.3', '4.5.6', 'invalid level'));
  });
});
