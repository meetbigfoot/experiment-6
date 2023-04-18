const g = document.getElementById.bind(document)
const q = document.querySelectorAll.bind(document)

mapboxgl.accessToken = 'pk.eyJ1IjoibWF0dGJvcm4iLCJhIjoiY2w1Ym0wbHZwMDh3eTNlbnh1aW51cm0ydyJ9.Z5h4Vkk8zqjf6JydrOGXGA'

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
let test = {
  gpt_context:
    "Here's a plan for a full day in Venice Beach for you! It includes some fun activities and delicious food options.",
  plan_date: 'Monday, Apr 17, 2023',
  plan_title: '🌞 Fun Day in Venice Beach 🏖️',
  plan: [
    {
      time_of_day: 'morning',
      places: [
        {
          name: 'Venice Canals',
          address: '1601 Ocean Front Walk, Venice, CA 90291',
          latitude: 33.9835,
          longitude: -118.4675,
          area: 'Venice Beach',
          distance: '0.9 miles',
          reason: 'Explore the charming area and beautiful houses along the Venice canals.',
          tags: 'scenic, Instagram-worthy, peaceful',
          tiktok_query: 'venice beach canals',
        },
        {
          name: 'Blue Bottle Coffee',
          address: '1103 Abbot Kinney Blvd, Venice, CA 90291',
          latitude: 33.9915,
          longitude: -118.4632,
          area: 'Venice Beach',
          distance: '1.5 miles',
          reason: 'Start the day with a delicious cup of coffee from this popular cafe.',
          tags: 'coffee, breakfast, trendy',
          tiktok_query: 'blue bottle coffee venice beach',
        },
      ],
    },
    {
      time_of_day: 'afternoon',
      places: [
        {
          name: 'Venice Skatepark',
          address: '1800 Ocean Front Walk, Venice, CA 90291',
          latitude: 33.9866,
          longitude: -118.4744,
          area: 'Venice Beach',
          distance: '1.4 miles',
          reason: 'Watch the local skateboarders and soak up the beach vibes at this iconic skatepark.',
          tags: 'skateboarding, beach, free',
          tiktok_query: 'venice beach skatepark',
        },
        {
          name: 'Gjusta Bakery',
          address: '320 Sunset Ave, Venice, CA 90291',
          latitude: 33.9908,
          longitude: -118.4645,
          area: 'Venice Beach',
          distance: '1.5 miles',
          reason: 'Enjoy a delicious sandwich or pastry from this trendy bakery.',
          tags: 'lunch, bakery, Instagram-worthy',
          tiktok_query: 'gjusta bakery venice beach',
        },
      ],
    },
    {
      time_of_day: 'evening',
      places: [
        {
          name: 'The Otheroom',
          address: '1201 Abbot Kinney Blvd, Venice, CA 90291',
          latitude: 33.9899,
          longitude: -118.463,
          area: 'Venice Beach',
          distance: '1.6 miles',
          reason: "Enjoy a happy hour drink and snacks at this local spot that's not too touristy.",
          tags: 'happy hour, drinks, casual',
          tiktok_query: 'the otheroom venice beach',
        },
        {
          name: 'The Tasting Kitchen',
          address: '1633 Abbot Kinney Blvd, Venice, CA 90291',
          latitude: 33.9882,
          longitude: -118.4663,
          area: 'Venice Beach',
          distance: '1.3 miles',
          reason: 'End the day with dinner at this high-end restaurant featuring New American cuisine.',
          tags: 'dinner, upscale, romantic',
          tiktok_query: 'the tasting kitchen venice beach',
        },
      ],
    },
  ],
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
  g('loading').style.display = 'none'
  constants.places = [] // reset places each time
  console.log(data)

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
  constants.places.forEach(spot => {
    console.log(spot)
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

const simulate = () => {
  g('collection').style.display = 'flex'
  constants.prompt = 'plan a fun day in venice beach'
  render(test)
}
