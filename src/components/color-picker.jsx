import React from 'react';
import PropTypes from 'prop-types';

function ColorPicker({ colorClickHandler }) {
  return (
    <section>
      <ul>
        <li>
          <button data-color="#0ff" onClick={colorClickHandler}>
            #0ff
          </button>
        </li>
        <li>
          <button data-color="#0000fe" onClick={colorClickHandler}>
            #0000fe
          </button>
        </li>
        <li>
          <button data-color="#fc0000" onClick={colorClickHandler}>
            #fc0000
          </button>
        </li>
      </ul>
    </section>
  );
}

ColorPicker.propTypes = {
  colorClickHandler: PropTypes.func.isRequired,
};

export default ColorPicker;
