import { defineComponent, h, ref, type PropType } from 'vue'

interface TabItem {
  key: string
  label: string
}

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
    return () => h('div', { 'data-animal-component': 'loading' })
  },
})

export const Time = defineComponent({
  setup() {
    return () =>
      h(
        'div',
        {
          class: 'animal-time',
          'data-animal-component': 'time',
        },
        [
          h('span', { class: 'animal-time__date' }),
          h('span', { class: 'animal-time__clock' }),
        ],
      )
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

export const Tabs = defineComponent({
  props: {
    items: {
      type: Array as PropType<TabItem[]>,
      required: true,
    },
    modelValue: String,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const selectTab = (key: string) => {
      emit('update:modelValue', key)
      emit('change', key)
    }

    return () =>
      h(
        'div',
        { 'data-animal-component': 'tabs' },
        props.items.map((item) =>
          h(
            'button',
            {
              'data-tab-key': item.key,
              'aria-pressed': props.modelValue === item.key,
              onClick: () => selectTab(item.key),
            },
            item.label,
          ),
        ),
      )
  },
})

export const Collapse = defineComponent({
  props: {
    question: String,
    defaultExpanded: {
      type: Boolean,
      default: false,
    },
    expanded: {
      type: Boolean,
      default: undefined,
    },
  },
  emits: ['update:expanded', 'change'],
  setup(props, { emit, slots }) {
    const internalExpanded = ref(props.defaultExpanded)

    const toggle = () => {
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
            onClick: toggle,
          },
          props.question,
        ),
        isExpanded
          ? h('div', { 'data-collapse-content': '' }, slots.default?.())
          : null,
      ])
    }
  },
})
