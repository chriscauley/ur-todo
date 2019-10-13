import uR from 'unrest.io'

export const ICON_CHOICES = (uR.ICON_CHOICES = [
  'beer',
  'beers',
  'cat-food',
  'cat-feeder',
  'cat-brush',
  'cigarettes',
  'cleaning',
  'dental-floss',
  'drop',
  'dryer',
  'flowers',
  'hop',
  'lifeline-in-a-heart-outline',
  'meditation',
  'mushrooms',
  'razor',
  'selkirk-rex-cat',
  'shirt',
  'shower',
  'skull',
  'smoking',
  'toothbrush',
  'vegetables',
  'warrior',
  'washing-machine',
  'washing-plate',
])

const SVGS = ['warrior', 'meditation']

const styles = [
  `.fi { background: center no-repeat; background-size: 100% auto; display: inline-block; }`,
]
ICON_CHOICES.forEach(choice => {
  uR.css.icon.overrides[choice] = 'fi fi_' + choice
  const e = SVGS.includes(choice) ? 'svg' : 'png'
  styles.push(
    `.fi_${choice} { background-image: url(/static/icons/${choice}.${e});width: 1em; height: 1em; }`,
  )
})

const head = document.head || document.getElementsByTagName('head')[0]
const style = document.createElement('style')
style.type = 'text/css'
if (style.styleSheet) {
  style.styleSheet.cssText = styles.join('\n')
} else {
  style.appendChild(document.createTextNode(styles.join('\n')))
}
head.appendChild(style)

uR.admin.DEBUG_URLS.push('/app/icons/')

uR.router.add({
  '/app/icons/': uR.router.routeElement('todo-icons'),
})
