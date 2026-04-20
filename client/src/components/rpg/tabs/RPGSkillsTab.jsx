import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Shield, Zap, Cpu, Database, Sword, Target, Compass } from 'lucide-react';
import { ARCHETYPE_MATRIX } from '../../../constants/assessment';

const PATH_THEMES = {
    'Strategist': { color: 'blue',    hex: 'rgba(59,130,246',   icon: <Brain    className="size-8 text-blue-400"    /> },
    'Visionary':  { color: 'purple',  hex: 'rgba(168,85,247',   icon: <Sparkles className="size-8 text-purple-400"  /> },
    'Warden':     { color: 'emerald', hex: 'rgba(16,185,129',   icon: <Shield   className="size-8 text-emerald-400" /> },
    'Scout':      { color: 'amber',   hex: 'rgba(245,158,11',   icon: <Zap      className="size-8 text-amber-400"   /> },
};

const polarToXY = (r, angleDeg) => {
    const rad = angleDeg * Math.PI / 180;
    return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
};

const buildConstellation = (currentPath) => {
    const pathsData = [
        { name: 'Strategist', angle: -90 },
        { name: 'Visionary',  angle: 90  },
        { name: 'Warden',     angle: 0   },
        { name: 'Scout',      angle: 180 },
    ];
    const styles     = ['Aggressive', 'Defensive', 'Opportunist'];
    const alignments = ['good', 'evil'];
    const nodes      = { root: [], l1: [], l2: [], l3: [], l4: [] };
    const lines      = [];

    nodes.root.push({ id: 'root', label: 'THE_SYSTEM', x: 50, y: 50, isActive: currentPath !== 'None' });

    pathsData.forEach(({ name: pathName, angle: pathAngle }) => {
        const pathData = ARCHETYPE_MATRIX[pathName];
        if (!pathData) return;

        const startArc    = pathAngle - 45;
        const isPathActive = currentPath === pathName;
        const theme       = PATH_THEMES[pathName];

        const pCoord = polarToXY(8, pathAngle);
        nodes.l1.push({ id: pathName, label: pathName, x: pCoord.x, y: pCoord.y, theme, isActive: isPathActive });
        lines.push({ x1: 50, y1: 50, x2: pCoord.x, y2: pCoord.y, isActive: isPathActive, colorHex: theme.hex });

        let pLeafIndex = 0;

        pathData.archetypes.forEach((discName) => {
            const discLeafCount = 6;
            const dStartAngle   = startArc + (pLeafIndex * 3.75);
            const dEndAngle     = startArc + ((pLeafIndex + discLeafCount) * 3.75);
            const dAngle        = (dStartAngle + dEndAngle) / 2;

            const dCoord = polarToXY(18, dAngle);
            nodes.l2.push({ id: `${pathName}_${discName}`, label: discName, x: dCoord.x, y: dCoord.y, theme, isActive: isPathActive });
            lines.push({ x1: pCoord.x, y1: pCoord.y, x2: dCoord.x, y2: dCoord.y, isActive: isPathActive, colorHex: theme.hex });

            styles.forEach((styleName) => {
                const styleData      = pathData[discName][styleName];
                const styleLeafCount = 2;
                const sStartAngle    = startArc + (pLeafIndex * 3.75);
                const sEndAngle      = startArc + ((pLeafIndex + styleLeafCount) * 3.75);
                const sAngle         = (sStartAngle + sEndAngle) / 2;

                const sCoord = polarToXY(28, sAngle);
                nodes.l3.push({ id: `${pathName}_${discName}_${styleName}`, label: styleData.label || styleName, x: sCoord.x, y: sCoord.y, theme, isActive: isPathActive });
                lines.push({ x1: dCoord.x, y1: dCoord.y, x2: sCoord.x, y2: sCoord.y, isActive: isPathActive, colorHex: theme.hex });

                alignments.forEach((alignName) => {
                    const leafAngle   = startArc + ((pLeafIndex + 0.5) * 3.75);
                    const isGood      = alignName === 'good';
                    const oRadius     = isGood ? 42 : 46;
                    const oCoord      = polarToXY(oRadius, leafAngle);
                    const outcomeName = styleData[alignName];

                    nodes.l4.push({ id: outcomeName, label: outcomeName, alignInfo: alignName, x: oCoord.x, y: oCoord.y, theme, isActive: isPathActive });
                    lines.push({ x1: sCoord.x, y1: sCoord.y, x2: oCoord.x, y2: oCoord.y, isActive: isPathActive, colorHex: theme.hex });

                    pLeafIndex++;
                });
            });
        });
    });

    return { nodes, lines };
};

