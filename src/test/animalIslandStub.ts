import { defineComponent, h } from 'vue'

export const Button = defineComponent({
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => h('button', attrs, slots.default?.())
  },
})

export const Card = defineComponent({
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => h('div', attrs, slots.default?.())
  },
})

export const Loading = defineComponent({
  setup() {
    return () => h('div')
  },
})

export const Time = defineComponent({
  setup() {
    return () => h('time')
  },
})
