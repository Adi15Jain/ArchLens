// ============================================================
// @archlens/cli — Score Command
// ============================================================

import { defineCommand } from "citty";
import { orchestrate } from "../orchestrate.js";
import { logger, isErr } from "@archlens/shared";

export default defineCommand({
    meta: {
        name: "score",
        description:
            "Analyze a repository and output score cards in JSON or text formats.",
    },
    args: {
        dir: {
            type: "positional",
            description: "Directory to analyze",
            required: false,
            default: ".",
        },
        format: {
            type: "string",
            description: "Output format (json, text)",
            default: "text",
        },
    },
    async run({ args }) {
        const dir = args.dir || ".";
        const format = args.format || "text";

        const result = await orchestrate(dir);

        if (!result.ok) {
            logger.error(`Analysis failed: ${result.error.message}`);
            process.exit(1);
            return;
        }

        const { scores, moduleCount, repositoryPath } = result.value.scoreCard;

        if (format === "json") {
            console.log(
                JSON.stringify(
                    { repositoryPath, moduleCount, scores },
                    null,
                    2,
                ),
            );
            process.exit(0);
        }

        // Text output
        console.log(`\nArchLens Architectural Scores for: ${repositoryPath}`);
        console.log(`Modules Analyzed: ${moduleCount}`);
        console.log("----------------------------------------------------");
        console.log(
            `Overall Architecture Score:  ${scores.architecture.value.toFixed(1)} [Grade ${scores.architecture.grade}]`,
        );
        console.log(
            `Dependency Health Score:     ${scores.dependencyHealth.value.toFixed(1)} [Grade ${scores.dependencyHealth.grade}]`,
        );
        console.log(
            `Maintainability Score:       ${scores.maintainability.value.toFixed(1)} [Grade ${scores.maintainability.grade}]`,
        );
        console.log(
            `Technical Debt Score:        ${scores.technicalDebt.value.toFixed(1)} [Grade ${scores.technicalDebt.grade}]`,
        );
        console.log(
            `Scalability Score:           ${scores.scalability.value.toFixed(1)} [Grade ${scores.scalability.grade}]`,
        );
        console.log("----------------------------------------------------\n");
    },
});
