import { ipcRenderer } from 'electron';
import React from 'react';
import { fabric } from 'fabric';
import { APP_EVENTS } from './constants';
import Toolbox from './components/Toolbox';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      screenshotImage: null,
      canvas: null,
    };
    this.loadImagePreview = this.loadImagePreview.bind(this);
    this.setCanvasSize = this.setCanvasSize.bind(this);
    this.deleteActiveObjects = this.deleteActiveObjects.bind(this);
  }

  componentDidMount() {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ canvas: new fabric.Canvas('canvas') }, () => this.setCanvasSize());
    ipcRenderer.on(APP_EVENTS.LOAD_SCREENSHOT_PREVIEW, this.loadImagePreview);
    ipcRenderer.on(APP_EVENTS.DELETE_BUTTON_PRESSED, this.deleteActiveObjects);
    window.addEventListener('resize', this.setCanvasSize, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setCanvasSize);
  }

  setCanvasSize() {
    const mainEl = document.querySelector('#App main');
    const { width, height } = mainEl.getBoundingClientRect();
    this.state.canvas.setDimensions({ width, height });
    this.state.canvas.renderAll();
  }

  deleteActiveObjects() {
    this.state.canvas.getActiveObjects().forEach((obj) => this.state.canvas.remove(obj));
    this.state.canvas.discardActiveObject().requestRenderAll();
  }

  loadImagePreview(event, imagePath) {
    const canvasCenter = this.state.canvas.getCenter();
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
      this.state.canvas.add(this.state.screenshotImage);
      this.state.canvas.renderAll();
    });
  }

  render() {
    return (
      <div className="content">
        <aside>
          <nav>
            <ul>
              <Toolbox {...this.state} />
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
