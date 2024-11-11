const ctx = document.getElementById('feedbackChart').getContext('2d');

const fetchFeedbackDataAndRender = async () => {
  try {
    const response = await fetch('http://localhost:3000/proxy');
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
      const day = item.timestamp.toISOString().split('T')[0];
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

    const feedbackChart = new Chart(ctx, {
      type: 'bar', // Change chart type to 'bar'
      data: {
        labels: labels, // Use aggregated timestamps
        datasets: [
          {
            label: 'Average Feedback Score',
            data: scores, // Use aggregated scores
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Days',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Score',
            },
            beginAtZero: true,
            max: 10, // Set the maximum value for the y-axis
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching feedback data:', error);
    return null;
  }
};

fetchFeedbackDataAndRender();
