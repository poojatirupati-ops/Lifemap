// Lambda cron (sst.config.ts CmsJobs): runs Payload's queued jobs (scheduled publish), since autoRun cannot run on Lambda.
export const handler = async () => {
  const res = await fetch(`${process.env.CMS_URL}/api/payload-jobs/run`, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  })
  if (!res.ok) throw new Error(`payload-jobs/run: ${res.status}`)
}
