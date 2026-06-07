import React, { useState, useEffect } from 'react';
import DashboardModal from './DashboardModal';
import { RefreshCw, Play, Trophy, Users } from 'lucide-react';
import { soundManager } from '../../services/sound';

const GamesModal = ({ isOpen, onClose }) => {
    const [gameMode, setGameMode] = useState(null); // 'ai' or 'pass'
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [scores, setScores] = useState({ x: 0, o: 0, ties: 0 });
    const [winner, setWinner] = useState(null);
    const [winningLine, setWinningLine] = useState([]);

    const WINNING_COMBOS = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    const checkWinner = (squares) => {
        for (let combo of WINNING_COMBOS) {
            const [a, b, c] = combo;
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return { winner: squares[a], line: combo };
            }
        }
        if (squares.every(s => s !== null)) {
            return { winner: 'Tie', line: [] };
        }
        return null;
    };

    const handleSquareClick = (index) => {
        if (board[index] || winner || (gameMode === 'ai' && !isXNext)) return;

        soundManager.play('click');
        const nextBoard = [...board];
        nextBoard[index] = isXNext ? 'X' : 'O';
        setBoard(nextBoard);

        const result = checkWinner(nextBoard);
        if (result) {
            setWinner(result.winner);
            setWinningLine(result.line);
            updateScores(result.winner);
        } else {
            setIsXNext(!isXNext);
        }
    };

    const updateScores = (gameWinner) => {
        if (gameWinner === 'X') {
            setScores(prev => ({ ...prev, x: prev.x + 1 }));
            soundManager.play('ding');
        } else if (gameWinner === 'O') {
            setScores(prev => ({ ...prev, o: prev.o + 1 }));
            soundManager.play('ding');
        } else if (gameWinner === 'Tie') {
            setScores(prev => ({ ...prev, ties: prev.ties + 1 }));
            soundManager.play('click');
        }
    };

    // AI Move logic
    useEffect(() => {
        if (gameMode !== 'ai' || isXNext || winner) return;

        const emptySquares = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        if (emptySquares.length === 0) return;

        // Simulate thinking delay
        const timer = setTimeout(() => {
            // Very simple AI: check if AI can win, or if it needs to block player, else pick random
            let targetMove = null;

            // 1. Check if AI ('O') can win in next move
            for (let combo of WINNING_COMBOS) {
                const [a, b, c] = combo;
                const vals = [board[a], board[b], board[c]];
                if (vals.filter(v => v === 'O').length === 2 && vals.filter(v => v === null).length === 1) {
                    targetMove = combo[vals.indexOf(null)];
                    break;
                }
            }

            // 2. Check if AI needs to block player ('X')
            if (targetMove === null) {
                for (let combo of WINNING_COMBOS) {
                    const [a, b, c] = combo;
                    const vals = [board[a], board[b], board[c]];
                    if (vals.filter(v => v === 'X').length === 2 && vals.filter(v => v === null).length === 1) {
                        targetMove = combo[vals.indexOf(null)];
                        break;
                    }
                }
            }

            // 3. Fallback to center or corner or random
            if (targetMove === null) {
                if (board[4] === null) targetMove = 4;
                else {
                    const corners = [0, 2, 6, 8].filter(c => board[c] === null);
                    if (corners.length > 0) {
                        targetMove = corners[Math.floor(Math.random() * corners.length)];
                    } else {
                        targetMove = emptySquares[Math.floor(Math.random() * emptySquares.length)];
                    }
                }
            }

            const nextBoard = [...board];
            nextBoard[targetMove] = 'O';
            setBoard(nextBoard);
            soundManager.play('click');

            const result = checkWinner(nextBoard);
            if (result) {
                setWinner(result.winner);
                setWinningLine(result.line);
                updateScores(result.winner);
            } else {
                setIsXNext(true);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [isXNext, gameMode, board, winner]);

    const resetGame = () => {
        soundManager.play('click');
        setBoard(Array(9).fill(null));
        setWinner(null);
        setWinningLine([]);
        setIsXNext(true);
    };

    const handleSelectMode = (mode) => {
        soundManager.play('click');
        setGameMode(mode);
        setBoard(Array(9).fill(null));
        setWinner(null);
        setWinningLine([]);
        setIsXNext(true);
        setScores({ x: 0, o: 0, ties: 0 });
    };

    return (
        <DashboardModal
            isOpen={isOpen}
            onClose={onClose}
            title="NEURAL REALITY GAMES"
            subtitle="Harness focus and mental reflexes in co-op matrix games"
            maxWidth="max-w-md"
        >
            <div className="flex flex-col items-center justify-center min-h-[350px]">
                {!gameMode ? (
                    /* Menu State */
                    <div className="w-full flex flex-col gap-4 text-center py-6">
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-relaxed mb-4 max-w-[280px] mx-auto">
                            Activate focus testing protocols. Select a neural simulator path to begin.
                        </p>
                        <button
                            onClick={() => handleSelectMode('ai')}
                            className="w-full h-14 bg-black dark:bg-white text-white dark:text-black hover:bg-black/85 dark:hover:bg-white/85 flex items-center justify-center gap-3 border border-black/10 rounded-sm font-black uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all"
                        >
                            <Trophy className="size-4" />
                            VS COGNITIVE AI
                        </button>
                        <button
                            onClick={() => handleSelectMode('pass')}
                            className="w-full h-14 bg-transparent border border-black/15 dark:border-white/15 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center gap-3 rounded-sm font-black uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all"
                        >
                            <Users className="size-4" />
                            PASS & PLAY CO-OP
                        </button>
                    </div>
                ) : (
                    /* Active Game State */
                    <div className="w-full flex flex-col items-center gap-6">
                        {/* Score Board */}
                        <div className="w-full grid grid-cols-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-sm py-3 px-4 text-center font-mono">
                            <div>
                                <span className="text-[8px] text-slate-400 uppercase tracking-wider block">PLAYER (X)</span>
                                <span className="text-sm font-bold text-black dark:text-white">{scores.x}</span>
                            </div>
                            <div className="border-x border-black/15 dark:border-white/15">
                                <span className="text-[8px] text-slate-400 uppercase tracking-wider block">TIES</span>
                                <span className="text-sm font-bold text-black dark:text-white">{scores.ties}</span>
                            </div>
                            <div>
                                <span className="text-[8px] text-slate-400 uppercase tracking-wider block">
                                    {gameMode === 'ai' ? 'COGNITIVE' : 'PARTNER'} (O)
                                </span>
                                <span className="text-sm font-bold text-black dark:text-white">{scores.o}</span>
                            </div>
                        </div>

                        {/* Status Label */}
                        <div className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-rose-500">
                            {winner ? (
                                winner === 'Tie' ? 'MATCH DRAWN • STATIC IN SIGNAL' : `PROTOCOL VICTORY: ${winner}`
                            ) : (
                                `ACTIVE NODE FOCUS: ${isXNext ? 'PLAYER X' : (gameMode === 'ai' ? 'COGNITIVE CORE' : 'PLAYER O')}`
                            )}
                        </div>

                        {/* Game Board */}
                        <div className="grid grid-cols-3 gap-2 w-64 h-64 bg-black/5 dark:bg-white/5 p-2 rounded-sm border border-black/10 dark:border-white/10">
                            {board.map((square, idx) => {
                                const isWinningSquare = winningLine.includes(idx);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSquareClick(idx)}
                                        className={`w-full h-full rounded-sm flex items-center justify-center font-mono text-xl font-bold border transition-all ${
                                            isWinningSquare
                                                ? 'bg-rose-500 border-rose-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                                                : 'bg-white dark:bg-[#000000] border-black/5 dark:border-white/5 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                        }`}
                                        disabled={!!square || !!winner || (gameMode === 'ai' && !isXNext)}
                                    >
                                        {square}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer Controls */}
                        <div className="w-full flex items-center gap-3">
                            <button
                                onClick={resetGame}
                                className="flex-1 h-10 bg-black dark:bg-white text-white dark:text-black hover:bg-black/85 dark:hover:bg-white/85 font-black uppercase text-[9px] tracking-[0.2em] flex items-center justify-center gap-2 rounded-sm"
                            >
                                <RefreshCw className="size-3" />
                                RESTART
                            </button>
                            <button
                                onClick={() => handleSelectMode(null)}
                                className="h-10 px-4 bg-transparent border border-black/15 dark:border-white/15 text-slate-500 hover:text-black dark:hover:text-white font-black uppercase text-[9px] tracking-[0.2em] rounded-sm"
                            >
                                MODE
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardModal>
    );
};

export default GamesModal;
