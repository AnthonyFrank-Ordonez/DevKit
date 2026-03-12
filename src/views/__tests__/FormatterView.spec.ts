import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FormatterView from '../FormatterView.vue'

describe('JSON Formatter', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(FormatterView)
  })

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('formats JSON correctly', async () => {
    const jsonInput = wrapper.find('[data-testid="json-input"]')
    const formatBtn = wrapper.find('[data-testid="format-btn"]')

    expect(jsonInput.exists()).toBe(true)
    expect(formatBtn.exists()).toBe(true)

    await jsonInput.setValue('{"name": "John", "age": 43}')
    await formatBtn.trigger('click')

    const formattedJson = wrapper.find('[data-testid="formatted-json"]')

    expect(formattedJson.exists()).toBe(true)
    expect(formattedJson.text()).toContain('John')
    expect(formattedJson.text()).toContain('43')
  })

  it('clears input when Clear button is clicked', async () => {
    const jsonInput = wrapper.find('[data-testid="json-input"]')
    const formatBtn = wrapper.find('[data-testid="format-btn"]')
    const clearBtn = wrapper.find('[data-testid="clear-btn"]')

    expect(jsonInput.exists()).toBe(true)
    expect(formatBtn.exists()).toBe(true)

    await jsonInput.setValue('{"name": "John", "age": 43}')
    await formatBtn.trigger('click')

    const formattedJson = wrapper.find('[data-testid="formatted-json"]')

    expect(formattedJson.exists()).toBe(true)

    await clearBtn.trigger('click')

    expect((jsonInput.element as HTMLTextAreaElement).value).toBe('')
    expect(wrapper.find('[data-testid="formatted-json"]').exists()).toBe(false)
  })

  it('copies formatted JSON to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    const jsonInput = wrapper.find('[data-testid="json-input"]')
    const formatBtn = wrapper.find('[data-testid="format-btn"]')

    await jsonInput.setValue('{"name": "John", "age": 43}')
    await formatBtn.trigger('click')

    const copyBtn = wrapper.find('[data-testid="copy-btn"]')

    expect(copyBtn.exists()).toBe(true)

    await copyBtn.trigger('click')

    expect(writeText).toHaveBeenCalledOnce()
    expect(copyBtn.text()).toContain('Copied!')
  })

  it('Show error correctly', async () => {
    const jsonInput = wrapper.find('[data-testid="json-input"]')
    const formatBtn = wrapper.find('[data-testid="format-btn"]')

    expect(jsonInput.exists()).toBe(true)
    expect(formatBtn.exists()).toBe(true)

    await jsonInput.setValue('<div></div')
    await formatBtn.trigger('click')

    const errorMessage = wrapper.find('[data-testid="error-message"]')
    const formattedJson = wrapper.find('[data-testid="formatted-json"]')

    expect(errorMessage.exists()).toBe(true)
    expect(errorMessage.text().length).toBeGreaterThan(0)
    expect(formattedJson.exists()).toBe(false)
  })
})
