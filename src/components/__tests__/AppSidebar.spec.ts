import { describe, it, expect, beforeEach, vi } from 'vitest'

import { mount, VueWrapper } from '@vue/test-utils'
import AppSidebar from '../AppSidebar.vue'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('AppSidebar', () => {
  let router: Router
  let wrapper: VueWrapper
  let pinia: ReturnType<typeof createPinia>

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'Formatter', component: { template: '<div></div>' } },
        { path: '/regex-builder', name: 'regex-builder', component: { template: '<div></div>' } },
        { path: '/color-picker', name: 'color-picker', component: { template: '<div></div>' } },
      ],
    })
    wrapper = mount(AppSidebar, {
      global: {
        plugins: [router, pinia],
      },
    })
  })

  it('renders properly', () => {
    expect(wrapper.text()).toContain('DevKit')
  })

  it('contains navigation links', () => {
    const links = wrapper.findAllComponents({ name: 'RouterLink' })

    links.forEach((link, i) => {
      console.log(`Link ${i}:`, link.props('to'), '→', link.text(), 'length: ', links.length)
    })

    expect(links.length).toBeGreaterThan(1)

    // JSON Formatter
    expect(links[0]?.props('to')).toBe('/')
    expect(links[0]?.text()).toBe('JSON Formatter')

    // Regex Builder
    expect(links[1]?.props('to')).toBe('/regex-builder')
    expect(links[1]?.text()).toBe('Regex Builder')

    // Color Picker
    expect(links[2]?.props('to')).toBe('/color-picker')
    expect(links[2]?.text()).toBe('Color Picker')
  })

  it('has a navigation link to JSON Formatter', () => {
    const link = wrapper.findAllComponents({ name: 'RouterLink' })

    expect(link[0]?.props('to')).toBe('/')
    expect(link[0]?.text()).toContain('JSON Formatter')
  })

  it('has a navigation link to Regex Builder', () => {
    const link = wrapper.findAllComponents({ name: 'RouterLink' })

    expect(link[1]?.props('to')).toBe('/regex-builder')
    expect(link[1]?.text()).toContain('Regex Builder')
  })

  it('has a navigation link to Color Picker', () => {
    const link = wrapper.findAllComponents({ name: 'RouterLink' })

    expect(link[2]?.props('to')).toBe('/color-picker')
    expect(link[2]?.text()).toContain('Color Picker')
  })
})
