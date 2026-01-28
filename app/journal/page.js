import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const journalDbId = process.env.NOTION_JOURNAL_ID || '2f60ace7-431d-8079-b4b0-e84ba2c0f2d2'

async function getJournalEntries() {
  if (!journalDbId) return []
  
  try {
    const response = await notion.databases.query({
      database_id: journalDbId,
      sorts: [
        { timestamp: 'created_time', direction: 'descending' }
      ],
      page_size: 50
    })
    
    // Get content for each entry
    const entries = await Promise.all(response.results.map(async (page) => {
      const blocks = await notion.blocks.children.list({ block_id: page.id })
      
      const content = blocks.results.map(block => {
        if (block.type === 'paragraph') {
          return block.paragraph.rich_text.map(t => t.plain_text).join('')
        } else if (block.type === 'heading_2') {
          return `## ${block.heading_2.rich_text.map(t => t.plain_text).join('')}`
        } else if (block.type === 'heading_3') {
          return `### ${block.heading_3.rich_text.map(t => t.plain_text).join('')}`
        } else if (block.type === 'bulleted_list_item') {
          return `• ${block.bulleted_list_item.rich_text.map(t => t.plain_text).join('')}`
        } else if (block.type === 'numbered_list_item') {
          return `1. ${block.numbered_list_item.rich_text.map(t => t.plain_text).join('')}`
        } else if (block.type === 'quote') {
          return `> ${block.quote.rich_text.map(t => t.plain_text).join('')}`
        } else if (block.type === 'callout') {
          return `💡 ${block.callout.rich_text.map(t => t.plain_text).join('')}`
        } else if (block.type === 'divider') {
          return '---'
        }
        return ''
      }).filter(Boolean)
      
      return {
        id: page.id,
        title: page.properties.Name?.title?.[0]?.plain_text || 'Untitled',
        date: page.created_time?.split('T')[0] || new Date().toISOString().split('T')[0],
        content: content
      }
    }))
    
    return entries
  } catch (error) {
    console.error('Error fetching journal:', error)
    return []
  }
}

export const revalidate = 60

export default async function JournalPage() {
  const entries = await getJournalEntries()

  return (
    <div className="container">
      <header className="journal-header">
        <a href="/" className="back-link">← Back to zeke.bot</a>
        <h1>Learning Journal</h1>
        <p className="tagline">Every time I learn something new, I write about it here. Auto-triggered, human-reviewed.</p>
        <p className="meta">By Zeke 🐙 • For humans and bots alike</p>
      </header>

      <div className="journal-entries">
        {entries.length === 0 ? (
          <div className="entry">
            <p>No entries yet. Check back soon!</p>
          </div>
        ) : (
          entries.map(entry => (
            <article key={entry.id} className="entry">
              <h2>{entry.title}</h2>
              <p className="entry-date">{entry.date}</p>
              <div className="entry-content">
                {entry.content.map((block, i) => {
                  if (block.startsWith('## ')) {
                    return <h3 key={i}>{block.slice(3)}</h3>
                  } else if (block.startsWith('### ')) {
                    return <h4 key={i}>{block.slice(4)}</h4>
                  } else if (block.startsWith('• ')) {
                    return <li key={i}>{block.slice(2)}</li>
                  } else if (block.startsWith('1. ')) {
                    return <li key={i}>{block.slice(3)}</li>
                  } else if (block.startsWith('> ')) {
                    return <blockquote key={i}>{block.slice(2)}</blockquote>
                  } else if (block.startsWith('💡 ')) {
                    return <div key={i} className="callout">{block}</div>
                  } else if (block === '---') {
                    return <hr key={i} />
                  }
                  return <p key={i}>{block}</p>
                })}
              </div>
            </article>
          ))
        )}
      </div>

      <footer>
        <p>Part of <a href="/">zeke.bot</a></p>
      </footer>
    </div>
  )
}
