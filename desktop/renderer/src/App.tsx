import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import ContentArea from './components/ContentArea'
import ChatPanel from './components/ChatPanel'
import { MOCK_SESSIONS } from './mock'

export default function App(): JSX.Element {
  const [activeSessionId, setActiveSessionId] = useState<string>('s1')
  const activeSession = MOCK_SESSIONS.find((s) => s.id === activeSessionId)

  return (
    <div className="app-shell">
      <aside className="panel panel-sidebar">
        <Sidebar activeSessionId={activeSessionId} onSelectSession={setActiveSessionId} />
      </aside>

      <div className="main-column">
        <Topbar title={activeSession?.title ?? ''} />
        <div className="main-row">
          <main className="panel panel-content">
            <ContentArea sessionId={activeSessionId} />
          </main>
          <aside className="panel panel-chat">
            <ChatPanel sessionId={activeSessionId} />
          </aside>
        </div>
      </div>
    </div>
  )
}
