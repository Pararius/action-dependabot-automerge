const core = require("@actions/core");
const github = require("@actions/github");
const PullRequest = require("./pull-request.js");
const {extractVersions, levelIncludesUpgrade} = require("./version.js");

async function run() {
  const { repo, actor, payload: { pull_request } } = github.context;

  if (pull_request === undefined) {
    core.info("This action can only be triggered on a pull request");
    return;
  }

  if (!['dependabot[bot]', 'dependabot-preview[bot]'].includes(actor)) {
    core.info("This action only handles pull requests from Dependabot");
    return;
  }

  const level = core.getInput("level");
  const requestMerge = core.getInput("request-merge") || "true";
  const token = core.getInput("token");

  if (!token) {
    throw new Error(
      "No GitHub token is supplied, add \"token\" to your configuration"
    );
  }

  const pr = new PullRequest(
    token,
    repo.owner,
    repo.repo,
    pull_request.number
  );

  const [oldVersion, newVersion] = extractVersions(pull_request.title);
  if (!levelIncludesUpgrade(oldVersion, newVersion, level)) {
    core.info(`Update from ${oldVersion} to ${newVersion} is higher than a "${level}" update, skipping auto approve/merge`);
    return;
  }

  if (! await pr.isApproved()) {
    await pr.approve(requestMerge.toLowerCase() === "true");
  }
}

run()
  .catch((err) => {
    core.setFailed(err.message);
  });
