import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

export default function ScrambledText({ children, radius = 150 }) {
    const ref = useRef();

    useEffect(() => {
        const root = ref.current;
        if (!root) return;

        const split = SplitText.create(root.querySelector("p"), { type: "chars" });
        const chars = split.chars;

        chars.forEach(c => {
            gsap.set(c, { display: "inline-block", attr: { "data-content": c.innerHTML } });
        });

        const move = e => {
            chars.forEach(c => {
                const r = c.getBoundingClientRect();
                const dx = e.clientX - (r.left + r.width / 2);
                const dy = e.clientY - (r.top + r.height / 2);
                const dist = Math.hypot(dx, dy);

                if (dist < radius) {
                    gsap.to(c, {
                        duration: 1.2 * (1 - dist / radius),
                        scrambleText: { text: c.dataset.content, chars: ".:", speed: 0.5 },
                        ease: "none"
                    });
                }
            });
        };

        root.addEventListener("pointermove", move);
        return () => root.removeEventListener("pointermove", move);
    }, [radius]);

    return (
        <div ref={ref}>
            <p>{children}</p>
        </div>
    );
}
