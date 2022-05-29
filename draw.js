allDots = 0
const drawDot = (p) => {
    drawDotXY(p.x, p.y)
}
nx = 0
nxs = 0.02
function drawDotXY(x, y) {
    allDots++
    nx += nxs
    strokeWeight(2+noise(nx)*3)
    // strokeWeight(1)
    line(x, y, x, y)
}

function fillShape(ps, x = 0, y = 0) {
    beginShape()
    ps.forEach(p => vertex(p.x + x, p.y + y))
    endShape()
}

function drawShape(ps, x = 0, y = 0) {
    ps.forEach(p => drawDotXY(p.x + x, p.y + y))
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}