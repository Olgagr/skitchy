export function debounce(func, wait, immediate) {
  let timeout;
  return function innerDebounce() {
    const context = this;
    const later = function later() {
      timeout = null;
      if (!immediate) func.apply(context);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context);
  };
}

export function canvasToBase64(canvas) {
  const url = canvas.toDataURL({ format: 'png' });
  return url.replace(/^data:image\/png;base64,/, '');
}
