import '@testing-library/jest-dom/vitest'

if (!window.matchMedia) {
  window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })
}
if (!window.scrollTo) window.scrollTo = () => {}
HTMLCanvasElement.prototype.getContext = () => null
if (!document.getSelection) document.getSelection = () => ({ removeAllRanges() {}, addRange() {} })
