import { defineComponent, h, ref, watch, type PropType } from 'vue'

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
    defaultActiveKey: String,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, slots }) {
    const internalActiveKey = ref(props.defaultActiveKey ?? props.items[0]?.key)

    watch(
      () => props.items,
      (items) => {
        if (
          props.modelValue === undefined &&
          !items.some((item) => item.key === internalActiveKey.value)
        ) {
          internalActiveKey.value = items[0]?.key
        }
      },
    )

    const selectTab = (key: string) => {
      if (props.modelValue === undefined) {
        internalActiveKey.value = key
      }

      emit('update:modelValue', key)
      emit('change', key)
    }

    return () => {
      const activeKey = props.modelValue ?? internalActiveKey.value
      const activeItem = props.items.find((item) => item.key === activeKey)
      const activeContent = activeItem
        ? slots[activeItem.key]?.({ item: activeItem })
        : undefined

      return h('div', { 'data-animal-component': 'tabs' }, [
        ...props.items.map((item) =>
          h(
            'button',
            {
              'data-tab-key': item.key,
              'aria-pressed': activeKey === item.key,
              onClick: () => selectTab(item.key),
            },
            item.label,
          ),
        ),
        ...(activeContent ?? []),
      ])
    }
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
