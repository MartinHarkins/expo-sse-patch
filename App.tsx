import { Button, ScrollView, StyleSheet, Text, View } from 'react-native'

import EventList from './src/EventList'
import { useEventSource } from './src/useEventSource'

export default function App() {
  const { events, clearEvents, connect, close } = useEventSource()

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text>Press the button to open up the connexion to the SSE server (mercure)</Text>
        <Button title="Open New Connexion" onPress={() => connect()} />
        <Button title="Close Connexion" onPress={() => close()} />

        <EventList events={events} />

        <Button title="Clear Events" onPress={() => clearEvents()} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
})
