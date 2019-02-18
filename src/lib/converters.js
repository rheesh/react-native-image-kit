/**
 * This source is from "@ptomasroos/react-native-multi-slider"
 * Thank you for sharing a great sauce.
 * @copyright Tomas Roos
 * @see https://github.com/ptomasroos/react-native-multi-slider/blob/master/converters.js
 */

// Find closest index for a given value
const closest = (array, n) => {
  let minI = 0;
  let maxI = array.length - 1;

  if (array[minI] > n) {
    return minI;
  } else if (array[maxI] < n) {
    return maxI;
  } else if (array[minI] <= n && n <= array[maxI]) {
    let closestIndex = null;

    while (closestIndex === null) {
      const midI = Math.round((minI + maxI) / 2);
      const midVal = array[midI];

      if (midVal === n) {
        closestIndex = midI;
      } else if (maxI === minI + 1) {
        const minValue = array[minI];
        const maxValue = array[maxI];
        const deltaMin = Math.abs(minValue - n);
        const deltaMax = Math.abs(maxValue - n);

        closestIndex = deltaMax <= deltaMin ? maxI : minI;
      } else if (midVal < n) {
        minI = midI;
      } else if (midVal > n) {
        maxI = midI;
      } else {
        closestIndex = -1;
      }
    }

    return closestIndex;
  }

  return -1;
};

export function valueToPosition(value, valuesArray, sliderLength) {
  const index = closest(valuesArray, value);

  const arrLength = valuesArray.length - 1;
  const validIndex = index === -1 ? arrLength : index;

  return sliderLength * validIndex / arrLength;
}

export function positionToValue(position, valuesArray, sliderLength) {
  const arrLength = valuesArray.length - 1;

  if (position < 0) {
    return valuesArray[0];
  } else if (sliderLength < position) {
    return valuesArray[arrLength];
  } else {
    const index = arrLength * position / sliderLength;
    return valuesArray[Math.round(index)];
  }
}

export function createArray(start, end, step) {
  var i;
  var length;
  var direction = start - end > 0 ? -1 : 1;
  var result = [];
  if (!step) {
    //console.log('invalid step: ', step);
    return result;
  } else {
    length = Math.abs((start - end) / step) + 1;
    for (i = 0; i < length; i++) {
      result.push(start + i * Math.abs(step) * direction);
    }
    return result;
  }
}
