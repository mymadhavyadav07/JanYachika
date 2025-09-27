import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const PortfolioWebView: React.FC = () => {
  return (
    <View style={styles.container}>
      <WebView 
        source={{ uri: 'https://janyachika.vercel.app/' }} 
        style={{ flex: 1 }}
        startInLoadingState={true}
        javaScriptEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PortfolioWebView;
