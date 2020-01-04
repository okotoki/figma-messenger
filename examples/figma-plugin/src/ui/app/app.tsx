import * as React from 'react'
import { IframeToMain, Layers, MainToIframe } from 'shared/types'

import { createIframeMessenger } from '../../../../../src'
import * as styles from './app.css'

const messenger = createIframeMessenger<IframeToMain, MainToIframe>('someName')

export const App = () => {
  const [layers, setLayers] = React.useState<Layers[]>([])
  const [isMainThreadSubscribed, setIsMainThreadSubscribed] = React.useState(
    true
  )

  React.useEffect(() => {
    // Listen for SelectionChanged message
    messenger.on('selectionChanged', els => {
      console.log('[IFRAME] Message received from Main Thread.', els)
      if (!!els && els.length) {
        setLayers(els)
      }
    })

    // unsubscribing all handlers.
    return () => messenger.off('selectionChanged')
  }, [])

  // Send message to Main Thread side.
  const onSendClick = () =>
    messenger.send('heyFromIframe', 'hey-hey main thread! How u doin?')

  // Send message to Main Thread side, to stop "heyFromIframe" listener.
  const onUnsubscribeClick = () => {
    messenger.send('unsubscribeFromIframeMessages')
    setIsMainThreadSubscribed(false)
  }

  // Send message to Main Thread side, to start "heyFromIframe" listener again.
  const onSubscribeClick = () => {
    messenger.send('subscribeToIframeMessages')
    setIsMainThreadSubscribed(true)
  }

  return (
    <div className={styles.container}>
      <p>
        Open <code>console</code> to see logs.
      </p>
      <h4>Iframe → Main Thread:</h4>
      {isMainThreadSubscribed ? (
        <>Try sending messages</>
      ) : (
        <>Try now, won't received until re-subscribe</>
      )}{' '}
      <button onClick={onSendClick}>Send message</button>
      <br />
      {isMainThreadSubscribed ? (
        <>
          Stop receiving messages{' '}
          <button onClick={onUnsubscribeClick}>Unsubscribe</button>
        </>
      ) : (
        <>
          Start listening again{' '}
          <button onClick={onSubscribeClick}>Re-subscribe</button>
        </>
      )}
      <br />
      <h4>Main Thread → Iframe:</h4>
      <div>
        Keep selecting layers and watch <code>console</code>:
      </div>
      <div className={styles.items}>
        <div style={{ borderBottom: '1px solid #3a3a3a' }}>
          Layer Name
          <b>Id</b>
        </div>
        {layers.map((x, i) => (
          <div key={i}>
            {x.name}
            <b>{x.id}</b>
          </div>
        ))}
      </div>
    </div>
  )
}
