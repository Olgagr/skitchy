import React from 'react';
import PropTypes from 'prop-types';
import { TOOLBOX_OPTION } from '../../constants';

export default function ToolboxTextOption({
  canvas,
  screenshotImage,
  activeColor,
  optionClickHandler,
}) {
  return (
    <button
      className="action-btn"
      // disabled={!screenshotImage}
      onClick={() => {
        optionClickHandler(TOOLBOX_OPTION.ADD_TEXT);
        const canvasCenter = canvas.getCenter();
        const text = new fabric.IText('Type some text here', {
          originX: 'center',
          originY: 'center',
          top: canvasCenter.top,
          left: canvasCenter.left,
          fill: activeColor,
        });
        canvas.add(text);
      }}
    >
      <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path d="M408 32H177.531C88.948 32 16.045 103.335 16 191.918 15.956 280.321 87.607 352 176 352v104c0 13.255 10.745 24 24 24h32c13.255 0 24-10.745 24-24V112h32v344c0 13.255 10.745 24 24 24h32c13.255 0 24-10.745 24-24V112h40c13.255 0 24-10.745 24-24V56c0-13.255-10.745-24-24-24z" />
      </svg>
    </button>
  );
}

ToolboxTextOption.propTypes = {
  canvas: PropTypes.object,
  screenshotImage: PropTypes.object,
  activeColor: PropTypes.string.isRequired,
  optionClickHandler: PropTypes.func.isRequired,
};

ToolboxTextOption.defaultProps = {
  canvas: null,
  screenshotImage: null,
  disabled: true,
};
