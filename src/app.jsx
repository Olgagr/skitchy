import { ipcRenderer } from 'electron';
import React from 'react';
import { fabric } from 'fabric';
import ColorPicker from './components/color-picker';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      screenshotImage: null,
      croppingRect: null,
      colorPickerOpened: false,
      activeColor: '#ff0000',
      activeAction: null,
    };
    this.canvas = null;
    this.inCropMode = false;
    this.loadImagePreview = this.loadImagePreview.bind(this);
    this.drawCroppingArea = this.drawCroppingArea.bind(this);
    this.save = this.save.bind(this);
    this.crop = this.crop.bind(this);
    this.draw = this.draw.bind(this);
    this.setActiveColor = this.setActiveColor.bind(this);
  }

  componentDidMount() {
    this.canvas = new fabric.Canvas('canvas');
    this.canvas.setDimensions({ width: 1080, height: 600 });
    ipcRenderer.on('load-screenshot-preview', this.loadImagePreview);
  }

  setActiveColor(event) {
    if (!event.target.dataset && !event.target.dataset.color) return;
    this.setState({ activeColor: event.target.dataset.color }, () => {
      if (this.canvas.isDrawingMode) {
        this.canvas.freeDrawingBrush.color = this.state.activeColor;
      }
    });
  }

  loadImagePreview(event, imagePath) {
    const canvasCenter = this.canvas.getCenter();
    fabric.Image.fromURL(imagePath, (i) => {
      this.setState({ screenshotImage: i });
      this.state.screenshotImage.set({
        originX: 'center',
        originY: 'center',
        top: canvasCenter.top,
        left: canvasCenter.left,
        selectable: false,
      });
      this.canvas.add(this.state.screenshotImage);
      this.canvas.renderAll();
    });
  }

  drawCroppingArea() {
    this.canvas.isDrawingMode = false;
    this.inCropMode = !this.inCropMode;
    if (this.inCropMode && !this.state.croppingRect) {
      let isDown;
      let origX;
      let origY;

      const onMouseDownHandler = (o) => {
        isDown = true;
        let pointer = this.canvas.getPointer(o.e);
        origX = pointer.x;
        origY = pointer.y;
        pointer = this.canvas.getPointer(o.e);
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
        this.canvas.add(this.state.croppingRect);
      };

      const onMouseMoveHandler = (o) => {
        if (!isDown) return;
        const pointer = this.canvas.getPointer(o.e);

        if (origX > pointer.x) {
          this.state.croppingRect.set({ left: Math.abs(pointer.x) });
        }
        if (origY > pointer.y) {
          this.state.croppingRect.set({ top: Math.abs(pointer.y) });
        }

        this.state.croppingRect.set({ width: Math.abs(origX - pointer.x) });
        this.state.croppingRect.set({ height: Math.abs(origY - pointer.y) });

        this.canvas.renderAll();
      };

      const mouseUpHandler = () => {
        isDown = false;
        this.canvas.off({
          'mouse:down': onMouseDownHandler,
          'mouse:move': onMouseMoveHandler,
          'mouse:up': mouseUpHandler,
        });
        /*
          Small trick to unblock dragging the rect. For some reason after drawing the rect,
          it is blocked until scaled
        */
        this.state.croppingRect.scale(1);
      };

      this.canvas.on('mouse:down', onMouseDownHandler);
      this.canvas.on('mouse:move', onMouseMoveHandler);
      this.canvas.on('mouse:up', mouseUpHandler);
    }
  }

  crop() {
    const left = this.state.croppingRect.left - this.state.screenshotImage.left;
    const top = this.state.croppingRect.top - this.state.screenshotImage.top;
    const width = this.state.croppingRect.width;
    const height = this.state.croppingRect.height;

    this.state.screenshotImage.clipTo = function clipTo(ctx) {
      ctx.rect(left, top, width, height);
    };
    this.canvas.remove(this.state.croppingRect);
    this.setState({ croppingRect: null });
    this.inCropMode = false;
    this.canvas.renderAll();
  }

  save() {
    const url = this.canvas.toDataURL({ format: 'png' });
    const data = url.replace(/^data:image\/png;base64,/, '');
    ipcRenderer.send('save-to-file', data);
  }

  draw() {
    this.canvas.freeDrawingBrush.color = this.state.activeColor;
    this.canvas.isDrawingMode = true;
  }

  render() {
    return (
      <div className="content">
        <aside>
          <nav>
            <ul>
              <li>
                <button
                  className="action-btn"
                  onClick={this.save}
                  disabled={!this.state.screenshotImage}
                >
                  <svg
                    className="action-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                  >
                    <path d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z" />
                  </svg>
                </button>
              </li>
              <li className="b-cropping-action">
                <button
                  className="action-btn"
                  disabled={!this.state.screenshotImage || this.state.croppingRect}
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
                    <button
                      className="action-btn"
                      disabled={!this.state.croppingRect}
                      onClick={this.crop}
                    >
                      <svg
                        className="action-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" />
                      </svg>
                    </button>
                  </li>
                  <li>
                    <button className="action-btn">
                      <svg
                        className="action-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 352 512"
                      >
                        <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z" />
                      </svg>
                    </button>
                  </li>
                </ul>
              </li>
              <li>
                <button
                  className="action-btn"
                  onClick={this.draw}
                  disabled={!this.state.screenshotImage}
                >
                  <svg
                    className="action-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                  >
                    <path d="M290.74 93.24l128.02 128.02-277.99 277.99-114.14 12.6C11.35 513.54-1.56 500.62.14 485.34l12.7-114.22 277.9-277.88zm207.2-19.06l-60.11-60.11c-18.75-18.75-49.16-18.75-67.91 0l-56.55 56.55 128.02 128.02 56.55-56.55c18.75-18.76 18.75-49.16 0-67.91z" />
                  </svg>
                </button>
              </li>
              <li className={this.state.screenshotImage ? '' : 'm-hidden'}>
                <ColorPicker
                  colorChangeHandler={this.setActiveColor}
                  activeColor={this.state.activeColor}
                />
              </li>
            </ul>
          </nav>
        </aside>
        <main>
          {/* <h2>To take a screenshot, use CTRL+ALT+L</h2> */}
          <canvas id="canvas" width="100%" height="100%" />
        </main>
      </div>
    );
  }
}
