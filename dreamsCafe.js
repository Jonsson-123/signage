let errorIntervalId;
let mainIntervalId;

const fetchDreamsCafeData = async () => {
  try {
    // Get the current date in YYYY-MM-DD format
    //const someDate = new Date();
    //someDate.setDate(someDate.getDate() + 1);
    //const nextDay = someDate.toISOString().split('T')[0];

    let url = `https://www.compass-group.fi/menuapi/feed/json?costNumber=3202&language=en`;
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
      errorIntervalId = setInterval(fetchDreamsCafeData, 5000);
    }
  }
};

const renderData = (data) => {
  if (!data || !data.MenusForDays) {
    return;
  }

  const currentDate = new Date().toISOString().split('T')[0];

  const todayMenu = data.MenusForDays.find((menu) => {
    const menuDate = new Date(menu.Date).toISOString().split('T')[0];
    return menuDate === currentDate;
  });

  if (!todayMenu) {
    console.log('No menu available for today.');
    return;
  }

  console.log(todayMenu, 'todayMenu');
  // Clear previous content
  const parent = document.getElementById('content');
  parent.innerHTML = '';
  const container = document.createElement('div');
  container.classList.add('menu-container');

  todayMenu.SetMenus.forEach((setMenu) => {
    const menuElement = document.createElement('div');
    menuElement.classList.add('menu');

    setMenu.Components.forEach((component) => {
      const componentElement = document.createElement('h3');
      componentElement.textContent = component;
      menuElement.appendChild(componentElement);
    });
    const price = document.createElement('p');
    price.textContent = `price: ${setMenu.Price || '12,50€'}`;
    menuElement.appendChild(price);

    container.appendChild(menuElement);
  });

  parent.appendChild(container);
};

// Initial fetch
fetchDreamsCafeData();

// Set the main interval to fetch data every 100 seconds
mainIntervalId = setInterval(() => {
  console.log('Main interval triggered');
  fetchDreamsCafeData();
}, 100000); // 100000ms = 100s = 1min 40s
