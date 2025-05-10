import React, { ErrorInfo } from 'react';
import { Icon } from './Icon';
import { Column } from '~/layout';
import { Button } from './Button';

interface Props {
  onClearLocalStorage: () => void;
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class TopLevelErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): State {
    console.error(error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Column>
          <h2>Oh no!</h2>
          <p>There seems to have been an issue</p>
          <p>
            If refreshing the page doesn't fix things, click the below button to
            clear local storage
          </p>
          <Button
            variant="warning"
            icon={<Icon name="PriorityHigh" />}
            onClick={this.props.onClearLocalStorage}
          >
            Clear storage and reload
          </Button>
        </Column>
      );
    }

    return this.props.children;
  }
}
