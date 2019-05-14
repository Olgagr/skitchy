import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TOOLBOX_OPTION } from '../../constants';

export default class ToolboxCropOption extends Component {
  constructor(props) {
    super(props);
    this.state = {
      croppingRect: null,
    };
    this.drawCroppingArea = this.drawCroppingArea.bind(this);
    this.crop = this.crop.bind(this);
    this.deleteCroppingArea = this.deleteCroppingArea.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.activeOption !== TOOLBOX_OPTION.CROP &&
      prevProps.activeOption === TOOLBOX_OPTION.CROP
    ) {
      this.deleteCroppingArea();
      this.props.canvas.trigger('mouse:up');
    }
  }

  drawCroppingArea() {
    this.props.optionClickHandler(TOOLBOX_OPTION.CROP);

    if (!this.state.croppingRect) {
      let isDown;
      let origX;
      let origY;

      this.toggleObjectSelectionOnCanvas(false);

      const onMouseDownHandler = (o) => {
        isDown = true;
        let pointer = this.props.canvas.getPointer(o.e);
        origX = pointer.x;
        origY = pointer.y;
        pointer = this.props.canvas.getPointer(o.e);
        const rect = new fabric.Rect({
          left: origX,
          top: origY,
          originX: 'left',
          originY: 'top',
          width: pointer.x - origX,
          height: pointer.y - origY,
          angle: 0,
          fill: 'rgba(255,0,0,0.5)',
          transparentCorners: false,
        });
        this.setState({ croppingRect: rect });
        this.props.canvas.add(this.state.croppingRect);
      };

      const onMouseMoveHandler = (o) => {
        if (!isDown) return;
        const pointer = this.props.canvas.getPointer(o.e);

        if (origX > pointer.x) {
          this.state.croppingRect.set({ left: Math.abs(pointer.x) });
        }
        if (origY > pointer.y) {
          this.state.croppingRect.set({ top: Math.abs(pointer.y) });
        }

        this.state.croppingRect.set({ width: Math.abs(origX - pointer.x) });
        this.state.croppingRect.set({ height: Math.abs(origY - pointer.y) });

        this.props.canvas.renderAll();
      };

      const mouseUpHandler = () => {
        isDown = false;
        this.props.canvas.off({
          'mouse:down': onMouseDownHandler,
          'mouse:move': onMouseMoveHandler,
          'mouse:up': mouseUpHandler,
        });
        /*
          Small trick to unblock dragging the rect. For some reason after drawing the rect,
          it is blocked until scaled
        */
        if (this.state.croppingRect) {
          this.state.croppingRect.scale(1);
        }
      };

      this.props.canvas.on('mouse:down', onMouseDownHandler);
      this.props.canvas.on('mouse:move', onMouseMoveHandler);
      this.props.canvas.on('mouse:up', mouseUpHandler);
    }
  }

  crop() {
    const left = this.state.croppingRect.left - this.props.screenshotImage.left;
    const top = this.state.croppingRect.top - this.props.screenshotImage.top;
    const width = this.state.croppingRect.width;
    const height = this.state.croppingRect.height;

    this.props.screenshotImage.clipTo = function clipTo(ctx) {
      ctx.rect(left, top, width, height);
    };
    this.deleteCroppingArea();
  }

  deleteCroppingArea() {
    this.toggleObjectSelectionOnCanvas(true);
    this.props.canvas.remove(this.state.croppingRect);
    this.setState({ croppingRect: null });
    this.props.canvas.renderAll();
  }

  toggleObjectSelectionOnCanvas(isSelectable) {
    this.props.canvas
      .getObjects()
      .filter((item) => !(item instanceof fabric.Image))
      .forEach((item) => {
        item.set({ selectable: isSelectable });
      });
  }

  render() {
    return (
      <div>
        <button
          className="action-btn"
          disabled={!this.props.screenshotImage || this.state.croppingRect}
          onClick={this.drawCroppingArea}
        >
          <svg
            className="action-icon"
            id="crop-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path d="M488 352h-40V96c0-17.67-14.33-32-32-32H192v96h160v328c0 13.25 10.75 24 24 24h48c13.25 0 24-10.75 24-24v-40h40c13.25 0 24-10.75 24-24v-48c0-13.26-10.75-24-24-24zM160 24c0-13.26-10.75-24-24-24H88C74.75 0 64 10.74 64 24v40H24C10.75 64 0 74.74 0 88v48c0 13.25 10.75 24 24 24h40v256c0 17.67 14.33 32 32 32h224v-96H160V24z" />
          </svg>
        </button>
        <ul className={!this.state.croppingRect && 'm-hidden'}>
          <li>
            <button className="action-btn" disabled={!this.state.croppingRect} onClick={this.crop}>
              <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" />
              </svg>
            </button>
          </li>
          <li>
            <button
              className="action-btn"
              disabled={!this.state.croppingRect}
              onClick={this.deleteCroppingArea}
            >
              <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512">
                <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z" />
              </svg>
            </button>
          </li>
        </ul>
      </div>
    );
  }
}

ToolboxCropOption.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  canvas: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  screenshotImage: PropTypes.object,
  optionClickHandler: PropTypes.func.isRequired,
  activeOption: PropTypes.string,
};

ToolboxCropOption.defaultProps = {
  canvas: null,
  screenshotImage: null,
  activeOption: null,
};
