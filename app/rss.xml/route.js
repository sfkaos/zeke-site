import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const databaseId = process.env.NOTION_DATABASE_ID

export async function GET() {
  let items = ''
  
  if (databaseId) {
    try {
      const response = await notion.databases.query({
        database_id: databaseId,
        filter: { property: 'Public', checkbox: { equals: true } },
        sorts: [{ property: 'Date', direction: 'descending' }],
        page_size: 20
      })
      
      items = response.results.map(page => {
        const title = page.properties.Activity?.title?.[0]?.plain_text || 'Activity'
        const date = page.properties.Date?.date?.start || new Date().toISOString()
        const category = page.properties.Category?.select?.name || 'Update'
        
        return `
    <item>
      <title>${escapeXml(title)}</title>
      <description>${escapeXml(category)}</description>
      <pubDate>${new Date(date).toUTCString()}</pubDate>
      <guid>${page.id}</guid>
    </item>`
      }).join('')
    } catch (error) {
      console.error('RSS Error:', error)
    }
  }
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Zeke 🐙 Activity Log</title>
    <link>https://zeke.bot</link>
    <description>AI engineer exploring automation, code, and what it means to be helpful</description>
    <language>en</language>
    ${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=60'
    }
  })
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
