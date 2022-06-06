import Animated from "./Animated";

export default function Sketch(props) {


    const src = props.filename ? `/images/${props.filename}.png` : `/images/download (${props.num}).png`

    return (
        <Animated x={props.x} y={props.y} starting={props.starting} duration={props.duration} start={props.start} >
            <img className={'sketch ' + props.className} src={src} alt="sketch" />
        </Animated>
    )
}
