// @ts-nocheck
import React from 'react';

export default function App() {
  const loadData = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [isAdmin, setIsAdmin] = React.useState(false);
  const [showLogin, setShowLogin] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [adminPassword, setAdminPassword] = React.useState(
    localStorage.getItem('gg_admin_password') || 'admin123'
  );
  const [newAdminPassword, setNewAdminPassword] = React.useState('');

  const [players, setPlayers] = React.useState(loadData('gg_players', [
    { id: 1, name: 'Rui Vieira' },
    { id: 2, name: 'João Paulo' }
  ]));

  const [teams, setTeams] = React.useState(loadData('gg_teams', [
    { id: 1, name: 'Equipa A', members: [1, 2] }
  ]));

  const [games, setGames] = React.useState(loadData('gg_games', [
    { id: 1, name: 'Poker Night', type: 'individual', scoreRule: 'max' },
    { id: 2, name: 'Sueca', type: 'group', scoreRule: 'min' }
  ]));

  const [matches, setMatches] = React.useState(
    loadData('gg_matches', []).filter((m) => m.status === 'closed')
  );

  const [expandedGames, setExpandedGames] = React.useState({});
  const [selectedMatchRanking, setSelectedMatchRanking] = React.useState<any>(null);
  const [selectedTeamDetails, setSelectedTeamDetails] = React.useState(null);
  const [selectedGameRanking, setSelectedGameRanking] = React.useState<any>(null);
  const [activeMatchId, setActiveMatchId] = React.useState(null);
  const [matchResults, setMatchResults] = React.useState({});
  const [matchObservations, setMatchObservations] = React.useState('');
  const [matchClosedAt, setMatchClosedAt] = React.useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });

  const [editingGameId, setEditingGameId] = React.useState(null);
  const [playerMessage, setPlayerMessage] = React.useState('');
  const [teamMessage, setTeamMessage] = React.useState('');
  const [gameMessage, setGameMessage] = React.useState('');
  const [matchMessage, setMatchMessage] = React.useState('');

  const [newPlayer, setNewPlayer] = React.useState('');
  const [newTeam, setNewTeam] = React.useState('');
  const [newGame, setNewGame] = React.useState('');
  const [newGameType, setNewGameType] = React.useState('individual');
  const [newGameScoreRule, setNewGameScoreRule] = React.useState('max');
  const [selectedMembers, setSelectedMembers] = React.useState([]);
  const [selectedParticipants, setSelectedParticipants] = React.useState([]);

  React.useEffect(() => {
    localStorage.setItem('gg_admin_password', adminPassword);
  }, [adminPassword]);

  React.useEffect(() => {
    localStorage.setItem('gg_players', JSON.stringify(players));
  }, [players]);

  React.useEffect(() => {
    localStorage.setItem('gg_teams', JSON.stringify(teams));
  }, [teams]);

  React.useEffect(() => {
    localStorage.setItem('gg_games', JSON.stringify(games));
  }, [games]);

  React.useEffect(() => {
    localStorage.setItem('gg_matches', JSON.stringify(matches));
  }, [matches]);

  const toggleGameMatches = (id) => {
    setExpandedGames((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id]
    );
  };

  const toggleParticipant = (name) => {
    setSelectedParticipants((prev) =>
      prev.includes(name)
        ? prev.filter((p) => p !== name)
        : [...prev, name]
    );
  };

  const addPlayer = () => {
    if (!newPlayer.trim()) return;

    const exists = players.some(
      (p) => p.name.toLowerCase() === newPlayer.trim().toLowerCase()
    );

    if (exists) {
      setPlayerMessage('⚠️ Já existe um jogador com esse nome.');
      return;
    }

    setPlayers([
      ...players,
      {
        id: Date.now(),
        name: newPlayer
      }
    ]);

    setNewPlayer('');
    setPlayerMessage('');
  };

  const deletePlayer = (id) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  const addTeam = () => {
    if (!newTeam.trim()) return;

    const exists = teams.some(
      (t) => t.name.toLowerCase() === newTeam.trim().toLowerCase()
    );

    if (exists) {
      setTeamMessage('⚠️ Já existe uma equipa com esse nome.');
      return;
    }

    setTeams([
      ...teams,
      {
        id: Date.now(),
        name: newTeam,
        members: selectedMembers
      }
    ]);

    setNewTeam('');
    setSelectedMembers([]);
    setTeamMessage('');
  };

  const deleteTeam = (id) => {
    setTeams(teams.filter((t) => t.id !== id));
  };

  const addGame = () => {
    if (!newGame.trim()) return;

    const exists = games.some(
      (g) => g.name.toLowerCase() === newGame.trim().toLowerCase()
    );

    if (exists) {
      setGameMessage('⚠️ Já existe um jogo com esse nome.');
      return;
    }

    setGames([
      ...games,
      {
        id: Date.now(),
        name: newGame,
        type: newGameType,
        scoreRule: newGameScoreRule
      }
    ]);

    setNewGame('');
    setGameMessage('');
  };

  const deleteGame = (id) => {
    const hasClosedMatches = matches.some(
      (m) => m.gameId === id && m.status === 'closed'
    );

    if (hasClosedMatches) {
      setGameMessage('⚠️ Não é possível eliminar jogos com partidas fechadas.');
      return;
    }

    setGames(games.filter((g) => g.id !== id));
  };

  const updateGame = (id, field, value) => {
    const hasClosedMatches = matches.some(
      (m) => m.gameId === id && m.status === 'closed'
    );

    if (hasClosedMatches) {
      setGameMessage('⚠️ Não é possível alterar jogos com partidas fechadas.');
      return;
    }

    setGames(
      games.map((g) =>
        g.id === id
          ? {
              ...g,
              [field]: value
            }
          : g
      )
    );
  };

  const deleteMatch = (id) => {
    setMatches(matches.filter((m) => m.id !== id));
  };

  const updateMatchScore = (name, value) => {
    setMatchResults((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const closeActiveMatch = () => {
    const now = new Date();
    const selectedDate = new Date(matchClosedAt);

    if (selectedDate > now) {
      setMatchMessage('⚠️ Não é possível fechar partidas com data/hora futura.');
      return;
    }

    if (selectedParticipants.length === 0) {
      setMatchMessage('⚠️ Seleciona pelo menos um jogador/equipa.');
      return;
    }

    const hasMissingScores = selectedParticipants.some(
      (name) =>
        matchResults[name] === undefined ||
        matchResults[name] === ''
    );

    if (hasMissingScores) {
      setMatchMessage('⚠️ Tens de atribuir pontuação a todos os participantes.');
      return;
    }

    setMatchMessage('');
    const activeMatch = matches.find((m) => m.id === activeMatchId);

    if (!activeMatch) return;

    const ranking = selectedParticipants
      .map((name) => ({
        name,
        score: Number(matchResults[name] || 0)
      }))
      .sort((a, b) =>
        activeMatch.scoreRule === 'max'
          ? b.score - a.score
          : a.score - b.score
      )
      .map((item, index) => ({
        ...item,
        position: index + 1
      }));

    const formattedClosedAt = new Date(matchClosedAt).toLocaleString('pt-PT', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setMatches(
      matches.map((m) =>
        m.id === activeMatchId
          ? {
              ...m,
              status: 'closed',
              ranking,
              winner: ranking[0]?.name || '-',
              observations: matchObservations,
              closedAt: formattedClosedAt,
              closedAtRaw: matchClosedAt
            }
          : m
      )
    );

    setActiveMatchId(null);
    setMatchResults({});
    setMatchObservations('');
    setSelectedParticipants([]);
    setMatchMessage('');

    const currentNow = new Date();
    setMatchClosedAt(currentNow.toISOString().slice(0, 16));
  };

  const createMatch = (game) => {
    const newMatch = {
      id: Date.now(),
      gameId: game.id,
      gameName: game.name,
      type: game.type,
      scoreRule: game.scoreRule,
      status: 'open',
      ranking: [],
      observations: '',
      winner: '-',
      closedAt: '',
      observations: ''
    };

    setActiveMatchId(newMatch.id);
    setMatches([...matches, newMatch]);
  };

  const rankingData = React.useMemo(() => {
    if (!selectedGameRanking) return [];

    const gameMatches = matches.filter(
      (m) => m.gameId === selectedGameRanking.id && m.status === 'closed'
    );

    const stats = {};

    gameMatches.forEach((match) => {
      match.ranking.forEach((r) => {
        if (!stats[r.name]) {
          stats[r.name] = {
            wins: 0,
            games: 0,
            totalPosition: 0
          };
        }

        stats[r.name].games += 1;
        stats[r.name].totalPosition += r.position;

        if (r.position === 1) {
          stats[r.name].wins += 1;
        }
      });
    });

    return Object.entries(stats)
      .map(([name, data]) => ({
        name,
        wins: data.wins,
        games: data.games,
        winRate: data.games ? (data.wins / data.games) * 100 : 0,
        avgPosition: data.games ? data.totalPosition / data.games : 999
      }))
      .sort((a, b) => {
        if (b.wins !== a.wins) {
          return b.wins - a.wins;
        }

        if (b.winRate !== a.winRate) {
          return b.winRate - a.winRate;
        }

        return a.avgPosition - b.avgPosition;
      });
  }, [matches, selectedGameRanking]);

  return (
    <div className="min-h-screen bg-[#111827] text-white">
      <header className="bg-gradient-to-r from-[#ff5b00] via-[#ff3d00] to-[#ff6b00] p-4 md:p-5 flex justify-between items-center shadow-2xl gap-3">
        <h1 className="text-2xl md:text-3xl font-black leading-tight">
          🎲 Gardénias Games
        </h1>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">

        <div className="flex justify-end">
          {!isAdmin ? (
            <button
              onClick={() => setShowLogin(true)}
              className="bg-[#23263a] px-4 py-2 rounded-xl text-sm md:text-base active:scale-95 transition"
            >
              Admin
            </button>
          ) : (
            <button
              onClick={() => setIsAdmin(false)}
              className="bg-[#23263a] px-4 py-2 rounded-xl text-sm md:text-base active:scale-95 transition"
            >
              Sair Admin
            </button>
          )}
        </div>

        {showLogin && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1c1830] p-6 rounded-3xl w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">Login Admin</h2>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-3 rounded-xl bg-[#23263a] mb-4"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogin(false)}
                  className="flex-1 bg-[#23263a] p-3 rounded-xl"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => {
                    if (password === adminPassword) {
                      setIsAdmin(true);
                      setShowLogin(false);
                      setPassword('');
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl"
                >
                  Entrar
                </button>
              </div>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#1c1830] p-6 rounded-3xl">
              <h2 className="text-xl font-bold mb-4">Admin</h2>

              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="Nova password"
                className="w-full p-3 rounded-xl bg-[#23263a] mb-3"
              />

              <button
                onClick={() => {
                  if (!newAdminPassword.trim()) return;
                  setAdminPassword(newAdminPassword);
                  setNewAdminPassword('');
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl"
              >
                Alterar Password
              </button>
            </div>

            <div className="bg-[#1c1830] p-6 rounded-3xl">
              <h2 className="text-xl font-bold mb-4">Jogadores</h2>

              {playerMessage && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-2xl mb-4 text-sm">
                  {playerMessage}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  value={newPlayer}
                  onChange={(e) => setNewPlayer(e.target.value)}
                  placeholder="Novo jogador"
                  className="flex-1 p-3 rounded-xl bg-[#23263a]"
                />

                <button
                  onClick={addPlayer}
                  className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 rounded-xl"
                >
                  Adicionar
                </button>
              </div>

              <div className="space-y-2">
                {players.map((p) => (
                  <div key={p.id} className="bg-[#23263a] p-3 rounded-xl flex justify-between items-center">
                    <span>{p.name}</span>

                    <button onClick={() => deletePlayer(p.id)} className="text-red-400">
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1c1830] p-6 rounded-3xl">
              <h2 className="text-xl font-bold mb-4">Equipas</h2>

              {teamMessage && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-2xl mb-4 text-sm">
                  {teamMessage}
                </div>
              )}

              <input
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                placeholder="Nova equipa"
                className="w-full p-3 rounded-xl bg-[#23263a] mb-4"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {players.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggleMember(p.id)}
                    className={`p-3 rounded-xl text-sm transition ${selectedMembers.includes(p.id)
                      ? 'bg-gradient-to-r from-orange-500 to-red-500'
                      : 'bg-[#23263a]'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <button
                onClick={addTeam}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl mb-4"
              >
                Criar Equipa
              </button>

              <div className="space-y-2">
                {teams.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTeamDetails(t)}
                    className="w-full text-left bg-[#23263a] p-3 rounded-xl hover:bg-[#303552] transition"
                  >
                    <div className="flex justify-between items-center">
                      <span>{t.name}</span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTeam(t.id);
                        }}
                        className="text-red-400"
                      >
                        🗑
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#1c1830] p-6 rounded-3xl">
          <h2 className="text-xl font-bold mb-6">Jogos</h2>

          {isAdmin && (
            <div className="mb-6 space-y-3">
              {gameMessage && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-2xl text-sm">
                  {gameMessage}
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-2">
                <input
                  value={newGame}
                  onChange={(e) => setNewGame(e.target.value)}
                  placeholder="Novo jogo"
                  className="flex-1 p-3 rounded-xl bg-[#23263a]"
                />

                <select
                  value={newGameType}
                  onChange={(e) => setNewGameType(e.target.value)}
                  className="bg-[#23263a] px-3 py-3 rounded-xl"
                >
                  <option value="individual">Individual</option>
                  <option value="group">Equipas</option>
                </select>

                <select
                  value={newGameScoreRule}
                  onChange={(e) => setNewGameScoreRule(e.target.value)}
                  className="bg-[#23263a] px-3 py-3 rounded-xl"
                >
                  <option value="max">Maior pontuação vence</option>
                  <option value="min">Menor pontuação vence</option>
                </select>

                <button
                  onClick={addGame}
                  className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 rounded-xl"
                >
                  Criar Jogo
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {games
              .sort((a, b) => a.name.localeCompare(b.name, 'pt'))
              .map((game) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGameRanking(game)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 px-3 py-2 rounded-xl text-sm"
                >
                  🏆 Ranking {game.name}
                </button>
              ))}
          </div>

          <div className="space-y-4">
            {games
              .sort((a, b) => a.name.localeCompare(b.name, 'pt'))
              .map((game) => (
                <div key={game.id} className="bg-[#23263a] p-4 rounded-2xl">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold text-lg">{game.name}</h3>

                      <div className="text-xs text-orange-200/70 mt-2">
                        {game.type === 'group' ? '👥 Equipas' : '👤 Individual'} • {game.scoreRule === 'max' ? 'Maior pontuação vence' : 'Menor pontuação vence'}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() =>
                              setEditingGameId(
                                editingGameId === game.id ? null : game.id
                              )
                            }
                            className="bg-[#111827] px-4 py-2 rounded-xl text-sm"
                          >
                            ✏️ Editar
                          </button>

                          <button
                            onClick={() => deleteGame(game.id)}
                            className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-xl text-sm"
                          >
                            🗑 Jogo
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => toggleGameMatches(game.id)}
                        className="bg-[#111827] px-4 py-2 rounded-xl text-sm"
                      >
                        {expandedGames[game.id] ? 'Ocultar Partidas' : 'Mostrar Partidas'}
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => createMatch(game)}
                          className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-xl"
                        >
                          Nova Partida
                        </button>
                      )}
                    </div>
                  </div>

                  {editingGameId === game.id && (
                    <div className="mt-4 bg-[#111827] p-4 rounded-2xl space-y-3 border border-orange-500/20">
                      <input
                        value={game.name}
                        onChange={(e) => updateGame(game.id, 'name', e.target.value)}
                        className="w-full p-3 rounded-xl bg-[#23263a]"
                      />

                      <select
                        value={game.type}
                        onChange={(e) => updateGame(game.id, 'type', e.target.value)}
                        className="w-full p-3 rounded-xl bg-[#23263a]"
                      >
                        <option value="individual">Individual</option>
                        <option value="group">Equipas</option>
                      </select>

                      <select
                        value={game.scoreRule}
                        onChange={(e) => updateGame(game.id, 'scoreRule', e.target.value)}
                        className="w-full p-3 rounded-xl bg-[#23263a]"
                      >
                        <option value="max">Maior pontuação vence</option>
                        <option value="min">Menor pontuação vence</option>
                      </select>
                    </div>
                  )}

                  {expandedGames[game.id] && (
                    <div className="mt-4 space-y-2">
                      {matches
                        .filter((m) => m.gameId === game.id && m.status === 'closed')
                        .sort((a, b) => {
                          const getSortableDate = (match) => {
                            // Novas partidas com datetime-local
                            if (match.closedAtRaw) {
                              return match.closedAtRaw;
                            }

                            // Compatibilidade com partidas antigas
                            if (match.closedAt) {
                              const parsed = new Date(match.closedAt);

                              if (!Number.isNaN(parsed.getTime())) {
                                return parsed.toISOString();
                              }
                            }

                            // fallback
                            return String(match.id || '');
                          };

                          return getSortableDate(b).localeCompare(
                            getSortableDate(a)
                          );
                        })
                        .map((match) => (
                          <div
                            key={match.id}
                            onClick={() => setSelectedMatchRanking(match)}
                            className="bg-slate-900 p-3 rounded-xl hover:bg-[#303552] transition cursor-pointer"
                          >
                            <div className="font-semibold">
                              🕹 Partida #{String(match.id).slice(-4)}
                            </div>

                            <div className="text-xs text-orange-200/70 mt-1">
                              📅 {match.closedAt}
                            </div>

                            <div className="text-sm text-yellow-300 font-semibold mt-2">
                              🏆 Vencedor: {match.winner}
                            </div>

                            {isAdmin && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMatch(match.id);
                                }}
                                className="mt-3 bg-red-500/20 border border-red-500 text-red-300 px-3 py-2 rounded-xl text-sm"
                              >
                                Eliminar Partida
                              </button>
                            )}

                            {match.observations && (
                              <div className="text-[11px] italic text-orange-200/60 mt-1">
                                📝 {match.observations}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {activeMatchId && (() => {
          const activeMatch = matches.find((m) => m.id === activeMatchId);

          if (!activeMatch) return null;

          const participants =
            activeMatch.type === 'group'
              ? teams
              : players;

          return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-auto">
              <div className="bg-[#1c1830] p-4 md:p-6 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    🎮 {activeMatch.gameName}
                  </h2>

                  <button onClick={() => setActiveMatchId(null)}>
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold mb-3">
                    Selecionar participantes
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                    {participants.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => toggleParticipant(p.name)}
                        className={`p-3 rounded-xl text-sm transition ${selectedParticipants.includes(p.name)
                          ? 'bg-gradient-to-r from-orange-500 to-red-500'
                          : 'bg-[#23263a]'}`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {participants
                    .filter((p) => selectedParticipants.includes(p.name))
                    .map((p) => {
                    const name = p.name;

                    return (
                      <div
                        key={p.id}
                        className="bg-[#23263a] p-3 rounded-xl flex justify-between items-center"
                      >
                        <span className="font-semibold">{name}</span>

                        <input
                          type="number"
                          value={matchResults[name] || ''}
                          onChange={(e) =>
                            updateMatchScore(name, e.target.value)
                          }
                          className="w-28 p-2 rounded-xl bg-[#111827]"
                          placeholder="Pontos"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-orange-200/70 mb-2">
                    Data e hora de fecho
                  </label>

                  <input
                    type="datetime-local"
                    value={matchClosedAt}
                    onChange={(e) => setMatchClosedAt(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#23263a]"
                  />
                </div>

                {matchMessage && (
                  <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-2xl mb-4 text-sm">
                    {matchMessage}
                  </div>
                )}

                <textarea
                  value={matchObservations}
                  onChange={(e) => setMatchObservations(e.target.value)}
                  placeholder="Observações da partida"
                  className="w-full p-3 rounded-2xl bg-[#23263a] mb-6 min-h-[100px]"
                />

                <button
                  onClick={closeActiveMatch}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl font-bold"
                >
                  Fechar Partida
                </button>
              </div>
            </div>
          );
        })()}

        {selectedTeamDetails && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 md:p-4">
            <div className="bg-[#1c1830] p-4 md:p-6 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  👥 {selectedTeamDetails.name}
                </h2>

                <button onClick={() => setSelectedTeamDetails(null)}>
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {selectedTeamDetails.members.length > 0 ? (
                  selectedTeamDetails.members.map((memberId) => {
                    const player = players.find((p) => p.id === memberId);

                    return (
                      <div
                        key={memberId}
                        className="bg-[#23263a] p-3 rounded-xl"
                      >
                        {player?.name || 'Jogador removido'}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-orange-200/70">
                    Esta equipa não tem jogadores.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedGameRanking && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 md:p-4">
            <div className="bg-[#1c1830] p-4 md:p-6 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  🏆 Ranking Global — {selectedGameRanking.name}
                </h2>

                <button onClick={() => setSelectedGameRanking(null)}>
                  ✕
                </button>
              </div>

              {rankingData.length > 0 ? (
                <div className="space-y-2">
                  {rankingData.map((r, index) => (
                    <div
                      key={r.name}
                      className="flex justify-between bg-[#23263a] p-3 rounded-xl"
                    >
                      <div className="flex gap-3 items-center">
                        <span>
                          {index === 0
                            ? '🥇'
                            : index === 1
                            ? '🥈'
                            : index === 2
                            ? '🥉'
                            : `#${index + 1}`}
                        </span>

                        <span>{r.name}</span>
                      </div>

                      <div className="text-right text-sm">
                        <div className="text-orange-300 font-bold">
                          {r.wins} vitórias
                        </div>

                        <div className="text-orange-200/70 text-xs">
                          {r.winRate.toFixed(0)}% • Média {r.avgPosition.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-orange-200/70">
                  Ainda não existem partidas fechadas para este jogo.
                </div>
              )}
            </div>
          </div>
        )}

        {selectedMatchRanking && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 md:p-4">
            <div className="bg-[#1c1830] p-4 md:p-6 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  🏆 {selectedMatchRanking.gameName}
                </h2>

                <button onClick={() => setSelectedMatchRanking(null)}>
                  ✕
                </button>
              </div>

              {selectedMatchRanking.ranking?.length > 0 ? (
                <div className="space-y-2">
                  {selectedMatchRanking.ranking.map((r) => (
                    <div
                      key={r.position}
                      className="flex justify-between bg-[#23263a] p-3 rounded-xl"
                    >
                      <span>
                        {r.position}.º {r.name}
                      </span>

                      <span className="text-orange-300 font-bold">
                        {r.score} pts
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-orange-200/70">
                  Partida sem classificação.
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
