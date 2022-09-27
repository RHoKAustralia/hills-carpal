import React, { FormEvent } from 'react';
import Link from 'next/link';

import './poll.css';
import isAuthedWithRole from '../../../../src/common/redirect-if-no-role';
import { AuthContext } from '../../../../src/client/auth';
import {
  CompletePayload,
  MobilityPermit,
  PickupLateness,
  SatisfactionLevel,
} from '../../../../src/common/model';

interface Props {
  rideId: string;
}

type SubmitState = 'form' | 'saving' | 'done' | 'error';
type State = {
  submitState: SubmitState;
  mobilityPermitUsed: boolean;
} & Partial<Omit<CompletePayload, 'mobilityPermit'>>;

export default class Poll extends React.Component<Props, State> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  state: State = {
    submitState: 'form',
    mobilityPermitUsed: false,
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

  completeRide = (e: FormEvent) => {
    e.preventDefault();

    this.setState({
      submitState: 'saving',
    });

    const payload: CompletePayload = {
      lateness: this.state.lateness,
      satisfaction: this.state.satisfaction,
      communicationsIssues: this.state.communicationsIssues,
      mobilityPermitUsedPickup: this.state.mobilityPermitUsedPickup || false,
      mobilityPermitUsedDropOff: this.state.mobilityPermitUsedDropOff || false,
      mobilityPermitUsedOtherAddress: this.state.mobilityPermitUsedOtherAddress,
      reimbursementAmount: this.state.reimbursementAmount,
      anythingElse: this.state.anythingElse,
    };

    fetch(`/api/rides/${this.props.rideId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (res.ok) {
          this.setState({
            submitState: 'done',
          });
        } else {
          throw new Error('Request returned ' + res.status);
        }
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
      <div className="poll row justify-content-center">
        {(() => {
          if (this.state.submitState !== 'done') {
            return (
              <div className="col-9">
                <div className="card">
                  <div className="card-header">
                    <h1>Submit Feedback</h1>
                  </div>

                  <form onSubmit={this.completeRide} className="card-body">
                    <div className="form-group">
                      <label>
                        <div>Tell us about the pickup *</div>
                        <select
                          required
                          onChange={(e) => {
                            this.setState({
                              lateness: e.currentTarget.value as PickupLateness,
                            });
                          }}
                          value={this.state.lateness}
                          className="custom-select"
                        >
                          <option></option>
                          <option value="onTime">
                            ON TIME (includes 10 minutes early to 5 minutes
                            late)
                          </option>
                          <option value="fiveMinutesLater">
                            More than 5 minutes LATE
                          </option>
                          <option value="didNotHappen">
                            Did NOT happen at all
                          </option>
                        </select>
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <div>
                          Overall, how satisfied are you about the Ride? *
                        </div>
                        <select
                          required
                          onChange={(e) => {
                            this.setState({
                              satisfaction: e.currentTarget
                                .value as SatisfactionLevel,
                            });
                          }}
                          value={this.state.satisfaction}
                          className="custom-select"
                        >
                          <option></option>
                          <option value="good">It was GOOD in every way</option>
                          <option value="ok">It was OK</option>
                          <option value="couldBeBetter">
                            It could have been better
                          </option>
                        </select>
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <div>Communication issues, if any</div>
                        <textarea
                          onChange={(e) => {
                            this.setState({
                              communicationsIssues: e.currentTarget.value,
                            });
                          }}
                          value={this.state.communicationsIssues}
                        />
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <div>
                          Was CarPal's Mobility Parking Scheme (MPS) Permit used
                          on this Ride? *
                        </div>
                        <select
                          required
                          onChange={(e) => {
                            this.setState({
                              mobilityPermitUsed:
                                e.currentTarget.value === 'true',
                            });
                          }}
                          value={
                            this.state.mobilityPermitUsed ? 'true' : 'false'
                          }
                          className="custom-select"
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </label>
                    </div>

                    {this.state.mobilityPermitUsed && (
                      <>
                        <div className="form-group">
                          <div>Permit used at:</div>

                          <label>
                            <input
                              type="checkbox"
                              name="permit-used-at-pick-up"
                              checked={this.state.mobilityPermitUsedPickup}
                              onChange={(e) => {
                                this.setState({
                                  mobilityPermitUsedPickup:
                                    e.currentTarget.checked,
                                });
                              }}
                            />
                            Pick Up
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              name="permit-used-at-drop-off"
                              checked={this.state.mobilityPermitUsedDropOff}
                              onChange={(e) => {
                                this.setState({
                                  mobilityPermitUsedDropOff:
                                    e.currentTarget.checked,
                                });
                              }}
                            />
                            Drop Off
                          </label>
                        </div>

                        <div className="form-group">
                          <label>
                            <div>
                              If the MPS was used at a "stop" on the Ride,
                              please tell us the street address or location:
                            </div>
                            <input
                              type="text"
                              onChange={(e) => {
                                this.setState({
                                  mobilityPermitUsedOtherAddress:
                                    e.currentTarget.value,
                                });
                              }}
                              value={this.state.mobilityPermitUsedOtherAddress}
                            />
                          </label>
                        </div>
                      </>
                    )}

                    <div className="form-group">
                      <label>
                        <div>Reimbursement amount you are claiming *</div>
                        <select
                          required
                          onChange={(e) => {
                            this.setState({
                              reimbursementAmount: Number.parseFloat(
                                e.currentTarget.value
                              ),
                            });
                          }}
                          value={this.state.reimbursementAmount?.toString()}
                          className="custom-select"
                        >
                          <option></option>
                          <option value="2.75">$2.75</option>
                          <option value="5.5">$5.50</option>
                          <option value="0">
                            No reimbursement needed just add points to my Ride
                            Credit Account
                          </option>
                        </select>
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <div>Anything else about the ride goes here</div>
                        <textarea
                          onChange={(e) => {
                            this.setState({
                              anythingElse: e.currentTarget.value,
                            });
                          }}
                          value={this.state.anythingElse}
                        />
                      </label>
                    </div>

                    <div className="form-group">
                      {this.state.submitState === 'saving' && (
                        <img
                          alt="loader"
                          className="loader"
                          src="/loader.svg"
                        />
                      )}
                      {this.state.submitState === 'error' && (
                        <span>Error, please try again.</span>
                      )}
                      {(this.state.submitState === 'form' ||
                        this.state.submitState === 'error') && (
                        <button className="btn btn-success" type="submit">
                          Submit
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            );
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
