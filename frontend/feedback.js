console.log('feedback.js loaded');
//const baseUrl = 'http://localhost:3000';
const baseUrl = 'https://wallofwondersinc.northeurope.cloudapp.azure.com';
// Generate QR code with Google Survey link
const surveyLink =
  'https://docs.google.com/forms/d/e/1FAIpQLSfHM_MzAF1n7mKpTBQTSLT0lFamtGNUQh4VOdWXz0kMqo8W6w/viewform?usp=sf_link';
const qrCanvas = document.getElementById('qrcode');

if (qrCanvas) {
  // Create QR code using QRious library
  const qr = new QRious({
    element: qrCanvas,
    value: surveyLink,
    size: 150,
  });
}

// Colors from red to green for 1-10 feedback
const colors = [
  '#ff0000',
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#ffff00', // 1-5
  '#adff2f',
  '#7fff00',
  '#32cd32',
  '#008000',
  '#006400', // 6-10
];

// Variable to keep track of the last feedback score processed
let lastScore = null;

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

const doLogin = async (username, password) => {
  try {
    const response = await fetch(baseUrl + '/auth/login', {
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
      getFeedbackScore();
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

// Fetch feedback score from the proxy server
async function getFeedbackScore() {
  console.log('Attempting to fetch latest score from /proxy');
  try {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage or another storage mechanism
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(baseUrl + '/secure/proxy', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        openModal(); // Open the modal if the response status is 401
      }
      throw new Error(
        `Network response was not ok: ${response.status} - ${response.statusText}`
      );
    }
    const data = await response.json();
    console.log('Data received from /proxy:', data);
    return data.latest_score; // Assuming API returns { "latest_score": 7 }
  } catch (error) {
    console.error('Error fetching feedback score:', error);
    document.getElementById('errorMessage').textContent =
      'Error fetching feedback score.';
    return null; // Default return if error occurs
  }
}

// Function to add a new leaf to the tree based on the feedback score
function addLeaf(score) {
  if (score === null || score < 1 || score > 10) {
    console.log('Invalid score received or no score available.');
    document.getElementById('errorMessage').textContent =
      'Invalid score received or no score available.';
    return;
  }

  const color = colors[score - 1]; // Map score to color
  document.getElementById('errorMessage').textContent = ''; // Clear any error message

  // Create a new leaf element
  const leaf = document.createElement('div');
  leaf.classList.add('leaf');
  leaf.style.backgroundColor = color;

  // Set a random position within the tree
  const tree = document.getElementById('tree');
  const treeWidth = tree.offsetWidth;
  const treeHeight = tree.offsetHeight;
  const x = Math.random() * (treeWidth - 20); // Adjust 20 for leaf size
  const y = Math.random() * (treeHeight - 20);

  leaf.style.left = `${x}px`;
  leaf.style.top = `${y}px`;

  // Add the new leaf to the tree
  tree.appendChild(leaf);
}

// Function to fetch the score and add a new leaf if the score is new
async function updateTree() {
  if (!localStorage.getItem('token')) {
    openModal();
    return;
  }
  const score = await getFeedbackScore();

  // Check if the score is different from the last processed score
  if (score !== null && score !== lastScore) {
    addLeaf(score); // Add a new leaf for each unique feedback score
    lastScore = score; // Update the last score to the current one
  } else {
    console.log('No new feedback score to display.');
  }
}

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

updateTree();

// Periodic update every 5 seconds to check for new feedback
setInterval(updateTree, 10000);
