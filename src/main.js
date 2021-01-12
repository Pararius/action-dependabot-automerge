import core from "@actions/core";
import github from "@actions/github";
import PullRequest from "./pull-request.js";

async function run() {
  const { repo, actor, payload: { pull_request } } = github.context;

  if (pull_request === undefined) {
    throw new Error("This action can only be triggered on a pull request")
  }

  if (!['dependabot[bot]', 'dependabot-preview[bot]'].includes(actor)) {
    core.warning(`This action only handles pull requests from Dependabot`);
    return;
  }

  const token = core.getInput("token") || process.env.GITHUB_TOKEN;
  const pr = new PullRequest(
    token,
    repo.owner,
    repo.repo,
    pull_request.number
  );

  if (! await pr.isApproved()) {
    await pr.approve();
  }

  if (! await pr.hasAutoMergeComment()) {
    await pr.requestMerge();
  }
}

run()
  .catch((err) => {
    core.error(err);
    core.setFailed(err.message);
  });
