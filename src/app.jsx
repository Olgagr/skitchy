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
      activeColor: '#0ff',
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
    this.setState({ activeColor: event.target.dataset.color });
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
                  disabled={!this.state.screenshotImage || this.state.croppingRect}
                  onClick={this.drawCroppingArea}
                >
                  Draw cropping area
                </button>
              </li>
              <li>
                <button disabled={!this.state.croppingRect} onClick={this.crop}>
                  Crop
                </button>
              </li>
              <li>
                <button onClick={this.save} disabled={!this.state.screenshotImage}>
                  Save
                </button>
              </li>
              <li>
                <button onClick={this.draw} disabled={!this.state.screenshotImage}>
                  Draw
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    this.setState({ colorPickerOpened: !this.state.colorPickerOpened })
                  }
                  disabled={!this.state.screenshotImage}
                >
                  Color
                </button>
                <ColorPicker colorClickHandler={this.setActiveColor} />
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
