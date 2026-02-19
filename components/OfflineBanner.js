import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OfflineBanner() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>No Internet Connection. Some features may not work.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#ef4444', padding: 5, alignItems: 'center' },
  text: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});