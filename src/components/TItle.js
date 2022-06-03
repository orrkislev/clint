import Animated from "./Animated";

export default function Title(props) {

    return (
        <Animated x={props.x} y={props.y} starting={props.starting} duration={props.duration} start={props.start} >
            <div className='title'>
                {props.text.map((item, i) => {
                    return <span key={i}>{item}<br/> </span>
                    })}
            </div>

            <style >{`
            .title {
                color: #1B1B0F;
                font-family: 'Open Sans', sans-serif;
                font-size: 1.5em;
                font-weight: 300;
                max-width: 30vw;
                max-height: 50vh;
                text-align: left;
            }
        `}</style>
        </Animated>
    )
}
