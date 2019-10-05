import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ColorPicker from './ColorPicker';
import ToolboxSelectOption from './toolbox-options/ToolboxSelectOption';
import ToolboxSaveOption from './toolbox-options/ToolboxSaveOption';
import ToolboxCropOption from './toolbox-options/ToolboxCropOption';
import ToolboxTextOption from './toolbox-options/ToolboxTextOption';
import ToolboxDrawOption from './toolbox-options/ToolboxDrawOption';
import ToolboxShapeOption from './toolbox-options/ToolboxShapeOption';
import { TOOLBOX_OPTION } from '../constants';

export default class Toolbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeColor: '#ff0000',
      activeOption: null,
    };
    this.setActiveColor = this.setActiveColor.bind(this);
    this.optionClickHandler = this.optionClickHandler.bind(this);
  }

  setActiveColor(event) {
    if (!event.target.dataset && !event.target.dataset.color) return;
    this.setState({ activeColor: event.target.dataset.color }, () => {
      this.props.canvas.freeDrawingBrush.color = this.state.activeColor;
      this.props.canvas.getActiveObjects().forEach((object) => {
        if (object instanceof fabric.IText) object.set('fill', this.state.activeColor);
        if (object instanceof fabric.Path || object instanceof fabric.Rect) {
          if (object.fill) {
            object.set('fill', this.state.activeColor);
          } else {
            object.set('stroke', this.state.activeColor);
          }
        }
      });
      this.props.canvas.renderAll();
    });
  }

  optionClickHandler(optionName) {
    this.setState({ activeOption: optionName });
    this.props.canvas.isDrawingMode = optionName === TOOLBOX_OPTION.DRAW;
  }

  render() {
    return (
      <ul id="Toolbox">
        <li>
          <ToolboxSaveOption
            {...this.props}
            {...this.state}
            optionClickHandler={this.optionClickHandler}
          />
        </li>
        <li>
          <ToolboxSelectOption
            {...this.props}
            {...this.state}
            optionClickHandler={this.optionClickHandler}
          />
        </li>
        <li className="b-with-submenu">
          <ToolboxCropOption
            {...this.props}
            {...this.state}
            optionClickHandler={this.optionClickHandler}
          />
        </li>
        <li>
          <ToolboxTextOption
            {...this.props}
            {...this.state}
            optionClickHandler={this.optionClickHandler}
          />
        </li>
        <li>
          <ToolboxDrawOption
            {...this.props}
            {...this.state}
            optionClickHandler={this.optionClickHandler}
          />
        </li>
        <li className="b-with-submenu">
          <ToolboxShapeOption
            {...this.props}
            {...this.state}
            optionClickHandler={this.optionClickHandler}
          />
        </li>
        <li className={this.props.screenshotImage ? '' : 'm-hidden'}>
          <ColorPicker
            colorChangeHandler={this.setActiveColor}
            activeColor={this.state.activeColor}
          />
        </li>
      </ul>
    );
  }
}

Toolbox.propTypes = {
  screenshotImage: PropTypes.object,
  canvas: PropTypes.object,
};

Toolbox.defaultProps = {
  screenshotImage: null,
  canvas: null,
};
