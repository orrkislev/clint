function setup(){
    canvas = createCanvas(windowWidth, windowHeight)
    paperCanvas = document.getElementById('paperCanvas');
    paperCanvas.width = width;
    paperCanvas.height = height
    canvas.elt.style.display = 'none';
    // paperCanvas.style.display = 'none';
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
