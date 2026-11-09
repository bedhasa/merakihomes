import React from 'react';
import { Text, View } from 'react-native';
import { Button, C } from './ui';

type Props = React.PropsWithChildren;
type State = { error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={{ flex: 1, backgroundColor: C.canvas, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 }}>
        <Text style={{ color: C.navy, fontSize: 18, fontWeight: '900', textAlign: 'center' }}>Something went wrong</Text>
        <Text style={{ color: C.slate, fontSize: 13, lineHeight: 20, textAlign: 'center' }}>The last screen could not be shown. You can retry without losing your account session.</Text>
        <Button title="Try again" onPress={() => this.setState({ error: null })} />
      </View>
    );
  }
}
