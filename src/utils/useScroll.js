import { useEffect, useState } from 'react';

export default function useScroll() {
    const [scroll, setScroll] = useState(0);
    const [touches, setTouches] = useState({});

    useEffect(() => {
        const handleScroll = (event) => setScroll(Math.max(0, scroll + Math.floor(event.deltaY / 50)))
        const handleTouch = (event) => {
            let deltaY = 0
            Object.values(event.touches).forEach(touch => {
                if (touch.identifier in touches) deltaY -= touch.clientY - touches[touch.identifier].clientY
            })
            setScroll(Math.max(0, scroll + Math.floor(deltaY/10)))
            setTouches(event.touches)
        }
        const handleTouchStart = (e) => setTouches(e.touches)

        window.addEventListener('wheel', handleScroll);
        window.addEventListener('touchmove', handleTouch);
        window.addEventListener('touchstart', handleTouchStart);
        return () => {
            window.removeEventListener('wheel', handleScroll);
            window.removeEventListener('touchmove', handleTouch);
            window.removeEventListener('touchstart', handleTouchStart);
        }
    }, [scroll, touches]);

    return { scroll, setScroll };
}