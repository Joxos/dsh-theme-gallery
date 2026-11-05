import style from './style.css'
import { tokens } from './tokens.js'

/** Pixel Arcade: zero radii, monospace type and an arcade palette. */
export const pixel = {
  id: 'pixel',
  nameKey: 'style.pixel.name',
  descKey: 'style.pixel.desc',
  tokens,
  structural: style,
}
