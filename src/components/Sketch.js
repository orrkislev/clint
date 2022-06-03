import Animated from "./Animated";

export default function Sketch(props) {

    const src = `/images/download (${props.num}).png`

    return (
        <Animated x={props.x} y={props.y} starting={props.starting} duration={props.duration} start={props.start} >
            <img className='sketch' src={src} alt="sketch" />

        <style>{`
            .sketch {
                border-radius: .6em;
                max-width: 50vw;
                max-height: 50vh;
            }
        `}</style>
        </Animated>
    )
}
