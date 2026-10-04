import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, Users, Activity, Flame, Skull } from 'lucide-react';

// --- MOCK DATA (Simulating merged Game_Calc.csv & Teams.csv data) ---
const INITIAL_DATA = [
  { id: 'ss51_01', name: 'Rob Antonson', tribe: 'Savu', captain: 'Colton', status: 'Alive', w1: 1, w2: 1, w3: 1 },
  { id: 'ss51_02', name: 'Brady Booker', tribe: 'Toka', captain: 'Colton', status: 'Alive', w1: 1, w2: 1, w3: 1 },
  { id: 'ss51_03', name: 'Patt Cannaday', tribe: 'Savu', captain: 'Sebastian', status: 'Alive', w1: 1, w2: 1, w3: 1 },
  { id: 'ss51_04', name: 'Sarah Jenkins', tribe: 'Toka', captain: 'Charlotte', status: 'Alive', w1: 1, w2: 1, w3: 1 },
  { id: 'ss51_05', name: 'Marcus Chen', tribe: 'Savu', captain: 'Charlotte', status: 'Alive', w1: 1, w2: 1, w3: 1 },
  { id: 'ss51_19', name: 'Aaliyah Puglia', tribe: 'Toka', captain: 'Sebastian', status: 'Voted Out (Ep 1)', w1: 0, w2: 0, w3: 0 },
  { id: 'ss51_06', name: 'Lewis Hamilton', tribe: 'Savu', captain: 'Sebastian', status: 'Voted Out (Ep 2)', w1: 1, w2: 0, w3: 0 },
  { id: 'ss51_07', name: 'Tom Hardy', tribe: 'Toka', captain: 'Colton', status: 'Voted Out (Ep 3)', w1: 1, w2: 1, w3: 0 },
  { id: 'ss51_08', name: 'Elena Rostova', tribe: 'Savu', captain: 'Charlotte', status: 'Alive', w1: 1, w2: 1, w3: 2 } // 2 pts week 3 = Immunity win
];

const WEEK_4_UPDATE = [
  { id: 'ss51_01', w4: 1, status: 'Alive' },
  { id: 'ss51_02', w4: 2, status: 'Alive' }, // Immunity Win
  { id: 'ss51_03', w4: 0, status: 'Voted Out (Ep 4)' }, // Voted Out
  { id: 'ss51_04', w4: 1, status: 'Alive' },
  { id: 'ss51_05', w4: 1, status: 'Alive' },
  { id: 'ss51_19', w4: 0, status: 'Voted Out (Ep 1)' },
  { id: 'ss51_06', w4: 0, status: 'Voted Out (Ep 2)' },
  { id: 'ss51_07', w4: 0, status: 'Voted Out (Ep 3)' },
  { id: 'ss51_08', w4: 1, status: 'Alive' } 
];

const CAPTAIN_COLORS = {
  'Colton': '#0094c6',     // ocean-blue
  'Sebastian': '#ff9f1c',  // amber-glow
  'Charlotte': '#e71d36'   // punch-red
};

export default function SurvivorGameMode() {
  const [currentWeek, setCurrentWeek] = useState(3);
  const [gameData, setGameData] = useState(INITIAL_DATA);
  const [selectedCaptain, setSelectedCaptain] = useState('Colton');

  // Simulate ingesting new Google Sheets data
  const handleSimulateWeek = () => {
    if (currentWeek >= 4) return;
    const updatedData = gameData.map(player => {
      const update = WEEK_4_UPDATE.find(u => u.id === player.id);
      return update ? { ...player, w4: update.w4, status: update.status } : player;
    });
    setGameData(updatedData);
    setCurrentWeek(4);
  };

  // Process data for Standings
  const teamStandings = useMemo(() => {
    const teams = {};
    gameData.forEach(player => {
      if (!teams[player.captain]) {
        teams[player.captain] = { captain: player.captain, total: 0, alive: 0, roster: [] };
      }
      const playerTotal = player.w1 + player.w2 + player.w3 + (player.w4 || 0);
      teams[player.captain].total += playerTotal;
      teams[player.captain].roster.push({ ...player, total: playerTotal });
      if (player.status === 'Alive') teams[player.captain].alive += 1;
    });
    return Object.values(teams).sort((a, b) => b.total - a.total);
  }, [gameData]);

  // Process data for Timeline Chart
  const timelineData = useMemo(() => {
    const data = [];
    for (let w = 1; w <= currentWeek; w++) {
      const weekStats = { name: `Week ${w}` };
      Object.keys(CAPTAIN_COLORS).forEach(captain => {
        const ctcData = gameData.filter(p => p.captain === captain);
        const cumScore = ctcData.reduce((acc, player) => {
          let pts = 0;
          for (let i = 1; i <= w; i++) pts += (player[`w${i}`] || 0);
          return acc + pts;
        }, 0);
        weekStats[captain] = cumScore;
      });
      data.push(weekStats);
    }
    return data;
  }, [gameData, currentWeek]);

  const activeTeam = teamStandings.find(t => t.captain === selectedCaptain);

  return (
    <div className="min-h-screen bg-[#011627] text-[#fdfffc] p-6 font-sans">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-[#0094c6]/30 pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Flame className="text-[#ff9f1c]" size={32} />
            Survivor Draft <span className="text-[#0094c6] font-light">Season 51</span>
          </h1>
          <p className="text-gray-400 mt-1">Live Game Dashboard • Week {currentWeek}</p>
        </div>
        <button 
          onClick={handleSimulateWeek}
          disabled={currentWeek === 4}
          className="bg-[#0094c6] hover:bg-[#007ba6] disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-semibold transition-colors shadow-lg"
        >
          {currentWeek === 4 ? 'Week 4 Imported' : 'Simulate Week 4 Import'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Standings & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Timeline Chart */}
          <div className="bg-[#011627] border border-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="text-[#0094c6]" size={20} />
              Season Timeline
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#011627', borderColor: '#1f2937' }} />
                  <Legend />
                  {Object.entries(CAPTAIN_COLORS).map(([captain, color]) => (
                    <Line 
                      key={captain} 
                      type="monotone" 
                      dataKey={captain} 
                      stroke={color} 
                      strokeWidth={3}
                      activeDot={{ r: 8 }} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Standings Table */}
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
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CAPTAIN_COLORS[team.captain] }}></span>
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

        {/* Right Column: Team Breakout */}
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
                      <div className="text-xl font-bold">{player.total} <span className="text-xs font-normal text-gray-400">pts</span></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 text-sm">
                    <span className={`flex items-center gap-1 ${player.status === 'Alive' ? 'text-green-400' : 'text-[#e71d36]'}`}>
                      {player.status !== 'Alive' && <Skull size={14} />}
                      {player.status}
                    </span>
                    <span className="text-gray-400">
                      W{currentWeek}: +{player[`w${currentWeek}`] || 0}
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