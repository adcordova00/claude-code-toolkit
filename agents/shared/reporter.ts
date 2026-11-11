import fs from "fs/promises";
import path from "path";

export interface TestResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  error?: string;
}

export interface Report {
  agent: string;
  suite: string;
  timestamp: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: TestResult[];
}

export class Reporter {
  constructor(private readonly outputDir: string) {}

  async save(report: Report): Promise<void> {
    await fs.mkdir(this.outputDir, { recursive: true });

    const jsonPath = path.join(this.outputDir, `report-${Date.now()}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");

    const htmlPath = path.join(this.outputDir, `report-${Date.now()}.html`);
    await fs.writeFile(htmlPath, this.toHtml(report), "utf-8");

    return;
  }

  toGitHubSummary(report: Report): string {
    const statusIcon = report.failed > 0 ? "❌" : "✅";
    const lines = [
      `## ${statusIcon} ${report.agent} — ${report.suite}`,
      ``,
      `| Passed | Failed | Skipped | Duration |`,
      `|--------|--------|---------|----------|`,
      `| ${report.passed} | ${report.failed} | ${report.skipped} | ${(report.duration / 1000).toFixed(1)}s |`,
    ];

    if (report.failed > 0) {
      lines.push(``, `### Failed tests`);
      for (const r of report.results.filter((t) => t.status === "failed")) {
        lines.push(`- **${r.name}**: ${r.error ?? "No error message"}`);
      }
    }

    return lines.join("\n");
  }

  private toHtml(report: Report): string {
    const rows = report.results
      .map(
        (r) => `
      <tr class="${r.status}">
        <td>${r.name}</td>
        <td>${r.status}</td>
        <td>${(r.duration / 1000).toFixed(2)}s</td>
        <td>${r.error ?? ""}</td>
      </tr>`
      )
      .join("");

    return `<!DOCTYPE html>
<html>
<head><title>${report.agent} Report</title>
<style>
  body { font-family: sans-serif; padding: 2rem; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  .passed { background: #e6ffe6; }
  .failed { background: #ffe6e6; }
  .skipped { background: #ffffcc; }
</style>
</head>
<body>
<h1>${report.agent}</h1>
<p>Suite: ${report.suite} | ${new Date(report.timestamp).toLocaleString()}</p>
<p>✅ ${report.passed} passed &nbsp; ❌ ${report.failed} failed &nbsp; ⏭ ${report.skipped} skipped</p>
<table>
<tr><th>Test</th><th>Status</th><th>Duration</th><th>Error</th></tr>
${rows}
</table>
</body></html>`;
  }
}
