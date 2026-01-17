import { useEffect } from 'react';
import { TriangleAlert } from 'lucide-react';
import { useUX } from '../../context/UXContext';
import './DisclaimerModal.css';

const DisclaimerModal = () => {
    const { disclaimerAccepted, acceptDisclaimer } = useUX();

    if (disclaimerAccepted) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-4 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {/* Background Glitch Effects / Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)50%,rgba(0,0,0,0.25)50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-10 pointer-events-none"></div>

            {/* Content Box */}
            <div className="relative z-50 bg-neutral-900 border-2 border-red-500/50 shadow-[0_0_50px_rgba(220,38,38,0.3)] max-w-2xl w-full p-8 md:p-12 rounded-lg text-center flex flex-col items-center gap-6">

                {/* Icon */}
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2 animate-pulse">
                    <TriangleAlert className="w-10 h-10 text-red-500" />
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase glitch-text" data-text="SATIRE WARNING">
                    SATIRE WARNING
                </h1>

                {/* Body Text */}
                <div className="space-y-4 text-neutral-300 font-mono text-sm md:text-base leading-relaxed">
                    <p>
                        This project ("INCX") is an intentionally <strong>inconvenient</strong> and satirical exploration of Bad UI/UX patterns.
                    </p>
                    <p className="text-white font-bold">
                        It serves as a learning application to demonstrate how NOT to design software.
                    </p>
                    <p className="text-xs opacity-50 uppercase tracking-widest pt-4">
                        Any frustration experienced is fully intentional.
                    </p>
                </div>

                {/* Credits */}
                <div className="w-full h-px bg-white/10 my-4"></div>

                <div className="text-neutral-400 text-xs font-mono">
                    <p className="uppercase tracking-[0.2em] mb-3 text-neutral-600 font-bold">Contributors</p>
                    <div className="flex flex-col gap-1 items-center">
                        <span className="hover:text-white transition-colors">Stefan Herzig</span>
                        <span className="hover:text-white transition-colors">Fabian Klar</span>
                        <span className="hover:text-white transition-colors">Kadir Botan Celik</span>
                    </div>
                </div>

                {/* Button */}
                <button
                    onClick={acceptDisclaimer}
                    className="mt-8 px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest rounded transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.5)] active:scale-95"
                >
                    I Understand & Accept
                </button>
            </div>

            <style jsx>{`
                .glitch-text {
                    position: relative;
                }
                .glitch-text::before,
                .glitch-text::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                .glitch-text::before {
                    left: 2px;
                    text-shadow: -1px 0 #ff00c1;
                    clip-path: inset(44% 0 61% 0);
                    animation: glitch-anim-1 2.5s infinite linear alternate-reverse;
                }
                .glitch-text::after {
                    left: -2px;
                    text-shadow: -1px 0 #00fff9;
                    clip-path: inset(54% 0 21% 0);
                    animation: glitch-anim-2 3.5s infinite linear alternate-reverse;
                }
                @keyframes glitch-anim-1 {
                    0% { clip-path: inset(30% 0 10% 0); }
                    20% { clip-path: inset(80% 0 5% 0); }
                    40% { clip-path: inset(20% 0 70% 0); }
                    60% { clip-path: inset(10% 0 80% 0); }
                    80% { clip-path: inset(50% 0 30% 0); }
                    100% { clip-path: inset(40% 0 40% 0); }
                }
                @keyframes glitch-anim-2 {
                    0% { clip-path: inset(15% 0 60% 0); }
                    20% { clip-path: inset(55% 0 10% 0); }
                    40% { clip-path: inset(10% 0 30% 0); }
                    60% { clip-path: inset(70% 0 15% 0); }
                    80% { clip-path: inset(35% 0 50% 0); }
                    100% { clip-path: inset(60% 0 10% 0); }
                }
            `}</style>
        </div>
    );
};

export default DisclaimerModal;
