const BG = '#F3F2D4'
let pencil = '#1B1B0F'

const tangentStrengh = 120
const pushPointBack = tangentStrengh
const lineSpacing = 30


async function draw() {
    background(BG)
    growthCenter = new Point(width*.5, height * .1)

    for (let i = 0; i < 10; i++) Hole.Random()
    for (hole of holes) hole.createTail()
    for (hole of holes) hole.trimTail()
    for (hole of holes) hole.finalShape()
    // for (hole of holes) hole.draw()

    basePath = makeSpine2(p(-width * 0.2, height), p(width * 1.2, height), 10)
    basePath.strokeColor = 'green'

    for (let y = 0; y < height; y += 20) {
        basePath.segments.forEach(p => p.point.y -= random(20, 30))

        newPath = basePath.clone()
        holeSections = []
        for (hole of holes) {
            const intersections = getOrderedIntersections(newPath, [hole.path])
            if (intersections.length>1) {
                const firstIntersection = intersections[0]
                const lastIntersection = intersections[intersections.length - 1]
                part1 = newPath.getSection(null, firstIntersection.point)
                part3 = newPath.getSection(lastIntersection.point, null)
                part2 = hole.path.getSection(firstIntersection.point, lastIntersection.point)
                hole.drawingPartOf()
                holeSections.push(part2)
                newPath = joinAndFillet([part1, part2, part3], 50) || newPath
            }
        }
        newPath.strokeColor = pencil

        fillField(newPath)
        drawPath(newPath)
        await timeout(0)
    }

    return

    compCenter = new Point(width / 2, 0)
    holeFocal = null
    holeDirection = DIRS.DOWN

    background(BG)
    makeHoles()
    makeBorders()

    holes.forEach(hole => hole.draw())
    borders.forEach(border => border.draw())

    baseLines = createBaseLines()
    for (baseLine of baseLines) {
        await drawArcs({ path: baseLine }, 0)
    }
}

function createBaseLines() {
    let baseLineType = choose(['horizontal', 'vertical', 'circles',])
    baseLineType = 'circles'
    const baseLines = []
    if (baseLineType == 'horizontal') {
        r = 0
        for (let y = 0; y < height; y += lineSpacing * random(0.6, 1)) {
            const dirPath = new Path([p(-width * 0.5, y), p(width / 2, y + r), p(width * 1.5, y)])
            dirPath.smooth()
            baseLines.push(dirPath)
            r += 15
        }
    } else if (baseLineType == 'vertical') {
        for (let x = 0; x < width; x += lineSpacing * random(0.6, 1)) {
            const dirPath = new Path([p(x, -height * 0.5), p(x, height * 1.5)])
            baseLines.push(dirPath)
        }
    } else if (baseLineType == 'circles') {
        const corners = [new Point(0, 0), new Point(width, 0), new Point(width, height), new Point(0, height)]
        const maxDist = corners.reduce((a, b) => max(a, b.getDistance(compCenter)), 0)
        for (let r = 50; r < maxDist; r += lineSpacing) {
            const dirPath = new Path.Circle(compCenter, r)
            dirPath.rotate(180)
            baseLines.push(dirPath)
        }
    }
    return baseLines
}




function makeHoles() {
    // spiral = spiralPath(p(width/2,height*1.5),30,30, 100)
    // const numPoints = 50
    // const spiralLength = spiral.length
    // const spacing = spiralLength / (numPoints + 1)
    // const points = Array(numPoints).fill(numPoints).map((a, i) => spiral.getLocationAt(i * spacing).point)

    // for (let i = 0; i < points.length; i++) {
    //     new Hole(points[i], random(30, 50))
    // }
    new Hole(p(width / 2, height / 2), 150)
}



function getOrderedIntersections(mainPath, paths) {
    allIntersections = []
    paths.forEach(path => {
        const pathIntersections = mainPath.getIntersections(path, (i) => i.offset > 3)
        pathIntersections.forEach(i => allIntersections.push(i))
    })
    allIntersections.sort((a, b) => a.offset - b.offset)
    return allIntersections
}