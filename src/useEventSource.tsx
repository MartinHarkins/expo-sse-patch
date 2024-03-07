import { EventSourcePolyfill, MessageEvent, NativeEventSource } from 'event-source-polyfill'
import { useEffect, useState } from 'react'

const EventSource = NativeEventSource || EventSourcePolyfill

// the mercure endpoint for connecting with Event Source
const sseEndpoint = 'http://127.0.0.1:8080/.well-known/mercure'

// topic is just a string (using this one as the base example from mercure)
const topic = 'https://example.com/my-private-topic'

// you can find the token at http://127.0.0.1:8080/.well-known/mercure/ui/
// in the Settings section => JWT
const apiToken =
  'eyJhbGciOiJIUzI1NiJ9.eyJtZXJjdXJlIjp7InB1Ymxpc2giOlsiKiJdLCJzdWJzY3JpYmUiOlsiaHR0cHM6Ly9leGFtcGxlLmNvbS9teS1wcml2YXRlLXRvcGljIiwie3NjaGVtZX06Ly97K2hvc3R9L2RlbW8vYm9va3Mve2lkfS5qc29ubGQiLCIvLndlbGwta25vd24vbWVyY3VyZS9zdWJzY3JpcHRpb25zey90b3BpY317L3N1YnNjcmliZXJ9Il0sInBheWxvYWQiOnsidXNlciI6Imh0dHBzOi8vZXhhbXBsZS5jb20vdXNlcnMvZHVuZ2xhcyIsInJlbW90ZUFkZHIiOiIxMjcuMC4wLjEifX19.KKPIikwUzRuB3DTpVw6ajzwSChwFw5omBMmMcWKiDcM'

const url = `${sseEndpoint}?topic=${encodeURI(topic)}`

const connectAndOpenSSE = (onEvent: (ev: { type: string; data?: string }) => void) => {
  console.log('starting event source')

  const eventSource: EventSource = new EventSource(url, {
    // @ts-expect-error - the typing is missing the headers
    headers: {
      Authorization: `Bearer ${apiToken}`,
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
