import React from 'react';
import PropTypes from 'prop-types';

function ColorPicker({ colorChangeHandler }) {
  return (
    <section>
      <ul>
        <li>
          <button data-color="#0ff" onClick={colorChangeHandler}>
            #0ff
          </button>
        </li>
        <li>
          <button data-color="#0000fe" onClick={colorChangeHandler}>
            #0000fe
          </button>
        </li>
        <li>
          <button data-color="#fc0000" onClick={colorChangeHandler}>
            #fc0000
          </button>
        </li>
      </ul>
    </section>
  );
}

ColorPicker.propTypes = {
  colorChangeHandler: PropTypes.func.isRequired,
};

export default ColorPicker;
