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
  // 1. get all elements from the canvas
  const items = canvas.getObjects();
  const frame = {
    max_x: 0,
    min_x: 100000,
    max_y: 0,
    min_y: 100000,
  };
  // 2. extract their aCoords and find max for each corner
  items
    .map((item) => item.aCoords)
    .reduce((acc, rectCoords) => {
      Object.keys(rectCoords).forEach((key) => {
        const c = rectCoords[key];
        if (c.x < frame.min_x) frame.min_x = c.x;
        if (c.x > frame.max_x) frame.max_x = c.x;
        if (c.y < frame.min_y) frame.min_y = c.y;
        if (c.y > frame.max_y) frame.max_y = c.y;
      });
      return acc;
      // find top left point
    }, frame);
  const topLeftPoint = new fabric.Point(frame.min_x, frame.min_y);
  const topRightPoint = new fabric.Point(frame.max_x, frame.min_y);
  const bottomLeftPoint = new fabric.Point(frame.min_x, frame.max_y);

  const width = topLeftPoint.distanceFrom(topRightPoint);
  const height = topLeftPoint.distanceFrom(bottomLeftPoint);

  const url = canvas.toDataURL({
    format: 'png',
    left: topLeftPoint.x,
    top: topLeftPoint.y,
    width,
    height,
  });
  return url.replace(/^data:image\/png;base64,/, '');
}
