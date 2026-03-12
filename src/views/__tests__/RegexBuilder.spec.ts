import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RegexBuilder from '../RegexBuilderView.vue'

describe('Regex Builder', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(RegexBuilder)
  })

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('regex anchors are working', async () => {
    const anchorBtns = wrapper.findAll('[data-testid^="anchor-"]')
    expect(anchorBtns.length).toBe(2)

    await anchorBtns[0]?.trigger('click')
    expect(anchorBtns[0]?.classes()).toContain('bg-accent')

    await anchorBtns[1]?.trigger('click')
    expect(anchorBtns[1]?.classes()).toContain('bg-accent')
  })

  it('regex buttons are working', async () => {
    const regexBtns = wrapper.findAll('[data-testid^="regex-btn-"]')
    expect(regexBtns.length).toBe(8)

    await regexBtns[0]?.trigger('click')
    expect(regexBtns[0]?.classes()).toContain('bg-accent')

    await regexBtns[1]?.trigger('click')
    expect(regexBtns[1]?.classes()).toContain('bg-accent')

    await regexBtns[2]?.trigger('click')
    expect(regexBtns[2]?.classes()).toContain('bg-accent')

    await regexBtns[3]?.trigger('click')
    expect(regexBtns[3]?.classes()).toContain('bg-accent')

    await regexBtns[4]?.trigger('click')
    expect(regexBtns[4]?.classes()).toContain('bg-accent')

    await regexBtns[5]?.trigger('click')
    expect(regexBtns[5]?.classes()).toContain('bg-accent')

    await regexBtns[6]?.trigger('click')
    expect(regexBtns[6]?.classes()).toContain('bg-accent')
  })

  it('regex quantifier buttons are working and rendered properly', () => {
    // checks if the quantifier buttons are added to the regex pattern
    const quantifierBtns = wrapper.findAll('[data-testid^="quantifier-btn-"]')
    expect(quantifierBtns.length).toBe(5)

    // checks if the quantifier buttons are rendered properly
    quantifierBtns.forEach((btn) => {
      expect(btn.exists()).toBe(true)
    })
  })

  it('regex flags checkbox are working', async () => {
    const flagBtns = wrapper.findAll('[data-testid^="flag-"]')
    expect(flagBtns.length).toBe(3)

    const firstFlag = flagBtns[0]!

    expect((firstFlag.element as HTMLInputElement).checked).toBe(false)

    await firstFlag.trigger('click')
    expect((firstFlag.element as HTMLInputElement).checked).toBe(true)

    await firstFlag.trigger('click')
    expect((firstFlag.element as HTMLInputElement).checked).toBe(false)
  })

  it('regex pattern is rendered properly', async () => {
    const regexPattern = wrapper.find('[data-testid="regex-pattern"]')

    expect(regexPattern.exists()).toBe(true)
    expect((regexPattern.element as HTMLInputElement).value).toBe('')

    // check it output is being added to the regex pattern
    const firstAnchorBtn = wrapper.findAll('[data-testid^="anchor-"]')[0]
    const firstRegexBtn = wrapper.findAll('[data-testid^="regex-btn-"]')[0]
    const firstQuantifierBtn = wrapper.findAll('[data-testid^="quantifier-btn-"]')[0]
    const firstFlagBtn = wrapper.find('[data-testid="flag-g"]')

    expect(firstAnchorBtn?.exists()).toBe(true)
    expect(firstRegexBtn?.exists()).toBe(true)
    expect(firstQuantifierBtn?.exists()).toBe(true)
    expect(firstFlagBtn.exists()).toBe(true)

    await firstAnchorBtn?.trigger('click')

    expect((regexPattern.element as HTMLInputElement).value).toContain('^')

    await firstRegexBtn?.trigger('click')

    expect((regexPattern.element as HTMLInputElement).value).toContain('\\d')

    await firstQuantifierBtn?.trigger('click')

    expect((regexPattern.element as HTMLInputElement).value).toContain('\\d+')

    await firstFlagBtn?.setValue(true)

    expect((regexPattern.element as HTMLInputElement).value).toContain('/g')
  })

  it('regex copy and clear are working', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    const regexPattern = wrapper.find('[data-testid="regex-pattern"]')
    const copyBtn = wrapper.find('[data-testid="copy-btn"]')
    const clearBtn = wrapper.find('[data-testid="clear-btn"]')

    expect(regexPattern.exists()).toBe(true)
    expect((regexPattern.element as HTMLInputElement).value).toBe('')

    // check it output is being added to the regex pattern
    const firstAnchorBtn = wrapper.findAll('[data-testid^="anchor-"]')[0]
    const firstRegexBtn = wrapper.findAll('[data-testid^="regex-btn-"]')[0]
    const firstQuantifierBtn = wrapper.findAll('[data-testid^="quantifier-btn-"]')[0]
    const firstFlagBtn = wrapper.find('[data-testid="flag-g"]')

    expect(firstAnchorBtn?.exists()).toBe(true)
    expect(firstRegexBtn?.exists()).toBe(true)
    expect(firstQuantifierBtn?.exists()).toBe(true)
    expect(firstFlagBtn.exists()).toBe(true)

    await firstAnchorBtn?.trigger('click')

    expect((regexPattern.element as HTMLInputElement).value).toContain('^')

    await firstRegexBtn?.trigger('click')

    expect((regexPattern.element as HTMLInputElement).value).toContain('\\d')

    await firstQuantifierBtn?.trigger('click')

    expect((regexPattern.element as HTMLInputElement).value).toContain('\\d+')

    await firstFlagBtn?.setValue(true)

    expect((regexPattern.element as HTMLInputElement).value).toContain('/g')

    await copyBtn.trigger('click')

    expect(writeText).toHaveBeenCalledExactlyOnceWith('/^\\d+/g')
    expect(copyBtn.text()).toContain('Copied!')

    await clearBtn.trigger('click')
    expect((regexPattern.element as HTMLInputElement).value).toBe('')
  })

  it('regex test string and output is working', async () => {
    const digitRegexBtn = wrapper.find('[data-testid="regex-btn-digit"]')
    const quantifierPlusbtn = wrapper.find('[data-testid="quantifier-btn-+"]')
    const testStringInput = wrapper.find('[data-testid="test-string"]')
    const testButton = wrapper.find('[data-testid="test-btn"]')
    const regexPattern = wrapper.find('[data-testid="regex-pattern"]')

    expect(digitRegexBtn.exists()).toBe(true)
    expect(testStringInput.exists()).toBe(true)
    expect(quantifierPlusbtn.exists()).toBe(true)
    expect(testButton.exists()).toBe(true)
    expect(regexPattern.exists()).toBe(true)

    await digitRegexBtn.trigger('click')
    expect((regexPattern.element as HTMLInputElement).value).toContain('\\d')

    await quantifierPlusbtn.trigger('click')
    expect((regexPattern.element as HTMLInputElement).value).toContain('\\d+')

    await testStringInput.setValue('Hello123')
    await testButton.trigger('click')

    const outputMatch = wrapper.find('[data-testid="match"]')
    const outputResult = wrapper.find('[data-testid="output-result"]')

    expect(outputMatch.exists()).toBe(true)
    expect(outputResult.exists()).toBe(true)

    expect(outputMatch.classes()).toContain('text-green-400')
    expect(outputResult.text()).toBe('123 — 1 match')
  })

  it('regex test string and no match is working', async () => {
    const digitRegexBtn = wrapper.find('[data-testid="regex-btn-digit"]')
    const quantifierPlusbtn = wrapper.find('[data-testid="quantifier-btn-+"]')
    const testStringInput = wrapper.find('[data-testid="test-string"]')
    const testButton = wrapper.find('[data-testid="test-btn"]')
    const regexPattern = wrapper.find('[data-testid="regex-pattern"]')

    expect(digitRegexBtn.exists()).toBe(true)
    expect(testStringInput.exists()).toBe(true)
    expect(quantifierPlusbtn.exists()).toBe(true)
    expect(testButton.exists()).toBe(true)
    expect(regexPattern.exists()).toBe(true)

    await digitRegexBtn.trigger('click')
    expect((regexPattern.element as HTMLInputElement).value).toContain('\\d')

    await quantifierPlusbtn.trigger('click')
    expect((regexPattern.element as HTMLInputElement).value).toContain('\\d+')

    await testStringInput.setValue('Hello World')
    await testButton.trigger('click')

    const outputMatch = wrapper.find('[data-testid="match"]')
    const outputResult = wrapper.find('[data-testid="output-result"]')
    const noMatchResult = wrapper.find('[data-testid="no-match"]')

    expect(outputMatch.exists()).toBe(false)
    expect(outputResult.exists()).toBe(false)
    expect(noMatchResult.exists()).toBe(true)

    expect(noMatchResult.classes()).toContain('text-red-400')
    expect(noMatchResult.text()).toBe('No match found')
  })
})
