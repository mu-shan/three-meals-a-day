import type { Dish, IngredientCategory, MealType } from '../types/menu'

const twemoji = (code: string) =>
  `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${code}.svg`

const ingredient = (name: string, category: IngredientCategory) => ({ name, category })

const meals = (...values: MealType[]) => values

export const BABY_RICE_DISH_IDS = [
  'tomato-eggs',
  'shredded-potato',
  'stir-fried-sprouts',
] as const

export const dishes: Dish[] = [
  {
    id: 'millet-porridge', name: '小米粥', meals: meals('breakfast'), role: 'staple', kind: 'one-bowl', spicy: false, babyFriendly: true,
    ingredients: [ingredient('小米', 'staples')], image: twemoji('1f963'),
  },
  {
    id: 'pumpkin-porridge', name: '南瓜粥', meals: meals('breakfast'), role: 'staple', kind: 'one-bowl', spicy: false, babyFriendly: true,
    ingredients: [ingredient('大米', 'staples'), ingredient('南瓜', 'vegetables')], image: twemoji('1f383'),
  },
  {
    id: 'oatmeal', name: '牛奶燕麦粥', meals: meals('breakfast'), role: 'staple', kind: 'one-bowl', spicy: false, babyFriendly: true,
    ingredients: [ingredient('燕麦', 'staples'), ingredient('牛奶', 'protein')], image: twemoji('1f963'),
  },
  {
    id: 'steamed-bun', name: '奶香小馒头', meals: meals('breakfast', 'dinner'), role: 'staple', kind: 'one-bowl', spicy: false, babyFriendly: true,
    ingredients: [ingredient('面粉', 'staples'), ingredient('牛奶', 'protein')], image: twemoji('1f35e'),
  },
  {
    id: 'boiled-corn', name: '香甜玉米', meals: meals('breakfast'), role: 'staple', kind: 'one-bowl', spicy: false, babyFriendly: true,
    ingredients: [ingredient('玉米', 'staples')], image: twemoji('1f33d'),
  },
  {
    id: 'steamed-sweet-potato', name: '蒸红薯', meals: meals('breakfast'), role: 'staple', kind: 'one-bowl', spicy: false, babyFriendly: true,
    ingredients: [ingredient('红薯', 'staples')], image: twemoji('1f360'),
  },
  {
    id: 'egg-pancake', name: '鸡蛋软饼', meals: meals('breakfast'), role: 'staple', kind: 'one-bowl', spicy: false, babyFriendly: true,
    ingredients: [ingredient('面粉', 'staples'), ingredient('鸡蛋', 'protein')], image: twemoji('1f95e'),
  },
  {
    id: 'toast', name: '全麦吐司', meals: meals('breakfast'), role: 'staple', kind: 'one-bowl', spicy: false, babyFriendly: true,
    ingredients: [ingredient('全麦面包', 'staples')], image: twemoji('1f35e'),
  },
  {
    id: 'warm-milk', name: '温牛奶', meals: meals('breakfast'), role: 'drink', kind: 'drink', spicy: false, babyFriendly: true,
    ingredients: [ingredient('牛奶', 'protein')], image: twemoji('1f95b'),
  },
  {
    id: 'soy-milk', name: '现磨豆浆', meals: meals('breakfast'), role: 'drink', kind: 'drink', spicy: false, babyFriendly: true,
    ingredients: [ingredient('黄豆', 'protein')], image: twemoji('1f964'),
  },
  {
    id: 'steamed-egg-breakfast', name: '嫩滑蒸蛋', meals: meals('breakfast'), role: 'drink', kind: 'dish', spicy: false, babyFriendly: true,
    ingredients: [ingredient('鸡蛋', 'protein')], image: twemoji('1f95a'),
  },
  {
    id: 'plain-yogurt', name: '原味酸奶', meals: meals('breakfast'), role: 'drink', kind: 'drink', spicy: false, babyFriendly: true,
    ingredients: [ingredient('酸奶', 'protein')], image: twemoji('1f95b'),
  },
  {
    id: 'boiled-egg', name: '水煮蛋', meals: meals('breakfast'), role: 'drink', kind: 'dish', spicy: false, babyFriendly: true,
    ingredients: [ingredient('鸡蛋', 'protein')], image: twemoji('1f95a'),
  },
  {
    id: 'banana', name: '香蕉', meals: meals('breakfast'), role: 'fruit', kind: 'fruit', spicy: false, babyFriendly: true,
    ingredients: [ingredient('香蕉', 'fruit')], image: twemoji('1f34c'),
  },
  {
    id: 'apple', name: '苹果', meals: meals('breakfast'), role: 'fruit', kind: 'fruit', spicy: false, babyFriendly: true,
    ingredients: [ingredient('苹果', 'fruit')], image: twemoji('1f34e'),
  },
  {
    id: 'orange', name: '橙子', meals: meals('breakfast'), role: 'fruit', kind: 'fruit', spicy: false, babyFriendly: true,
    ingredients: [ingredient('橙子', 'fruit')], image: twemoji('1f34a'),
  },
  {
    id: 'strawberry', name: '草莓', meals: meals('breakfast'), role: 'fruit', kind: 'fruit', spicy: false, babyFriendly: true,
    ingredients: [ingredient('草莓', 'fruit')], image: twemoji('1f353'),
  },
  {
    id: 'blueberry', name: '蓝莓', meals: meals('breakfast'), role: 'fruit', kind: 'fruit', spicy: false, babyFriendly: true,
    ingredients: [ingredient('蓝莓', 'fruit')], image: twemoji('1fad0'),
  },
  {
    id: 'pear', name: '雪梨', meals: meals('breakfast'), role: 'fruit', kind: 'fruit', spicy: false, babyFriendly: true,
    ingredients: [ingredient('雪梨', 'fruit')], image: twemoji('1f350'),
  },
  {
    id: 'kiwi', name: '猕猴桃', meals: meals('breakfast'), role: 'fruit', kind: 'fruit', spicy: false, babyFriendly: true,
    ingredients: [ingredient('猕猴桃', 'fruit')], image: twemoji('1f95d'),
  },
  {
    id: 'watermelon', name: '西瓜', meals: meals('breakfast'), role: 'fruit', kind: 'fruit', spicy: false, babyFriendly: true,
    ingredients: [ingredient('西瓜', 'fruit')], image: twemoji('1f349'),
  },
  {
    id: 'steamed-rice', name: '香喷喷米饭', meals: meals('lunch', 'dinner'), role: 'staple', kind: 'rice', spicy: false, babyFriendly: true,
    ingredients: [ingredient('大米', 'staples')], image: twemoji('1f35a'),
  },
  {
    id: 'tomato-noodles', name: '番茄鸡蛋面', meals: meals('lunch', 'dinner'), role: 'staple', kind: 'one-bowl', spicy: false, babyFriendly: true,
    ingredients: [ingredient('面条', 'staples'), ingredient('西红柿', 'vegetables'), ingredient('鸡蛋', 'protein')], image: twemoji('1f35c'),
  },
  {
    id: 'pork-dumplings', name: '白菜猪肉饺子', meals: meals('lunch', 'dinner'), role: 'staple', kind: 'one-bowl', spicy: false, babyFriendly: true,
    ingredients: [ingredient('饺子皮', 'staples'), ingredient('白菜', 'vegetables'), ingredient('猪肉', 'protein')], image: twemoji('1f95f'),
  },
  {
    id: 'beef-noodles', name: '清汤牛肉面', meals: meals('lunch'), role: 'staple', kind: 'one-bowl', spicy: false, babyFriendly: true,
    ingredients: [ingredient('面条', 'staples'), ingredient('牛肉', 'protein'), ingredient('青菜', 'vegetables')], image: twemoji('1f35c'),
  },
  {
    id: 'vegetable-risotto', name: '蔬菜烩饭', meals: meals('lunch', 'dinner'), role: 'staple', kind: 'one-bowl', spicy: false, babyFriendly: true,
    ingredients: [ingredient('大米', 'staples'), ingredient('胡萝卜', 'vegetables'), ingredient('豌豆', 'vegetables')], image: twemoji('1f35b'),
  },
  {
    id: 'tomato-eggs', name: '西红柿炒鸡蛋', meals: meals('lunch', 'dinner'), role: 'baby', kind: 'dish', spicy: false, babyFriendly: true,
    ingredients: [ingredient('西红柿', 'vegetables'), ingredient('鸡蛋', 'protein')], image: twemoji('1f345'),
  },
  {
    id: 'shredded-potato', name: '清炒土豆丝', meals: meals('lunch', 'dinner'), role: 'baby', kind: 'dish', spicy: false, babyFriendly: true,
    ingredients: [ingredient('土豆', 'vegetables')], image: twemoji('1f954'),
  },
  {
    id: 'stir-fried-sprouts', name: '清炒豆芽', meals: meals('lunch', 'dinner'), role: 'baby', kind: 'dish', spicy: false, babyFriendly: true,
    ingredients: [ingredient('豆芽', 'vegetables')], image: twemoji('1f331'),
  },
  {
    id: 'steamed-cod', name: '清蒸鳕鱼', meals: meals('lunch', 'dinner'), role: 'baby', kind: 'dish', spicy: false, babyFriendly: true,
    ingredients: [ingredient('鳕鱼', 'protein'), ingredient('姜', 'vegetables')], image: twemoji('1f41f'),
  },
  {
    id: 'broccoli-shrimp', name: '西兰花炒虾仁', meals: meals('lunch', 'dinner'), role: 'baby', kind: 'dish', spicy: false, babyFriendly: true,
    ingredients: [ingredient('西兰花', 'vegetables'), ingredient('虾仁', 'protein')], image: twemoji('1f966'),
  },
  {
    id: 'minced-tofu', name: '肉末豆腐', meals: meals('lunch', 'dinner'), role: 'baby', kind: 'dish', spicy: false, babyFriendly: true,
    ingredients: [ingredient('豆腐', 'protein'), ingredient('猪肉', 'protein')], image: twemoji('1f9c8'),
  },
  {
    id: 'winter-melon-meatballs', name: '冬瓜丸子汤', meals: meals('lunch', 'dinner'), role: 'baby', kind: 'soup', spicy: false, babyFriendly: true,
    ingredients: [ingredient('冬瓜', 'vegetables'), ingredient('猪肉', 'protein')], image: twemoji('1f372'),
  },
  {
    id: 'corn-rib-soup', name: '玉米排骨汤', meals: meals('lunch', 'dinner'), role: 'baby', kind: 'soup', spicy: false, babyFriendly: true,
    ingredients: [ingredient('玉米', 'vegetables'), ingredient('排骨', 'protein')], image: twemoji('1f372'),
  },
  {
    id: 'yam-chicken-soup', name: '山药鸡汤', meals: meals('dinner'), role: 'baby', kind: 'soup', spicy: false, babyFriendly: true,
    ingredients: [ingredient('山药', 'vegetables'), ingredient('鸡肉', 'protein')], image: twemoji('1f372'),
  },
  {
    id: 'pepper-pork', name: '辣椒炒肉', meals: meals('lunch'), role: 'spicy', kind: 'dish', spicy: true, babyFriendly: false,
    ingredients: [ingredient('辣椒', 'vegetables'), ingredient('猪肉', 'protein')], image: twemoji('1f336'),
  },
  {
    id: 'mapo-tofu', name: '麻婆豆腐', meals: meals('lunch'), role: 'spicy', kind: 'dish', spicy: true, babyFriendly: false,
    ingredients: [ingredient('豆腐', 'protein'), ingredient('辣椒', 'vegetables'), ingredient('牛肉末', 'protein')], image: twemoji('1f336'),
  },
  {
    id: 'spicy-wings', name: '香辣鸡翅', meals: meals('lunch'), role: 'spicy', kind: 'dish', spicy: true, babyFriendly: false,
    ingredients: [ingredient('鸡翅', 'protein'), ingredient('辣椒', 'vegetables')], image: twemoji('1f357'),
  },
  {
    id: 'kung-pao-chicken', name: '宫保鸡丁', meals: meals('lunch'), role: 'spicy', kind: 'dish', spicy: true, babyFriendly: false,
    ingredients: [ingredient('鸡肉', 'protein'), ingredient('花生', 'protein'), ingredient('辣椒', 'vegetables')], image: twemoji('1f357'),
  },
  {
    id: 'boiled-fish', name: '水煮鱼片', meals: meals('lunch'), role: 'spicy', kind: 'dish', spicy: true, babyFriendly: false,
    ingredients: [ingredient('鱼片', 'protein'), ingredient('豆芽', 'vegetables'), ingredient('辣椒', 'vegetables')], image: twemoji('1f41f'),
  },
  {
    id: 'hot-sour-potato', name: '酸辣土豆丝', meals: meals('lunch'), role: 'spicy', kind: 'dish', spicy: true, babyFriendly: false,
    ingredients: [ingredient('土豆', 'vegetables'), ingredient('辣椒', 'vegetables')], image: twemoji('1f954'),
  },
  {
    id: 'pepper-eggs', name: '青椒炒鸡蛋', meals: meals('lunch'), role: 'spicy', kind: 'dish', spicy: true, babyFriendly: false,
    ingredients: [ingredient('青椒', 'vegetables'), ingredient('鸡蛋', 'protein')], image: twemoji('1f336'),
  },
  {
    id: 'spicy-cauliflower', name: '干锅花菜', meals: meals('lunch'), role: 'spicy', kind: 'dish', spicy: true, babyFriendly: false,
    ingredients: [ingredient('花菜', 'vegetables'), ingredient('辣椒', 'vegetables')], image: twemoji('1f966'),
  },
  {
    id: 'chopped-pepper-chicken', name: '剁椒鸡块', meals: meals('lunch'), role: 'spicy', kind: 'dish', spicy: true, babyFriendly: false,
    ingredients: [ingredient('鸡肉', 'protein'), ingredient('剁椒', 'vegetables')], image: twemoji('1f357'),
  },
  {
    id: 'braised-pork', name: '家常红烧肉', meals: meals('lunch', 'dinner'), role: 'shared', kind: 'dish', spicy: false, babyFriendly: false,
    ingredients: [ingredient('五花肉', 'protein')], image: twemoji('1f356'),
  },
  {
    id: 'sweet-sour-ribs', name: '糖醋排骨', meals: meals('lunch', 'dinner'), role: 'shared', kind: 'dish', spicy: false, babyFriendly: false,
    ingredients: [ingredient('排骨', 'protein')], image: twemoji('1f356'),
  },
  {
    id: 'soy-chicken', name: '照烧鸡腿', meals: meals('lunch', 'dinner'), role: 'shared', kind: 'dish', spicy: false, babyFriendly: false,
    ingredients: [ingredient('鸡腿', 'protein')], image: twemoji('1f357'),
  },
  {
    id: 'steamed-seabass', name: '清蒸鲈鱼', meals: meals('lunch', 'dinner'), role: 'shared', kind: 'dish', spicy: false, babyFriendly: true,
    ingredients: [ingredient('鲈鱼', 'protein'), ingredient('葱', 'vegetables')], image: twemoji('1f41f'),
  },
  {
    id: 'garlic-broccoli', name: '蒜蓉西兰花', meals: meals('lunch', 'dinner'), role: 'shared', kind: 'dish', spicy: false, babyFriendly: true,
    ingredients: [ingredient('西兰花', 'vegetables'), ingredient('大蒜', 'vegetables')], image: twemoji('1f966'),
  },
  {
    id: 'garlic-lettuce', name: '蒜蓉生菜', meals: meals('lunch', 'dinner'), role: 'shared', kind: 'dish', spicy: false, babyFriendly: true,
    ingredients: [ingredient('生菜', 'vegetables'), ingredient('大蒜', 'vegetables')], image: twemoji('1f96c'),
  },
  {
    id: 'mushroom-bokchoy', name: '香菇青菜', meals: meals('lunch', 'dinner'), role: 'shared', kind: 'dish', spicy: false, babyFriendly: true,
    ingredients: [ingredient('香菇', 'vegetables'), ingredient('青菜', 'vegetables')], image: twemoji('1f344'),
  },
  {
    id: 'cucumber-salad', name: '清爽拍黄瓜', meals: meals('lunch', 'dinner'), role: 'shared', kind: 'dish', spicy: false, babyFriendly: false,
    ingredients: [ingredient('黄瓜', 'vegetables')], image: twemoji('1f952'),
  },
  {
    id: 'lotus-root', name: '清炒藕片', meals: meals('lunch', 'dinner'), role: 'shared', kind: 'dish', spicy: false, babyFriendly: true,
    ingredients: [ingredient('莲藕', 'vegetables')], image: twemoji('1fab7'),
  },
  {
    id: 'eggplant-soy', name: '酱烧茄子', meals: meals('lunch', 'dinner'), role: 'shared', kind: 'dish', spicy: false, babyFriendly: false,
    ingredients: [ingredient('茄子', 'vegetables')], image: twemoji('1f346'),
  },
  {
    id: 'tofu-mushroom', name: '香菇烧豆腐', meals: meals('lunch', 'dinner'), role: 'shared', kind: 'dish', spicy: false, babyFriendly: true,
    ingredients: [ingredient('香菇', 'vegetables'), ingredient('豆腐', 'protein')], image: twemoji('1f9c8'),
  },
  {
    id: 'celery-beef', name: '芹菜炒牛肉', meals: meals('lunch', 'dinner'), role: 'shared', kind: 'dish', spicy: false, babyFriendly: false,
    ingredients: [ingredient('芹菜', 'vegetables'), ingredient('牛肉', 'protein')], image: twemoji('1f969'),
  },
  {
    id: 'carrot-beef', name: '胡萝卜炖牛腩', meals: meals('lunch', 'dinner'), role: 'shared', kind: 'dish', spicy: false, babyFriendly: true,
    ingredients: [ingredient('胡萝卜', 'vegetables'), ingredient('牛腩', 'protein')], image: twemoji('1f955'),
  },
  {
    id: 'seaweed-egg-soup', name: '紫菜蛋花汤', meals: meals('lunch', 'dinner'), role: 'shared', kind: 'soup', spicy: false, babyFriendly: true,
    ingredients: [ingredient('紫菜', 'vegetables'), ingredient('鸡蛋', 'protein')], image: twemoji('1f372'),
  },
  {
    id: 'tomato-tofu-soup', name: '番茄豆腐汤', meals: meals('lunch', 'dinner'), role: 'shared', kind: 'soup', spicy: false, babyFriendly: true,
    ingredients: [ingredient('西红柿', 'vegetables'), ingredient('豆腐', 'protein')], image: twemoji('1f372'),
  },
  {
    id: 'mushroom-chicken', name: '香菇蒸鸡', meals: meals('dinner'), role: 'shared', kind: 'dish', spicy: false, babyFriendly: true,
    ingredients: [ingredient('香菇', 'vegetables'), ingredient('鸡肉', 'protein')], image: twemoji('1f357'),
  },
  {
    id: 'spinach-egg-soup', name: '菠菜鸡蛋汤', meals: meals('dinner'), role: 'shared', kind: 'soup', spicy: false, babyFriendly: true,
    ingredients: [ingredient('菠菜', 'vegetables'), ingredient('鸡蛋', 'protein')], image: twemoji('1f372'),
  },
  {
    id: 'pumpkin-steamed', name: '清甜蒸南瓜', meals: meals('dinner'), role: 'shared', kind: 'dish', spicy: false, babyFriendly: true,
    ingredients: [ingredient('南瓜', 'vegetables')], image: twemoji('1f383'),
  },
]
