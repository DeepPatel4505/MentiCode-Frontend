const techBadges = ["Tailwind v4", "Vite Plugin", "React Router", "Utility-First"];

const quickStats = [
  { label: "Components", value: "8" },
  { label: "Themes", value: "3" },
  { label: "Utilities", value: "100+" },
  { label: "Responsive", value: "Yes" },
];

const sampleRows = [
  { name: "Global Navbar", status: "Ready", owner: "Frontend Team" },
  { name: "Analyze Sidebar", status: "In Progress", owner: "Design Team" },
  { name: "Auth Views", status: "Ready", owner: "Platform Team" },
  { name: "Playground", status: "Planned", owner: "Analyzer Team" },
];

function statusClass(status) {
  if (status === "Ready") return "bg-emerald-100 text-emerald-700 ring-emerald-600/20";
  if (status === "In Progress") return "bg-amber-100 text-amber-700 ring-amber-600/20";
  return "bg-slate-100 text-slate-700 ring-slate-600/20";
}

function TestTailwindCss() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#10346b_0%,#071428_45%,#030711_100%)] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm sm:p-10">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" aria-hidden="true" />

          <div className="relative flex flex-col gap-6">
            <p className="inline-flex w-fit rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Test Route: /testtailwindcss
            </p>

            <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
              Tailwind CSS Is Active Across The Project
            </h1>

            <p className="max-w-2xl text-sm text-slate-200/80 sm:text-base">
              This page is built entirely with utility classes to validate Tailwind styles,
              layout, spacing, responsive behavior, gradients, forms, and table elements.
            </p>

            <div className="flex flex-wrap gap-2">
              {techBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-sky-400/20 px-3 py-1 text-xs font-semibold text-sky-100 ring-1 ring-inset ring-sky-300/40"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-400/30 transition hover:translate-y-[-1px] hover:bg-cyan-200"
              >
                Primary Action
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-300/40 bg-transparent px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                Secondary Action
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {quickStats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center shadow-lg"
            >
              <p className="text-xl font-black text-cyan-200 sm:text-2xl">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-slate-300">{stat.label}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-lg font-extrabold">Interactive Form Sample</h2>
            <p className="mt-1 text-sm text-slate-300">Testing form controls and spacing utilities.</p>

            <form className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Repository Name
                </span>
                <input
                  type="text"
                  placeholder="menticode-frontend"
                  className="w-full rounded-xl border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm outline-none ring-cyan-300/40 transition placeholder:text-slate-500 focus:ring"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Analysis Mode
                </span>
                <select className="w-full rounded-xl border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm outline-none ring-cyan-300/40 transition focus:ring">
                  <option>Quick Scan</option>
                  <option>Full Deep Scan</option>
                  <option>Security Focused</option>
                </select>
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input type="checkbox" className="h-4 w-4 accent-cyan-300" defaultChecked />
                Enable autofix suggestions
              </label>

              <button
                type="button"
                className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-white"
              >
                Start Analysis
              </button>
            </form>
          </article>

          <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-lg font-extrabold">Repository Status Table</h2>
            <p className="mt-1 text-sm text-slate-300">Testing table, badges, and responsive overflow.</p>

            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-700">
              <table className="min-w-full divide-y divide-slate-700 text-left text-sm">
                <thead className="bg-slate-800/80 text-xs uppercase tracking-wide text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  {sampleRows.map((row) => (
                    <tr key={row.name} className="hover:bg-slate-800/70">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-100">
                        {row.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(
                            row.status
                          )}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-300">{row.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

export default TestTailwindCss;
