import React, { useState, useEffect } from 'react';
import { X, Dices, Grid3X3, LayoutGrid, RotateCcw, Lock, Trophy, ShieldAlert } from 'lucide-react';

export default function ForgotGames({ onClose, onWin, username }) {
    const [gameType, setGameType] = useState(null);
    const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost'
    const [newPassword, setNewPassword] = useState('');
    const [manualUsername, setManualUsername] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [error, setError] = useState('');

    const selectGame = (type) => {
        setGameType(type);
        setGameState('playing');
    };

    const handleWin = () => {
        setGameState('won');
        // Do not auto close here, let them fill form
    };

    const handleLose = () => setGameState('lost');

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setError('');
        const userToReset = username || manualUsername;

        if (!userToReset) {
            setError('Username required.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/auth/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: userToReset, password: newPassword })
            });

            if (response.ok) {
                setResetSuccess(true);
                setTimeout(() => {
                    onWin();
                }, 2000);
            } else {
                setError('User not found or system error.');
            }
        } catch (err) {
            setError('Connection failure.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-[#0f0f13] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight mb-2 text-white">Security Verification</h2>
                    <p className="text-white/40 text-sm">Win the game to reset your password.</p>
                </div>

                <div className="flex justify-center mb-6">
                    {gameState === 'playing' && gameType && (
                        <div className="bg-white/5 px-6 py-2 rounded-full border border-white/10 text-xs font-bold tracking-widest uppercase flex items-center gap-2 text-white">
                            {gameType === 'dice' && <><Dices size={14} /> High Roller (Best of 5)</>}
                            {gameType === 'tictactoe' && <><Grid3X3 size={14} /> Tic Tac Toe</>}
                            {gameType === 'connect4' && <><LayoutGrid size={14} /> Connect Four</>}
                        </div>
                    )}
                    {gameState === 'won' && <div className="text-green-400 font-bold tracking-widest uppercase animate-pulse flex items-center gap-2"><Trophy size={16} /> Access Granted</div>}
                    {gameState === 'lost' && <div className="text-red-400 font-bold tracking-widest uppercase animate-shake flex items-center gap-2"><ShieldAlert size={16} /> Verification Failed</div>}
                </div>

                {/* GAME SELECTION MENU */}
                {!gameType && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button onClick={() => selectGame('dice')} className="group flex flex-col items-center justify-center p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-2xl transition-all hover:scale-105 space-y-4">
                            <div className="p-4 bg-blue-500/20 text-blue-400 rounded-full group-hover:bg-blue-500/30 transition-colors">
                                <Dices size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-white text-lg">High Roller</h3>
                                <p className="text-white/40 text-xs mt-1">Best of 5</p>
                            </div>
                        </button>

                        <button onClick={() => selectGame('tictactoe')} className="group flex flex-col items-center justify-center p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-2xl transition-all hover:scale-105 space-y-4">
                            <div className="p-4 bg-purple-500/20 text-purple-400 rounded-full group-hover:bg-purple-500/30 transition-colors">
                                <Grid3X3 size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-white text-lg">Tic Tac Toe</h3>
                                <p className="text-white/40 text-xs mt-1">Classic</p>
                            </div>
                        </button>

                        <button onClick={() => selectGame('connect4')} className="group flex flex-col items-center justify-center p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-2xl transition-all hover:scale-105 space-y-4">
                            <div className="p-4 bg-yellow-500/20 text-yellow-500 rounded-full group-hover:bg-yellow-500/30 transition-colors">
                                <LayoutGrid size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-white text-lg">Connect 4</h3>
                                <p className="text-white/40 text-xs mt-1">Strategy</p>
                            </div>
                        </button>
                    </div>
                )}

                {/* GAME AREA */}
                {gameType && (
                    <div className="min-h-[300px] flex items-center justify-center relative animate-in fade-in zoom-in-95 duration-300">
                        {gameState === 'playing' && (
                            <>
                                {gameType === 'dice' && <DiceGame onWin={handleWin} onLose={handleLose} />}
                                {gameType === 'tictactoe' && <TicTacToe onWin={handleWin} onLose={handleLose} />}
                                {gameType === 'connect4' && <ConnectFour onWin={handleWin} onLose={handleLose} />}
                            </>
                        )}

                        {gameState === 'lost' && (
                            <div className="text-center space-y-6 animate-fade-in w-full">
                                <p className="text-white/60">System validation failure.</p>
                                <button onClick={() => setGameType(null)} className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                                    <RotateCcw size={18} /> Try Another Challenge
                                </button>
                            </div>
                        )}

                        {gameState === 'won' && (
                            <form onSubmit={handlePasswordReset} className="w-full max-w-sm space-y-6 animate-fade-in">
                                {resetSuccess ? (
                                    <div className="text-center text-green-400 font-bold p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                                        Success! Closing...
                                    </div>
                                ) : (
                                    <>
                                        {error && <div className="text-red-400 text-xs text-center font-bold mb-4">{error}</div>}

                                        {!username && (
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Username</label>
                                                <input
                                                    type="text"
                                                    value={manualUsername}
                                                    onChange={(e) => setManualUsername(e.target.value)}
                                                    required
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-white/30 transition-colors text-white mb-4"
                                                    placeholder="Enter username..."
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 pl-10 focus:outline-none focus:border-white/30 transition-colors text-white"
                                                    placeholder="Enter new password..."
                                                />
                                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                                            Update Password
                                        </button>
                                    </>
                                )}
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- GAMES ---

function DiceGame({ onWin, onLose }) {
    const [rolling, setRolling] = useState(false);
    const [round, setRound] = useState(1);
    const [score, setScore] = useState({ user: 0, cpu: 0 });
    const [lastRoll, setLastRoll] = useState({ user: '?', cpu: '?' });
    const [message, setMessage] = useState('Best of 5 wins.');

    // Animation Effect
    useEffect(() => {
        let interval;
        if (rolling) {
            interval = setInterval(() => {
                setLastRoll({
                    user: Math.floor(Math.random() * 6) + 1,
                    cpu: Math.floor(Math.random() * 6) + 1
                });
            }, 80);
        }
        return () => clearInterval(interval);
    }, [rolling]);

    const roll = () => {
        if (rolling) return;
        setRolling(true);
        setMessage(`Rolling Round ${round}...`);

        setTimeout(() => {
            // Standard Logic
            let winChance = 0.5;
            // Rigged only on tie-breaker (2-2)
            if (score.user === 2 && score.cpu === 2) {
                winChance = 0.7;
            }

            const isUserWin = Math.random() < winChance;

            let uRoll, cRoll;
            if (isUserWin) {
                uRoll = Math.floor(Math.random() * 5) + 2; // 2-6
                cRoll = Math.floor(Math.random() * (uRoll - 1)) + 1; // 1 to uRoll-1
            } else {
                cRoll = Math.floor(Math.random() * 5) + 2;
                uRoll = Math.floor(Math.random() * cRoll) + 1;
            }

            setLastRoll({ user: uRoll, cpu: cRoll });
            setRolling(false);

            const newUserScore = score.user + (uRoll > cRoll ? 1 : 0);
            const newCpuScore = score.cpu + (uRoll <= cRoll ? 1 : 0); // CPU wins ties

            setScore({ user: newUserScore, cpu: newCpuScore });

            if (uRoll > cRoll) setMessage('You won this round!');
            else setMessage('System won this round.');

            // Check Game Over (Best of 5 -> First to 3)
            if (newUserScore >= 3) {
                setTimeout(onWin, 1000);
            } else if (newCpuScore >= 3) {
                setTimeout(onLose, 1000);
            } else {
                setRound(r => r + 1);
            }

        }, 1500);
    };

    return (
        <div className="text-center space-y-8 w-full">
            <div className="flex justify-between items-center px-12 text-white/60 text-sm font-bold uppercase tracking-widest">
                <span>You: {score.user}</span>
                <span>Round {Math.min(round, 5)}/5</span>
                <span>CPU: {score.cpu}</span>
            </div>

            <div className="flex gap-12 items-center justify-center">
                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/30">You</p>
                    <div className={`w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center text-4xl font-bold border border-white/10 text-white transition-all ${rolling ? 'animate-spin scale-90 border-blue-500/50 text-blue-300' : 'scale-100'}`}>{lastRoll.user}</div>
                </div>
                <div className="text-2xl font-black text-white/20">VS</div>
                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/30">System</p>
                    <div className={`w-24 h-24 bg-red-500/10 rounded-2xl flex items-center justify-center text-4xl font-bold border border-red-500/20 text-red-200 transition-all ${rolling ? 'animate-spin scale-90 opacity-50' : 'scale-100'}`}>{lastRoll.cpu}</div>
                </div>
            </div>

            <div className="h-4 text-white/50 text-sm">{message}</div>

            <button onClick={roll} disabled={rolling} className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100">
                {rolling ? 'Rolling...' : 'Roll Dice'}
            </button>
        </div>
    );
}

function TicTacToe({ onWin, onLose }) {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);

    const checkWinner = (squares) => {
        const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
        }
        return null;
    };

    const handleClick = (i) => {
        if (board[i] || !isPlayerTurn) return;
        const newBoard = [...board];
        newBoard[i] = 'X';
        setBoard(newBoard);

        const winner = checkWinner(newBoard);
        if (winner === 'X') { onWin(); return; }
        if (!newBoard.includes(null)) { onLose(); return; }

        setIsPlayerTurn(false);
        setTimeout(() => {
            const emptyIndices = newBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
            if (emptyIndices.length > 0) {
                const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                newBoard[randomIdx] = 'O';
                setBoard([...newBoard]);

                const aiWinner = checkWinner(newBoard);
                if (aiWinner === 'O') { onLose(); return; }
                if (!newBoard.includes(null)) { onLose(); return; }
            }
            setIsPlayerTurn(true);
        }, 500);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2 bg-white/5 p-2 rounded-xl">
                {board.map((val, i) => (
                    <button
                        key={i}
                        onClick={() => handleClick(i)}
                        className={`w-16 h-16 rounded-lg text-2xl font-bold flex items-center justify-center transition-colors ${val ? (val === 'X' ? 'bg-blue-500/20 text-blue-200' : 'bg-red-500/20 text-red-200') : 'bg-white/5 hover:bg-white/10'}`}
                    >
                        {val}
                    </button>
                ))}
            </div>
            <p className="text-xs text-center text-white/30">Draws count as loss.</p>
        </div>
    );
}

function ConnectFour({ onWin, onLose }) {
    const ROWS = 6;
    const COLS = 7;
    const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    const [playerTurn, setPlayerTurn] = useState(true);

    const checkWin = (b, player) => {
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS - 3; c++) if (b[r][c] === player && b[r][c + 1] === player && b[r][c + 2] === player && b[r][c + 3] === player) return true;
        for (let r = 0; r < ROWS - 3; r++) for (let c = 0; c < COLS; c++) if (b[r][c] === player && b[r + 1][c] === player && b[r + 2][c] === player && b[r + 3][c] === player) return true;
        for (let r = 0; r < ROWS - 3; r++) for (let c = 0; c < COLS - 3; c++) if (b[r][c] === player && b[r + 1][c + 1] === player && b[r + 2][c + 2] === player && b[r + 3][c + 3] === player) return true;
        for (let r = 3; r < ROWS; r++) for (let c = 0; c < COLS - 3; c++) if (b[r][c] === player && b[r - 1][c + 1] === player && b[r - 2][c + 2] === player && b[r - 3][c + 3] === player) return true;
        return false;
    };

    const dropPiece = (col) => {
        if (!playerTurn) return;
        const newBoard = board.map(row => [...row]);
        let row = -1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (!newBoard[r][col]) {
                row = r;
                break;
            }
        }
        if (row === -1) return;

        newBoard[row][col] = 'P';
        setBoard(newBoard);

        if (checkWin(newBoard, 'P')) { onWin(); return; }

        setPlayerTurn(false);
        setTimeout(() => {
            const validCols = [];
            for (let c = 0; c < COLS; c++) if (!newBoard[0][c]) validCols.push(c);

            if (validCols.length === 0) { onLose(); return; }

            const randomCol = validCols[Math.floor(Math.random() * validCols.length)];
            let aiRow = -1;
            for (let r = ROWS - 1; r >= 0; r--) {
                if (!newBoard[r][randomCol]) {
                    aiRow = r;
                    break;
                }
            }
            newBoard[aiRow][randomCol] = 'C';
            setBoard([...newBoard]);

            if (checkWin(newBoard, 'C')) { onLose(); return; }
            setPlayerTurn(true);
        }, 500);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-1 bg-blue-900/40 p-3 rounded-xl border border-blue-500/30">
                {Array(COLS).fill(null).map((_, col) => (
                    <div key={col} className="flex flex-col gap-1 cursor-pointer hover:bg-white/5 rounded-t" onClick={() => dropPiece(col)}>
                        {board.map((row, r) => (
                            <div key={r} className={`w-8 h-8 rounded-full border border-white/5 transition-colors ${row[col] === 'P' ? 'bg-yellow-400' : row[col] === 'C' ? 'bg-red-500' : 'bg-black/40'}`} />
                        ))}
                    </div>
                ))}
            </div>
            <p className="text-xs text-center text-white/30">Connect 4 to unlock.</p>
        </div>
    );
}
