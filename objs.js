let holes = []

class Hole {
    constructor(pos, size) {
        this.size = size; this.pos = pos
        this.hole = new Path.Circle(pos, size)
        this.hole.segments.forEach(seg => {
            seg.point = seg.point.subtract(pos).multiply(random(1, 1.5)).add(pos)
        })
        holes.push(this)
    }

    createTail() {
        this.tail = makeSpine(this.hole.position, this.hole.position.subtract(growthCenter).normalize(), height)
    }

    trimTail() {
        for (hole of holes.filter(hole => hole != this)) {
            const holeIntersections = this.tail.getIntersections(hole.hole)
            holeIntersections.sort((a, b) => a.offset - b.offset)
            if (holeIntersections.length > 0) this.tail.splitAt(holeIntersections[0].offset)
            const tailIntersections = this.tail.getIntersections(hole.hole)
            tailIntersections.sort((a, b) => a.offset - b.offset)
            if (tailIntersections.length > 0) this.tail.splitAt(tailIntersections[0].offset)
        }
    }

    finalShape() {
        const tailOffset1 = offsetPath(this.tail, -2.5)
        const tailOffset2 = offsetPath(this.tail, 2.5)
        tailOffset1.reverse()
        tailOffset1.join(tailOffset2)
        const intersections = getOrderedIntersections(tailOffset1, [this.hole])
        const tail1 = tailOffset1.getSection(null,intersections[0].point)
        const tail2 = tailOffset1.getSection(intersections[1].point)
        const holePart = this.hole.getSection(intersections[0].point, intersections[1].point)
        this.path = joinAndFillet([tail1, holePart, tail2],50)
        this.path.strokeColor = pencil

        tailOffset1.remove()
        tailOffset2.remove()
        tail1.remove()
        tail2.remove()
        holePart.remove()
    }

    static Random() {
        let pos = new Point(random(width), random(height))
        let size = 50
        let goodPos = false
        while (!goodPos) {
            goodPos = true
            for (const hole of holes) {
                if (pos.getDistance(hole.pos) < size + hole.size + 60) {
                    goodPos = false
                    pos = new Point(random(width), random(height))
                }
            }
        }
        return new Hole(pos, size)
    }
}