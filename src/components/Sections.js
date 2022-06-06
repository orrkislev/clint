import Sketch from "./Sketch"
import Title from "./TItle"
import Wrapper from "./Wrapper"

export default function Sections(props) {

    const titles = []
    const sketches = []

    let start = 0
    const dur = 80

    props.data.forEach(item => {
        const startStart = start
        const itemDur = item.singleImage ? dur * 2 : dur
        for (let i = 0; i < item.images.length; i++) {
            let x = (!item.singleImage && i % 2 === 0) ? 0.45 : 0.05
            let y = (!item.singleImage && i % 2 === 0) ? 0.2 : 0.3
            if (item.centered) {
                x = .1
                y = .3
            }
            const sketch = <Sketch x={x} y={y} duration={itemDur} start={start} num={item.images[i]} key={item.images[i]} className={item.centered ? "image-large image-centered" : ""} />
            sketches.push(sketch)
            start += item.singleImage ? itemDur / 2 : itemDur / 4
        }

        const titleDuration = item.singleImage ? (itemDur / 1.5) * item.images.length  : (itemDur / 3) * (item.images.length + 1)
        const titleComponent = <Title withLine x={0.05} y={0.2} start={startStart} duration={titleDuration} key={item.title} text={item.title} />
        titles.push(titleComponent)
    })

    return (
        <>
            <Wrapper>
                {sketches}
            </Wrapper>
            <Wrapper>
                {titles}
            </Wrapper>

        </>
    )
}
