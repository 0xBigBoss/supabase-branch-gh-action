import {
	DatabaseBranchesBetaService,
	SupabaseManager,
} from "@0xbigboss/supabase-manager";

import * as core from "@actions/core";
console.log(DatabaseBranchesBetaService);

process.on("unhandledRejection", handleError);
main().catch(handleError);

async function main(): Promise<void> {
	const sbToken = core.getInput("supabase-access-token");
	const sbRef = core.getInput("supbase-project-id");
	const waitForMigrations = core.getBooleanInput("wait-for-migrations");
	const timeout = Number(core.getInput("timeout")); // timeout in seconds

	if (!sbToken) {
		core.setFailed("Supabase access token is not defined");
		return;
	}

	if (!sbRef) {
		core.setFailed("Supabase project id is not defined");
		return;
	}

	if (Number.isNaN(timeout)) {
		core.setFailed("Timeout is not a valid number");
		return;
	}

	const supabase = new SupabaseManager({
		TOKEN: sbToken,
		BASE: "https://api.supabase.com/",
	});

	// find branch name
	let branchName = process.env.GITHUB_HEAD_REF;
	if (branchName) {
		branchName = (process.env.GITHUB_REF ?? "").split("/").pop();
	}

	if (!branchName) {
		core.setFailed("Git branch not found");
		return;
	}

	core.info(`Current Git branch: ${branchName}`);

	// find the supabase branch ID of the database preview branch
	// (optionally) wait for the migrations to be applied
	// up to a certain timeout
	let branchId = "";
	const now = Date.now();
	while (!branchId && Date.now() - now < timeout * 1000) {
		const branches = await supabase.databaseBranchesBeta.getBranches({
			ref: sbRef,
		});
		const currentBranch = branches.find((b) => b.name === branchName);
		if (
			currentBranch &&
			(!waitForMigrations || currentBranch.status === "MIGRATIONS_PASSED")
		) {
			branchId = currentBranch.id;
			break;
		}
		core.info(
			`Waiting for branch ${branchName} to be created. Status=${currentBranch?.status}`,
		);
		await new Promise((resolve) => setTimeout(resolve, 2900));
	}

	if (!branchId) {
		core.setFailed("Branch not found");
		return;
	}

	const branch = await supabase.databaseBranchesBeta.getBranchDetails({
		branchId,
	});

	if (!branch) {
		core.setFailed("Branch details not found");
		return;
	}

	// set outputs and mask secrets
	for (const [k, v] of Object.entries(branch)) {
		const _v = v.toString();
		core.setSecret(_v);
		core.setOutput(k, _v);
	}

	core.setOutput("api_url", `https://${branch.ref}.supabase.co/rest/v1`);
	core.setOutput("graphql_url", `https://${branch.ref}.supabase.co/graphql/v1`);

	core.info("done");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// biome-ignore lint/suspicious/noExplicitAny: err can be any type
function handleError(err: any): void {
	console.error(err);
	core.setFailed(`Unhandled error: ${err}`);
}
