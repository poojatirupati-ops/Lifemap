// Dev only: wipes the content collections (not users) and loads src/seed/content.json again. Run: npm run seed
// Deployed stages are seeded once by the seed migration, which never wipes.
import { getPayload } from 'payload'
import config from '@payload-config'
import { SEEDED, seedContent } from './seed/load'

const payload = await getPayload({ config })
for (const collection of SEEDED)
  await payload.delete({ collection, where: { id: { exists: true } } })

const email = process.env.SEED_STAFF_EMAIL
const password = process.env.SEED_STAFF_PASSWORD
if (
  email &&
  password &&
  !(await payload.find({ collection: 'users', where: { email: { equals: email } } })).totalDocs
)
  await payload.create({ collection: 'users', data: { email, password } })

await seedContent(payload)
process.exit(0)
