const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// File path for the hospital data
const filePath = path.join(__dirname, 'hospitalData.json');

// Function to read data from JSON file
const readData = () => {
  if (!fs.existsSync(filePath)) {
    // If file doesn't exist, initialize with an empty structure
    const emptyData = { hospitals: [] };
    fs.writeFileSync(filePath, JSON.stringify(emptyData, null, 2), 'utf8');
    return emptyData;
  }

  const rawData = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(rawData);
};

// Function to write data to JSON file
const writeData = (data) => {
  const jsonData = JSON.stringify(data, null, 2); // Pretty print with 2 spaces
  fs.writeFileSync(filePath, jsonData, 'utf8');
};

// CRUD Operations

// 1. GET - Get all hospitals
app.get('/hospitals', (req, res) => {
  const data = readData();
  res.json(data.hospitals);
});

// 2. POST - Add a new hospital
app.post('/hospitals', (req, res) => {
  const data = readData();
  const newHospital = req.body;

  // Automatically assign an ID to the new hospital
  newHospital.id = data.hospitals.length + 1;

  // Add the new hospital to the array
  data.hospitals.push(newHospital);

  // Write the updated data to the JSON file
  writeData(data);

  // Return the newly created hospital
  res.status(201).json(newHospital);
});

// 3. PUT - Update an existing hospital
app.put('/hospitals/:id', (req, res) => {
  const data = readData();
  const hospitalId = parseInt(req.params.id, 10);
  const updatedHospital = req.body;

  // Find the hospital to update
  const hospitalIndex = data.hospitals.findIndex(h => h.id === hospitalId);

  if (hospitalIndex === -1) {
    return res.status(404).json({ message: `Hospital with ID ${hospitalId} not found` });
  }

  // Update the hospital data
  data.hospitals[hospitalIndex] = { ...data.hospitals[hospitalIndex], ...updatedHospital };

  // Write the updated data to the JSON file
  writeData(data);

  // Return the updated hospital
  res.json(data.hospitals[hospitalIndex]);
});

// 4. DELETE - Delete a hospital
app.delete('/hospitals/:id', (req, res) => {
  const data = readData();
  const hospitalId = parseInt(req.params.id, 10);

  // Find the hospital to delete
  const hospitalIndex = data.hospitals.findIndex(h => h.id === hospitalId);

  if (hospitalIndex === -1) {
    return res.status(404).json({ message: `Hospital with ID ${hospitalId} not found` });
  }

  // Remove the hospital from the array
  const removedHospital = data.hospitals.splice(hospitalIndex, 1);

  // Write the updated data to the JSON file
  writeData(data);

  // Return the removed hospital
  res.json(removedHospital);
});

// Start the server
app.listen(3000, () => {
  console.log(`Hospital app server running on http://localhost:3000`);
});
