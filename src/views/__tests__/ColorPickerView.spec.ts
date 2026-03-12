import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, beforeEach, it, expect, vi } from 'vitest'
import ColorPickerView from '../ColorPickerView.vue'

describe('Color Picker', () => {
  let wrapper: VueWrapper

  const setupCanvas = async () => {
    const colorCanvas = wrapper.find('[data-testid="color-canvas"]')

    colorCanvas.element.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 300,
      height: 220,
      x: 0,
      y: 0,
      bottom: 220,
      right: 300,
      toJSON: () => {},
    }))

    Object.defineProperty(colorCanvas.element.parentElement, 'clientWidth', {
      value: 300,
      configurable: true,
    })
    ;(wrapper.vm as typeof wrapper.vm & { canvasWidth: number }).canvasWidth = 300
    ;(wrapper.vm as typeof wrapper.vm & { cursorX: number }).cursorX = 150
    ;(wrapper.vm as typeof wrapper.vm & { cursorY: number }).cursorY = 110
    await wrapper.vm.$nextTick()
  }

  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      fillRect: vi.fn(),
      fillStyle: '',
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext
    wrapper = mount(ColorPickerView)
  })

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('hue slider and color canvas renders properly', () => {
    const hueSlider = wrapper.find('[data-testid="hue-slider"]')
    const colorCanvas = wrapper.find('[data-testid="color-canvas"]')

    expect(hueSlider.exists()).toBe(true)
    expect(colorCanvas.exists()).toBe(true)
  })

  it('moves the circle cursor properly on canvas mousedown and move', async () => {
    await setupCanvas()
    const colorCanvas = wrapper.find('[data-testid="color-canvas"]')

    // Mousedown
    await colorCanvas.trigger('mousedown', {
      clientX: 50,
      clientY: 100,
    })

    const cursor = wrapper.find('[data-testid="circle-cursor"]')
    expect(cursor.attributes('style')).toContain('left: 50px')
    expect(cursor.attributes('style')).toContain('top: 100px')

    const moveEvent = new MouseEvent('mousemove', {
      clientX: 150,
      clientY: 80,
    })
    window.dispatchEvent(moveEvent)

    await wrapper.vm.$nextTick()

    expect(cursor.attributes('style')).toContain('left: 150px')
    expect(cursor.attributes('style')).toContain('top: 80px')

    const upEvent = new MouseEvent('mouseup')
    window.dispatchEvent(upEvent)

    const moveAgainEvent = new MouseEvent('mousemove', {
      clientX: 200,
      clientY: 200,
    })
    window.dispatchEvent(moveAgainEvent)
    await wrapper.vm.$nextTick()

    expect(cursor.attributes('style')).toContain('left: 150px')
    expect(cursor.attributes('style')).toContain('top: 80px')
  })

  it('updates the hue correctly when slider is changed', async () => {
    await setupCanvas()

    const hsvSpan = wrapper.find('[data-testid="hsv-text"]')
    const rgbSpan = wrapper.find('[data-testid="rgb-text"]')
    const hslSpan = wrapper.find('[data-testid="hsl-text"]')
    const cmykSpan = wrapper.find('[data-testid="cmyk-text"]')
    const cssSpan = wrapper.find('[data-testid="css-text"]')

    const initialHsvText = hsvSpan.text()
    const initialRgbText = rgbSpan.text()
    const initialHslText = hslSpan.text()
    const initialCmykText = cmykSpan.text()
    const initialCssText = cssSpan.text()

    const hueSlider = wrapper.find('[data-testid="hue-slider"]')
    await hueSlider.setValue(240)

    expect(hsvSpan.text()).not.toBe(initialHsvText)
    expect(rgbSpan.text()).not.toBe(initialRgbText)
    expect(hslSpan.text()).not.toBe(initialHslText)
    expect(cmykSpan.text()).not.toBe(initialCmykText)
    expect(cssSpan.text()).not.toBe(initialCssText)

    expect(hsvSpan.text()).toContain('hsv(240')
    expect(rgbSpan.text()).toContain('rgb(64')
    expect(hslSpan.text()).toContain('hsl(240')
    expect(cmykSpan.text()).toContain('cmyk(50')
    expect(cssSpan.text()).toContain('--color: #40')
  })

  it('updates the text outputs when the cursor is moved on the canvas', async () => {
    await setupCanvas()

    const hsvSpan = wrapper.find('[data-testid="hsv-text"]')
    const rgbSpan = wrapper.find('[data-testid="rgb-text"]')
    const hslSpan = wrapper.find('[data-testid="hsl-text"]')
    const cmykSpan = wrapper.find('[data-testid="cmyk-text"]')
    const cssSpan = wrapper.find('[data-testid="css-text"]')

    const initialHsvText = hsvSpan.text()
    const initialRgbText = rgbSpan.text()
    const initialHslText = hslSpan.text()
    const initialCmykText = cmykSpan.text()
    const initialCssText = cssSpan.text()

    // Trigger cursor move
    const colorCanvas = wrapper.find('[data-testid="color-canvas"]')
    await colorCanvas.trigger('mousedown', {
      clientX: 50,
      clientY: 100,
    })

    expect(hsvSpan.text()).not.toBe(initialHsvText)
    expect(rgbSpan.text()).not.toBe(initialRgbText)
    expect(hslSpan.text()).not.toBe(initialHslText)
    expect(cmykSpan.text()).not.toBe(initialCmykText)
    expect(cssSpan.text()).not.toBe(initialCssText)
  })

  it('updates the color canvas when the hex input has changed', async () => {
    await setupCanvas()

    const hexInput = wrapper.find('[data-testid="hex-input"]')
    const cursor = wrapper.find('[data-testid="circle-cursor"]')
    const hsvSpan = wrapper.find('[data-testid="hsv-text"]')
    const rgbSpan = wrapper.find('[data-testid="rgb-text"]')
    const hslSpan = wrapper.find('[data-testid="hsl-text"]')
    const cmykSpan = wrapper.find('[data-testid="cmyk-text"]')
    const cssSpan = wrapper.find('[data-testid="css-text"]')

    const initialHsvText = hsvSpan.text()
    const initialRgbText = rgbSpan.text()
    const initialHslText = hslSpan.text()
    const initialCmykText = cmykSpan.text()
    const initialCssText = cssSpan.text()

    await hexInput.setValue('#404080')

    expect(cursor.attributes('style')).toContain('left: 150px')
    expect(cursor.attributes('style')).toContain('top: 110px')

    expect(hsvSpan.text()).not.toBe(initialHsvText)
    expect(rgbSpan.text()).not.toBe(initialRgbText)
    expect(hslSpan.text()).not.toBe(initialHslText)
    expect(cmykSpan.text()).not.toBe(initialCmykText)
    expect(cssSpan.text()).not.toBe(initialCssText)

    expect(hsvSpan.text()).toContain('hsv(240')
    expect(rgbSpan.text()).toContain('rgb(64')
    expect(hslSpan.text()).toContain('hsl(240')
    expect(cmykSpan.text()).toContain('cmyk(50')
    expect(cssSpan.text()).toContain('--color: #40')
  })

  it('restores the previous color once previous color was clicked', async () => {
    await setupCanvas()
    const previousColorBtn = wrapper.find('[data-testid="previous-color"]')

    const hsvSpan = wrapper.find('[data-testid="hsv-text"]')
    const rgbSpan = wrapper.find('[data-testid="rgb-text"]')
    const hslSpan = wrapper.find('[data-testid="hsl-text"]')
    const cmykSpan = wrapper.find('[data-testid="cmyk-text"]')
    const cssSpan = wrapper.find('[data-testid="css-text"]')

    const initialHsvText = hsvSpan.text()
    const initialRgbText = rgbSpan.text()
    const initialHslText = hslSpan.text()
    const initialCmykText = cmykSpan.text()
    const initialCssText = cssSpan.text()

    const colorCanvas = wrapper.find('[data-testid="color-canvas"]')
    await colorCanvas.trigger('mousedown', {
      clientX: 50,
      clientY: 100,
    })

    expect(hsvSpan.text()).not.toBe(initialHsvText)
    expect(rgbSpan.text()).not.toBe(initialRgbText)
    expect(hslSpan.text()).not.toBe(initialHslText)
    expect(cmykSpan.text()).not.toBe(initialCmykText)
    expect(cssSpan.text()).not.toBe(initialCssText)

    await previousColorBtn.trigger('click')

    expect(hsvSpan.text()).toBe(initialHsvText)
    expect(rgbSpan.text()).toBe(initialRgbText)
    expect(hslSpan.text()).toBe(initialHslText)
    expect(cmykSpan.text()).toBe(initialCmykText)
    expect(cssSpan.text()).toBe(initialCssText)
  })

  it('copies the hex color to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    await setupCanvas()
    const hexCopyBtn = wrapper.find('[data-testid="hex-copy-btn"]')
    const hexInput = wrapper.find('[data-testid="hex-input"]')

    expect(hexCopyBtn.exists()).toBe(true)

    await hexInput.setValue('#404080')
    await hexCopyBtn.trigger('click')

    expect(writeText).toHaveBeenCalledExactlyOnceWith('#404080')
    expect(hexCopyBtn.text()).toContain('Copied!')
  })

  it('copies the rgb color to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    await setupCanvas()
    const rgbCopyBtn = wrapper.find('[data-testid="rgb-copy-btn"]')
    const hexInput = wrapper.find('[data-testid="hex-input"]')

    expect(rgbCopyBtn.exists()).toBe(true)

    await hexInput.setValue('#404080')
    await rgbCopyBtn.trigger('click')

    expect(writeText).toHaveBeenCalledExactlyOnceWith('rgb(64, 64, 128)')
    expect(rgbCopyBtn.text()).toContain('Copied!')
  })

  it('copies the hsl color to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    await setupCanvas()
    const hslCopyBtn = wrapper.find('[data-testid="hsl-copy-btn"]')
    const hexInput = wrapper.find('[data-testid="hex-input"]')

    expect(hslCopyBtn.exists()).toBe(true)

    await hexInput.setValue('#404080')
    await hslCopyBtn.trigger('click')

    expect(writeText).toHaveBeenCalledExactlyOnceWith('hsl(240, 33%, 38%)')
    expect(hslCopyBtn.text()).toContain('Copied!')
  })

  it('copies the cmyk color to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    await setupCanvas()
    const cmykCopyBtn = wrapper.find('[data-testid="cmyk-copy-btn"]')
    const hexInput = wrapper.find('[data-testid="hex-input"]')

    expect(cmykCopyBtn.exists()).toBe(true)

    await hexInput.setValue('#404080')
    await cmykCopyBtn.trigger('click')

    expect(writeText).toHaveBeenCalledExactlyOnceWith('cmyk(50, 50, 0, 50)')
    expect(cmykCopyBtn.text()).toContain('Copied!')
  })

  it('copies the css color to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    await setupCanvas()
    const cssCopyBtn = wrapper.find('[data-testid="css-copy-btn"]')
    const hexInput = wrapper.find('[data-testid="hex-input"]')

    expect(cssCopyBtn.exists()).toBe(true)

    await hexInput.setValue('#404080')
    await cssCopyBtn.trigger('click')

    expect(writeText).toHaveBeenCalledExactlyOnceWith('--color: #404080;')
    expect(cssCopyBtn.text()).toContain('Copied!')
  })
})
