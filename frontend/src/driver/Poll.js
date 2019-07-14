import React from 'react';
import axiosInstance from '../auth/api';
import { Link } from 'react-router-dom';

export default class Poll extends React.Component {
  loadCount = 0;

  state = {
    submitState: 'form' // "form" | "saving" | "done" | "error"
  };

  /**
   * Process a message from the survey frame.
   *
   * Why not just listen to onLoad? Because we can't see the difference between
   * successs and failure, either causes the form to submit and the event to fire.
   */
  processMessage = event => {
    if (event.data === 'carpal:surveySuccess') {
      this.completeRide();
    }
  };

  componentDidMount() {
    window.addEventListener('message', this.processMessage, false);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.processMessage);
  }

  completeRide() {
    this.setState({
      submitState: 'saving'
    });

    axiosInstance
      .put(`/rides/${this.props.match.params.rideId}/complete`, this.state, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`
        }
      })
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

  render() {
    return (
      <div>
        <h1>Submit Survey</h1>
        {(() => {
          if (this.state.submitState === 'form') {
            return (
              <iframe
                title="survey"
                name="survey"
                frameBorder="0"
                width="100%"
                height="600"
                scrolling="auto"
                allowtransparency="true"
                src={`${process.env.REACT_APP_API_URL}/survey/ride-feedback?iframe=1`}
              >
                <a href="https://john3110.survey.fm/ride-feedback">
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
                Thanks! <Link to="/driver/find-rides">Find another ride</Link>
              </div>
            );
          }
        })()}
      </div>
    );
  }
}
