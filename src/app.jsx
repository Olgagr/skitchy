import { ipcRenderer } from 'electron';
import React from 'react';
import { fabric } from 'fabric';
import Toolbox from './components/toolbox';
import { APP_EVENTS } from './constants';

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
    this.select = this.select.bind(this);
    this.addText = this.addText.bind(this);
    this.setActiveColor = this.setActiveColor.bind(this);
    this.setCanvasSize = this.setCanvasSize.bind(this);
    this.addShape = this.addShape.bind(this);
    this.deleteActiveObjects = this.deleteActiveObjects.bind(this);
    this.deleteCroppingArea = this.deleteCroppingArea.bind(this);
  }

  componentDidMount() {
    this.canvas = new fabric.Canvas('canvas');
    this.setCanvasSize();
    ipcRenderer.on(APP_EVENTS.LOAD_SCREENSHOT_PREVIEW, this.loadImagePreview);
    ipcRenderer.on(APP_EVENTS.DELETE_BUTTON_PRESSED, this.deleteActiveObjects);
    window.addEventListener('resize', this.setCanvasSize, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setCanvasSize);
    this.canvas.dispose();
  }

  setActiveColor(event) {
    if (!event.target.dataset && !event.target.dataset.color) return;
    this.setState({ activeColor: event.target.dataset.color }, () => {
      if (this.canvas.isDrawingMode) {
        this.canvas.freeDrawingBrush.color = this.state.activeColor;
      }
      this.canvas.getActiveObjects().forEach((object) => {
        if (object instanceof fabric.IText) object.set('fill', this.state.activeColor);
        if (object instanceof fabric.Path) {
          if (object.fill) {
            object.set('fill', this.state.activeColor);
          } else {
            object.set('stroke', this.state.activeColor);
          }
        }
      });
      this.canvas.renderAll();
    });
  }

  setCanvasSize() {
    const mainEl = document.querySelector('#App main');
    const { width, height } = mainEl.getBoundingClientRect();
    this.canvas.setDimensions({ width, height });
    this.canvas.renderAll();
  }

  deleteActiveObjects() {
    this.canvas.getActiveObjects().forEach((obj) => this.canvas.remove(obj));
    this.canvas.discardActiveObject().requestRenderAll();
  }

  loadImagePreview(event, imagePath) {
    const canvasCenter = this.canvas.getCenter();
    fabric.Image.fromURL(imagePath, (i) => {
      i.set({
        originX: 'center',
        originY: 'center',
        top: canvasCenter.top,
        left: canvasCenter.left,
        selectable: false,
        hoverCursor: 'auto',
      });
      this.setState({ screenshotImage: i });
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

  select() {
    this.canvas.isDrawingMode = false;
    this.canvas.setCursor('pointer');
  }

  crop() {
    const left = this.state.croppingRect.left - this.state.screenshotImage.left;
    const top = this.state.croppingRect.top - this.state.screenshotImage.top;
    const width = this.state.croppingRect.width;
    const height = this.state.croppingRect.height;

    this.state.screenshotImage.clipTo = function clipTo(ctx) {
      ctx.rect(left, top, width, height);
    };
    this.deleteCroppingArea();
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

  addText() {
    this.canvas.isDrawingMode = false;
    const canvasCenter = this.canvas.getCenter();
    const text = new fabric.IText('Type some text here', {
      originX: 'center',
      originY: 'center',
      top: canvasCenter.top,
      left: canvasCenter.left,
      fill: this.state.activeColor,
    });
    this.canvas.add(text);
  }

  addShape(shapeType) {
    const canvasCenter = this.canvas.getCenter();
    switch (shapeType) {
      case 'arrow':
      default:
        fabric.loadSVGFromString(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M313.941 216H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h301.941v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.569 0-33.941l-86.059-86.059c-15.119-15.119-40.971-4.411-40.971 16.971V216z"/></svg>',
          ([path]) => {
            path.set({
              fill: this.state.activeColor,
              scaleX: 0.2,
              scaleY: 0.2,
              originX: 'center',
              originY: 'center',
              top: canvasCenter.top,
              left: canvasCenter.left,
            });
            this.canvas.add(path);
          }
        );
    }
  }

  deleteCroppingArea() {
    this.canvas.remove(this.state.croppingRect);
    this.setState({ croppingRect: null });
    this.inCropMode = false;
    this.canvas.renderAll();
  }

  render() {
    return (
      <div className="content">
        <aside>
          <nav>
            <ul>
              <Toolbox
                {...this.state}
                save={this.save}
                crop={this.crop}
                draw={this.draw}
                addText={this.addText}
                select={this.select}
                setActiveColor={this.setActiveColor}
                drawCroppingArea={this.drawCroppingArea}
                addShape={this.addShape}
                deleteCroppingArea={this.deleteCroppingArea}
              />
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
