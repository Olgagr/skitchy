import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class ColorPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submenuVisible: false,
    };
    this.colors = ['#f9ff00', '#00ff0c', '#ff0000', '#0000fe'];
  }

  render() {
    return (
      <section className="b-with-submenu" id="ColorPicker">
        <button
          className="action-btn current-color-btn"
          style={{ background: this.props.activeColor }}
          onClick={() =>
            this.setState(({ submenuVisible }) => ({
              submenuVisible: !submenuVisible,
            }))
          }
        />
        <ul className={!this.state.submenuVisible && 'm-hidden'}>
          {this.colors.map((color) => (
            <li key={color}>
              <button
                style={{ background: color }}
                className={
                  this.props.activeColor === color ? 'color-preview selected' : 'color-preview'
                }
                data-color={color}
                onClick={this.props.colorChangeHandler}
              />
            </li>
          ))}
        </ul>
      </section>
    );
  }
}

ColorPicker.propTypes = {
  colorChangeHandler: PropTypes.func.isRequired,
  activeColor: PropTypes.string.isRequired,
};
