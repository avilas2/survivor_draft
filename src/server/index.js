import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Hardcoded JSON representing persisted database data
const DRAFT_DB = {
  gameId: "ss51_alpha",
  captains: [
    { id: "5", name: "Colton", email: "colton@example.com", color: "#0094c6" },
    { id: "1", name: "Sebastian", email: "sebastian@example.com", color: "#ff9f1c" },
    { id: "2", name: "Charlotte", email: "charlotte@example.com", color: "#e71d36" }
  ],
  // Mapping contestant_ids to captain names
  rosters: {
    "Colton": ["ss51_01", "ss51_02", "ss51_07"],
    "Sebastian": ["ss51_03", "ss51_06", "ss51_19"],
    "Charlotte": ["ss51_04", "ss51_05", "ss51_08"]
  }
};

// API Endpoint to fetch initial setup data
app.get('/api/draft-setup', (req, res) => {
  res.json(DRAFT_DB);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