const RPGSkillsTab = ({ user }) => {
    const [treeScale, setTreeScale] = useState(1);
    const currentPath  = user?.rpg?.path || 'None';
    const constellation = buildConstellation(currentPath);

    // Auto-locate origin when mounted
    useEffect(() => {
        const container = document.getElementById('skills-scroll-container');
        if (container) {
            const centerPoint = (4000 * treeScale) / 2;
            container.scrollTo({
                left: centerPoint - container.clientWidth  / 2,
                top:  centerPoint - container.clientHeight / 2,
                behavior: 'smooth',
            });
        }
    }, [treeScale]);

    const locateOrigin = () => {
        const container = document.getElementById('skills-scroll-container');
        if (container) {
            const centerPoint = (4000 * treeScale) / 2;
            container.scrollTo({
                left: centerPoint - container.clientWidth  / 2,
                top:  centerPoint - container.clientHeight / 2,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div id="skills-scroll-container" className="absolute inset-0 z-20 pointer-events-auto overflow-auto custom-scrollbar bg-black/40" key="skills-inner">

            {/* Vertical Optical Zoom Controls (Upper Left) */}
            <div className="fixed top-10 left-10 z-[100]">
                <div className="flex flex-col items-center gap-1 glass-panel px-1.5 py-2 rounded-full border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <button
                        onClick={() => setTreeScale(prev => Math.min(1.5, prev + 0.2))}
                        className="size-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/20"
                        title="Zoom In"
                    >
                        <span className="text-lg font-mono font-bold leading-none">+</span>
                    </button>
                    <span className="text-[9px] font-mono font-black text-white/70 py-1 text-center tracking-widest">{Math.round(treeScale * 100)}%</span>
                    <button
                        onClick={() => setTreeScale(prev => Math.max(0.2, prev - 0.2))}
                        className="size-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/20"
                        title="Zoom Out"
                    >
                        <span className="text-lg font-mono font-bold leading-none">-</span>
                    </button>
                </div>
            </div>

            {/* Locate Origin (Bottom Right) */}
            <div className="fixed bottom-10 right-10 z-[100]">
                <button
                    onClick={locateOrigin}
                    className="flex items-center gap-2 px-4 py-3 rounded-full glass-panel border border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] active:scale-95"
                >
                    <Compass className="size-4 text-cyan-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Locate Origin</span>
                </button>
            </div>

            <div
                className="relative transition-all duration-300 ease-out"
                style={{ width: `${4000 * treeScale}px`, height: `${4000 * treeScale}px` }}
            >
                <div
                    className="absolute top-0 left-0 w-[4000px] h-[4000px] overflow-visible transition-transform duration-300 ease-out"
                    style={{ transform: `scale(${treeScale})`, transformOrigin: 'top left' }}
                >
                    {/* 1. SVG Wiring Layer */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        {constellation.lines.map((line, i) => (
                            <line
                                key={`line_${i}`}
                                x1={`${line.x1}%`} y1={`${line.y1}%`}
                                x2={`${line.x2}%`} y2={`${line.y2}%`}
                                stroke={line.isActive ? `${line.colorHex}, 0.8)` : 'rgba(255,255,255,0.15)'}
                                strokeWidth={line.isActive ? "2.5" : "1"}
                                strokeDasharray={line.isActive ? "none" : "3 5"}
                            />
                        ))}
                    </svg>

                    {/* 2. Constellation Nodes */}

                    {/* T0: Root */}
                    {constellation.nodes.root.map(n => (
                        <div key={n.id} className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group z-30 transition-all ${n.isActive ? 'opacity-100 scale-110' : 'opacity-40'}`} style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                            <div className="size-16 rounded-full glass-panel border border-cyan-500/50 flex items-center justify-center relative shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                                <Cpu className="size-8 text-cyan-400" />
                                <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping" />
                            </div>
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{n.label}</span>
                        </div>
                    ))}

                    {/* T1: Paths */}
                    {constellation.nodes.l1.map(n => (
                        <div key={n.id} className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group z-20 cursor-pointer transition-all hover:scale-110 ${n.isActive ? 'opacity-100' : 'opacity-30 saturate-0 hover:saturate-100 hover:opacity-80'}`} style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                            <div className={`size-16 rounded-full glass-panel border border-${n.theme.color}-500/50 flex items-center justify-center relative shadow-[0_0_30px_${n.theme.hex},0.3)]`}>
                                {n.theme.icon}
                            </div>
                            <span className={`text-[10px] font-black text-${n.theme.color}-400 uppercase tracking-widest`}>{n.label}</span>
                        </div>
                    ))}

                    {/* T2: Disciplines */}
                    {constellation.nodes.l2.map(n => (
                        <div key={n.id} className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group z-10 cursor-pointer transition-all hover:scale-110 ${n.isActive ? 'opacity-100' : 'opacity-20 hover:opacity-100'}`} style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                            <div className={`size-16 rounded-full glass-panel border border-${n.theme.color}-500/30 flex items-center justify-center relative group-hover:border-${n.theme.color}-500 group-hover:shadow-[0_0_20px_${n.theme.hex},0.4)] transition-all`}>
                                <Database className={`size-8 text-${n.theme.color}-500/60 group-hover:text-${n.theme.color}-400 transition-colors`} />
                            </div>
                            <span className="text-[10px] font-bold text-white/50 group-hover:text-white uppercase tracking-widest whitespace-nowrap">{n.label}</span>
                        </div>
                    ))}

                    {/* T3: Styles */}
                    {constellation.nodes.l3.map(n => (
                        <div key={n.id} className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group cursor-pointer transition-all hover:scale-110 ${n.isActive ? 'opacity-90' : 'opacity-20 hover:opacity-100'}`} style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                            <div className={`size-16 rounded-full glass-panel border border-${n.theme.color}-500/20 flex items-center justify-center relative group-hover:border-${n.theme.color}-400 group-hover:shadow-[0_0_15px_${n.theme.hex},0.3)] transition-all`}>
                                <Sword className={`size-8 text-${n.theme.color}-400/40 group-hover:text-${n.theme.color}-400 transition-colors`} />
                            </div>
                            <span className="text-[8px] font-mono text-white/40 group-hover:text-white uppercase tracking-widest bg-black/60 px-2 rounded backdrop-blur-sm">{n.label}</span>
                        </div>
                    ))}

                    {/* T4: Outcomes */}
                    {constellation.nodes.l4.map(n => (
                        <div key={n.id} className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-[120px] group cursor-pointer transition-all hover:z-50 hover:scale-110 ${n.isActive ? 'opacity-100' : 'opacity-20 hover:opacity-100'}`} style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                            <div className={`size-16 rounded-full glass-panel border flex items-center justify-center relative transition-all shadow-xl
                                ${n.alignInfo === 'good' ? `border-${n.theme.color}-500/40` : 'border-rose-500/40'}
                                group-hover:border-white group-hover:bg-white/10 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.6)]`}
                            >
                                <Target className={`size-8 transition-colors ${n.alignInfo === 'good' ? `text-${n.theme.color}-400/50` : 'text-rose-400/50'} group-hover:text-white`} />
                            </div>
                            <div className="bg-black/90 p-2 border border-white/10 rounded-lg backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-opacity absolute top-20 pointer-events-none w-[140px] text-center z-50 shadow-2xl">
                                <span className={`block text-[8px] uppercase tracking-widest mb-1 ${n.alignInfo === 'good' ? `text-${n.theme.color}-400` : 'text-rose-400'}`}>[{n.alignInfo}]</span>
                                <span className="text-[10px] font-black text-white uppercase tracking-tight leading-none">{n.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RPGSkillsTab;
