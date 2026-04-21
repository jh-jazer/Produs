import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Sparkles, Shield, Zap, Cpu, Database, Sword, Target, Compass, GitBranch, Globe } from 'lucide-react';
import { ARCHETYPE_MATRIX } from '../../../constants/assessment';

/* ─────────────────────────────────────────────────────────────────
   THEME
───────────────────────────────────────────────────────────────── */
const PATH_THEMES = {
    Strategist: { color: 'blue',    hex: '#3b82f6', icon: <Brain    className="size-5 text-blue-400"    /> },
    Visionary:  { color: 'purple',  hex: '#a855f7', icon: <Sparkles className="size-5 text-purple-400"  /> },
    Warden:     { color: 'emerald', hex: '#10b981', icon: <Shield   className="size-5 text-emerald-400" /> },
    Scout:      { color: 'amber',   hex: '#f59e0b', icon: <Zap      className="size-5 text-amber-400"   /> },
};

const STYLE_COLORS = { Aggressive: '#ef4444', Defensive: '#3b82f6', Opportunist: '#f59e0b' };

/* ─────────────────────────────────────────────────────────────────
   TREE LAYOUT  (pure pixel coords, no polar math)

   Structure:
     L0  root                          1 node
     L1  paths                         4 nodes
     L2  disciplines     4 paths × 4   = 16 nodes
     L3  styles          16   × 3      = 48 nodes
     L4  outcomes        48   × 2      = 96 nodes

   We lay out columns evenly per path quadrant, then assign
   y positions per level.
───────────────────────────────────────────────────────────────── */

const ROW_Y   = [0, 130, 290, 460, 640];   // y-centre of each level
const NODE_W  = 72;                         // node circle diameter (px)
const CARD_W  = 84;                         // outcome card width   (px)

// Each path occupies 24 leaf-columns (4 disc × 3 styles × 2 outcomes)
const LEAF_COL_W  = 94;                    // px per leaf column
const PATH_COLS   = 24;                    // leaf columns per path
const PATH_W      = PATH_COLS * LEAF_COL_W;
const CANVAS_W    = PATH_W * 4 + 80;      // total canvas width (+ padding)
const CANVAS_H    = ROW_Y[4] + 140;       // total canvas height

function buildTree(currentPath) {
    const nodes = [];
    const edges = [];

    // ── L0 root ──────────────────────────────────────────────────
    const rootX = CANVAS_W / 2;
    const root  = { id: 'root', label: 'THE_SYSTEM', level: 0, x: rootX, y: ROW_Y[0], isActive: currentPath !== 'None' };
    nodes.push(root);

    const pathNames = Object.keys(ARCHETYPE_MATRIX); // 4 paths

    pathNames.forEach((pathName, pi) => {
        const pathData  = ARCHETYPE_MATRIX[pathName];
        const theme     = PATH_THEMES[pathName];
        const isPathAct = currentPath === pathName;

        // Path's column block starts at pi * PATH_W + 40 (left padding)
        const pathBlockL = pi * PATH_W + 40;
        const pathBlockR = pathBlockL + PATH_W;
        const pathX      = (pathBlockL + pathBlockR) / 2;

        // ── L1 path node ─────────────────────────────────────────
        const pathNode = { id: pathName, label: pathName, level: 1, x: pathX, y: ROW_Y[1], theme, isActive: isPathAct };
        nodes.push(pathNode);
        edges.push({ x1: rootX, y1: ROW_Y[0], x2: pathX, y2: ROW_Y[1], isActive: isPathAct, color: theme.hex });

        // Each discipline occupies 6 leaf-columns
        const DISC_COLS = PATH_COLS / pathData.archetypes.length; // 6

        pathData.archetypes.forEach((discName, di) => {
            const discBlockL = pathBlockL + di * DISC_COLS * LEAF_COL_W;
            const discBlockR = discBlockL + DISC_COLS * LEAF_COL_W;
            const discX      = (discBlockL + discBlockR) / 2;

            // ── L2 discipline node ───────────────────────────────
            const discId   = `${pathName}_${discName}`;
            const discNode = { id: discId, label: discName, level: 2, x: discX, y: ROW_Y[2], theme, isActive: isPathAct };
            nodes.push(discNode);
            edges.push({ x1: pathX, y1: ROW_Y[1], x2: discX, y2: ROW_Y[2], isActive: isPathAct, color: theme.hex });

            const styles = ['Aggressive', 'Defensive', 'Opportunist'];

            styles.forEach((styleName, si) => {
                const styleData  = pathData[discName][styleName];
                const styleBlockL = discBlockL + si * 2 * LEAF_COL_W;
                const styleBlockR = styleBlockL + 2 * LEAF_COL_W;
                const styleX      = (styleBlockL + styleBlockR) / 2;

                // ── L3 style node ────────────────────────────────
                const styleId   = `${discId}_${styleName}`;
                const styleNode = { id: styleId, label: styleData.label || styleName, level: 3, x: styleX, y: ROW_Y[3], theme, isActive: isPathAct, styleColor: STYLE_COLORS[styleName] };
                nodes.push(styleNode);
                edges.push({ x1: discX, y1: ROW_Y[2], x2: styleX, y2: ROW_Y[3], isActive: isPathAct, color: theme.hex });

                // ── L4 outcome nodes ─────────────────────────────
                [
                    { align: 'good', label: styleData.good },
                    { align: 'evil', label: styleData.evil },
                ].forEach(({ align, label }, oi) => {
                    const leafX = styleBlockL + oi * LEAF_COL_W + LEAF_COL_W / 2;

                    nodes.push({
                        id: `${styleId}_${align}`,
                        label,
                        level: 4,
                        x: leafX,
                        y: ROW_Y[4],
                        theme,
                        isActive: isPathAct,
                        align,
                    });
                    edges.push({
                        x1: styleX, y1: ROW_Y[3],
                        x2: leafX,  y2: ROW_Y[4],
                        isActive: isPathAct,
                        color: align === 'good' ? theme.hex : '#ef4444',
                    });
                });
            });
        });
    });

    return { nodes, edges };
}

