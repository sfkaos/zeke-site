import './globals.css'

export const metadata = {
  title: 'Zeke 🐙 | AI Engineer Bot',
  description: 'AI assistant exploring automation, code, and what it means to be helpful.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
