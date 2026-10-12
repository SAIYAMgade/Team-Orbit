import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code, Sparkles } from 'lucide-react';

// The main hero component
const CyberMatrixHero: React.FC = () => {
    const gridRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // This ensures the code only runs on the client, avoiding SSR issues.
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !gridRef.current) return;

        const grid = gridRef.current;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>/?;:"[]{}\\|!@#$%^&*()_+-=';
        let columns = 0;
        let rows = 0;
        
        const createTile = (_index: number) => {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            
            tile.onclick = (e) => {
                const target = e.target as HTMLElement;
                target.textContent = chars[Math.floor(Math.random() * chars.length)];
                target.classList.add('glitch');
                setTimeout(() => target.classList.remove('glitch'), 200);
            };

            return tile;
        };

        const createTiles = (quantity: number) => {
            Array.from(Array(quantity)).forEach((_, index) => {
                grid.appendChild(createTile(index));
            });
        };

        const createGrid = () => {
            grid.innerHTML = '';
            
            const size = 60; // Made tiles smaller for a denser grid
            columns = Math.floor(window.innerWidth / size);
            rows = Math.floor(window.innerHeight / size);
            
            grid.style.setProperty('--columns', columns.toString());
            grid.style.setProperty('--rows', rows.toString());
            
            createTiles(columns * rows);

            // Set initial characters
            for (let i = 0; i < grid.children.length; i++) {
                const tile = grid.children[i] as HTMLElement;
                tile.textContent = chars[Math.floor(Math.random() * chars.length)];
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const radius = window.innerWidth / 4;

            for (let i = 0; i < grid.children.length; i++) {
                const tile = grid.children[i] as HTMLElement;
                const rect = tile.getBoundingClientRect();
                const tileX = rect.left + rect.width / 2;
                const tileY = rect.top + rect.height / 2;

                const distance = Math.sqrt(
                    Math.pow(mouseX - tileX, 2) + Math.pow(mouseY - tileY, 2)
                );

                const intensity = Math.max(0, 1 - distance / radius);
                
                tile.style.setProperty('--intensity', intensity.toString());
            }
        };

        window.addEventListener('resize', createGrid);
        window.addEventListener('mousemove', handleMouseMove);
        
        createGrid();

        return () => {
            window.removeEventListener('resize', createGrid);
            window.removeEventListener('mousemove', handleMouseMove);
        };

    }, [isClient]);

    const fadeUpVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.2 + 0.5,
                duration: 0.8,
                ease: "easeInOut",
            },
        }),
    };

    return (
        <div className="relative h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden">
            {/* Animated Grid Background */}
            <div ref={gridRef} id="tiles"></div>
            
            <style>{`
                #tiles {
                    --intensity: 0;
                    display: grid;
                    grid-template-columns: repeat(var(--columns), 1fr);
                    grid-template-rows: repeat(var(--rows), 1fr);
                    width: 100vw;
                    height: 100vh;
                    position: absolute;
                    top: 0;
                    left: 0;
                }
                .tile {
                    position: relative;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 1.2rem;
                    
                    /* Use CSS variable for dynamic styling */
                    opacity: calc(0.1 + var(--intensity) * 0.9);
                    color: hsl(120, 100%, calc(50% + var(--intensity) * 50%));
                    text-shadow: 0 0 calc(var(--intensity) * 15px) hsl(120, 100%, 50%);
                    transform: scale(calc(1 + var(--intensity) * 0.2));
                    transition: color 0.2s ease, text-shadow 0.2s ease, transform 0.2s ease;
                }
                .tile.glitch {
                    animation: glitch-anim 0.2s ease;
                }
                @keyframes glitch-anim {
                    0% { transform: scale(1); color: #0f0; }
                    50% { transform: scale(1.2); color: #fff; text-shadow: 0 0 10px #fff; }
                    100% { transform: scale(1); color: #0f0; }
                }
            `}</style>

            {/* Overlay HTML Content */}
            <div className="relative z-10 text-center p-6 sm:p-10 bg-black/75 backdrop-blur-md rounded-2xl border border-white/10 max-w-3xl mx-4 shadow-2xl">
                <motion.div
                    custom={0}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6"
                >
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs sm:text-sm font-semibold tracking-wide text-emerald-300 uppercase">
                        Unified Enterprise Workspace
                    </span>
                </motion.div>

                {/* Project Name: Highlighted and Bold */}
                <motion.h1
                    custom={1}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-5xl sm:text-7xl font-black tracking-tight mb-3"
                >
                    <span className="bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent font-black drop-shadow-[0_0_35px_rgba(52,211,153,0.35)]">
                        TEAM ORBIT
                    </span>
                </motion.h1>

                {/* Suggested Hero Headline */}
                <motion.p
                    custom={1.5}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight"
                >
                    One Workspace. Every Team. Moving Together.
                </motion.p>

                {/* Supporting Text */}
                <motion.p
                    custom={2}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-2xl mx-auto text-sm sm:text-base text-gray-300 mb-8 leading-relaxed font-normal"
                >
                    Bring conversations, projects, documents, real-time live boards, meetings, and deadlines into one secure workspace built for modern companies.
                </motion.p>

                {/* Action Buttons: 3-Day Trial + Developer Dashboard */}
                <motion.div
                    custom={3}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <a
                        href="/login"
                        className="w-full sm:w-auto px-8 py-4 bg-white text-black font-extrabold rounded-xl shadow-xl hover:bg-gray-200 transition-all duration-300 inline-flex items-center justify-center gap-2 group text-base"
                    >
                        <span>Admin Dashboard</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a
                        href="/developer"
                        className="w-full sm:w-auto px-8 py-4 bg-[#111111]/90 text-white border border-white/20 hover:border-emerald-500/40 font-semibold rounded-xl hover:bg-[#1c1c1c] transition-all duration-300 inline-flex items-center justify-center gap-2 text-base backdrop-blur-sm"
                    >
                        <Code className="h-5 w-5 text-emerald-400" />
                        <span>Developer Dashboard</span>
                    </a>
                </motion.div>
            </div>
        </div>
    );
};

export default CyberMatrixHero;
