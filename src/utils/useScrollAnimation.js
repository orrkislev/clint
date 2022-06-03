import useScroll from './useScroll';

export default function useScrollAnimation(start,end,durationIn, durationOut) {
    const { scroll } = useScroll()

    if (scroll < start) {
        return 0
    } else if (scroll <= start + durationIn) {
        return (scroll - start) / durationIn
    } else if (scroll < end - durationOut) {
        return 1
    } else if (scroll < end) {
        return 1 + (scroll - end + durationOut) / durationOut
    } else {
        return 0
    }
}