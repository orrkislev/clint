import Animated from "./Animated";

export default function Title(props) {



    return (
        <Animated x={props.x} y={props.y} starting={props.starting} duration={props.duration} start={props.start} >
            {props.withLine && <div className="line" />}
            <div className={'title ' +props.className}>
                {props.text.map((item, i) => {
                    return <span key={i}>{item}<br/> </span>
                    })}
            </div>
        </Animated>
    )
}
