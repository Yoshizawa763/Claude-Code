import { useCallback, useState } from 'react'
import type { Screen } from './types'
import { AppStoreProvider, useApp } from './store/AppStore'
import { ComboProvider } from './hooks/useCombo'
import { ToastProvider } from './hooks/useToast'
import { Header } from './components/Header'
import { DemoWatermark } from './components/DemoWatermark'
import { FxLayer } from './components/FxLayer'
import { Toasts } from './components/Toasts'
import { ComboIndicator } from './components/ComboIndicator'
import { BadgeWatcher } from './components/BadgeWatcher'
import { DisclaimerModal } from './components/DisclaimerModal'
import { IdleScreen } from './screens/IdleScreen'
import { TableSetupScreen } from './screens/TableSetupScreen'
import { MenuScreen } from './screens/MenuScreen'
import { OrderCompleteScreen } from './screens/OrderCompleteScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { BillScreen } from './screens/BillScreen'

function Shell() {
  const { state } = useApp()
  const [screen, setScreen] = useState<Screen>('idle')
  const [disclaimer, setDisclaimer] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)

  const goMenu = useCallback(() => setScreen('menu'), [])
  const navigate = useCallback((s: Screen) => {
    setCartOpen(false)
    setScreen(s)
  }, [])

  const withHeader = screen === 'menu' || screen === 'history' || screen === 'bill'

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {withHeader && <Header screen={screen} onNavigate={navigate} onOpenCart={() => setCartOpen(true)} />}

      {screen === 'idle' && <IdleScreen onStart={() => setScreen(state.table ? 'menu' : 'setup')} />}
      {screen === 'setup' && <TableSetupScreen onDone={goMenu} />}
      {screen === 'menu' && <MenuScreen cartOpen={cartOpen} setCartOpen={setCartOpen} onOrderPlaced={() => setScreen('complete')} />}
      {screen === 'complete' && <OrderCompleteScreen onBack={goMenu} />}
      {screen === 'history' && <HistoryScreen onGoMenu={goMenu} />}
      {screen === 'bill' && <BillScreen />}

      <DisclaimerModal open={disclaimer} onClose={() => setDisclaimer(false)} />
      <BadgeWatcher />
      <ComboIndicator />
      <Toasts />
      <FxLayer />
      <DemoWatermark />
    </div>
  )
}

export default function App() {
  return (
    <AppStoreProvider>
      <ComboProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </ComboProvider>
    </AppStoreProvider>
  )
}
