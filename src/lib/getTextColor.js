import tinycolor from 'tinycolor2'

function getTextColor (bgColor) {
  const hsl = tinycolor(bgColor).toHsl()
  const saturation = hsl.s * 100
  const lightness = hsl.l * 100
  // If very saturated (>95%) and not too bright (<75%), use white text
  if (saturation > 95 && lightness < 75) {
    return '#FFFFFF'
  } else if (lightness > 70) { // For bright colors, use dark text
    return tinycolor({
      h: hsl.h,
      s: hsl.s,
      l: 0.28 // Dark text with same hue
    }).toHexString()
  } else { // Default to white text
    return '#FFFFFF'
  }
}

export default getTextColor