/* ─────────────────────────────────────────────────────────────────
   ORTHOGONAL EDGE  (elbow: vertical mid-hop then horizontal then vertical)
───────────────────────────────────────────────────────────────── */
function OrthogonalEdge({ x1, y1, x2, y2, isActive, color }) {
    const mid = (y1 + y2) / 2;
    const d   = `M ${x1} ${y1} L ${x1} ${mid} L ${x2} ${mid} L ${x2} ${y2}`;
    return (
        <path
            d={d}
            fill="none"
            stroke={isActive ? color : 'rgba(255,255,255,0.12)'}
            strokeWidth={isActive ? 1.5 : 1}
            strokeDasharray={isActive ? 'none' : '4 6'}
            strokeLinecap="round"
        />
    );
}

/* ─────────────────────────────────────────────────────────────────
   NODE RENDERS  per level
───────────────────────────────────────────────────────────────── */
function NodeRoot({ node }) {
    return (
        <g transform={`translate(${node.x}, ${node.y})`}>
            <circle r={30} fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.5)" strokeWidth={1.5} />
            <circle r={26} fill="rgba(0,0,0,0.6)" stroke="rgba(6,182,212,0.3)" strokeWidth={1}
                className={node.isActive ? '' : 'opacity-40'} />
            <foreignObject x={-20} y={-20} width={40} height={40}>
                <div xmlns="http://www.w3.org/1999/xhtml" className="flex items-center justify-center w-full h-full">
                    <Cpu className="size-6 text-cyan-400" />
                </div>
            </foreignObject>
            <text y={46} textAnchor="middle" fontSize={8} fontFamily="monospace" fontWeight="900"
                fill="rgba(34,211,238,0.9)" letterSpacing="3">
                {node.label}
            </text>
        </g>
    );
}

function NodePath({ node }) {
    const hex  = node.theme?.hex || '#fff';
    const fill = node.isActive ? `${hex}14` : 'rgba(255,255,255,0.03)';
    const stroke = node.isActive ? hex : 'rgba(255,255,255,0.15)';
    return (
        <g transform={`translate(${node.x}, ${node.y})`} className={`${node.isActive ? '' : 'opacity-30'}`}>
            <circle r={28} fill={fill} stroke={stroke} strokeWidth={1.5} />
            <foreignObject x={-18} y={-18} width={36} height={36}>
                <div xmlns="http://www.w3.org/1999/xhtml" className="flex items-center justify-center w-full h-full">
                    {node.theme?.icon}
                </div>
            </foreignObject>
            <text y={42} textAnchor="middle" fontSize={8} fontFamily="monospace" fontWeight="800"
                fill={node.isActive ? hex : 'rgba(255,255,255,0.4)'} letterSpacing="2">
                {node.label.toUpperCase()}
            </text>
        </g>
    );
}

