import React from 'react';
import PropTypes from 'prop-types';

import ColorPicker from './color-picker';

function Toolbox(props) {
  return (
    <ul id="Toolbox">
      <li>
        <button className="action-btn" onClick={props.save} disabled={!props.screenshotImage}>
          <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z" />
          </svg>
        </button>
      </li>
      <li className="b-cropping-action">
        <button
          className="action-btn"
          disabled={!props.screenshotImage || props.croppingRect}
          onClick={props.drawCroppingArea}
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
        <ul className={!props.croppingRect && 'm-hidden'}>
          <li>
            <button className="action-btn" disabled={!props.croppingRect} onClick={props.crop}>
              <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" />
              </svg>
            </button>
          </li>
          <li>
            <button className="action-btn">
              <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512">
                <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z" />
              </svg>
            </button>
          </li>
        </ul>
      </li>
      <li>
        <button className="action-btn" onClick={props.draw} disabled={!props.screenshotImage}>
          <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M290.74 93.24l128.02 128.02-277.99 277.99-114.14 12.6C11.35 513.54-1.56 500.62.14 485.34l12.7-114.22 277.9-277.88zm207.2-19.06l-60.11-60.11c-18.75-18.75-49.16-18.75-67.91 0l-56.55 56.55 128.02 128.02 56.55-56.55c18.75-18.76 18.75-49.16 0-67.91z" />
          </svg>
        </button>
      </li>
      <li className={props.screenshotImage ? '' : 'm-hidden'}>
        <ColorPicker colorChangeHandler={props.setActiveColor} activeColor={props.activeColor} />
      </li>
    </ul>
  );
}

Toolbox.propTypes = {
  save: PropTypes.func.isRequired,
  crop: PropTypes.func.isRequired,
  draw: PropTypes.func.isRequired,
  drawCroppingArea: PropTypes.func.isRequired,
  setActiveColor: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  screenshotImage: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  croppingRect: PropTypes.object,
  activeColor: PropTypes.string.isRequired,
};

Toolbox.defaultProps = {
  screenshotImage: null,
  croppingRect: null,
};

export default Toolbox;
