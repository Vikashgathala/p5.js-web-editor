import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';
import * as IDEActions from '../actions/ide';
import * as preferenceActions from '../actions/preferences';
import * as projectActions from '../actions/project';

import PlayIcon from '../../../images/play.svg';
import StopIcon from '../../../images/stop.svg';
import PreferencesIcon from '../../../images/preferences.svg';
import EditableInput from './EditableInput';

class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.handleProjectNameSave = this.handleProjectNameSave.bind(this);
  }

  handleProjectNameSave(value) {
    const newProjectName = value.trim();
    this.props.setProjectName(newProjectName);
    if (this.props.project.id) {
      this.props.saveProject();
    }
  }

  canEditProjectName() {
    return (
      (this.props.owner &&
        this.props.owner.username &&
        this.props.owner.username === this.props.currentUser) ||
      !this.props.owner ||
      !this.props.owner.username
    );
  }

  render() {
    const playButtonClass = classNames({
      'toolbar__play-button': true,
      'toolbar__play-button--selected': this.props.isPlaying
    });
    const stopButtonClass = classNames({
      'toolbar__stop-button': true,
      'toolbar__stop-button--selected': !this.props.isPlaying
    });
    const preferencesButtonClass = classNames({
      'toolbar__preferences-button': true,
      'toolbar__preferences-button--selected': this.props.preferencesIsVisible
    });

    const canEditProjectName = this.canEditProjectName();

    return (
      <div className="toolbar">
        <button
          className="toolbar__play-sketch-button"
          onClick={() => {
            this.props.syncFileContent();
            this.props.startAccessibleSketch();
            this.props.setTextOutput(true);
            this.props.setGridOutput(true);
          }}
          aria-label={this.props.t('Toolbar.PlaySketchARIA')}
          disabled={this.props.infiniteLoop}
        >
          <PlayIcon focusable="false" aria-hidden="true" />
        </button>
        <button
          className={playButtonClass}
          onClick={() => {
            this.props.syncFileContent();
            this.props.startSketch();
          }}
          aria-label={this.props.t('Toolbar.PlayOnlyVisualSketchARIA')}
          title={this.props.t('Toolbar.PlaySketchARIA')}
          disabled={this.props.infiniteLoop}
        >
          <PlayIcon focusable="false" aria-hidden="true" />
        </button>
        <button
          className={stopButtonClass}
          onClick={this.props.stopSketch}
          aria-label={this.props.t('Toolbar.StopSketchARIA')}
          title={this.props.t('Toolbar.StopSketchARIA')}
        >
          <StopIcon focusable="false" aria-hidden="true" />
        </button>
        <div className="toolbar__autorefresh">
          <input
            id="autorefresh"
            className="checkbox__autorefresh"
            type="checkbox"
            checked={this.props.autorefresh}
            onChange={(event) => {
              this.props.setAutorefresh(event.target.checked);
            }}
          />
          <label htmlFor="autorefresh" className="toolbar__autorefresh-label">
            {this.props.t('Toolbar.Auto-refresh')}
          </label>
        </div>
        <div className="toolbar__project-name-container">
          <EditableInput
            value={this.props.project.name}
            disabled={!canEditProjectName}
            aria-label={this.props.t('Toolbar.EditSketchARIA')}
            inputProps={{
              maxLength: 128,
              'aria-label': this.props.t('Toolbar.NewSketchNameARIA')
            }}
            validate={(text) => text.trim().length > 0}
            onChange={this.handleProjectNameSave}
          />
          {(() => {
            if (this.props.owner) {
              return (
                <p className="toolbar__project-owner">
                  {this.props.t('Toolbar.By')}{' '}
                  <Link to={`/${this.props.owner.username}/sketches`}>
                    {this.props.owner.username}
                  </Link>
                </p>
              );
            }
            return null;
          })()}
        </div>
        <button
          className={preferencesButtonClass}
          onClick={this.props.openPreferences}
          aria-label={this.props.t('Toolbar.OpenPreferencesARIA')}
          title={this.props.t('Toolbar.OpenPreferencesARIA')}
        >
          <PreferencesIcon focusable="false" aria-hidden="true" />
        </button>
      </div>
    );
  }
}

Toolbar.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  preferencesIsVisible: PropTypes.bool.isRequired,
  stopSketch: PropTypes.func.isRequired,
  setProjectName: PropTypes.func.isRequired,
  openPreferences: PropTypes.func.isRequired,
  owner: PropTypes.shape({
    username: PropTypes.string
  }),
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string
  }).isRequired,
  infiniteLoop: PropTypes.bool.isRequired,
  autorefresh: PropTypes.bool.isRequired,
  setAutorefresh: PropTypes.func.isRequired,
  setTextOutput: PropTypes.func.isRequired,
  setGridOutput: PropTypes.func.isRequired,
  startSketch: PropTypes.func.isRequired,
  startAccessibleSketch: PropTypes.func.isRequired,
  saveProject: PropTypes.func.isRequired,
  currentUser: PropTypes.string,
  t: PropTypes.func.isRequired,
  syncFileContent: PropTypes.func.isRequired
};

Toolbar.defaultProps = {
  owner: undefined,
  currentUser: undefined
};

function mapStateToProps(state) {
  return {
    autorefresh: state.preferences.autorefresh,
    currentUser: state.user.username,
    infiniteLoop: state.ide.infiniteLoop,
    isPlaying: state.ide.isPlaying,
    owner: state.project.owner,
    preferencesIsVisible: state.ide.preferencesIsVisible,
    project: state.project
  };
}

const mapDispatchToProps = {
  ...IDEActions,
  ...preferenceActions,
  ...projectActions
};

export const ToolbarComponent = withTranslation()(Toolbar);
export default connect(mapStateToProps, mapDispatchToProps)(ToolbarComponent);
