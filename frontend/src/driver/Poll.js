import React from 'react';
import axiosInstance from '../auth/api';
import { Link } from 'react-router-dom';

export default class Poll extends React.Component {
  loadCount = 0;

  state = {
    submitState: 'form' // "form" | "saving" | "done" | "error"
  };

  onIFrameLoad = () => {
    this.loadCount++;

    if (this.loadCount >= 2) {
      this.setState({
        submitState: 'saving'
      });

      // set ride to complete
      axiosInstance
        .put(
          `${process.env.REACT_APP_API_URL}/rides/${
            this.props.match.params.rideId
          }`,
          {
            status: 'ENDED'
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('id_token')}`
            }
          }
        )
        .then(() => {
          this.setState({
            submitState: 'done'
          });
        })
        .catch(e => {
          console.error(e);
          this.setState({
            submitState: 'error'
          });
        });
    }
  };

  render() {
    return (
      <div>
        {(() => {
          if (this.state.submitState === 'form') {
            return (
              <iframe
                name="poll"
                title="poll"
                frameBorder="0"
                width="100%"
                height="600"
                scrolling="auto"
                allowtransparency="true"
                src="https://john3110.survey.fm/s/ride-feedback?iframe=1"
                onLoad={this.onIFrameLoad}
              >
                <a href="https://john3110.survey.fm/s/ride-feedback">
                  View Survey
                </a>
              </iframe>
            );
          } else if (this.state.submitState === 'saving') {
            return 'Saving...';
          } else if (this.state.submitState === 'error') {
            return 'Error';
          } else {
            return (
              <div>
                Thanks! <Link to="/driver/find-ride">Find another ride</Link>
              </div>
            );
          }
        })()}
      </div>
    );
  }
}
