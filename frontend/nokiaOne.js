let errorIntervalId;
let mainIntervalId;

const fetchNokiaOneData = async () => {
  try {
    // Get the current date in YYYY-MM-DD format

    const currentDate = new Date().toISOString().split('T')[0];

    //const someDate = new Date();
    //someDate.setDate(someDate.getDate() + 1);
    //const nextDay = someDate.toISOString().split('T')[0];

    let url = `https://www.sodexo.fi/ruokalistat/output/daily_json/80/${currentDate}`;
    const mathrandom = Math.random();
    url = `https://api.allorigins.win/get?url=${encodeURIComponent(
      url
    )}&rand=${mathrandom}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const parsedData = JSON.parse(data.contents);

    console.log(parsedData);
    renderData(parsedData);
    // Clear the error interval if it exists
    if (errorIntervalId) {
      clearInterval(errorIntervalId);
      errorIntervalId = null;
    }
  } catch (error) {
    console.error('Error:', error);

    // Set a new interval to retry fetching data every 5 seconds
    if (!errorIntervalId) {
      errorIntervalId = setInterval(fetchNokiaOneData, 5000);
    }
  }
};

const renderData = (data) => {
  if (!data || !data.courses) {
    const parent = document.getElementById('content');
    parent.innerHTML = 'No data available';
    return;
  }
  const parent = document.getElementById('content');
  parent.innerHTML = '';
  const container = document.createElement('div');
  container.classList.add('menu-container');

  // Convert courses object to array
  const coursesArray = Object.values(data.courses);

  if (coursesArray.length === 0) {
    const noData = document.createElement('p');
    noData.textContent = 'No data available';
    container.appendChild(noData);
  }
  coursesArray.forEach((course) => {
    const courseElement = document.createElement('div');
    courseElement.classList.add('course');

    const title = document.createElement('h3');
    title.textContent = course.title_en || course.title_fi;
    courseElement.appendChild(title);

    const price = document.createElement('p');
    price.textContent = `prices: ${course.price}`;
    courseElement.appendChild(price);

    if (course.allergens) {
      const allergens = document.createElement('p');
      allergens.textContent = `Allergens: ${course.allergens}`;
      courseElement.appendChild(allergens);
    }

    container.appendChild(courseElement);
  });
  parent.appendChild(container);
};

fetchNokiaOneData();
// Set the main interval to fetch data every 100 seconds
mainIntervalId = setInterval(() => {
  console.log('Main interval triggered');
  fetchNokiaOneData();
}, 100000); // 100000ms = 100s = 1min 40s
