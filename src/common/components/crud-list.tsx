import React, { Component, ReactNode } from 'react';
import Link from 'next/link';
import { AuthContext, hasFacilitatorPrivilege } from '../../client/auth';
import router from 'next/router';

import {
  Client,
  OptionalClient,
  GenderPreference,
  CarType,
  Complete,
} from '../../../src/common/model';
import isAuthedWithRole from '../../../src/common/redirect-if-no-role';
import { isUndefined } from 'lodash';

const clientSort = (lhs, rhs) => {
  if (lhs.name < rhs.name) {
    return -1;
  }
  if (lhs.name > rhs.name) {
    return 1;
  }
  return 0;
};

interface Props<Model> {
  blankModel: Model;
  id: string;
  getData: () => Promise<Complete<Model>[]>;
  validate: (data: Model) => boolean | Error;
  update: (data: Model) => Promise<void>;
  create: (data: Model) => Promise<Complete<Model>>;
  delete: (id: number) => Promise<void>;
  children: (
    data: Model,
    buttons: () => JSX.Element,
    update: (model: Model) => void,
    save: () => void
  ) => ReactNode;
  onSelected?: (data: Model) => void;
  baseRoute: string;
}

interface State<Model> {
  current: Model;
  list: Model[];
  loading: boolean;
  loadingError: Error | null;
  saving: boolean;
  savingError: Error | null;
}

export default class CrudList<
  Model extends { id?: number; name?: string }
> extends Component<Props<Model>, State<Model>> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  state: State<Model> = {
    current: this.props.blankModel,
    list: [],
    loading: false,
    loadingError: null,
    saving: false,
    savingError: null,
  };

  componentDidMount() {
    if (!isAuthedWithRole(this.context.authState, 'facilitator')) {
      return;
    }

    this.fetchData();
  }

  componentDidUpdate = (prevProps: Props<Model>) => {
    if (this.props.id !== prevProps.id) {
      this.setCurrent(this.props.id);
    }
  };

  setCurrent(id: string) {
    const current =
      id === 'new'
        ? { ...this.props.blankModel }
        : this.find(Number.parseInt(id));

    if (!current) {
      throw new Error(
        `Tried to find model with id ${id} but it wasn't in list with ids ${this.state.list.map(
          (x) => x.id
        )}`
      );
    }

    this.setState({
      current,
    });
    this.props.onSelected ?? this.props.onSelected(current);
  }

  fetchData = async () => {
    this.setState({ loading: true, loadingError: null });

    try {
      const data = await this.props.getData();
      this.setState({ list: data, loading: false }, () => {
        if (data.length > 0) {
          if (this.props.id) {
            this.setCurrent(this.props.id);
          } else if (data.length > 0) {
            router.push(this.props.baseRoute + '/' + data[0].id);
          }
        }
      });
    } catch (e) {
      console.error(e);
      this.setState({ loadingError: e, loading: false });
    }
  };

  saveModel = async () => {
    this.setState({
      saving: true,
      savingError: null,
    });

    const validation = this.props.validate(this.state.current);

    if (validation instanceof Error) {
      this.setState({
        saving: false,
        savingError: validation,
      });
      return;
    }

    try {
      if (!isNaN(this.state.current.id)) {
        await this.props.update(this.state.current);
        this.updateCurrentAndList(this.state.current);
      } else {
        const withId = await this.props.create(this.state.current);

        this.updateCurrentAndList(withId);

        router.push(this.props.baseRoute + '/' + withId.id);
      }
      this.setState({
        saving: false,
      });
    } catch (e) {
      console.error(e);
      this.setState({
        saving: false,
        savingError: e,
      });
    }
  };

  find(id: number): Model | undefined {
    return this.state.list.find((c) => c.id === id);
  }

  newModel() {
    router.push(this.props.baseRoute + '/new');
  }

  updateCurrentAndList(model: Model) {
    const list = this.state.list;
    const modelInList = this.find(model.id);

    if (isUndefined(modelInList)) {
      list.push(model);
    } else {
      Object.assign(modelInList, model);
    }

    list.sort(clientSort);

    this.setState({ list, current: model });

    this.props.onSelected(model);
  }

  deleteCurrent = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isNaN(this.state.current.id)) {
      return;
    }

    const promptResult = confirm(
      `Are you sure you want to delete this person?`
    );

    if (promptResult) {
      await this.props.delete(this.state.current.id);
      let list = this.state.list;
      const idx = list.findIndex((c) => c.id === this.state.current.id);
      if (idx >= 0) {
        list.splice(idx, 1);
        this.setState({ list, current: this.props.blankModel });
      }
    }
  };

  buttons = () => {
    if (this.state.saving) {
      return <img alt="loader" className="loader" src="/loader.svg" />;
    } else {
      return (
        <React.Fragment>
          {this.state.savingError && (
            <span>
              Error: {this.state.savingError.message}. Please try again.
            </span>
          )}

          <button className="btn btn-primary" type="submit">
            Save
          </button>

          <button
            className="btn btn-danger ml-2"
            type="submit"
            onClick={this.deleteCurrent}
          >
            Delete
          </button>
        </React.Fragment>
      );
    }
  };

  updateCurrent = (model: Model) => {
    this.setState({ current: model });
  };

  render() {
    if (this.state.loading) {
      return <img alt="loader" className="loader" src="/loader.svg" />;
    }
    if (this.state.loadingError) {
      return (
        <span>
          Error: {this.state.loadingError.message}. Please refresh the page to
          try again.
        </span>
      );
    }

    return (
      <>
        <div className="row">
          <div className="col-12">
            <div className="btn-group">
              <button
                className="btn btn-primary"
                onClick={() => this.newModel()}
              >
                Create Client
              </button>
            </div>
          </div>
        </div>
        <br></br>
        <div className="row">
          <div className="col-3">
            <ul className="nav nav-fill nav-pills client-nav flex-column">
              {this.state.list.map((c) => {
                return (
                  <li key={c.id} className={`nav-item`}>
                    <Link
                      scroll={false}
                      href={`/facilitator/clients/[clientId]`}
                      as={`/facilitator/clients/${c.id}`}
                      className={`nav-link ${
                        c.id === this.state.current.id ? 'active' : ''
                      }`}
                    >
                      {c.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="col-9">
            {this.props.children(
              this.state.current,
              this.buttons,
              this.updateCurrent,
              this.saveModel
            )}
          </div>
        </div>
      </>
    );
  }
}
