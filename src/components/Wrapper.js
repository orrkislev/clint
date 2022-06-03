import { Children, cloneElement } from 'react';

export default function Wrapper(props) {

    const fade = props.fade || 50

    let allDurations = 0
    Children.forEach(props.children, (child, i) => {
        if (['Animated', 'Sketch'].includes(child.type.name) && child.props.duration) {
            allDurations += child.props.duration - fade
        }
    })

    let start = 0
    const children = Children.toArray(props.children);
    let childrenWithProps = children.map((child, index) => {
        if (['Title', 'Sketch'].includes(child.type.name)) {
            const newChild = cloneElement(child, {
                start: child.props.start || start,
                duration: child.props.duration || allDurations,
                last: index === children.length - 1,
                index
            });
            if (child.props.duration) start += child.props.duration - fade
            return newChild
        } else {
            return child;
        }
    });

    return (
        <>
            {childrenWithProps}
        </>
    );
}
