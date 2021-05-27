/**
 * @file File for storing hotkey configuration.
 */

import mapValues from 'lodash-es/mapValues';
import PropTypes from 'prop-types';
import React from 'react';
import { configure as configureHotkeys, GlobalHotKeys } from 'react-hotkeys';
import { connect } from 'react-redux';

import { selectAllUAVFeatures, clearSelection } from '~/actions/map';
import { clearStoreAfterConfirmation } from '~/store';
import { takeoffUAVs, landUAVs, returnToHomeUAVs } from '~/utils/messaging';

import { copyCoordinates } from './actions';
import keyMap from './keymap';
import keyboardNavigationSignal from './signal';
import { showHotkeyDialog } from './slice';
import { callOnSelection } from './utils';

configureHotkeys({
  // This is necessary to ensure that the appropriate handlers are triggered
  // when digit keys are pressed in rapid succession; otherwise it can happen
  // that the keydown event of the second key is triggered before the keyup
  // event of the first key, and react-hotkeys would then be evaluating the
  // key combination only
  allowCombinationSubmatches: true,

  // Uncomment the next line for debugging problems with hotkeys
  // logLevel: 'debug',
});

// We use GlobalHotKeys here because the plain HotKeys component does not
// play nicely with multiple React root components; hotkeys defined in one of
// the root component may overwrite others when we try to retrieve the
// application keymap from react-hotkeys. This is because react-hotkeys fails
// to link the hotKeyParentId property of one <HotKeys> component to another
// if they are in different React root components.
//
// Luckily it is not a problem if we use GlobalHotKeys "outside" the workbench
// and normal <HotKeys> "inside" the workbench.

const AppHotkeys = ({ handlers }) => (
  <GlobalHotKeys keyMap={keyMap} handlers={handlers} />
);

const bindHotkeyHandlers = (reduxHandlers, nonReduxHandlers, dispatch) => ({
  ...nonReduxHandlers,
  ...mapValues(reduxHandlers, (handler) => (event) => {
    event.preventDefault();
    dispatch(handler());
  }),
});

AppHotkeys.propTypes = {
  handlers: PropTypes.object,
};

const sendKeyboardNavigationSignal = (action) => (event) =>
  keyboardNavigationSignal.dispatch(action, event);

export default connect(
  // mapStateToProps
  null,
  // mapDispatchToProps
  (dispatch) => ({
    handlers: bindHotkeyHandlers(
      // Redux actions bound to hotkeys
      {
        CLEAR_SELECTION: clearSelection,
        COPY_COORDINATES: copyCoordinates,
        SELECT_ALL_DRONES: selectAllUAVFeatures,
        SEND_TAKEOFF_COMMAND: callOnSelection(takeoffUAVs),
        SEND_LANDING_COMMAND: callOnSelection(landUAVs),
        SEND_RTH_COMMAND: callOnSelection(returnToHomeUAVs),
        SHOW_HOTKEY_DIALOG: showHotkeyDialog,
      },
      // Plain callable functions bound to hotkeys
      {
        CLEAR_STORED_SETTINGS: clearStoreAfterConfirmation,
        SELECT_FIRST: sendKeyboardNavigationSignal('SELECT_FIRST'),
        SELECT_LAST: sendKeyboardNavigationSignal('SELECT_LAST'),
        SELECT_NEXT: sendKeyboardNavigationSignal('SELECT_NEXT'),
        SELECT_PREVIOUS: sendKeyboardNavigationSignal('SELECT_PREVIOUS'),
      },
      dispatch
    ),
  })
)(AppHotkeys);
