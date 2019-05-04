import React from 'react';
import PropTypes from 'prop-types';

function ColorPicker({ colorChangeHandler, activeColor }) {
  const colors = ['#0ff', '#0000fe', '#ff0000'];

  return (
    <section id="ColorPicker">
      <ul>
        {colors.map((color) => (
          <li key={color}>
            <button
              style={{ background: color }}
              className={activeColor === color ? 'color-preview selected' : 'color-preview'}
              data-color={color}
              onClick={colorChangeHandler}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

ColorPicker.propTypes = {
  colorChangeHandler: PropTypes.func.isRequired,
  activeColor: PropTypes.string.isRequired,
};

export default ColorPicker;
