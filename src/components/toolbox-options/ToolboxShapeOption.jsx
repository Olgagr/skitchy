import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TOOLBOX_OPTION } from '../../constants';

const SHAPE_TYPES = {
  ARROW: 'arrow',
  RECTANGLE: 'rectangle',
};

export default class ToolboxShapeOption extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submenuOpened: false,
    };
    this.toggleSubmenu = this.toggleSubmenu.bind(this);
  }

  addShape(shapeType) {
    const canvasCenter = this.props.canvas.getCenter();
    switch (shapeType) {
      case SHAPE_TYPES.RECTANGLE: {
        const rect = new fabric.Rect({
          fill: this.props.activeColor,
          originX: 'center',
          originY: 'center',
          top: canvasCenter.top,
          left: canvasCenter.left,
          width: 200,
          height: 100,
        });
        this.props.canvas.add(rect);
        break;
      }
      case SHAPE_TYPES.ARROW:
      default:
        fabric.loadSVGFromString(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M313.941 216H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h301.941v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.569 0-33.941l-86.059-86.059c-15.119-15.119-40.971-4.411-40.971 16.971V216z"/></svg>',
          ([path]) => {
            path.set({
              fill: this.props.activeColor,
              scaleX: 0.2,
              scaleY: 0.2,
              originX: 'center',
              originY: 'center',
              top: canvasCenter.top,
              left: canvasCenter.left,
            });
            this.props.canvas.add(path);
            // eslint-disable-next-line comma-dangle
          }
        );
    }
    this.props.optionClickHandler(TOOLBOX_OPTION.ADD_SHAPE);
  }

  toggleSubmenu() {
    this.setState((currentState) => ({ submenuOpened: !currentState.submenuOpened }));
  }

  render() {
    return (
      <div>
        <button
          className="action-btn"
          onClick={this.toggleSubmenu}
          disabled={!this.props.screenshotImage}
          title="Draw shape"
        >
          <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M512 320v160c0 17.67-14.33 32-32 32H320c-17.67 0-32-14.33-32-32V320c0-17.67 14.33-32 32-32h160c17.67 0 32 14.33 32 32zm-384-64C57.31 256 0 313.31 0 384s57.31 128 128 128 128-57.31 128-128-57.31-128-128-128zm351.03-32c25.34 0 41.18-26.67 28.51-48L412.51 16c-12.67-21.33-44.35-21.33-57.02 0l-95.03 160c-12.67 21.33 3.17 48 28.51 48h190.06z" />
          </svg>
        </button>
        <ul className={!this.state.submenuOpened && 'm-hidden'}>
          <li>
            <button className="action-btn" onClick={() => this.addShape(SHAPE_TYPES.ARROW)}>
              <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path d="M313.941 216H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h301.941v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.569 0-33.941l-86.059-86.059c-15.119-15.119-40.971-4.411-40.971 16.971V216z" />
              </svg>
            </button>
          </li>
          <li>
            <button className="action-btn" onClick={() => this.addShape(SHAPE_TYPES.RECTANGLE)}>
              <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M512 512H0V0h512v512z" />
              </svg>
            </button>
          </li>
        </ul>
      </div>
    );
  }
}

ToolboxShapeOption.propTypes = {
  canvas: PropTypes.object,
  screenshotImage: PropTypes.object,
  activeColor: PropTypes.string.isRequired,
  optionClickHandler: PropTypes.func.isRequired,
};

ToolboxShapeOption.defaultProps = {
  canvas: null,
  screenshotImage: null,
  disabled: true,
};