function NodeDisc({ node }) {
    const hex    = node.theme?.hex || '#fff';
    const stroke = node.isActive ? hex : 'rgba(255,255,255,0.1)';
    return (
        <g transform={`translate(${node.x}, ${node.y})`} className={node.isActive ? '' : 'opacity-20'}>
            <rect x={-32} y={-18} width={64} height={36} rx={6}
                fill="rgba(0,0,0,0.5)" stroke={stroke} strokeWidth={1} />
            <text y={-4} textAnchor="middle" fontSize={8} fontFamily="monospace" fontWeight="700"
                fill={node.isActive ? hex : 'rgba(255,255,255,0.4)'} letterSpacing="1">
                {node.label.toUpperCase()}
            </text>
            <text y={10} textAnchor="middle" fontSize={6} fontFamily="monospace"
                fill="rgba(255,255,255,0.3)" letterSpacing="1">
                DISCIPLINE
            </text>
        </g>
    );
}

function NodeStyle({ node }) {
    const sc = node.styleColor || '#fff';
    return (
        <g transform={`translate(${node.x}, ${node.y})`} className={node.isActive ? '' : 'opacity-20'}>
            <rect x={-34} y={-16} width={68} height={32} rx={4}
                fill="rgba(0,0,0,0.6)" stroke={sc} strokeWidth={0.8} strokeOpacity={node.isActive ? 0.7 : 0.2} />
            <text y={-3} textAnchor="middle" fontSize={7} fontFamily="monospace" fontWeight="700"
                fill={node.isActive ? sc : 'rgba(255,255,255,0.3)'} letterSpacing="1">
                {node.label.toUpperCase()}
            </text>
            <text y={10} textAnchor="middle" fontSize={6} fontFamily="monospace"
                fill="rgba(255,255,255,0.25)" letterSpacing="1">
                STYLE
            </text>
        </g>
    );
}

function NodeOutcome({ node }) {
    const goodColor = node.theme?.hex || '#fff';
    const evilColor = '#ef4444';
    const color     = node.align === 'good' ? goodColor : evilColor;
    return (
        <g transform={`translate(${node.x}, ${node.y})`} className={node.isActive ? '' : 'opacity-15'}>
            {/* diamond shape */}
            <polygon points="0,-20 20,0 0,20 -20,0"
                fill="rgba(0,0,0,0.7)" stroke={color} strokeWidth={0.8}
                strokeOpacity={node.isActive ? 0.8 : 0.2} />
            {/* alignment tag */}
            <text y={-10} textAnchor="middle" fontSize={5} fontFamily="monospace" fontWeight="900"
                fill={color} letterSpacing="2" opacity={node.isActive ? 0.9 : 0.4}>
                [{node.align?.toUpperCase()}]
            </text>
            {/* label below */}
            <foreignObject x={-CARD_W / 2} y={26} width={CARD_W} height={42}>
                <div xmlns="http://www.w3.org/1999/xhtml"
                    className="flex items-center justify-center text-center"
                    style={{ height: '100%' }}>
                    <span style={{
                        fontSize: '7px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: node.isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        lineHeight: 1.3,
                    }}>
                        {node.label}
                    </span>
                </div>
            </foreignObject>
        </g>
    );
}

