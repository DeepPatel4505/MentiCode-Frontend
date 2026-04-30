import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getFiles,
  getJobResult,
  getJobStatus,
  getPlaygrounds,
} from "../services/analyze.api";
import { getStoredAnalysisHistory } from "../queries/analysisQueries";
import { cn } from "../../../lib/utils";
import { CheckCircle, XCircle, AlertTriangle, Zap, ExternalLink, Clock } from "lucide-react";

function formatDate(timestamp) {
  if (!timestamp) return "Unknown";
  return new Date(timestamp).toLocaleString();
}

function countBySeverity(findings = []) {
  const counts = { critical: 0, major: 0, minor: 0 };
  for (const f of findings) {
    const s = String(f?.severity || "").toLowerCase();
    if (counts[s] !== undefined) counts[s] += 1;
  }
  return counts;
}

function isNotFoundError(err) {
  return String(err?.message || "").toLowerCase().includes("not found") ||
    String(err?.message || "").includes("404");
}

function normalizePlaygrounds(p) {
  if (Array.isArray(p)) return p;
  if (Array.isArray(p?.playgrounds)) return p.playgrounds;
  return [];
}

function normalizeFiles(p) {
  if (Array.isArray(p)) return p;
  if (Array.isArray(p?.files)) return p.files;
  return [];
}

