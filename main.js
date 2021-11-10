function main() {
    //Access the canvas through DOM: Document Object Model
    var canvas = document.getElementById('myCanvas');   // The paper
    var gl = canvas.getContext('webgl');                // The brush and the paints

    // Define vertices data consisting of position and color properties

    var vertices = [
        // Face A       // Red      // Surface orientation (normal vector)
        -1, -1, -1,     1, 0, 0,    0, 0, -1,   // Index:  0    
         1, -1, -1,     1, 0, 0,    0, 0, -1,   // Index:  1
         1,  1, -1,     1, 0, 0,    0, 0, -1,   // Index:  2
        -1,  1, -1,     1, 0, 0,    0, 0, -1,   // Index:  3
        // Face B       // Yellow
        -1, -1,  1,     1, 1, 0,    0, 0, 1,    // Index:  4
         1, -1,  1,     1, 1, 0,    0, 0, 1,    // Index:  5
         1,  1,  1,     1, 1, 0,    0, 0, 1,    // Index:  6
        -1,  1,  1,     1, 1, 0,    0, 0, 1,    // Index:  7
        // Face C       // Green
        -1, -1, -1,     0, 1, 0,    -1, 0, 0,   // Index:  8
        -1,  1, -1,     0, 1, 0,    -1, 0, 0,   // Index:  9
        -1,  1,  1,     0, 1, 0,    -1, 0, 0,   // Index: 10
        -1, -1,  1,     0, 1, 0,    -1, 0, 0,   // Index: 11
        // Face D       // Blue
         1, -1, -1,     0, 0, 1,    1, 0, 0,    // Index: 12
         1,  1, -1,     0, 0, 1,    1, 0, 0,    // Index: 13
         1,  1,  1,     0, 0, 1,    1, 0, 0,    // Index: 14
         1, -1,  1,     0, 0, 1,    1, 0, 0,    // Index: 15
        // Face E       // Orange
        -1, -1, -1,     1, 0.5, 0,  0, -1, 0,   // Index: 16
        -1, -1,  1,     1, 0.5, 0,  0, -1, 0,   // Index: 17
         1, -1,  1,     1, 0.5, 0,  0, -1, 0,   // Index: 18
         1, -1, -1,     1, 0.5, 0,  0, -1, 0,   // Index: 19
        // Face F       // White
        -1,  1, -1,     1, 1, 1,    0, 1, 0,    // Index: 20
        -1,  1,  1,     1, 1, 1,    0, 1, 0,    // Index: 21
         1,  1,  1,     1, 1, 1,    0, 1, 0,    // Index: 22
         1,  1, -1,     1, 1, 1,    0, 1, 0     // Index: 23
    ];

    var indices = [
        0, 1, 2,     0, 2, 3,     // Face A
        4, 5, 6,     4, 6, 7,     // Face B
        8, 9, 10,    8, 10, 11,   // Face C
        12, 13, 14,  12, 14, 15,  // Face D
        16, 17, 18,  16, 18, 19,  // Face E
        20, 21, 22,  20, 22, 23,  // Face F     
    ];

    // Create a linked-list for storing the vertices data
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Create a linked-list for storing the indices data
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    var vertexShaderSource = `
        attribute vec3 aPosition;
        attribute vec3 aColor;
        attribute vec3 aNormal;
        varying vec3 vColor;
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform mat4 uModel;
        uniform mat4 uView;
        uniform mat4 uProjection;
        void main() {
            gl_Position = uProjection * uView * uModel * (vec4(aPosition * 2. / 3., 1.));
            vColor = aColor;
            vNormal = aNormal;
            vPosition = (uModel * (vec4(aPosition * 2. / 3., 1.))).xyz;
        }
    `;

    var fragmentShaderSource = `
        precision mediump float;
        varying vec3 vColor;
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform vec3 uLightConstant;        // It represents the light color
        uniform float uAmbientIntensity;    // It represents the light intensity
        // uniform vec3 uLightDirection;
        uniform vec3 uLightPosition;
        uniform mat3 uNormalModel;
        uniform vec3 uViewerPosition;
        void main() {
            vec3 ambient = uLightConstant * uAmbientIntensity;
            // vec3 lightDirection = uLightDirection;
            vec3 lightDirection = uLightPosition - vPosition;
            vec3 normalizedLight = normalize(lightDirection);  // [2., 0., 0.] becomes a unit vector [1., 0., 0.]
            vec3 normalizedNormal = normalize(uNormalModel * vNormal);
            float cosTheta = dot(normalizedNormal, normalizedLight);
            vec3 diffuse = vec3(0., 0., 0.);
            if (cosTheta > 0.) {
                float diffuseIntensity = cosTheta;
                diffuse = uLightConstant * diffuseIntensity;
            }
            vec3 reflector = reflect(lightDirection, normalizedNormal);
            vec3 normalizedReflector = normalize(reflector);
            vec3 normalizedViewer = normalize(uViewerPosition);
            float cosPhi = dot(normalizedReflector, normalizedViewer);
            vec3 specular = vec3(0., 0., 0.);
            if (cosPhi > 0.) {
                float shininessConstant = 100.0; 
                float specularIntensity = pow(cosPhi, shininessConstant); 
                specular = uLightConstant * specularIntensity;
            }
            vec3 phong = ambient + diffuse + specular;
            gl_FragColor = vec4(phong * vColor, 1.);
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
        3, 
        gl.FLOAT, 
        false, 
        9 * Float32Array.BYTES_PER_ELEMENT, 
        0
    );
    gl.enableVertexAttribArray(aPosition);
    var aColor = gl.getAttribLocation(shaderProgram, "aColor");
    gl.vertexAttribPointer(
        aColor, 
        3, 
        gl.FLOAT, 
        false, 
        9 * Float32Array.BYTES_PER_ELEMENT, 
        3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(aColor);
    var aNormal = gl.getAttribLocation(shaderProgram, "aNormal");
    gl.vertexAttribPointer(
        aNormal, 
        3, 
        gl.FLOAT, 
        false, 
        9 * Float32Array.BYTES_PER_ELEMENT, 
        6 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(aNormal);

    // Connect the uniform transformation matrices
    var uModel = gl.getUniformLocation(shaderProgram, "uModel");
    var uView = gl.getUniformLocation(shaderProgram, "uView");
    var uProjection = gl.getUniformLocation(shaderProgram, "uProjection");

    // Set the projection matrix in the vertex shader
    var projection = glMatrix.mat4.create();
    glMatrix.mat4.perspective(
        projection,
        Math.PI / 3,    // field of view
        1,              // ratio
        0.5,            // near clip
        10              // far clip
    );
    gl.uniformMatrix4fv(uProjection, false, projection);

    // Set the view matrix in the vertex shader
    var view = glMatrix.mat4.create();
    var camera = [0, 0, 3];
    glMatrix.mat4.lookAt(
        view,
        camera,      // camera position
        [0, 0, 0],      // the point where camera looks at
        [0, 1, 0]       // up vector of the camera
    );
    gl.uniformMatrix4fv(uView, false, view);

    // Define the lighting and shading
    var uLightConstant = gl.getUniformLocation(shaderProgram, "uLightConstant");
    var uAmbientIntensity = gl.getUniformLocation(shaderProgram, "uAmbientIntensity");
    gl.uniform3fv(uLightConstant, [1.0, 0.5, 1.0]);   // orange light
    gl.uniform1f(uAmbientIntensity, 0.4) // light intensity: 40%
    // var uLightDirection = gl.getUniformLocation(shaderProgram, "uLightDirection");
    // gl.uniform3fv(uLightDirection, [2.0, 0.0, 0.0]);    // light comes from the right side
    var uLightPosition = gl.getUniformLocation(shaderProgram, "uLightPosition");
    gl.uniform3fv(uLightPosition, [1.0, 1.0, 1.0]);
    var uNormalModel = gl.getUniformLocation(shaderProgram, "uNormalModel");
    var uViewerPosition = gl.getUniformLocation(shaderProgram, "uViewerPosition");
    gl.uniform3fv(uViewerPosition, camera);

    var freeze = false;
    // Apply some interaction using mouse
    function onMouseClick(event) {
        freeze = !freeze;
    }
    document.addEventListener("click", onMouseClick, false);
    // Apply some interaction using keyboard
    function onKeydown(event) {
        if (event.keyCode == 32) freeze = true;
    }
    function onKeyup(event) {
        if (event.keyCode == 32) freeze = false;
    }
    document.addEventListener("keydown", onKeydown, false);
    document.addEventListener("keyup", onKeyup, false);

    var speed = [3/600, 2/600, 0];
    var change = [0, 0, 0];

    function render() {
        if (!freeze) { // If it is not freezing, then animate the rectangle
            if (change[0] >= 0.5 || change[0] <= -0.5) speed[0] = -speed[0];
            if (change[1] >= 0.5 || change[1] <= -0.5) speed[1] = -speed[1];
            change[0] = change[0] + speed[0];
            change[1] = change[1] + speed[1];
            // Init the model matrix
            var model = glMatrix.mat4.create();
            // Define a rotation matrix about x axis and store it to the model matrix
            glMatrix.mat4.rotate(model, model, change[0], [1, 0, 0]);
            // Define a rotation matrix about y axis and store it to the model matrix
            glMatrix.mat4.rotate(model, model, change[1], [0, 1, 0]);
            // Define a translation matrix and store it to the model matrix
            glMatrix.mat4.translate(model, model, change);
            // Set the model matrix in the vertex shader
            gl.uniformMatrix4fv(uModel, false, model);
            // Set the model matrix for normal vector
            var normalModel = glMatrix.mat3.create();
            glMatrix.mat3.normalFromMat4(normalModel, model);
            gl.uniformMatrix3fv(uNormalModel, false, normalModel);
            // Reset the frame buffer
            gl.enable(gl.DEPTH_TEST);
            gl.clearColor(0.1, 0.1, 0.1, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        }
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}