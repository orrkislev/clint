let holes = []

class Hole {
    constructor(pos, size) {
        if (pos && size) {
            this.size = size; this.pos = pos
            this.hole = new Path.Circle(pos, size)
            this.hole.segments.forEach(seg => {
                seg.point = seg.point.subtract(pos).multiply(random(1, 1.5)).add(pos)
            })
            this.hole.strokeColor = '#00000044'
            this.createTail()
        }
        holes.push(this)
    }

    createTail() {
        this.tail = makeSpine(this.hole.position, this.hole.position.subtract(growthCenter).normalize(), height)
        this.tail.strokeColor = '#00000044'
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
        const tailOffset1 = offsetPath(this.tail, -.5)
        const tailOffset2 = offsetPath(this.tail, .5)
        tailOffset1.reverse()
        tailOffset1.join(tailOffset2)
        const intersections = getOrderedIntersections(tailOffset1, [this.hole])
        if (intersections.length < 2) {
            this.path = this.hole
        } else {
            const tail1 = tailOffset1.getSection(null, intersections[0].point)
            const tail2 = tailOffset1.getSection(intersections[1].point)
            const holePart = this.hole.getSection(intersections[0].point, intersections[1].point)
            const r = min(this.size,50) * pixelSize
            this.path = joinAndFillet([tail1, holePart, tail2], r,r)
            this.path.strokeColor = '#00000044'

            tail1.remove()
            tail2.remove()
            holePart.remove()
        }

        this.hole.remove()
        this.tail.remove()
        tailOffset1.remove()
        tailOffset2.remove()
    }

    draw() {
        fill(pencil)
        noStroke()
        fillPath(this.path)
        noFill()
        stroke(pencil)
    }

    drawingPartOf() {
        if (!this.drawn) {
            this.drawn = true
            this.draw()
        }
    }

    mirror() {
        if (abs(this.pos.x - width / 2) > this.size*2) {
            const newPos = new Point(width - this.pos.x, this.pos.y)
            new Hole(newPos, this.size)
        } else {
            this.hole.translate(new Point(width / 2 - this.pos.x, 0))
            this.tail.translate(new Point(width / 2 - this.pos.x, 0))
        }
    }

    static Random(xrange,yrange,baseSize) {
        xrange = xrange || [width*.2,width*.8]
        yrange = yrange || [height*.2,height*.8]
        let pos = new Point(randomRange(xrange), randomRange(yrange))
        let size = baseSize * random(0.5,1.2) * pixelSize || width*random(0.01,0.08)
        let goodPos = false
        let tries = 0
        while (!goodPos) {
            goodPos = true
            for (const hole of holes) {
                if (pos.getDistance(hole.pos) < size + hole.size + 60 * pixelSize) {
                    goodPos = false
                    pos = new Point(randomRange(xrange), randomRange(yrange))
                    size = baseSize * random(0.5,1.2) * pixelSize || width*random(0.01,0.08)
                    break
                }
            }
            if (tries++ > 100) return
        }
        return new Hole(pos, size)
    }

    static RandomMirror(){
        const hole = Hole.Random([width*.2,width*.5])
        if (hole) hole.mirror()
    }
}