function buildInsights(rows) {
  const completed = rows.filter((r) => r.status === "completed");
  const allFindings = completed.flatMap((r) => r.findings || []);
  const severityCounts = countBySeverity(allFindings);
  const qualityScores = completed
    .map((r) => Number(r.summary?.overall_quality || 0))
    .filter(Number.isFinite);
  const avgQuality = qualityScores.length
    ? Math.round(qualityScores.reduce((s, v) => s + v, 0) / qualityScores.length)
    : 0;

  const categoryCounts = allFindings.reduce((acc, f) => {
    const cat = String(f?.category || "general").toLowerCase();
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([c]) => c);

  const strengths = [];
  const gaps = [];

  if (completed.length >= 1) strengths.push(`Completed ${completed.length} analysis run(s).`);
  if (avgQuality >= 70) strengths.push(`Healthy average quality score (${avgQuality}/100).`);
  if (severityCounts.critical === 0 && completed.length > 0) strengths.push("No critical issues in recent analyses.");
  if (avgQuality < 60) gaps.push(`Quality score is trending low (${avgQuality}/100).`);
  if (severityCounts.critical > 0) gaps.push(`${severityCounts.critical} critical issue(s) need attention.`);
  if (severityCounts.major > 0) gaps.push(`${severityCounts.major} major issue(s) to address.`);
  if (topCategories.length > 0) gaps.push(`Most frequent areas: ${topCategories.join(", ")}.`);
  if (!strengths.length) strengths.push("Run more analyses to surface strengths.");
  if (!gaps.length) gaps.push("No major recurring gaps detected.");

  return { avgQuality, severityCounts, strengths, gaps, completedCount: completed.length };
}

const STATUS_STYLES = {
  completed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  failed:    "bg-red-500/15 text-red-400 border border-red-500/25",
  running:   "bg-violet-500/15 text-violet-400 border border-violet-500/25",
  pending:   "bg-amber-500/15 text-amber-400 border border-amber-500/25",
};

function JobResultPage() {
  const { jobId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [rows, setRows]       = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const history = getStoredAnalysisHistory({ limit: 20 });
        const jobMeta = new Map(history.map((h) => [h.jobId, { fileId: h.fileId, updatedAt: h.updatedAt }]));
        if (jobId && !jobMeta.has(jobId)) jobMeta.set(jobId, { fileId: null, updatedAt: Date.now() });

        const jobIds = Array.from(jobMeta.keys());
        if (!jobIds.length) { if (!cancelled) setRows([]); return; }

        const pgRes = await getPlaygrounds();
        const playgrounds = normalizePlaygrounds(pgRes);
        const fileInfoMap = new Map();

        await Promise.all(playgrounds.map(async (pg) => {
          try {
            const filesRes = await getFiles(pg.id);
            normalizeFiles(filesRes).forEach((f) => {
              fileInfoMap.set(f.id, { fileName: f.name, language: f.language, playgroundName: pg.name, playgroundId: pg.id });
            });
          } catch {}
        }));

        const settled = await Promise.allSettled(jobIds.map(async (id) => {
          const meta = jobMeta.get(id) || {};
          let statusData;
          try { statusData = await getJobStatus(id); }
          catch (e) { if (isNotFoundError(e)) return null; throw e; }

          const status = String(statusData?.status || "unknown").toLowerCase();
          let result = null;
          if (status === "completed") { try { result = await getJobResult(id); } catch {} }

          const fileId   = result?.fileId || meta.fileId || null;
          const fileInfo = fileId ? fileInfoMap.get(fileId) : null;
          const findings = Array.isArray(result?.findings) ? result.findings : [];

          return {
            jobId: id, status, fileId,
            summary:       result?.summary || { risk_level: "low", overall_quality: 0 },
            findings,
            counts:        countBySeverity(findings),
            updatedAt:     meta.updatedAt || 0,
            fileName:      fileInfo?.fileName      || "Unknown file",
            language:      fileInfo?.language      || "unknown",
            playgroundName: fileInfo?.playgroundName || "Unknown playground",
            playgroundId:  fileInfo?.playgroundId  || null,
          };
        }));

        const resolved = settled
          .filter((s) => s.status === "fulfilled" && s.value)
          .map((s) => s.value)
          .sort((a, b) => b.updatedAt - a.updatedAt);

        if (!cancelled) setRows(resolved);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load analysis history.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [jobId]);

  const insights = useMemo(() => buildInsights(rows), [rows]);

  return (
    <section className="w-full max-w-5xl p-6 mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.1em] text-neutral-600 font-semibold">My Analysis</p>
        <h1 className="mt-1 text-xl font-semibold text-white tracking-tight">Recent Analysis & Skill Signals</h1>
        <p className="mt-1 text-sm text-neutral-500 max-w-2xl">
          Track your latest runs, identify where your code is strong, and focus on recurring weakness areas.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-red-500/30 bg-red-500/8 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {/* Insight stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Completed Runs",  value: insights.completedCount,           icon: CheckCircle,  cls: "text-emerald-400" },
          { label: "Avg Quality",     value: `${insights.avgQuality}/100`,       icon: Zap,          cls: "text-violet-400" },
          { label: "Critical Issues", value: insights.severityCounts.critical,   icon: XCircle,      cls: insights.severityCounts.critical > 0 ? "text-red-400" : "text-neutral-500" },
          { label: "Major Issues",    value: insights.severityCounts.major,      icon: AlertTriangle, cls: insights.severityCounts.major > 0 ? "text-amber-400" : "text-neutral-500" },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="rounded-lg border border-neutral-800 bg-neutral-900/80 px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("w-4 h-4", cls)} />
              <p className="text-[10px] text-neutral-600 font-semibold uppercase tracking-[0.08em]">{label}</p>
            </div>
            <p className={cn("text-2xl font-semibold", cls)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Strengths / Gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-400 mb-3">Where You Do Well</h2>
          <ul className="space-y-2">
            {insights.strengths.map((item, i) => (
              <li key={i} className="text-sm text-neutral-300 flex gap-2">
                <span className="text-emerald-400 shrink-0">✓</span>{item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-red-400 mb-3">Where You Can Improve</h2>
          <ul className="space-y-2">
            {insights.gaps.map((item, i) => (
              <li key={i} className="text-sm text-neutral-300 flex gap-2">
                <span className="text-red-400 shrink-0">✗</span>{item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent analyses list */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-4">Recent Analyses</h2>

        {loading && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 rounded-lg border border-neutral-800 bg-neutral-900/50 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-8 text-center">
            <Clock className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">No analyses yet. Run analysis from the Playground to populate this page.</p>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div className="space-y-2">
            {rows.map((row) => (
              <Link
                key={row.jobId}
                to={`/analyze/my-analysis/${row.jobId}`}
                className="group block rounded-lg border border-neutral-800 bg-neutral-900/80 p-4 hover:border-neutral-700 hover:bg-neutral-900 transition-all no-underline"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-200 truncate group-hover:text-violet-300 transition-colors">
                      {row.fileName}
                    </p>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      {row.playgroundName} · {row.language}
                    </p>
                  </div>
                  <span className={cn("shrink-0 text-[10px] font-semibold uppercase px-2 py-0.5 rounded", STATUS_STYLES[row.status] || "bg-neutral-800 text-neutral-400")}>
                    {row.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-neutral-600 mb-3">
                  <span>Risk: <span className="text-neutral-300 font-medium">{row.summary?.risk_level || "low"}</span></span>
                  <span>Quality: <span className="text-neutral-300 font-medium">{row.summary?.overall_quality ?? 0}/100</span></span>
                  <span>Critical: <span className={cn("font-medium", row.counts.critical > 0 ? "text-red-400" : "text-neutral-400")}>{row.counts.critical}</span></span>
                  <span>Major: <span className={cn("font-medium", row.counts.major > 0 ? "text-amber-400" : "text-neutral-400")}>{row.counts.major}</span></span>
                  <span>Minor: <span className="text-neutral-400 font-medium">{row.counts.minor}</span></span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-neutral-700">{formatDate(row.updatedAt)}</p>
                  {row.playgroundId && (
                    <span
                      onClick={(e) => { e.preventDefault(); window.location.href = `/analyze/playground/${row.playgroundId}?fileId=${encodeURIComponent(row.fileId || "")}`; }}
                      className="flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300 border border-violet-500/30 hover:border-violet-500/60 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      Open in Playground <ExternalLink className="w-3 h-3" />
                    </span>
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
