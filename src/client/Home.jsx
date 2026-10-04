import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import { Trophy, Users, Activity, Flame, Skull } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Replace this with your actual Google Sheets -> Publish to Web CSV URL (Game_Calc tab)
const GOOGLE_SHEET_CSV_URL = 'YOUR_PUBLISHED_CSV_URL';

export default function Home() {
  const [draftSetup, setDraftSetup] = useState(null);
  const [sheetData, setSheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaptain, setSelectedCaptain] = useState('Colton');

  useEffect(() => {
    // 1. Fetch static draft mappings from our server DB
    fetch('http://localhost:3000/api/draft-setup')
      .then(res => res.json())
      .then(data => {
        setDraftSetup(data);
        
        // 2. Fetch live game data directly from Google Sheets
        Papa.parse(GOOGLE_SHEET_CSV_URL, {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setSheetData(results.data);
            setLoading(false);
          },
          error: (err) => {
            console.error("Error parsing Google Sheet data:", err);
            setLoading(false);
          }
        });
      });
  }, []);

  // Merge the Server Data and Google Sheets Data
  const mergedGameData = useMemo(() => {
    if (!draftSetup || !sheetData.length) return [];

    return sheetData.map(row => {
      // Find which captain drafted this contestant ID
      const captain = Object.keys(draftSetup.rosters).find(capName => 
        draftSetup.rosters[capName].includes(row.contestant_id)
      ) || 'Undrafted';

      // Ensure points calculate safely from the sheet columns
      return {
        id: row.contestant_id,
        name: row.contestant_name,
        tribe: row.tribe,
        status: row.status || 'Alive',
        captain: captain,
        // Adapt these column names exactly to what Game_Calc outputs
        totalPoints: parseInt(row['Total Points'] || 0, 10),
      };
    }).filter(player => player.captain !== 'Undrafted');
  }, [draftSetup, sheetData]);

  const teamStandings = useMemo(() => {
    if (!draftSetup) return [];
    
    const teams = {};
    draftSetup.captains.forEach(cap => {
      teams[cap.name] = { captain: cap.name, color: cap.color, total: 0, alive: 0, roster: [] };
    });

    mergedGameData.forEach(player => {
      if (teams[player.captain]) {
        teams[player.captain].total += player.totalPoints;
        teams[player.captain].roster.push(player);
        if (player.status === 'Alive') teams[player.captain].alive += 1;
      }
    });

    return Object.values(teams).sort((a, b) => b.total - a.total);
  }, [mergedGameData, draftSetup]);

  if (loading) {
    return <div className="min-h-screen bg-[#011627] text-white flex items-center justify-center">Loading Data from Server & Sheets...</div>;
  }

  const activeTeam = teamStandings.find(t => t.captain === selectedCaptain);

  return (
    <div className="min-h-screen bg-[#011627] text-[#fdfffc] p-6 font-sans">
      <header className="flex justify-between items-center mb-8 border-b border-[#0094c6]/30 pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Flame className="text-[#ff9f1c]" size={32} />
            Survivor Draft <span className="text-[#0094c6] font-light">Season 51</span>
          </h1>
          <p className="text-gray-400 mt-1">Live Game Dashboard (Synced via Google Sheets)</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#011627] border border-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Trophy className="text-[#ff9f1c]" size={20} />
              League Standings
            </h2>
            <div className="space-y-3">
              {teamStandings.map((team, index) => (
                <div 
                  key={team.captain}
                  onClick={() => setSelectedCaptain(team.captain)}
                  className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border
                    ${selectedCaptain === team.captain 
                      ? 'border-[#0094c6] bg-[#0094c6]/10' 
                      : 'border-gray-800 hover:border-gray-600 bg-gray-900/50'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-500 w-6">{index + 1}</div>
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }}></span>
                        Team {team.captain}
                      </h3>
                      <p className="text-sm text-gray-400">{team.alive} Players Alive</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#fdfffc]">
                    {team.total} <span className="text-sm font-normal text-gray-400">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#011627] border border-gray-800 rounded-xl p-6 shadow-xl sticky top-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Users className="text-[#e71d36]" size={20} />
              Team Breakout: {activeTeam?.captain}
            </h2>
            <div className="space-y-4">
              {activeTeam?.roster.map(player => (
                <div 
                  key={player.id} 
                  className={`p-4 rounded-lg border ${
                    player.status === 'Alive' 
                      ? 'border-gray-700 bg-gray-800/40' 
                      : 'border-[#e71d36]/30 bg-[#e71d36]/10 opacity-75'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-lg">{player.name}</h4>
                      <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                        {player.tribe} Tribe
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{player.totalPoints} <span className="text-xs font-normal text-gray-400">pts</span></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-sm">
                    <span className={`flex items-center gap-1 ${player.status === 'Alive' ? 'text-green-400' : 'text-[#e71d36]'}`}>
                      {player.status !== 'Alive' && <Skull size={14} />}
                      {player.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
