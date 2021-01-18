import React from 'react';
import Link from 'next/link';

import './poll.css';
import isAuthedWithRole from '../../../../src/common/redirect-if-no-role';
import { AuthContext } from '../../../../src/client/auth';

interface Props {
  rideId: string;
}
interface State {
  submitState: 'form' | 'saving' | 'done' | 'error';
  loadCount: number;
}

export default class Poll extends React.Component<Props, State> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  state: State = {
    submitState: 'form', // "form" | "saving" | "done" | "error"
    loadCount: 0,
  };

  static getInitialProps({ query }) {
    return {
      rideId: query.rideId && Number.parseInt(query.rideId),
    };
  }

  componentDidMount() {
    if (!isAuthedWithRole(this.context, 'driver')) {
      return;
    }
  }

  completeRide = () => {
    this.setState({
      submitState: 'saving',
    });

    fetch(`/api/rides/${this.props.rideId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(this.state),
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
      },
    })
      .then(() => {
        this.setState({
          submitState: 'done',
        });
      })
      .catch((e) => {
        console.error(e);
        this.setState({
          submitState: 'error',
        });
      });
  };

  render() {
    return (
      <div>
        {(() => {
          if (this.state.submitState === 'form') {
            return (
              <>
                <div className="poll-explanation">
                  Please complete the Google Form then{' '}
                  <button
                    className="btn btn-success"
                    disabled={this.state.loadCount < 4}
                    onClick={this.completeRide}
                  >
                    Click Here
                  </button>{' '}
                  when finished.
                </div>

                <iframe
                  src="https://docs.google.com/forms/d/e/1FAIpQLScdGx7Pk80YATeIkfI0geXMxdK4HzFqQ4Domvie5cj7yCPJmQ/viewform?embedded=true"
                  width="100%"
                  height="600"
                  onLoad={() => {
                    this.setState((state) => ({
                      loadCount: state.loadCount + 1,
                    }));
                  }}
                  frameBorder={0}
                  marginHeight={0}
                  marginWidth={0}
                >
                  Loading…
                </iframe>
              </>
            );
          } else if (this.state.submitState === 'saving') {
            return 'Saving...';
          } else if (this.state.submitState === 'error') {
            return 'Error';
          } else {
            return (
              <div>
                Thanks!{' '}
                <Link href="/driver/rides/find">
                  <a>Find another ride</a>
                </Link>
              </div>
            );
          }
        })()}
      </div>
    );
  }
}
