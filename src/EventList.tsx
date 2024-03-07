import { StyleSheet, Text, View } from 'react-native'

export default function EventList({ events }: { events: { type: string; data?: string }[] }) {
  return (
    <View style={styles.results}>
      {events.map((ev, i) => {
        return (
          <View key={`ev.type.${i}`} style={styles.resultItem}>
            <Text>type: {ev.type}</Text>
            {'data' in ev && <Text>data: {ev.data}</Text>}
          </View>
        )
      })}
    </View>
  )
}
const styles = StyleSheet.create({
  results: {
    width: '100%',
    paddingHorizontal: 20,
  },
  resultItem: {
    borderWidth: 1,
    width: '100%',
  },
})
