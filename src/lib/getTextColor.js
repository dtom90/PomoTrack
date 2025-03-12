/* eslint-disable brace-style */

import tinycolor from 'tinycolor2'

function getTextColor (bgColor) {
  const hsl = tinycolor(bgColor).toHsl()
  const saturation = hsl.s * 100
  const lightness = hsl.l * 100
  const hue = hsl.h // Get the hue value (0-360 degrees)
  
  // RULE 1: SPECIFIC HUE RANGE RULE
  // If hue is between 35 and 230
  // AND lightness is between 49% and 75%
  // THEN: Use dark text
  if (hue > 35 && hue < 230 &&
    lightness >= 49 && lightness <= 75) {
    return tinycolor({
      h: hsl.h,
      s: hsl.s,
      l: 0.28 // 28% lightness
    }).toHexString()
  }
  // RULE 2: HIGH SATURATION RULE
  // If color is very saturated (>95%) AND not too bright (<75%)
  // THEN: Use white text
  if (saturation > 95 && lightness < 75) {
    return '#FFFFFF'
  }
  // RULE 3: BRIGHTNESS RULE
  // If color is bright (lightness > 70%)
  // THEN: Use dark text with same hue but 28% lightness
  else if (lightness > 70) {
    return tinycolor({
      h: hsl.h,
      s: hsl.s,
      l: 0.28 // 28% lightness
    }).toHexString()
  }
  // RULE 4: DEFAULT RULE
  // For all other colors
  // THEN: Use white text
  else {
    return '#FFFFFF'
  }
}

export default getTextColor
