function main() {
    //Access the canvas through DOM: Document Object Model
    var canvas = document.getElementById('myCanvas');   // The paper
    var gl = canvas.getContext('webgl');                // The brush and the paints

    // Define vertices data
    /**
     * A ( -0.5, -0.5 )
     * B (  0.5, -0.5 )
     * C (  0.0,  0.5 )
     */

    var vertices = [
        -0.5, -0.5,     // Point A
         0.5, -0.5,     // Point B
         0.0,  0.5      // Point C
    ];

    // Create a linked-list for storing the vertices data
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var vertexShaderSource = `
        attribute vec2 aPosition;
        void main() {
            gl_PointSize = 10.0;
            gl_Position = vec4(aPosition, 0.0, 1.0);     // Center of the coordinate
        }
    `;

    var fragmentShaderSource = `
        void main() {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);    // Yellow
        }
    `;

    // Create .c in GPU
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);

    // Compile .c into .o
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    // Prepare a .exe shell (shader program)
    var shaderProgram = gl.createProgram();

    // Put the two .o files into the shell
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    // Link the two .o files, so together they can be a runnable program/context.
    gl.linkProgram(shaderProgram);

    // Start using the context (analogy: start using the paints and the brushes)
    gl.useProgram(shaderProgram);

    // Teach the computer how to collect
    //  the positional values from ARRAY_BUFFER
    //  to each vertex being processed
    var aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
    gl.vertexAttribPointer(
        aPosition, 
        2, 
        gl.FLOAT, 
        false, 
        0, 
        0
    );
    gl.enableVertexAttribArray(aPosition);

    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, 3);
}