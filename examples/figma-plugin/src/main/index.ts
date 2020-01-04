import { IframeToMain, MainToIframe } from 'shared/types'

import { createMainThreadMessenger } from '../../../../src'

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
  width: 400,
  height: 300
})

// Create named messenger on the Main Thread side
const messenger = createMainThreadMessenger<MainToIframe, IframeToMain>(
  'someName'
)

// create global messenger
const messenger2 = createMainThreadMessenger<MainToIframe, IframeToMain>()
messenger2.on('heyFromIframe', () => {
  console.log(
    'This won"t ever fire, as communication is between named messengers'
  )
})

// Handler for "heyFromIframe" message.
const handler = (msg: string) => {
  console.log('[MAIN THREAD] Message received from Iframe.', msg)
}

// Listen for "heyFromIframe" message
messenger.on('heyFromIframe', handler)

messenger.on('unsubscribeFromIframeMessages', () => {
  // Remove listener for "heyFromIframe" message from iframe
  messenger.off('heyFromIframe', handler)
})

messenger.on('subscribeToIframeMessages', () => {
  // Add listener for "heyFromIframe" message from iframe
  messenger.on('heyFromIframe', handler)
})

const sendSelection = (selection: readonly SceneNode[]) => {
  const sel = selection.map(({ name, id }) => ({
    name,
    id
  }))

  // Send current selection to Iframe.
  messenger.send('selectionChanged', sel)
}

sendSelection(figma.currentPage.selection)

figma.on('selectionchange', () => sendSelection(figma.currentPage.selection))
