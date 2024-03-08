import { EventSourcePolyfill, MessageEvent, NativeEventSource } from 'event-source-polyfill'
import { useEffect, useState } from 'react'

const EventSource = NativeEventSource || EventSourcePolyfill

// the mercure endpoint for connecting with Event Source
const sseEndpoint = 'http://127.0.0.1:3000/streaming'

const connectAndOpenSSE = (onEvent: (ev: { type: string; data?: string }) => void) => {
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
      console.log('on message event', ev.data)
      onEvent(ev)
    })
    eventSource.addEventListener('error', (ev) => {
      console.log('got error event')
      onEvent(ev)
    })
    eventSource.addEventListener('open', (ev) => {
      console.log('got open event')
      onEvent(ev)
    })

    return () => {
      console.log('closing event source')
      onEvent({ type: 'close' })

      // unsub
      eventSource.close()
    }
  } catch (e) {
    console.log('could not connect, please check you have run `adb reverse tcp:8080 tcp:8080`')

    return () => {}
  }
}

export const useEventSource = () => {
  const [events, setEvents] = useState<{ type: string; data?: string }[]>([])
  const [doClose, setDoClose] = useState<() => void>(() => {})

  return {
    connect: () => {
      doClose && doClose()

      const closeFn = connectAndOpenSSE((ev) => {
        setEvents((prev) => [...prev, ev])
      })

      setDoClose(() => closeFn)
    },
    close: () => doClose && doClose(),
    events,
    clearEvents: () => setEvents([]),
  }
}
