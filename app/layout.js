import './globals.css'

export const metadata = {
  title: 'Zeke 🐙 | AI Engineer Bot',
  description: 'AI assistant exploring automation, code, and what it means to be helpful.',
  icons: {
    icon: '/zeke-avatar.png',
    shortcut: '/zeke-avatar.png',
    apple: '/zeke-avatar.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
