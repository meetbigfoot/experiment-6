const g = document.getElementById.bind(document)
const q = document.querySelectorAll.bind(document)

mapboxgl.accessToken = 'pk.eyJ1IjoibWF0dGJvcm4iLCJhIjoiY2w1Ym0wbHZwMDh3eTNlbnh1aW51cm0ydyJ9.Z5h4Vkk8zqjf6JydrOGXGA'

const ls = window.localStorage.getItem('makemyday')
let saved = ls ? JSON.parse(ls) : []

let constants = {
  places: [],
  prompt: 'replace with what the user types in',
  time: dayjs().format(),
  today: dayjs().format('dddd, MMM D, YYYY'),
}
let data = {}
let schema = {
  gpt_context: '',
  plan: [
    {
      time_of_day: 'morning',
      places: [
        {
          address: 'Example',
          area: 'Example',
          distance: '2 blocks',
          icon: 'FontAwesome icon name with no prefix',
          latitude: 12.34,
          longitude: -56.78,
          name: 'Example',
          reason: 'in less than 10 words why we think it is relevant to them',
          tags: 'comma-separated list of descriptors',
          tiktok_query: 'keywords to use to find this on TikTok',
        },
      ],
    },
  ],
  plan_color: 'replace with a hex value',
  plan_date: 'replace with human readable date',
  plan_title: 'make it fun and use emojis',
}

let history = [
  {
    role: 'system',
    content: `You are helping me build a digital concierge app to help our users find surprising things to do near where they are.`,
  },
]

const toJSON = str => {
  const curly = str.indexOf('{')
  const square = str.indexOf('[')
  let first
  if (curly < 0) first = '[' // only for empty arrays
  else if (square < 0) first = '{'
  else first = curly < square ? '{' : '['
  const last = first === '{' ? '}' : ']'
  // ensure JSON is complete
  let count = 0
  for (c of str) {
    if (c === '{' || c === '[') count++
    else if (c === '}' || c === ']') count--
  }
  if (!count) return JSON.parse(str.slice(str.indexOf(first), str.lastIndexOf(last) + 1))
}

const heyI = async messages => {
  g('collection').style.display = 'flex'
  g('loading').style.display = 'flex'
  const response = await fetch(`https://us-central1-samantha-374622.cloudfunctions.net/turbo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  })
  return response.text()
}

g('form').addEventListener('submit', e => {
  e.preventDefault()
  constants.prompt = g('input').value
  history.push({
    role: 'user',
    content: `Today is ${
      constants.today
    }. Plan a full day of local experiences including both free and paid activities, entertainment, food, sight-seeing, or ideas for how to enjoy the area while spending time with loved ones while avoiding touristy spots for ${
      constants.prompt
    }. Now return only a JSON object that copies this schema: ${JSON.stringify(
      schema,
    )}, use the values as hints, only one or two recommendations per time of day, keep recommendations within 1 mile of each other, translate all values if the user specifies a language, and include anything else you want to say in the key called gpt_context.`,
  })
  heyI(history).then(text => {
    history.push({
      role: 'assistant',
      content: text,
    })
    render(toJSON(text))
  })
})

const render = d => {
  data = d
  saveCollection()
  g('loading').style.display = 'none'
  constants.places = [] // reset places each time

  // cover
  g('title').textContent = data.plan_title
  g('date').textContent = data.plan_date
  g('prompt').textContent = constants.prompt

  // plan
  g('plan').innerHTML = ''
  data.plan.forEach(part => {
    const group = document.createElement('div')
    group.className = 'plan-group'
    const time = document.createElement('div')
    time.className = 'plan-time-of-day'
    time.textContent = part.time_of_day
    group.appendChild(time)
    const stack = document.createElement('div')
    stack.className = 'plan-stack'
    part.places.forEach(spot => {
      spot.time_of_day = part.time_of_day
      constants.places.push(spot)
      const place = document.createElement('div')
      place.className = 'plan-place'
      const name = document.createElement('h2')
      name.className = 'plan-name'
      name.textContent = spot.name
      place.appendChild(name)
      const reason = document.createElement('div')
      reason.className = 'plan-reason'
      reason.textContent = spot.reason
      place.appendChild(reason)
      stack.appendChild(place)
    })
    group.appendChild(stack)
    g('plan').appendChild(group)
  })

  // map
  const firstPlace = constants.places[0]
  const map = new mapboxgl.Map({
    center: [firstPlace.longitude, firstPlace.latitude],
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    zoom: 14,
  })
  map.addControl(new mapboxgl.NavigationControl())
  constants.places.forEach(place => {
    const marker = document.createElement('div')
    marker.className = 'marker'
    const icon = document.createElement('i')
    icon.className = `fa-solid fa-${place.icon}`
    marker.appendChild(icon)
    new mapboxgl.Marker(marker).setLngLat([place.longitude, place.latitude]).addTo(map)
  })

  // story
  g('media').innerHTML = ''
  constants.places.forEach(spot => {
    const story = document.createElement('div')
    story.className = 'iphone-14 story'

    const group = document.createElement('div')
    group.className = 'plan-group'
    const time = document.createElement('div')
    time.className = 'plan-time-of-day'
    time.textContent = spot.time_of_day
    group.appendChild(time)
    const stack = document.createElement('div')
    stack.className = 'plan-stack'
    const name = document.createElement('h2')
    name.className = 'plan-name'
    name.textContent = spot.name
    stack.appendChild(name)
    const reason = document.createElement('div')
    reason.className = 'plan-reason'
    reason.textContent = spot.reason
    stack.appendChild(reason)

    group.appendChild(stack)
    story.appendChild(group)

    g('media').appendChild(story)
  })
}

const loadCollection = item => {
  console.log('Loading collection:', item)
  g('collection').style.display = 'flex'
  constants.prompt = item.prompt
  render(item)
}

const saveCollection = () => {
  if (saved[0].prompt === data.prompt) return
  console.log('Saving collection:', data)
  data.prompt = constants.prompt
  saved.push(data)
  localStorage.setItem('makemyday', JSON.stringify(saved))
  listCollections()
}

const listCollections = () => {
  g('saved').innerHTML = ''
  console.log('Listing collections:', saved)
  saved.forEach(item => {
    const collection = document.createElement('div')
    collection.className = 'collection'
    collection.onclick = () => loadCollection(item)
    const date = document.createElement('div')
    date.className = 'collection-date'
    date.textContent = item.plan_date
    collection.appendChild(date)
    const title = document.createElement('h2')
    title.textContent = item.plan_title
    collection.appendChild(title)
    g('saved').appendChild(collection)
  })
}
