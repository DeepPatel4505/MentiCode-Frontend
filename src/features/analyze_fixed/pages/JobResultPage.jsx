import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  getFiles,
  getJobResult,
  getJobStatus,
  getPlaygrounds,
} from "../services/analyze.api";
import { getStoredAnalysisHistory } from "../queries/analysisQueries";
import { cn } from "../../../lib/utils";

function formatDate(timestamp) {
  if (!timestamp) return "Unknown";
  return new Date(timestamp).toLocaleString();
}

function countBySeverity(findings = []) {
  const counts = { critical: 0, major: 0, minor: 0 };
  for (const finding of findings) {
    const severity = String(finding?.severity || "").toLowerCase();
    if (counts[severity] !== undefined) counts[severity] += 1;
  }
  return counts;
}

function isNotFoundError(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("not found") || message.includes("404");
}

function normalizePlaygrounds(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.playgrounds)) return payload.playgrounds;
  return [];
}

function normalizeFiles(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.files)) return payload.files;
  return [];
}

function buildInsights(rows) {
  const completed = rows.filter((row) => row.status === "completed");
  const allFindings = completed.flatMap((row) => row.findings || []);
  const severityCounts = countBySeverity(allFindings);
  const qualityScores = completed
    .map((row) => Number(row.summary?.overall_quality || 0))
    .filter((score) => Number.isFinite(score));
  const avgQuality =
    qualityScores.length > 0
      ? Math.round(qualityScores.reduce((sum, s) => sum + s, 0) / qualityScores.length)
      : 0;

  const categoryCounts = allFindings.reduce((acc, finding) => {
    const category = String(finding?.category || "general").toLowerCase();
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const topIssueCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);

  const strengths = [];
  const gaps = [];

  if (completed.length >= 1) strengths.push(`Completed ${completed.length} analysis run(s).`);
  if (avgQuality >= 70) strengths.push(`Healthy average quality score (${avgQuality}/100).`);
  if (severityCounts.critical === 0 && completed.length > 0) strengths.push("No critical issues in recent completed analyses.");
  if (avgQuality < 60) gaps.push(`Quality score is trending low (${avgQuality}/100).`);
  if (severityCounts.critical > 0) gaps.push(`Found ${severityCounts.critical} critical issue(s) recently.`);
  if (severityCounts.major > 0) gaps.push(`Found ${severityCounts.major} major issue(s) to address.`);
  if (topIssueCategories.length > 0) gaps.push(`Most frequent issue areas: ${topIssueCategories.join(", ")}.`);
  if (strengths.length === 0) strengths.push("Run and complete more analyses to surface strengths.");
  if (gaps.length === 0) gaps.push("No major recurring gaps detected in recent analyses.");

  return { avgQuality, severityCounts, strengths, gaps, completedCount: completed.length };
}

const statusColors = {
  completed: "bg-green-500/20 text-green-300 border border-green-500/30",
  failed: "bg-red-500/20 text-red-300 border border-red-500/30",
  running: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  pending: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
};

function JobResultPage() {
  const { jobId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalysisRows() {
      setLoading(true);
      setError("");

      try {
        const history = getStoredAnalysisHistory({ limit: 20 });
        const jobMeta = new Map();

        for (const item of history) {
          jobMeta.set(item.jobId, { fileId: item.fileId, updatedAt: item.updatedAt });
        }

        if (jobId && !jobMeta.has(jobId)) {
          jobMeta.set(jobId, { fileId: null, updatedAt: Date.now() });
        }

        const jobIds = Array.from(jobMeta.keys());
        if (jobIds.length === 0) {
          if (!cancelled) setRows([]);
          return;
        }

        const playgroundRes = await getPlaygrounds();
        const playgrounds = normalizePlaygrounds(playgroundRes);
        const fileInfoMap = new Map();

        await Promise.all(
          playgrounds.map(async (playground) => {
            try {
              const filesRes = await getFiles(playground.id);
              const files = normalizeFiles(filesRes);
              for (const file of files) {
                fileInfoMap.set(file.id, {
                  fileName: file.name,
                  language: file.language,
                  playgroundName: playground.name,
                  playgroundId: playground.id,
                });
              }
            } catch {}
          }),
        );

        const settledRows = await Promise.allSettled(
          jobIds.map(async (id) => {
            const meta = jobMeta.get(id) || {};
            let statusData;
            try {
              statusData = await getJobStatus(id);
            } catch (statusError) {
              if (isNotFoundError(statusError)) return null;
              throw statusError;
            }

            const status = String(statusData?.status || "unknown").toLowerCase();
            let result = null;
            if (status === "completed") {
              try { result = await getJobResult(id); } catch {}
            }

            const fileId = result?.fileId || meta.fileId || null;
            const fileInfo = fileId ? fileInfoMap.get(fileId) : null;
            const findings = Array.isArray(result?.findings) ? result.findings : [];
            const summary = result?.summary || { risk_level: "low", overall_quality: 0 };

            return {
              jobId: id,
              status,
              fileId,
              summary,
              findings,
              counts: countBySeverity(findings),
              updatedAt: meta.updatedAt || 0,
              fileName: fileInfo?.fileName || "Unknown file",
              language: fileInfo?.language || "unknown",
              playgroundName: fileInfo?.playgroundName || "Unknown playground",
              playgroundId: fileInfo?.playgroundId || null,
            };
          }),
        );

        const resolvedRows = settledRows
          .filter((item) => item.status === "fulfilled" && item.value)
          .map((item) => item.value);
        resolvedRows.sort((a, b) => b.updatedAt - a.updatedAt);

        if (!cancelled) setRows(resolvedRows);
      } catch (loadError) {
        if (!cancelled) setError(loadError?.message || "Failed to load analysis history.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAnalysisRows();
    return () => { cancelled = true; };
  }, [jobId]);

  const insights = useMemo(() => buildInsights(rows), [rows]);

  return (
    <section className="w-full max-w-7xl mx-auto px-6 pb-12 text-white">
      {/* Page header */}
      <div className="pt-8 mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9fb1c8] mb-2">
          My Analysis
        </p>
        <h1 className="m-0 text-3xl sm:text-4xl font-bold font-heading tracking-tight">
          Recent Analysis & Skill Signals
        </h1>
        <p className="mt-3 text-[#a8b8d0] max-w-2xl">
          Track your latest runs, identify where your code is strong, and focus on recurring weakness areas from real findings.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Insight cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Completed Runs", value: insights.completedCount },
          { label: "Avg Quality", value: `${insights.avgQuality}/100` },
          { label: "Critical Issues", value: insights.severityCounts.critical, danger: insights.severityCounts.critical > 0 },
          { label: "Major Issues", value: insights.severityCounts.major, warn: insights.severityCounts.major > 0 },
        ].map(({ label, value, danger, warn }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-[#141414] px-5 py-4"
          >
            <p className="text-xs text-[#9fb1c8] font-semibold uppercase tracking-wide mb-1">{label}</p>
            <p className={cn(
              "text-2xl font-bold",
              danger ? "text-red-400" : warn ? "text-yellow-400" : "text-white"
            )}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Strengths / Gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-green-400 mb-3">
            Where You Do Well
          </h2>
          <ul className="space-y-2">
            {insights.strengths.map((item, idx) => (
              <li key={`strength-${idx}`} className="text-sm text-[#c8e6c9] flex gap-2">
                <span className="text-green-400 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-red-400 mb-3">
            Where You Lack
          </h2>
          <ul className="space-y-2">
            {insights.gaps.map((item, idx) => (
              <li key={`gap-${idx}`} className="text-sm text-[#ffcdd2] flex gap-2">
                <span className="text-red-400 shrink-0">✗</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent analyses */}
      <div>
        <h2 className="text-xl font-bold font-heading mb-5">Recent Analyses</h2>

        {loading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 rounded-2xl border border-white/10 bg-[#141414] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#141414] p-8 text-center">
            <p className="text-[#a8b8d0] text-sm">
              No recent analysis found yet. Run analysis from Playground to populate this page.
            </p>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div className="space-y-3">
            {rows.map((row) => (
              <Link
                key={row.jobId}
                to={`/analyze/my-analysis/${row.jobId}`}
                className="block rounded-2xl border border-white/10 bg-[#141414] p-5 hover:border-white/30 hover:bg-[#1a1a1a] transition-all duration-200 no-underline group"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                      {row.fileName}
                    </p>
                    <p className="text-xs text-[#9fb1c8] mt-0.5">
                      {row.playgroundName} &middot; {row.language}
                    </p>
                  </div>
                  <span className={cn(
                    "shrink-0 text-[11px] font-bold uppercase px-2 py-1 rounded-md",
                    statusColors[row.status] || "bg-white/10 text-white border border-white/10"
                  )}>
                    {row.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-[#9fb1c8] mb-3">
                  <span>Risk: <span className="font-semibold text-white">{row.summary?.risk_level || "low"}</span></span>
                  <span>Quality: <span className="font-semibold text-white">{row.summary?.overall_quality ?? 0}/100</span></span>
                  <span>Critical: <span className={cn("font-semibold", row.counts.critical > 0 ? "text-red-400" : "text-white")}>{row.counts.critical}</span></span>
                  <span>Major: <span className={cn("font-semibold", row.counts.major > 0 ? "text-yellow-400" : "text-white")}>{row.counts.major}</span></span>
                  <span>Minor: <span className="font-semibold text-blue-400">{row.counts.minor}</span></span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-[#64748b]">
                    Last tracked: {formatDate(row.updatedAt)}
                  </p>
                  {row.playgroundId ? (
                    <Link
                      to={`/analyze/playground/${row.playgroundId}?fileId=${encodeURIComponent(row.fileId || "")}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 border border-amber-400/30 hover:border-amber-400/60 px-3 py-1 rounded-full transition-colors no-underline"
                    >
                      Open in Playground →
                    </Link>
                  ) : (
                    <span className="text-xs text-[#64748b]">Playground not available</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default JobResultPage;
