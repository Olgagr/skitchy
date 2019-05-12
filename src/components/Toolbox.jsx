import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ColorPicker from './ColorPicker';
import ToolboxSelectOption from './toolbox-options/ToolboxSelectOption';
import ToolboxSaveOption from './toolbox-options/ToolboxSaveOption';
import ToolboxCropOption from './toolbox-options/ToolboxCropOption';
import ToolboxTextOption from './toolbox-options/ToolboxTextOption';
import ToolboxDrawOption from './toolbox-options/ToolboxDrawOption';
import ToolboxShapeOption from './toolbox-options/ToolboxShapeOption';

export default class Toolbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeColor: '#ff0000',
    };
    this.setActiveColor = this.setActiveColor.bind(this);
  }

  setActiveColor(event) {
    if (!event.target.dataset && !event.target.dataset.color) return;
    this.setState({ activeColor: event.target.dataset.color }, () => {
      this.props.canvas.freeDrawingBrush.color = this.state.activeColor;
      this.props.canvas.getActiveObjects().forEach((object) => {
        if (object instanceof fabric.IText) object.set('fill', this.state.activeColor);
        if (object instanceof fabric.Path) {
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

  render() {
    return (
      <ul id="Toolbox">
        <li>
          <ToolboxSaveOption canvas={this.props.canvas} disabled={!this.props.screenshotImage} />
        </li>
        <li className="b-cropping-action">
          <ToolboxSelectOption canvas={this.props.canvas} disabled={!this.props.screenshotImage} />
        </li>
        <li className="b-with-submenu">
          <ToolboxCropOption
            canvas={this.props.canvas}
            disabled={!this.props.screenshotImage}
            screenshotImage={this.props.screenshotImage}
          />
        </li>
        <li>
          <ToolboxTextOption
            canvas={this.props.canvas}
            disabled={!this.props.screenshotImage}
            activeColor={this.state.activeColor}
          />
        </li>
        <li>
          <ToolboxDrawOption
            canvas={this.props.canvas}
            disabled={!this.props.screenshotImage}
            activeColor={this.state.activeColor}
          />
        </li>
        <li className="b-with-submenu">
          <ToolboxShapeOption
            canvas={this.props.canvas}
            disabled={!this.props.screenshotImage}
            activeColor={this.state.activeColor}
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
  // eslint-disable-next-line react/forbid-prop-types
  screenshotImage: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  canvas: PropTypes.object,
};

Toolbox.defaultProps = {
  screenshotImage: null,
  canvas: null,
};
