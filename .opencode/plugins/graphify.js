// graphify OpenCode plugin
// Injects a knowledge‑graph reminder before tool calls when the graph exists.
// Updated to:
//  • Support any tool (not just "bash") via a configurable `tools` array.
//  • Allow a custom reminder message via plugin options.
//  • Ensure the reminder is shown only once per plugin instance.
//  • Use path.resolve for robust absolute paths.
//  • Add JSDoc typings for better editor support.

import { existsSync } from "fs";
import { join, resolve } from "path";

/**
 * @typedef {Object} GraphifyPluginOptions
 * @property {string} directory - Base directory where `graphify-out` lives.
 * @property {string[]} [tools] - List of tool names that should receive the reminder.
 *                                 Defaults to `["bash"]`.
 * @property {string} [message] - Custom reminder message. If omitted a default
 *                                 informative message is used.
 */

/**
 * Graphify OpenCode plugin.
 *
 * @param {GraphifyPluginOptions} param0
 * @returns {Promise<Object>} Plugin hooks.
 */
export const GraphifyPlugin = async ({
  directory,
  tools = ["bash"],
  message,
}) => {
  // Resolve the absolute path once – avoids issues when `directory` is relative.
  const graphDir = resolve(directory, "graphify-out");
  const graphFile = join(graphDir, "graph.json");
  const reportFile = join(graphDir, "GRAPH_REPORT.md");

  // Default reminder message – includes a link to the markdown report.
  const defaultMessage = `[graphify] Knowledge graph available. Read ${reportFile} for god nodes and architecture context before searching files.`;

  // Use the provided custom message or fall back to the default.
  const reminderMessage = message ?? defaultMessage;

  // Ensure we only remind once per plugin instance.
  let reminded = false;

  return {
    /**
     * Hook executed before any tool runs.
     *
     * @param {Object} input  - The original tool input.
     * @param {Object} output - The mutable output that will be passed to the tool.
     */
    "tool.execute.before": async (input, output) => {
      // If we have already reminded, skip further processing.
      if (reminded) return;

      // Only proceed if the graph file exists.
      if (!existsSync(graphFile)) return;

      // Only inject the reminder for the configured tools.
      if (!tools.includes(input.tool)) return;

      // Prepend the reminder to the command (or equivalent argument) that will be executed.
      // Different tools may expose the command differently; we handle the most common cases.
      if (output?.args?.command) {
        output.args.command = `echo "${reminderMessage}" && ${output.args.command}`;
      } else if (output?.args?.script) {
        // For tools that use a `script` field (e.g., some custom runners).
        output.args.script = `echo "${reminderMessage}" && ${output.args.script}`;
      } else {
        // Fallback – attach a generic `preMessage` property that downstream code can
        // decide how to render. This keeps the plugin safe for unknown tool shapes.
        output.preMessage = reminderMessage;
      }

      reminded = true;
    },
  };
};
