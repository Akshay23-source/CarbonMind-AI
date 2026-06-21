async function test() {
  try {
    const response = await fetch('http://localhost:3000/api/ai/analyze-meal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer null`
      },
      body: JSON.stringify({
        text: 'Chicken Biryani'
      })
    });
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Data:', data);
  } catch (err) {
    console.error('Error fetching:', err);
  }
}

test();
