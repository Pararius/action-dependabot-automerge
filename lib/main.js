import * as core from "@actions/core";
async function run() {
    core.info("Hello");
}
run()
    /* eslint-disable github/no-then */
    .catch((err) => {
    core.error(err);
    core.setFailed(err.message);
});
