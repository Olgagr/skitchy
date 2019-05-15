import React from 'react';
import PropTypes from 'prop-types';
import { TOOLBOX_OPTION } from '../../constants';

export default function ToolboxSelectOption({ canvas, screenshotImage, optionClickHandler }) {
  return (
    <button
      className="action-btn"
      disabled={!screenshotImage}
      onClick={() => {
        optionClickHandler(TOOLBOX_OPTION.SELECT);
        canvas.setCursor('pointer');
      }}
    >
      <svg className="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
        <path d="M302.189 329.126H196.105l55.831 135.993c3.889 9.428-.555 19.999-9.444 23.999l-49.165 21.427c-9.165 4-19.443-.571-23.332-9.714l-53.053-129.136-86.664 89.138C18.729 472.71 0 463.554 0 447.977V18.299C0 1.899 19.921-6.096 30.277 5.443l284.412 292.542c11.472 11.179 3.007 31.141-12.5 31.141z" />
      </svg>
    </button>
  );
}

ToolboxSelectOption.propTypes = {
  canvas: PropTypes.object,
  screenshotImage: PropTypes.object,
  optionClickHandler: PropTypes.func.isRequired,
};

ToolboxSelectOption.defaultProps = {
  canvas: null,
  screenshotImage: null,
  disabled: true,
};
