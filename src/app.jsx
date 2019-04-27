import { ipcRenderer } from 'electron';
import React from 'react';
import { fabric } from 'fabric';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      screenshotPath: null,
    };
    this.canvas = null;
    this.inCropMode = false;
    this.croppingRect = null;
    this.loadImagePreview = this.loadImagePreview.bind(this);
    this.crop = this.crop.bind(this);
  }

  componentDidMount() {
    this.canvas = new fabric.Canvas('canvas');
    this.canvas.setDimensions({ width: 1080, height: 600 });
    ipcRenderer.on('load-screenshot-preview', this.loadImagePreview);
  }

  loadImagePreview(event, imagePath) {
    const canvasCenter = this.canvas.getCenter();
    fabric.Image.fromURL(imagePath, (i) => {
      this.canvas.setBackgroundImage(i, this.canvas.renderAll.bind(this.canvas), {
        originX: 'center',
        originY: 'center',
        top: canvasCenter.top,
        left: canvasCenter.left,
      });
    });
  }

  crop() {
    this.inCropMode = !this.inCropMode;
    if (this.inCropMode && !this.croppingRect) {
      let isDown;
      let origX;
      let origY;

      const onMouseDownHandler = (o) => {
        isDown = true;
        let pointer = this.canvas.getPointer(o.e);
        origX = pointer.x;
        origY = pointer.y;
        pointer = this.canvas.getPointer(o.e);
        this.croppingRect = new fabric.Rect({
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
        this.canvas.add(this.croppingRect);
      };

      const onMouseMoveHandler = (o) => {
        if (!isDown) return;
        const pointer = this.canvas.getPointer(o.e);

        if (origX > pointer.x) {
          this.croppingRect.set({ left: Math.abs(pointer.x) });
        }
        if (origY > pointer.y) {
          this.croppingRect.set({ top: Math.abs(pointer.y) });
        }

        this.croppingRect.set({ width: Math.abs(origX - pointer.x) });
        this.croppingRect.set({ height: Math.abs(origY - pointer.y) });

        this.canvas.renderAll();
      };

      this.canvas.on('mouse:down', onMouseDownHandler);

      this.canvas.on('mouse:move', onMouseMoveHandler);

      this.canvas.on('mouse:up', () => {
        isDown = false;
        this.canvas.off({ 'mouse:down': onMouseDownHandler, 'mouse:move': onMouseMoveHandler });
      });
    }
  }

  render() {
    return (
      <div className="content">
        <aside>
          <nav>
            <ul>
              <li>
                <button onClick={this.crop}>Crop</button>
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
