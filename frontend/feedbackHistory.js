// Get modal element
const modal = document.getElementById('authModal');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');
const loginBtn = document.getElementById('loginBtn');

// Function to open modal
const openModal = () => {
  modal.style.display = 'block';
};

// Function to close modal
const closeModal = () => {
  modal.style.display = 'none';
};

const fetchFeedbackDataAndRender = async () => {
  try {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage or another storage mechanism
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch('http://localhost:3000/secure/proxy', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(
        `Network response was not ok: ${response.status} - ${response.statusText}`
      );
    }
    const data = await response.json();
    console.log('Data received from /proxy:', data);

    const allScores = data.all_scores;
    const allTimestamps = data.allTimestamps;
    console.log(allScores, 'allScores');
    console.log(allTimestamps, 'allTimestamps');

    // Filter data to include only the past 7 days
    const today = new Date();
    const past7Days = allTimestamps
      .map((timestamp, index) => ({
        timestamp: new Date(timestamp),
        score: allScores[index],
      }))
      .filter((item) => {
        const diffTime = today - item.timestamp;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 8 && diffDays >= 0;
      });

    // Sort by timestamp
    past7Days.sort((a, b) => a.timestamp - b.timestamp);

    // Aggregate scores by day
    const scoresByDay = new Map();
    past7Days.forEach((item) => {
      const day = item.timestamp.toLocaleDateString('en-GB'); // Format as day/month/year
      if (!scoresByDay.has(day)) {
        scoresByDay.set(day, []);
      }
      scoresByDay.get(day).push(item.score);
    });

    // Extract labels and average scores
    const labels = Array.from(scoresByDay.keys());
    const scores = Array.from(scoresByDay.values()).map(
      (scores) => scores.reduce((a, b) => a + b, 0) / scores.length
    );

    // Create gradient for bars

    const feedbackChart = new Chart(ctx, {
      type: 'bar', // Change chart type to 'bar'
      data: {
        labels: labels, // Use aggregated timestamps
        datasets: [
          {
            label: 'Average Feedback Score',
            data: scores, // Use aggregated scores
            borderColor: '#005AFF', // Primary color 1
            backgroundColor: 'rgba(0, 90, 225, 1)',
            borderWidth: 1,
            hoverBackgroundColor: '#005AFF', // Primary color 1
            hoverBorderColor: '#1D1E20', // Primary color 2
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Days',
              color: '#1D1E20', // Primary color 2
              font: {
                size: 14,
                weight: 'bold',
              },
            },
            ticks: {
              color: '#1D1E20', // Primary color 2
              font: {
                size: 12,
              },
            },
            grid: {
              color: '#1D1E20', // Primary color 3
            },
          },
          y: {
            title: {
              display: true,
              text: 'Score',
              color: '#1D1E20', // Primary color 2
              font: {
                size: 14,
                weight: 'bold',
              },
            },
            ticks: {
              color: '#1D1E20', // Primary color 2
              font: {
                size: 12,
              },
            },
            grid: {
              color: '#1D1E20', // Primary color 3
            },
            beginAtZero: true,
            max: 10, // Set the maximum value for the y-axis
          },
        },
        plugins: {
          legend: {
            labels: {
              color: '#1D1E20', // Primary color 2
              font: {
                size: 14,
                weight: 'bold',
              },
            },
          },
          tooltip: {
            backgroundColor: '#1D1E20', // Primary color 3
            titleColor: '#F3F3F3', // Primary color 2
            bodyColor: '#F3F3F3', // Primary color 2
            borderColor: '#F3F3F3', // Primary color 2
            borderWidth: 1,
          },
        },
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching feedback data:', error);
    return null;
  }
};

const doLogin = async (username, password) => {
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      throw new Error(
        `Network response was not ok: ${response.status} - ${response.statusText}`
      );
    }
    const data = await response.json();
    console.log('Data received from /auth/login:', data);

    if (data.token) {
      localStorage.setItem('token', data.token);
      closeModal();
      fetchFeedbackDataAndRender();
    } else {
      alert('Login failed. Please try again.');
    }
  } catch (error) {
    alert('Login failed. Please try again.');
    openModal();
    console.error('Error logging in:', error);
    return null;
  }
};

// Event listeners
closeBtn.onclick = closeModal;
cancelBtn.onclick = closeModal;
loginBtn.onclick = () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if (username && password) {
    // Handle authentication logic here

    doLogin(username, password);

    closeModal();
  } else {
    alert('Please enter both username and password.');
  }
};

const ctx = document.getElementById('feedbackChart').getContext('2d');

const checkIfAuthenticated = async () => {
  try {
    if (!localStorage.getItem('token')) {
      openModal();
      return;
    }
    fetchFeedbackDataAndRender();
  } catch (error) {
    console.error('Error checking authentication:', error);
    return null;
  }
};

checkIfAuthenticated();
