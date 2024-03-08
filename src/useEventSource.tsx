import { EventSource } from 'event-source-polyfill'
import { useState } from 'react'

// the mercure endpoint for connecting with Event Source
const sseEndpoint = 'http://127.0.0.1:3000/streaming'

enum ReadyStateMap {
  WAITING = -1,
  CONNECTING = 0,
  OPEN = 1,
  CLOSED = 2,
}

const connectAndOpenSSE = (onEvent: (ev: { type: string; data?: string; error?: string }) => void) => {
  console.log('starting event source')

  try {
    const eventSource: EventSource = new EventSource(sseEndpoint, {
      // @ts-expect-error - the typing is missing the headers
      headers: {
        // unused here but would work
        // Authorization: `Bearer ${apiToken}`,
      },
    })

    eventSource.addEventListener('message', (ev) => {
      console.log(`on message event readyState:${ReadyStateMap[eventSource.readyState]}`, ev.data)
      onEvent(ev)
    })
    eventSource.addEventListener('error', (ev) => {
      console.log(`got error event readyState:${ReadyStateMap[eventSource.readyState]}`, ev.error || ev)
      onEvent(ev)
    })
    eventSource.addEventListener('open', (ev) => {
      console.log(`got open event readyState:${ReadyStateMap[eventSource.readyState]}`)
      onEvent(ev)
    })

    return () => {
      console.log('closing event source')
      onEvent({ type: 'close' })

      // unsub
      eventSource.close()
    }
  } catch (e) {
    console.log('could not connect')

    return () => {}
  }
}

export const useEventSource = () => {
  const [events, setEvents] = useState<{ type: string; data?: string }[]>([])
  const [doClose, setDoClose] = useState<() => void>(() => {})

  return {
    connect: () => {
      doClose && doClose()

      try {
        const closeFn = connectAndOpenSSE((ev) => {
          setEvents((prev) => [...prev, ev])
        })
        setDoClose(() => closeFn)
      } catch (e) {
        setEvents((prev) => [...prev, { type: 'error' }])
        console.log('error connecting to open sse', e)
        throw e
      }
    },
    close: () => doClose && doClose(),
    events,
    clearEvents: () => setEvents([]),
  }
}
