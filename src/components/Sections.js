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
        for (let i = 0; i < item.images.length; i++) {
            let x = (!item.singleImage && i % 2 === 0) ? 0.45 : 0.3
            let y = (!item.singleImage && i % 2 === 0) ? 0.2 : 0.3
            const sketch = <Sketch x={x} y={y} duration={dur} start={start} num={item.images[i]} key={item.images[i]} />
            sketches.push(sketch)
            start += dur / 4
        }

        const titleComponent = <Title withLine x={0.05} y={0.2} start={startStart} duration={(dur/3) * (item.images.length+1)} key={item.title} text={item.title} />
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
