# <img src="media/header.svg" width="800" align="center" alt="Type-safe Iframe ↔ Main Thread communication for good 🧐"/>


## Usage

Installation
```sh
npm i figma-messenger
# or using Yarn
yarn add figma-messenger
```

Quick usage example
```typescript
// Shared code between main thread and iframe
// shared.ts
interface IframeToMain {
  setVersion(name: string, value: number): void
}

interface MainToIframe {
  heyIframe(data: any): void
}

// main.ts
import { createMainThreadMessenger } from 'figma-messenger'

const mainMessenger = createMainThreadMessenger<MainToIframe, IframeToMain>()

// All good
mainMessenger.send('heyIframe', { any: 'data'})

// Error. Argument of type "unknownMessage" is not assignable to parameter of type "heyIframe".
mainMessenger.send('unknownMessage')
// Error. Expected 2 arguments, but got 1.
mainMessenger.send('heyIframe')

mainMessenger.on('setVersion', (name, value) => {
  console.log('setVersion', name, value)
})

// Remove all listeners
mainMessenger.off('setVersion')

// iframe.ts
import { createIframeMessenger, createMainThreadMessenger } from 'figma-messenger'

const iframeMessenger = createIframeMessenger<IframeToMain, MainToIframe>()

// All good
iframeMessenger.send('setVersion', 'initial', 1)

// Error. Expected 3 arguments, but got 2.
iframeMessenger.send('setVersion', 'initial')

iframeMessenger.on('heyIframe', sel => console.log(sel))

// Remove all listeners
iframeMessenger.off('heyIframe')
```

See more comprehensive live figma plugin example at [examples/figma-plugin](examples/figma-plugin). Files `shared/types.ts`, `app.tsx` and `main/index.ts`


## Api

### createIframeMessenger<MessagesToSend, MessagesToListen>() / createMainThreadMessenger<MessagesToSend, MessagesToListen>()

Creates a messenger instance for Iframe and Main Thread sides respectively. Take 2 type arguments:
`MessagesToSend` – messages to send signature
`MessagesToListen` – messages to receive signature

Example:
```typescript
// Messages sent from Iframe side, received on Main Thread side
interface IframeToMain {
  setVersion(name: string, value: number): void
}

// Messages sent from Main Thread side, received on Iframe side
interface MainToIframe {
  heyIframe(data: any): void
}

// somewhere in iframe code:
const iframeMessenger = createIframeMessenger<IframeToMain, MainToIframe>()

// somewhere in main thread code:
const mainThreadMessenger = createMainThreadMessenger<MainToIframe, IframeToMain>()
```

Single global listener under the hood makes it possible to create multiple instances, which won't conflict (but would handle messages with same name).
```typescript
const m1 = createIframeMessenger()
const m2 = createIframeMessenger()


// When fired on Main Thread side, "msg" message would be received by both handlers.
m1.on('msg', callback1)
m2.on('msg', callback2)
```

### .on(message: string, listener: (...arg: any[]) => void): void
Add listener for the message from opposite side. Callbacks can take no or multiple arguments.
```typescript
messenger.on('aMessage', handleMessage)
messenger.on('someMessage', (data) => doSomething(data))
messenger.on('otherMessage', (arg1, arg2) => hello(arg1, arg2))
messenger.on('noArgsMessage', () => world())
```

### .off(message: string, , listener: (...arg: any[]) => void): void
Remove one or all listeners for the message.
```typescript
// remove particular listener
messenger.off('aMessage', handleMessage)

// remove all listeners
messenger.on('someMessage')
```

### .send(message: string, ...data?: any[]): void
Send a message to an opposite side.
```typescript
// send message with one data item
messenger.on('someMessage', data)
// with multiple data items
messenger.on('otherMessage', arg1, arg2)
// or no data at all
messenger.send('noArgsMessage')
```

## License
MIT
