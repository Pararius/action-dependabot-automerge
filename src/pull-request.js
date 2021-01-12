const github = require("@actions/github");

const APPROVE_EVENT = 'APPROVE';
const APPROVED_STATE = 'APPROVED';
const AUTO_MERGE_COMMENT = '@dependabot merge';

module.exports = class PullRequest {
  constructor(token, owner, repo, number) {
    this.github = github.getOctokit(token);
    this.owner = owner;
    this.repo = repo;
    this.number = number;
  }

  async approve(autoMerge = false) {
    let options = {
      owner: this.owner,
      repo: this.repo,
      pull_number: this.number,
      event: APPROVE_EVENT,
    };

    if (autoMerge) {
      options.body = AUTO_MERGE_COMMENT;
    }

    this.github
      .pulls
      .createReview(options)
    ;
  }

  async requestMerge() {
    if (! await this.hasAutoMergeComment()) {
      this.github
        .issues
        .createComment({
          owner: this.owner,
          repo: this.repo,
          issue_number: this.number,
          body: AUTO_MERGE_COMMENT,
        })
      ;
    }
  }

  async isApproved() {
    const reviews = await this.github
      .pulls
      .listReviews({
        owner: this.owner,
        repo: this.repo,
        pull_number: this.number,
      })
    ;

    return reviews
      .data
      .filter(review => review.state === APPROVED_STATE)
      .length > 0
  }

  async hasAutoMergeComment() {
    const comments = await this.github
      .issues
      .listComments({
        owner: this.owner,
        repo: this.repo,
        issue_number: this.number,
      })
    ;

    return comments
      .data
      .filter(comment => comment.body.includes(AUTO_MERGE_COMMENT))
      .length > 0
    ;
  }
}
