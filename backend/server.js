const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const users = [];

app.post('/users', (req, res) => {
  let { name, age, interests } = req.body;

  if (!name || !age || !interests || !Array.isArray(interests) || interests.length < 1) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  interests = interests.map(i => i.toLowerCase().trim());

  if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
    return res.status(400).json({ error: 'User with this name already exists' });
  }

  users.push({ name, age, interests, shortlistedBy: [] });
  res.status(201).json({ message: 'User added successfully' });
});

app.get('/matches/:username', (req, res) => {
  const username = req.params.username.toLowerCase();
  const currentUser = users.find(u => u.name.toLowerCase() === username);

  if (!currentUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  const matches = users.filter(u => {
    if (u.name.toLowerCase() === username) return false;

    const sharedInterests = u.interests.filter(i => currentUser.interests.includes(i));
    return sharedInterests.length >= 2;
  }).map(u => ({
    name: u.name,
    age: u.age,
    interests: u.interests,
    shortlisted: u.shortlistedBy.includes(currentUser.name)
  }));

  res.json(matches);
});

app.post('/shortlist', (req, res) => {
  const { fromUser, toUser } = req.body;

  if (!fromUser || !toUser) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const userToShortlist = users.find(u => u.name.toLowerCase() === toUser.toLowerCase());
  if (!userToShortlist) {
    return res.status(404).json({ error: 'User to shortlist not found' });
  }

  if (userToShortlist.shortlistedBy.includes(fromUser)) {
    userToShortlist.shortlistedBy = userToShortlist.shortlistedBy.filter(u => u !== fromUser);
  } else {
    userToShortlist.shortlistedBy.push(fromUser);
  }

  res.json({ shortlistedBy: userToShortlist.shortlistedBy });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
