const core = require("@actions/core");
const github = require("@actions/github");
const PullRequest = require("./pull-request.js");

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

  const requestMerge = core.getInput("request-merge") || "true";
  const token = core.getInput("token") || process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error(
      "No GitHub token is supplied, add \"token\" to your configuration " +
      "or set the `GITHUB_TOKEN` environment variable"
    );
  }

  const pr = new PullRequest(
    token,
    repo.owner,
    repo.repo,
    pull_request.number
  );

  if (! await pr.isApproved()) {
    await pr.approve(requestMerge.toLowerCase() === "true");
  }
}

run()
  .catch((err) => {
    core.error(err);
    core.setFailed(err.message);
  });
