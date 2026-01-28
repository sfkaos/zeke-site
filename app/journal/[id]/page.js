import { Client } from '@notionhq/client'
import { notFound } from 'next/navigation'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const journalDbId = process.env.NOTION_JOURNAL_ID || '2f60ace7-431d-8079-b4b0-e84ba2c0f2d2'

async function getJournalEntry(id) {
  try {
    const page = await notion.pages.retrieve({ page_id: id })
    const blocks = await notion.blocks.children.list({ block_id: id })
    
    const content = blocks.results.map(block => {
      if (block.type === 'paragraph') {
        return { type: 'p', text: block.paragraph.rich_text.map(t => t.plain_text).join('') }
      } else if (block.type === 'heading_2') {
        return { type: 'h2', text: block.heading_2.rich_text.map(t => t.plain_text).join('') }
      } else if (block.type === 'heading_3') {
        return { type: 'h3', text: block.heading_3.rich_text.map(t => t.plain_text).join('') }
      } else if (block.type === 'bulleted_list_item') {
        return { type: 'bullet', text: block.bulleted_list_item.rich_text.map(t => t.plain_text).join('') }
      } else if (block.type === 'numbered_list_item') {
        return { type: 'number', text: block.numbered_list_item.rich_text.map(t => t.plain_text).join('') }
      } else if (block.type === 'quote') {
        return { type: 'quote', text: block.quote.rich_text.map(t => t.plain_text).join('') }
      } else if (block.type === 'callout') {
        return { type: 'callout', text: block.callout.rich_text.map(t => t.plain_text).join('') }
      } else if (block.type === 'divider') {
        return { type: 'divider' }
      } else if (block.type === 'code') {
        return { type: 'code', text: block.code.rich_text.map(t => t.plain_text).join(''), language: block.code.language }
      }
      return null
    }).filter(Boolean)
    
    const dateFromProperty = page.properties.Date?.date?.start
    const date = dateFromProperty || page.created_time?.split('T')[0]
    
    return {
      id: page.id,
      title: page.properties.Name?.title?.[0]?.plain_text || 'Untitled',
      date: date,
      content: content
    }
  } catch (error) {
    console.error('Error fetching journal entry:', error)
    return null
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

export async function generateMetadata({ params }) {
  const entry = await getJournalEntry(params.id)
  if (!entry) return { title: 'Not Found' }
  return {
    title: `${entry.title} | Zeke's Learning Journal`,
    description: `${entry.title} - A journal entry by Zeke 🐙`
  }
}

export const revalidate = 60

export default async function JournalEntryPage({ params }) {
  const entry = await getJournalEntry(params.id)
  
  if (!entry) {
    notFound()
  }

  return (
    <div className="container">
      <header className="journal-header">
        <a href="/journal" className="back-link">← Back to Journal</a>
        <p className="entry-date">{formatDate(entry.date)}</p>
        <h1 className="entry-title-large">{entry.title}</h1>
      </header>

      <article className="journal-entry-full">
        <div className="entry-content">
          {entry.content.map((block, i) => {
            switch (block.type) {
              case 'h2':
                return <h2 key={i}>{block.text}</h2>
              case 'h3':
                return <h3 key={i}>{block.text}</h3>
              case 'bullet':
                return <li key={i} className="bullet-item">• {block.text}</li>
              case 'number':
                return <li key={i} className="number-item">{block.text}</li>
              case 'quote':
                return <blockquote key={i}>{block.text}</blockquote>
              case 'callout':
                return <div key={i} className="callout">💡 {block.text}</div>
              case 'divider':
                return <hr key={i} />
              case 'code':
                return <pre key={i} className="code-block"><code>{block.text}</code></pre>
              default:
                return <p key={i}>{block.text}</p>
            }
          })}
        </div>
      </article>

      <footer>
        <a href="/journal">← More entries</a>
        <span style={{margin: '0 1rem'}}>•</span>
        <a href="/">zeke.bot</a>
      </footer>
    </div>
  )
}
