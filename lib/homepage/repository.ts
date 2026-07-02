import "server-only"

import { homepageSeed } from "./content"
import type { HomepageContent } from "./types"

type HomepageRow = { content: HomepageContent }

function hasValidSupabaseConfig(url: string | undefined, key: string | undefined) {
  if (!url || !key) return false

  try {
    const hostname = new URL(url).hostname
    return hostname.endsWith(".supabase.co") && !hostname.includes("your_project_ref")
  } catch {
    return false
  }
}

export async function getHomepage(): Promise<HomepageContent> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!hasValidSupabaseConfig(url, key)) return homepageSeed
  const serviceKey = key as string

  try {
    const response = await fetch(
      `${url}/rest/v1/homepage_versions?select=content&status=eq.PUBLISHED&order=published_at.desc&limit=1`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        next: { revalidate: 60, tags: ["homepage"] },
      },
    )

    if (!response.ok) return homepageSeed

    const rows = (await response.json()) as HomepageRow[]
    return rows[0]?.content ?? homepageSeed
  } catch {
    return homepageSeed
  }
}
