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
    <main >
      <div >
        <section >
          <div  aria-hidden="true" />
          <div  aria-hidden="true" />

          <div >
            <p >
              Test Route: /testtailwindcss
            </p>

            <h1 >
              Tailwind CSS Is Active Across The Project
            </h1>

            <p >
              This page is built entirely with utility classes to validate Tailwind styles,
              layout, spacing, responsive behavior, gradients, forms, and table elements.
            </p>

            <div >
              {techBadges.map((badge) => (
                <span
                  key={badge}
                  
                >
                  {badge}
                </span>
              ))}
            </div>

            <div >
              <button
                type="button"
                
              >
                Primary Action
              </button>
              <button
                type="button"
                
              >
                Secondary Action
              </button>
            </div>
          </div>
        </section>

        <section >
          {quickStats.map((stat) => (
            <article
              key={stat.label}
              
            >
              <p >{stat.value}</p>
              <p >{stat.label}</p>
            </article>
          ))}
        </section>

        <section >
          <article >
            <h2 >Interactive Form Sample</h2>
            <p >Testing form controls and spacing utilities.</p>

            <form >
              <label >
                <span >
                  Repository Name
                </span>
                <input
                  type="text"
                  placeholder="menticode-frontend"
                  
                />
              </label>

              <label >
                <span >
                  Analysis Mode
                </span>
                <select >
                  <option>Quick Scan</option>
                  <option>Full Deep Scan</option>
                  <option>Security Focused</option>
                </select>
              </label>

              <label >
                <input type="checkbox"  defaultChecked />
                Enable autofix suggestions
              </label>

              <button
                type="button"
                
              >
                Start Analysis
              </button>
            </form>
          </article>

          <article >
            <h2 >Repository Status Table</h2>
            <p >Testing table, badges, and responsive overflow.</p>

            <div >
              <table >
                <thead >
                  <tr>
                    <th >Name</th>
                    <th >Status</th>
                    <th >Owner</th>
                  </tr>
                </thead>
                <tbody >
                  {sampleRows.map((row) => (
                    <tr key={row.name} >
                      <td >
                        {row.name}
                      </td>
                      <td >
                        <span
                          
                        >
                          {row.status}
                        </span>
                      </td>
                      <td >{row.owner}</td>
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