/* ─────────────────────────────────────────────────────────────────
   TREE VIEW
───────────────────────────────────────────────────────────────── */
function SkillTreeView({ currentPath }) {
    const [scale, setScale]   = useState(1);
    const { nodes, edges }    = buildTree(currentPath);

    const snapToRoot = useCallback(() => {
        const el = document.getElementById('tree-scroll');
        if (!el) return;
        const scaledW = CANVAS_W * scale;
        el.scrollTo({ left: (scaledW - el.clientWidth) / 2, top: 0, behavior: 'smooth' });
    }, [scale]);

    useEffect(() => { snapToRoot(); }, [scale, snapToRoot]);

    return (
        <div id="tree-scroll" className="absolute inset-0 overflow-auto custom-scrollbar bg-black/40">
            {/* Zoom controls */}
            <div className="fixed top-10 left-10 z-[100]">
                <div className="flex flex-col items-center gap-1 glass-panel px-1.5 py-2 rounded-full border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <button
                        onClick={() => setScale(p => Math.min(2, +(p + 0.15).toFixed(2)))}
                        className="size-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all"
                    ><span className="text-lg font-mono font-bold leading-none">+</span></button>
                    <span className="text-[9px] font-mono font-black text-white/70 py-1 text-center tracking-widest">{Math.round(scale * 100)}%</span>
                    <button
                        onClick={() => setScale(p => Math.max(0.2, +(p - 0.15).toFixed(2)))}
                        className="size-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all"
                    ><span className="text-lg font-mono font-bold leading-none">-</span></button>
                </div>
            </div>

            {/* Snap to root */}
            <div className="fixed bottom-10 right-10 z-[100]">
                <button
                    onClick={snapToRoot}
                    className="flex items-center gap-2 px-4 py-3 rounded-full glass-panel border border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] active:scale-95"
                >
                    <Compass className="size-4 text-cyan-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Locate Root</span>
                </button>
            </div>

            {/* Canvas */}
            <div
                className="relative transition-all duration-300 ease-out"
                style={{ width: `${CANVAS_W * scale}px`, height: `${CANVAS_H * scale}px` }}
            >
                <div
                    className="absolute top-0 left-0 overflow-visible transition-transform duration-300 ease-out"
                    style={{
                        width: `${CANVAS_W}px`,
                        height: `${CANVAS_H}px`,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                    }}
                >
                    <svg
                        width={CANVAS_W}
                        height={CANVAS_H}
                        className="absolute inset-0 overflow-visible pointer-events-none"
                    >
                        {/* Level label rows */}
                        {['PATH', 'DISCIPLINE', 'STYLE', 'OUTCOME'].map((lbl, i) => (
                            <text
                                key={lbl}
                                x={12}
                                y={ROW_Y[i + 1] + 4}
                                fontSize={7}
                                fontFamily="monospace"
                                fontWeight="900"
                                fill="rgba(255,255,255,0.12)"
                                letterSpacing="4"
                            >
                                {lbl}
                            </text>
                        ))}

                        {/* Horizontal guide lines */}
                        {ROW_Y.map((y, i) => (
                            <line
                                key={`guide_${i}`}
                                x1={0} y1={y}
                                x2={CANVAS_W} y2={y}
                                stroke="rgba(255,255,255,0.03)"
                                strokeWidth={1}
                                strokeDasharray="4 8"
                            />
                        ))}

                        {/* Edges */}
                        {edges.map((e, i) => (
                            <OrthogonalEdge key={`e_${i}`} {...e} />
                        ))}

                        {/* Nodes */}
                        {nodes.map(n => {
                            if (n.level === 0) return <NodeRoot    key={n.id} node={n} />;
                            if (n.level === 1) return <NodePath    key={n.id} node={n} />;
                            if (n.level === 2) return <NodeDisc    key={n.id} node={n} />;
                            if (n.level === 3) return <NodeStyle   key={n.id} node={n} />;
                            return                    <NodeOutcome key={n.id} node={n} />;
                        })}
                    </svg>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   WEB / CONSTELLATION  (original — kept as alternate view)
───────────────────────────────────────────────────────────────── */
const polarToXY = (r, angleDeg) => {
    const rad = angleDeg * Math.PI / 180;
    return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
};

function buildConstellation(currentPath) {
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
        const pathData     = ARCHETYPE_MATRIX[pathName];
        if (!pathData) return;
        const startArc     = pathAngle - 45;
        const isPathActive = currentPath === pathName;
        const theme        = PATH_THEMES[pathName];
        const pCoord       = polarToXY(8, pathAngle);
        nodes.l1.push({ id: pathName, label: pathName, x: pCoord.x, y: pCoord.y, theme, isActive: isPathActive });
        lines.push({ x1: 50, y1: 50, x2: pCoord.x, y2: pCoord.y, isActive: isPathActive, colorHex: theme.hex });

        let pLeafIndex = 0;
        pathData.archetypes.forEach((discName) => {
            const discLeafCount = 6;
            const dStartAngle   = startArc + (pLeafIndex * 3.75);
            const dEndAngle     = startArc + ((pLeafIndex + discLeafCount) * 3.75);
            const dAngle        = (dStartAngle + dEndAngle) / 2;
            const dCoord        = polarToXY(18, dAngle);
            nodes.l2.push({ id: `${pathName}_${discName}`, label: discName, x: dCoord.x, y: dCoord.y, theme, isActive: isPathActive });
            lines.push({ x1: pCoord.x, y1: pCoord.y, x2: dCoord.x, y2: dCoord.y, isActive: isPathActive, colorHex: theme.hex });

            styles.forEach((styleName) => {
                const styleData      = pathData[discName][styleName];
                const styleLeafCount = 2;
                const sStartAngle    = startArc + (pLeafIndex * 3.75);
                const sEndAngle      = startArc + ((pLeafIndex + styleLeafCount) * 3.75);
                const sAngle         = (sStartAngle + sEndAngle) / 2;
                const sCoord         = polarToXY(28, sAngle);
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
}

function SkillWebView({ currentPath }) {
    const [treeScale, setTreeScale] = useState(1);
    const constellation = buildConstellation(currentPath);

    const locateOrigin = useCallback(() => {
        const container = document.getElementById('web-scroll-container');
        if (container) {
            const centerPoint = (4000 * treeScale) / 2;
            container.scrollTo({
                left: centerPoint - container.clientWidth  / 2,
                top:  centerPoint - container.clientHeight / 2,
                behavior: 'smooth',
            });
        }
    }, [treeScale]);

    useEffect(() => { locateOrigin(); }, [treeScale, locateOrigin]);

    return (
        <div id="web-scroll-container" className="absolute inset-0 z-20 pointer-events-auto overflow-auto custom-scrollbar bg-black/40">
            <div className="fixed top-10 left-10 z-[100]">
                <div className="flex flex-col items-center gap-1 glass-panel px-1.5 py-2 rounded-full border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <button onClick={() => setTreeScale(p => Math.min(1.5, p + 0.2))} className="size-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all"><span className="text-lg font-mono font-bold leading-none">+</span></button>
                    <span className="text-[9px] font-mono font-black text-white/70 py-1 text-center tracking-widest">{Math.round(treeScale * 100)}%</span>
                    <button onClick={() => setTreeScale(p => Math.max(0.2, p - 0.2))} className="size-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all"><span className="text-lg font-mono font-bold leading-none">-</span></button>
                </div>
            </div>
            <div className="fixed bottom-10 right-10 z-[100]">
                <button onClick={locateOrigin} className="flex items-center gap-2 px-4 py-3 rounded-full glass-panel border border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] active:scale-95">
                    <Compass className="size-4 text-cyan-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Locate Origin</span>
                </button>
            </div>

            <div className="relative transition-all duration-300 ease-out" style={{ width: `${4000 * treeScale}px`, height: `${4000 * treeScale}px` }}>
                <div className="absolute top-0 left-0 w-[4000px] h-[4000px] overflow-visible transition-transform duration-300 ease-out" style={{ transform: `scale(${treeScale})`, transformOrigin: 'top left' }}>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        {constellation.lines.map((line, i) => (
                            <line key={`line_${i}`} x1={`${line.x1}%`} y1={`${line.y1}%`} x2={`${line.x2}%`} y2={`${line.y2}%`}
                                stroke={line.isActive ? `${line.colorHex}cc` : 'rgba(255,255,255,0.15)'}
                                strokeWidth={line.isActive ? '2.5' : '1'}
                                strokeDasharray={line.isActive ? 'none' : '3 5'} />
                        ))}
                    </svg>

                    {constellation.nodes.root.map(n => (
                        <div key={n.id} className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group z-30 transition-all ${n.isActive ? 'opacity-100 scale-110' : 'opacity-40'}`} style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                            <div className="size-16 rounded-full glass-panel border border-cyan-500/50 flex items-center justify-center relative shadow-[0_0_30px_rgba(6,182,212,0.4)]"><Cpu className="size-8 text-cyan-400" /><div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping" /></div>
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{n.label}</span>
                        </div>
                    ))}
                    {constellation.nodes.l1.map(n => (
                        <div key={n.id} className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group z-20 cursor-pointer transition-all hover:scale-110 ${n.isActive ? 'opacity-100' : 'opacity-30 saturate-0 hover:saturate-100 hover:opacity-80'}`} style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                            <div className={`size-16 rounded-full glass-panel border border-${n.theme.color}-500/50 flex items-center justify-center relative`}>{n.theme.icon}</div>
                            <span className={`text-[10px] font-black text-${n.theme.color}-400 uppercase tracking-widest`}>{n.label}</span>
                        </div>
                    ))}
                    {constellation.nodes.l2.map(n => (
                        <div key={n.id} className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group z-10 cursor-pointer transition-all hover:scale-110 ${n.isActive ? 'opacity-100' : 'opacity-20 hover:opacity-100'}`} style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                            <div className={`size-16 rounded-full glass-panel border border-${n.theme.color}-500/30 flex items-center justify-center relative group-hover:border-${n.theme.color}-500 transition-all`}><Database className={`size-8 text-${n.theme.color}-500/60 group-hover:text-${n.theme.color}-400 transition-colors`} /></div>
                            <span className="text-[10px] font-bold text-white/50 group-hover:text-white uppercase tracking-widest whitespace-nowrap">{n.label}</span>
                        </div>
                    ))}
                    {constellation.nodes.l3.map(n => (
                        <div key={n.id} className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group cursor-pointer transition-all hover:scale-110 ${n.isActive ? 'opacity-90' : 'opacity-20 hover:opacity-100'}`} style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                            <div className={`size-16 rounded-full glass-panel border border-${n.theme.color}-500/20 flex items-center justify-center relative group-hover:border-${n.theme.color}-400 transition-all`}><Sword className={`size-8 text-${n.theme.color}-400/40 group-hover:text-${n.theme.color}-400 transition-colors`} /></div>
                            <span className="text-[8px] font-mono text-white/40 group-hover:text-white uppercase tracking-widest bg-black/60 px-2 rounded backdrop-blur-sm">{n.label}</span>
                        </div>
                    ))}
                    {constellation.nodes.l4.map(n => (
                        <div key={n.id} className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-[120px] group cursor-pointer transition-all hover:z-50 hover:scale-110 ${n.isActive ? 'opacity-100' : 'opacity-20 hover:opacity-100'}`} style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                            <div className={`size-16 rounded-full glass-panel border flex items-center justify-center relative transition-all shadow-xl ${n.alignInfo === 'good' ? `border-${n.theme.color}-500/40` : 'border-rose-500/40'} group-hover:border-white group-hover:bg-white/10`}><Target className={`size-8 transition-colors ${n.alignInfo === 'good' ? `text-${n.theme.color}-400/50` : 'text-rose-400/50'} group-hover:text-white`} /></div>
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
}

/* ─────────────────────────────────────────────────────────────────
   ROOT COMPONENT
───────────────────────────────────────────────────────────────── */
const RPGSkillsTab = ({ user }) => {
    const [view, setView]  = useState('tree'); // 'tree' | 'web'
    const currentPath      = user?.rpg?.path || 'None';

    return (
        <div className="absolute inset-0 z-20">
            {/* View toggle — top right */}
            <div className="absolute top-4 right-4 z-[110] flex items-center gap-1 glass-panel px-2 py-1.5 rounded-full border border-white/15 shadow-xl">
                <button
                    onClick={() => setView('tree')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${view === 'tree' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'}`}
                >
                    <GitBranch className="size-3" />
                    Tree
                </button>
                <button
                    onClick={() => setView('web')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${view === 'web' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'}`}
                >
                    <Globe className="size-3" />
                    Web
                </button>
            </div>

            {view === 'tree'
                ? <SkillTreeView currentPath={currentPath} />
                : <SkillWebView  currentPath={currentPath} />
            }
        </div>
    );
};

export default RPGSkillsTab;
