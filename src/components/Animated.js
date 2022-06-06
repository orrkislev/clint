import useScrollAnimation from './../utils/useScrollAnimation';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Animated(props) {
    const animate1 = useScrollAnimation(props.start, props.start + props.duration, 30, 30);
    const [yInitial, setyInitial] = useState(window.innerHeight)

    let animate2 = animate1
    if (props.starting && animate1<1) animate2 = 1
    if (props.last && animate1>1) animate2 = 1

    if (animate2 === 0) return null
    let y = 0
    if (animate2 < 1) y = (1 - animate2) * window.innerHeight
    else if (animate2 > 1) y = (1 - animate2) * window.innerHeight

    if (animate2 < 0.5 && yInitial !== window.innerHeight) setyInitial(window.innerHeight)
    else if (animate2 > 0.5 && yInitial !== 0) setyInitial(0)

    const style = {
        top: props.y * window.innerHeight,
        left: props.x * window.innerWidth,
    }

    return (
        <motion.div className='animated-outer' initial={{ y: yInitial }} animate={{ y, opacity:[0,1] }}>
            <div style={style} className='animated-inner'>
                {props.children}
            </div>
        </motion.div>
    )
}
