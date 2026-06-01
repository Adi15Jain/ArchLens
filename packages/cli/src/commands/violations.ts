// ============================================================
// @archlens/cli — Violations Command
// ============================================================

import { defineCommand } from "citty";
import { orchestrate } from "../orchestrate.js";
import { logger, isErr } from "@archlens/shared";
import { colors } from "@archlens/reporting";

export default defineCommand({
    meta: {
        name: "violations",
        description:
            "Analyze a repository and output architectural violations only, returning a failure exit code if any errors are found.",
    },
    args: {
        dir: {
            type: "positional",
            description: "Directory to analyze",
            required: false,
            default: ".",
        },
        exclude: {
            type: "string",
            description: "Comma-separated glob ignore patterns",
        },
        failOnError: {
            type: "boolean",
            description:
                "Exit with code 1 if any architectural errors are found",
            default: true,
        },
    },
    async run({ args }) {
        const dir = args.dir || ".";
        const excludePatterns = args.exclude
            ? args.exclude.split(",").map((p) => p.trim())
            : undefined;
        const failOnError = args.failOnError !== false;

        const result = await orchestrate(dir, {
            excludePatterns,
        });

        if (!result.ok) {
            logger.error(`Analysis failed: ${result.error.message}`);
            process.exit(1);
            return;
        }

        const { violations, summary } = result.value.violationSet;

        if (violations.length === 0) {
            console.log(
                colors.bold(
                    colors.green("\n✔ No architectural violations detected."),
                ),
            );
            process.exit(0);
        }

        console.log(
            colors.bold(
                colors.yellow(
                    `\n⚠️  Architectural Violations (${violations.length} total: ${summary.bySeverity.error} errors, ${summary.bySeverity.warning} warnings)`,
                ),
            ),
        );
        console.log(
            colors.dim("----------------------------------------------------"),
        );

        for (const v of violations) {
            const sevLabel =
                v.severity === "error"
                    ? colors.bold(colors.red("[ERROR]"))
                    : colors.bold(colors.yellow("[WARN]"));

            console.log(
                `\n${sevLabel} ${colors.bold(v.ruleName)} (${v.ruleId})`,
            );
            console.log(`  ${colors.dim("Message:")}  ${v.message}`);
            console.log(`  ${colors.dim("Modules:")}  ${v.modules.join(", ")}`);
            if (v.evidence.description) {
                console.log(
                    `  ${colors.dim("Evidence:")} ${v.evidence.description}`,
                );
            }
        }

        console.log("");

        if (failOnError && summary.bySeverity.error > 0) {
            logger.error(
                `[FAIL] Exiting with code 1 because ${summary.bySeverity.error} architectural errors were found.`,
            );
            process.exit(1);
        }
    },
});
