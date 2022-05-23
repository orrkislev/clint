function makefield(spine) {
    const thickness = makeThicknessPath(spine)
    const [rightSide, leftSide] = makeSides(spine, thickness)

    drawField(spine, leftSide, rightSide)

    return { spine, thickness, leftSide, rightSide }
}


function drawField(spine, leftSide, rightSide) {
    // fill(100.50)
    noStroke()
    fillShape([...pathToPoints(rightSide), ...pathToPoints(leftSide).reverse()])
    noFill()
    stroke(pencil)

    drawPath(rightSide)
    drawPath(leftSide)

    paths = []
    const l = spine.length
    for (let i = 0; i < l; i += random(30, 30)) {
        const perc = i / l
        loc_l = leftSide.getLocationAt(perc * leftSide.length)
        loc_r = rightSide.getLocationAt(perc * rightSide.length)
        loc_spine = spine.getLocationAt(i)
        seg1 = new Segment(loc_l.point, null, loc_l.tangent.multiply(80))
        seg2 = new Segment(loc_r.point, loc_r.tangent.multiply(80))
        segMid = new Segment(loc_spine.point.add(loc_spine.tangent.multiply(40)), loc_spine.normal.multiply(50), loc_spine.normal.multiply(-50))
        p = new Path([seg1, seg2])
        p.smooth()
        paths.push(p)
    }
    paths.forEach(p => drawPath(p))
}

function makeSides(spine, thickness) {
    rightSide = new Path()
    leftSide = new Path()
    for (let i = 0; i < 1; i += 1 / 10) {
        p = spine.getPointAt(i * spine.length)
        perpendicular = spine.getNormalAt(i * spine.length)
        perpendicular.length = thickness.getLocationAt(i * thickness.length).point.y
        rightSide.add(p.add(perpendicular))
        leftSide.add(p.subtract(perpendicular))
    }
    rightSide.smooth()
    leftSide.smooth()
    return [rightSide, leftSide]
}


function makeThicknessPath(spine) {
    thickness = new Path()
    for (let i = 0; i < spine.length; i += 100) {
        thickness.add(new Point(i, random(20, 100)))
    }
    thickness.smooth()
    return thickness
}


function spineConnection(field1, field2) {
    const connectionPath = new Path([field1.spine.firstSegment, field2.spine.firstSegment])
    const connectionLocation = connectionPath.getLocationAt(connectionPath.length / 2)
    spine3 = makeSpine(connectionLocation.point, connectionLocation.normal, 500)
    spine3.reverse()

    const thickness = makeThicknessPath(spine3)
    const lastThickness = thickness.lastSegment.clone()
    lastThickness.point.y = connectionPath.length / 2 + field1.thickness.firstSegment.point.y / 2 + field2.thickness.firstSegment.point.y / 2
    thickness.removeSegment(thickness.segments.length - 1)
    thickness.add(lastThickness)
    const [rightSide, leftSide] = makeSides(spine3, thickness)
    drawField(spine3, leftSide, rightSide, { reversed: true })
}


function test1() {
    spine = makeSpine(new Point(width * .4, height * .5), new Point(-0.3, 1), 400)
    spine2 = makeSpine(new Point(width * .6, height * .5), new Point(0.3, 1), 200)
    field1 = makefield(spine)
    field2 = makefield(spine2)
    spineConnection(field1, field2)
}


function test2(){
    spines = []
    borders = []
    for (let i = 0; i <= width; i += 200) {
        // borders.push(makeSpine2(new Point(i, 0), new Point(i, 1000),8))
        spines.push(makeSpine2(new Point(i + 100, 0), new Point(i + 100, 1000),10))
    }
    borders.push(makeSpine2(new Point(-width/2, -height/2), new Point(-width/2, height*1.5),8))
    borders.push(makeSpine2(new Point(width*1.5, -height/2), new Point(width*1.5, height*1.5),8))
    borders.push(makeSpine2(new Point(-width/2, -height/2), new Point(width*1.5, -height/2),8))
    borders.push(makeSpine2(new Point(-width/2, height*1.5), new Point(width*1.5, height*1.5),8))



    holes = []
    for (let i=0;i<6;i++){
        const p = new Point(width*random(-0.1,1.1),height*random(-0.1,1.1))
        holes.push(new Path.Circle(p, random(30,80)))
        borders.push(makeSpine(p,new Point(0,1), height*1.5))
    }
    holes.forEach(hole=>{
        hole.segments.forEach(seg=>{
            seg.point.y += random(-8,8)
            seg.point.x += random(-8,8)
        })
    })
    nonos = [...holes]
    borders.push(...holes)

    fill(pencil)
    holes.forEach(s => fillPath(s))
    noFill()

    borders.forEach(s => drawPath(s))

    spines.forEach(s=>{
        for (let i = 0; i < s.length; i += random(30,30)) {
            sides = findSides(s,i,borders)
            if (sides) fieldArc(sides[0],sides[1])
        }
    })
}

function findSides(spine, i, borders) {
    const loc = spine.getLocationAt(i)
    const dir = new Point(width*3,loc.point.y)
    const path1 = new Path(loc.point, loc.point.add(dir))
    const path2 = new Path(loc.point, loc.point.subtract(dir))
    
    const p1 = getClosestIntersection(loc.point ,path1, borders)
    const p2 = getClosestIntersection(loc.point, path2, borders)
    if (!p1 || !p2) return false
    return [p1,p2]
}

function getClosestIntersection(startPoint, path, borders) {

    for (nono of nonos) {
        if (nono.contains(startPoint)) {
            return null
        }
    }
    
    let nearest = null
    borders.forEach(b => {
        const intersections = path.getIntersections(b)
        if (intersections.length > 0) {
            if (nearest == null || startPoint.getDistance(intersections[0].point, true) < startPoint.getDistance(nearest.point, true)) {
                nearest = b.getNearestLocation(intersections[0].point)
            }
        }
    })
    return nearest
}


function mark(p){
    circle(p.x,p.y,50)
}

