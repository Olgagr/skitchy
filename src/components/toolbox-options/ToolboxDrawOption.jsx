import React from 'react';
import PropTypes from 'prop-types';
import { TOOLBOX_OPTION } from '../../constants';

export default function ToolboxDrawOption({
  canvas,
  screenshotImage,
  activeColor,
  optionClickHandler,
}) {
  return (
    <button
      className="action-btn"
      onClick={() => {
        optionClickHandler(TOOLBOX_OPTION.DRAW);
        canvas.freeDrawingBrush.color = activeColor;
        canvas.isDrawingMode = true;
      }}
      disabled={!screenshotImage}
      title="Free draw"
    >
      <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M290.74 93.24l128.02 128.02-277.99 277.99-114.14 12.6C11.35 513.54-1.56 500.62.14 485.34l12.7-114.22 277.9-277.88zm207.2-19.06l-60.11-60.11c-18.75-18.75-49.16-18.75-67.91 0l-56.55 56.55 128.02 128.02 56.55-56.55c18.75-18.76 18.75-49.16 0-67.91z" />
      </svg>
    </button>
  );
}

ToolboxDrawOption.propTypes = {
  canvas: PropTypes.object,
  screenshotImage: PropTypes.object,
  activeColor: PropTypes.string.isRequired,
  optionClickHandler: PropTypes.func.isRequired,
};

ToolboxDrawOption.defaultProps = {
  canvas: null,
  screenshotImage: null,
  disabled: true,
};
