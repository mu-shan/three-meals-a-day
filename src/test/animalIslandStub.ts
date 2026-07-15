import { defineComponent, h, ref } from 'vue'

export const Button = defineComponent({
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => h('button', attrs, slots.default?.())
  },
})

export const Typewriter = defineComponent({
  props: {
    text: String,
  },
  setup(props) {
    return () => h('span', { 'data-animal-component': 'typewriter' }, props.text)
  },
})

export const Title = defineComponent({
  setup(_props, { slots }) {
    return () => h('span', { 'data-animal-component': 'title' }, slots.default?.())
  },
})

export const Divider = defineComponent({
  setup() {
    return () => h('div', { 'data-animal-component': 'divider' })
  },
})

export const Icon = defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () => h('span', { 'data-animal-icon': props.name })
  },
})

export const Footer = defineComponent({
  props: {
    type: {
      type: String,
      default: 'tree',
    },
  },
  setup(props) {
    return () => h('footer', { 'data-animal-footer': props.type })
  },
})

export const Collapse = defineComponent({
  props: {
    question: String,
    answer: String,
    defaultExpanded: {
      type: Boolean,
      default: false,
    },
    expanded: {
      type: Boolean,
      default: undefined,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:expanded', 'change'],
  setup(props, { emit, slots }) {
    const internalExpanded = ref(props.defaultExpanded)

    const toggle = () => {
      if (props.disabled) {
        return
      }

      const nextExpanded = !(props.expanded ?? internalExpanded.value)

      if (props.expanded === undefined) {
        internalExpanded.value = nextExpanded
      }

      emit('update:expanded', nextExpanded)
      emit('change', nextExpanded)
    }

    return () => {
      const isExpanded = props.expanded ?? internalExpanded.value

      return h('div', { 'data-animal-component': 'collapse' }, [
        h(
          'button',
          {
            'data-collapse-trigger': '',
            'aria-expanded': isExpanded,
            disabled: props.disabled,
            onClick: toggle,
          },
          slots.question?.() ?? props.question,
        ),
        isExpanded
          ? h(
              'div',
              { 'data-collapse-content': '' },
              slots.default?.() ?? props.answer,
            )
          : null,
      ])
    }
  },
})
