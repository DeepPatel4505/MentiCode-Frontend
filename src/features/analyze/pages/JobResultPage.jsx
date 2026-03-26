import { useParams } from 'react-router'

function JobResultPage() {
  const { jobId } = useParams()

  return (
    <section className="job-result">
      <p className="job-result__eyebrow">MyAnalysis</p>
      <h1>Job Results & History</h1>
      <p className="job-result__summary">
        {jobId
          ? `Showing result data for job ${jobId}.`
          : 'Showing your latest analysis jobs and summary insights.'}
      </p>

      <div className="job-result__card">
        <div>
          <h3>Status</h3>
          <p>Completed</p>
        </div>
        <div>
          <h3>Critical Findings</h3>
          <p>0</p>
        </div>
        <div>
          <h3>Actionable Suggestions</h3>
          <p>3</p>
        </div>
      </div>
    </section>
  )
}

export default JobResultPage