import { ipcRenderer } from 'electron';
import React from 'react';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      screenshotPath: null,
    };
  }

  componentDidMount() {
    ipcRenderer.on('load-screenshot-preview', (event, imagePath) => {
      this.setState({ screenshotPath: imagePath });
    });
  }

  screenshotImage() {
    return <img src={this.state.screenshotPath} alt="aaa" />;
  }

  render() {
    return (
      <div>
        <h2>To take a screenshot, use CTRL+ALT+L</h2>
        {this.state.screenshotPath && this.screenshotImage()}
      </div>
    );
  }
}
