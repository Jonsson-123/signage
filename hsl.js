const stops = [
  {
    id: 'HSL:2132225',
  },
  {
    id: 'HSL:2132226',
  },
  {
    id: 'HSL:2132552',
  },
  {
    id: 'HSL:2132502',
  },
];
const convertTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}:${mins < 10 ? '0' + mins : mins}`;
};
const returnQuery = (id) => {
  return `{
    stop(id: "${id}") {
      name
      lat
      lon
      stoptimesWithoutPatterns {
        scheduledArrival
        realtimeArrival
        arrivalDelay
        scheduledDeparture
        realtimeDeparture
        departureDelay
        realtime
        realtimeState
        serviceDay
        headsign
        trip {
          routeShortName
          tripHeadsign
        }
      }
    }
  }`;
};

const fetchHSLData = async () => {
  try {
    const hslData = [];
    for (const stop of stops) {
      const query = returnQuery(stop.id);
      const response = await fetch(
        'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'digitransit-subscription-key': '7610807e7032411982584edf9ba3a833',
          },
          body: JSON.stringify({ query }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      hslData.push(data.data.stop);
    }
    console.log(hslData, 'hslDatasdasda');
    return hslData;
  } catch (error) {
    console.error('Error:', error);
  }
};

const renderHSL = async () => {
  const hslData = await fetchHSLData();
  const junaLista1 = document.getElementById('train-timetable-1');
  const junaLista2 = document.getElementById('train-timetable-2');
  const bussiLista1 = document.getElementById('bus-timetable-1');
  const bussiLista2 = document.getElementById('bus-timetable-2');
  junaLista1.innerHTML = '';
  junaLista2.innerHTML = '';
  bussiLista1.innerHTML = '';
  bussiLista2.innerHTML = '';

  const usedIndexes = [];

  hslData.forEach((stop, stopIndex) => {
    stop.stoptimesWithoutPatterns.forEach((time) => {
      const routeShortName = time.trip.routeShortName;
      const tripHeadsign = time.trip.tripHeadsign;
      const realtimeArrival = convertTime(time.realtimeArrival);
      const listItem = document.createElement('li');

      listItem.textContent = `${routeShortName} - ${tripHeadsign} - ${realtimeArrival}`;
      console.log(usedIndexes, 'usedIndexes');
      console.log(stopIndex, 'stopIndex');
      if (stop.name === 'Kera' && stopIndex % 2 === 0) {
        junaLista1.appendChild(listItem);
      }
      if (stop.name === 'Kera' && stopIndex % 2 !== 0) {
        junaLista2.appendChild(listItem);
      }
      if (stop.name !== 'Kera' && stopIndex % 2 === 0) {
        bussiLista1.appendChild(listItem);
      }
      if (stop.name !== 'Kera' && stopIndex % 2 !== 0) {
        bussiLista2.appendChild(listItem);
      }
    });
    usedIndexes.push(stopIndex);
  });
};

// Set interval to update the data every minute
setInterval(() => {
  renderHSL();
}, 60000); // 60s

// Call renderHSL to execute the rendering
renderHSL();

// Function to scale timetable based on viewport size
function adjustTimetableScale() {
  const timetables = document.querySelector('.timetables');
  const width = window.innerWidth;

  // Set scale based on window width
  if (width < 480) {
    timetables.style.transform = 'scale(0.6)';
  } else if (width < 768) {
    timetables.style.transform = 'scale(0.8)';
  } else {
    timetables.style.transform = 'scale(1)'; // Default scale for larger screens
  }
}

// Call adjustTimetableScale on load and resize
window.addEventListener('load', adjustTimetableScale);
window.addEventListener('resize', adjustTimetableScale);
