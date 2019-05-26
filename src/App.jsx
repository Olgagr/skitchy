import { ipcRenderer } from 'electron';
import React from 'react';
import { fabric } from 'fabric';
import { APP_EVENTS } from './constants';
import Toolbox from './components/Toolbox';
import { debounce, canvasToBase64 } from './utils';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      screenshotImage: null,
      canvas: null,
    };
    this.loadImagePreview = this.loadImagePreview.bind(this);
    this.setCanvasSize = debounce(this.setCanvasSize.bind(this), 100);
    this.deleteActiveObjects = this.deleteActiveObjects.bind(this);
    this.getCanvasDataToSaveHandler = this.getCanvasDataToSaveHandler.bind(this);
  }

  componentDidMount() {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ canvas: new fabric.Canvas('canvas') }, () => this.setCanvasSize());
    ipcRenderer.on(APP_EVENTS.LOAD_SCREENSHOT_PREVIEW, this.loadImagePreview);
    ipcRenderer.on(APP_EVENTS.DELETE_BUTTON_PRESSED, this.deleteActiveObjects);
    ipcRenderer.on(APP_EVENTS.GET_CANVAS_DATA_TO_SAVE, this.getCanvasDataToSaveHandler);
    window.addEventListener('resize', this.setCanvasSize, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setCanvasSize);
  }

  setCanvasSize() {
    const mainEl = document.querySelector('#App main');
    const { width, height } = mainEl.getBoundingClientRect();
    this.state.canvas.setDimensions({ width, height });
    this.state.canvas.requestRenderAll();
    if (this.state.screenshotImage) {
      this.scaleImageToCanvasDimentions(this.state.screenshotImage);
      const canvasCenter = this.state.canvas.getCenter();
      this.state.screenshotImage.set({
        top: canvasCenter.top,
        left: canvasCenter.left,
      });
    }
    this.state.canvas.requestRenderAll();
  }

  getCanvasDataToSaveHandler() {
    if (!this.state.screenshotImage) return;
    ipcRenderer.send(APP_EVENTS.SAVE_TO_FILE, canvasToBase64(this.state.canvas));
  }

  deleteActiveObjects() {
    this.state.canvas.getActiveObjects().forEach((obj) => this.state.canvas.remove(obj));
    this.state.canvas.discardActiveObject().requestRenderAll();
  }

  loadImagePreview(event, imagePath) {
    const canvasCenter = this.state.canvas.getCenter();
    this.state.canvas.clear();
    fabric.Image.fromURL(imagePath, (i) => {
      i.set({
        originX: 'center',
        originY: 'center',
        top: canvasCenter.top,
        left: canvasCenter.left,
        selectable: false,
        hoverCursor: 'auto',
      });
      this.scaleImageToCanvasDimentions(i);
      this.setState({ screenshotImage: i });
      this.state.canvas.add(this.state.screenshotImage);
      this.state.canvas.requestRenderAll();
      ipcRenderer.send(APP_EVENTS.SCREENSHOT_LOADED);
    });
  }

  scaleImageToCanvasDimentions(image) {
    const canvas = this.state.canvas;
    if (canvas.width > image.width && canvas.height > image.height) return;
    if (canvas.width < canvas.height) {
      image.scaleToWidth(canvas.width);
    } else {
      image.scaleToHeight(canvas.height);
    }
  }

  render() {
    return (
      <div className="b-content">
        <aside>
          <nav>
            <ul>
              <Toolbox {...this.state} />
            </ul>
          </nav>
        </aside>
        <main>
          {!this.state.screenshotImage && (
            <h2 className="b-help-message">
              Press CTRL+SHITF+L and draw the region on the screen to take a screenshot
            </h2>
          )}
          <canvas id="canvas" width="100%" height="100%" />
        </main>
      </div>
    );
  }
}
