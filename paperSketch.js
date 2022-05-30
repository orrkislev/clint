const BG = '#F3F2D4'
let pencil = '#1B1B0F'

const tangentStrengh = 30
const pushPointBack = tangentStrengh
const lineSpacing = 30

function setup(){
    canvas = createCanvas(windowWidth, windowHeight)
    paperCanvas = document.getElementById('paperCanvas');
    paperCanvas.width = width;
    paperCanvas.height = height
    paperCanvas.style.display = 'none';
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
    compCenter = new Point(width/2, -height*6)
    // holeFocal = new Point(width/2, height*.5)
    holeDirection = DIRS.DOWN

    background(BG)
    makeHoles()
    makeBorders()

    holes.forEach(hole => hole.draw())
    r=0
    for (let y = 0; y < height; y += lineSpacing * random(0.6,1)) {
        const dirPath = new Path([p(-width*0.5, y),p(width/2,y+r), p(width*1.5, y)])
        dirPath.smooth()
        r+=15
        await drawArcs({path:dirPath}, 0)
    }
    // for (let x = 0; x < width; x += lineSpacing * random(0.6,1)) {
    //     const dirPath = new Path([p(x, -height*0.5), p(x, height*1.5)])
    //     await drawArcs({path:dirPath}, 0)
    // }
    borders.forEach(border => border.draw())
    return
    
    // get max distance from compCenter to canvas corners
    const corners = [
        new Point(0, 0),
        new Point(width, 0),
        new Point(width, height),
        new Point(0, height)
    ]
    r = 50
    const maxDist = corners.reduce((a, b) => max(a, b.getDistance(compCenter)), 0)
    for (let r = 50; r < maxDist; r += lineSpacing) {
        const dirPath = new Path.Circle(compCenter, r)
        dirPath.rotate(180)
        await drawArcs({path:dirPath}, r, [], 0)
    }
}



async function drawArcs(pathObj, depth = 0) {
    pathObj.path.strokeColor = 'red'
    await timeout(0)
    const intersections = getOrderedIntersections(pathObj.path, colliders)
    if (intersections.length > 0 && depth < 5) {
        pathObj.path.strokeColor = '#ff000077'
        await timeout(0)
        const locations = intersections.map(intersection => moveLocationCloser(intersection.location, compCenter, depth == 0 ? pushPointBack : 0))

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

            if (location1.point.getDistance(location2.point) < 30) continue
            
            const newPath = createSubArc(location1, location2, pathObj.path)
            newPath.path.strokeColor = 'green'
            await timeout(0)

            const midPoint = location1.point.add(location2.point).divide(2)
            if ((location1.path.closed && location1.path.contains(midPoint)) ||
                (location2.path.closed && location2.path.contains(midPoint)) ||
                (newPath.path.length < 30) ) {
                newPath.path.dashArray = [10, 4];
                await timeout(0)
                continue
            }

            newPaths.push(newPath)
        }


        for (newPath of newPaths) {
            // if (round(data.newPath.path.length) == round(pathObj.path.length)) await data.newPath.draw()
            await drawArcs(newPath, depth + 1)
        }
    } else {
        if (pathObj instanceof myObj) {
            if (getOrderedIntersections(pathObj.path, allArcs.filter(a=>a.drawn)).length == 0) {
                pathObj.drawn = true
                await pathObj.draw()
            }
        }
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

function createSubArc(locStart,locEnd,parent){
    const nearestStartOnParent = parent.getNearestLocation(locStart.point)
    const nearestEndOnParent = parent.getNearestLocation(locEnd.point)
    const startOffset = nearestStartOnParent.offset + 50
    let endOffset = nearestEndOnParent.offset + 50
    if (endOffset <= startOffset && parent.closed) endOffset += parent.length
    const lengthToAddPoints = endOffset - startOffset
    if (lengthToAddPoints < 50) return new FieldArc(locStart,locEnd,[])
    const pointsToAdd = floor(lengthToAddPoints / 50)-1
    const spacing = 50
    const newPointsOffsets = Array(pointsToAdd).fill(pointsToAdd).map((a, i) => startOffset + i * spacing)
    const newPoints = newPointsOffsets.map(offset => parent.getPointAt(offset % parent.length))
    return new FieldArc(locStart, locEnd, newPoints)
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
    spiral = spiralPath(p(width/2,height*1.5),30,30, 100)
    const numPoints = 50
    const spiralLength = spiral.length
    const spacing = spiralLength / (numPoints + 1)
    const points = Array(numPoints).fill(numPoints).map((a, i) => spiral.getLocationAt(i * spacing).point)

    for (let i = 0; i < points.length; i++) {
        new Hole(points[i], random(30, 50))
    }
}



function makeBorders() {
    holes.forEach(hole => hole.calcBorder())

    createBorder(p(-200,-200), DIRS.DOWN, height*1.4)
    createBorder(p(width+200,-200), DIRS.DOWN, height*1.4)
    // createBorder(p(-200,-200), DIRS.RIGHT, width*1.4)
    // createBorder(p(-200,height+200), DIRS.RIGHT, width*1.4)

    // createBorder(compCenter, pointFromAngle(random(360)), height * 2)

    for (let i = 0; i < borders.length - 1; i++) {
        for (let j = i + 1; j < borders.length; j++) {
            borders[i].stickTo(borders[j].path)
        }
    }
}
