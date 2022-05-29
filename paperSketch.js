const BG = '#F3F2D4'
let pencil = '#1B1B0F'

function setup(){
    canvas = createCanvas(min(windowWidth,windowHeight), min(windowWidth,windowHeight))
    paperCanvas = document.getElementById('paperCanvas');
    paperCanvas.width = width
    paperCanvas.height = height
    canvas.elt.style.display = 'none';
    paper.setup(paperCanvas);
    noLoop()
}

function keyPressed(){
    // on y key toggle visible canvas between canvas and paperCanvas
    if (keyCode == 89) {
        if (canvas.elt.style.display == 'none') {
            canvas.elt.style.display = 'block';
            paperCanvas.style.display = 'none';
        } else {
            canvas.elt.style.display = 'none';
            paperCanvas.style.display = 'block';
        }
    }
}

async function draw() {
    compCenter = new Point(random(width), random(height))
    holeDirection = null

    background(BG)
    makeHoles()
    makeBorders()

    holes.forEach(hole => hole.draw())
    borders.forEach(border => border.draw())

    r = 50

    // get max distance from compCenter to canvas corners
    const corners = [
        new Point(0, 0),
        new Point(width, 0),
        new Point(width, height),
        new Point(0, height)
    ]
    const maxDist = corners.reduce((a, b) => max(a, b.getDistance(compCenter)), 0)
    for (let r = 50; r < maxDist; r += 30) {
        const dirPath = new Path.Circle(compCenter, r)
        await drawArcs({path:dirPath}, r, [], 0)
    }
}



async function drawArcs(pathObj, radius, depth = 0) {
    pathObj.path.strokeColor = '#00000044'
    const intersections = getOrderedIntersections(pathObj.path, colliders)
    if (intersections.length > 0 && depth < 5) {
        const locations = intersections.map(intersection => moveLocationCloser(intersection.location, compCenter, depth == 0 ? 30 : 0))

        // get intersecion pairs
        const pairs = []
        if (!(pathObj instanceof FieldArc)) locations.push(locations[0])
        else {
            locations.unshift(pathObj.path.firstSegment.location)
            locations.push(pathObj.path.lastSegment.location)
        }
        for (let i = 0; i < locations.length - 1; i++) {
            const location1 = locations[i]
            const location2 = locations[i + 1]
            pairs.push([location1, location2])
        }

        const newPaths = []
        // make round paths from pairs
        for (let i = 0; i < pairs.length; i++) {
            const location1 = pairs[i][0]
            const location2 = pairs[i][1]
            const newPath = makeRoundedPath(location1, location2, compCenter, radius)
            newPath.path.strokeColor = '#ff000044'

            const pathMidPoint = newPath.path.getLocationAt(newPath.path.length / 2).point
            if ((location1.path.closed && location1.path.contains(pathMidPoint)) ||
                (location2.path.closed && location2.path.contains(pathMidPoint)) ||
                (newPath.path.length < 30) ) {
                newPath.path.strokeColor = '#0000ffaa'
                continue
            }

            newPaths.push(newPath)
        }


        for (newPath of newPaths) {
            // if (round(data.newPath.path.length) == round(pathObj.path.length)) await data.newPath.draw()
            await drawArcs(newPath, radius, depth + 1)
        }
    } else {
        if (pathObj instanceof myObj) await pathObj.draw()
    }
}








function moveLocationCloser(location, point, distance) {
    const dir = point.subtract(location.point)
    dir.length = distance
    const newPoint = location.point.add(dir)
    const placeOnPath = location.path.getNearestLocation(newPoint)
    placeOnPath.point = newPoint
    return placeOnPath
}

function makeRoundedPath(locStart, locEnd, center, radius) {
    const startToCenter = locStart.point.subtract(center)
    const endToCenter = locEnd.point.subtract(center)
    const startAngle = startToCenter.angle
    const endAngle = normalAngle(endToCenter.angle)
    let angleBetween = endAngle - startAngle
    if (angleBetween <= 0) angleBetween += 360
    const midPointNumber = floor(abs(angleBetween) / 25)
    const midPointSpacing = angleBetween / (midPointNumber + 1)
    const midPointAngles = Array(midPointNumber).fill(midPointNumber).map((a, i) => startToCenter.angle + (i + 1) * midPointSpacing)
    const midPointLocations = midPointAngles.map(angle => pointFromAngle(angle).multiply(radius).add(center))
    return new FieldArc(locStart, locEnd, midPointLocations)
}

function getOrderedIntersections(path1, pathObjs) {
    let filteredPaths = [...pathObjs]
    if (path1 instanceof FieldArc) {
        filteredPaths = filteredPaths.filter(p => p.path == path1.startPath || path1.endPath)
    }
    allIntersections = []
    filteredPaths.forEach(pathObj => {
        const pathIntersections = pathObj.intersect(path1, (i) => i.offset > 3 && i.offset < path1.length - 3)
        pathIntersections.forEach(location => {
            const dist = location.intersection.offset
            allIntersections.push({ pathObj, location, dist })
        })
    })
    allIntersections.sort((a, b) => a.dist - b.dist)
    return allIntersections
}















function makeHoles() {
    hole = new Hole(p(width * .5, height * .8), 80)
    for (let i = 0; i < 0; i++) {
        hole = new Hole(p(random(width), random(height)), random(30, 80))
        // hole.mirror()
    }
}



function makeBorders() {
    createBorder(compCenter, pointFromAngle(random(360)), height * 2)

    for (let i = 0; i < borders.length - 1; i++) {
        for (let j = i + 1; j < borders.length; j++) {
            borders[i].stickTo(borders[j].path)
        }
    }
}