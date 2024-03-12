//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)

// Tabs set to 2

/*=====================
  VBObox-Lib.js library: 
  ===================== 
Note that you don't really need 'VBObox' objects for any simple, 
    beginner-level WebGL/OpenGL programs: if all vertices contain exactly 
		the same attributes (e.g. position, color, surface normal), and use 
		the same shader program (e.g. same Vertex Shader and Fragment Shader), 
		then our textbook's simple 'example code' will suffice.
		  
***BUT*** that's rare -- most genuinely useful WebGL/OpenGL programs need 
		different sets of vertices with  different sets of attributes rendered 
		by different shader programs.  THUS a customized VBObox object for each 
		VBO/shader-program pair will help you remember and correctly implement ALL 
		the WebGL/GLSL steps required for a working multi-shader, multi-VBO program.
		
One 'VBObox' object contains all we need for WebGL/OpenGL to render on-screen a 
		set of shapes made from vertices stored in one Vertex Buffer Object (VBO), 
		as drawn by calls to one 'shader program' that runs on your computer's 
		Graphical Processing Unit(GPU), along with changes to values of that shader 
		program's one set of 'uniform' varibles.  
The 'shader program' consists of a Vertex Shader and a Fragment Shader written 
		in GLSL, compiled and linked and ready to execute as a Single-Instruction, 
		Multiple-Data (SIMD) parallel program executed simultaneously by multiple 
		'shader units' on the GPU.  The GPU runs one 'instance' of the Vertex 
		Shader for each vertex in every shape, and one 'instance' of the Fragment 
		Shader for every on-screen pixel covered by any part of any drawing 
		primitive defined by those vertices.
The 'VBO' consists of a 'buffer object' (a memory block reserved in the GPU),
		accessed by the shader program through its 'attribute' variables. Shader's
		'uniform' variable values also get retrieved from GPU memory, but their 
		values can't be changed while the shader program runs.  
		Each VBObox object stores its own 'uniform' values as vars in JavaScript; 
		its 'adjust()'	function computes newly-updated values for these uniform 
		vars and then transfers them to the GPU memory for use by shader program.
EVENTUALLY you should replace 'cuon-matrix-quat03.js' with the free, open-source
   'glmatrix.js' library for vectors, matrices & quaternions: Google it!
		This vector/matrix library is more complete, more widely-used, and runs
		faster than our textbook's 'cuon-matrix-quat03.js' library.  
		--------------------------------------------------------------
		I recommend you use glMatrix.js instead of cuon-matrix-quat03.js
		--------------------------------------------------------------
		for all future WebGL programs. 
You can CONVERT existing cuon-matrix-based programs to glmatrix.js in a very 
    gradual, sensible, testable way:
		--add the glmatrix.js library to an existing cuon-matrix-based program;
			(but don't call any of its functions yet).
		--comment out the glmatrix.js parts (if any) that cause conflicts or in	
			any way disrupt the operation of your program.
		--make just one small local change in your program; find a small, simple,
			easy-to-test portion of your program where you can replace a 
			cuon-matrix object or function call with a glmatrix function call.
			Test; make sure it works. Don't make too large a change: it's hard to fix!
		--Save a copy of this new program as your latest numbered version. Repeat
			the previous step: go on to the next small local change in your program
			and make another replacement of cuon-matrix use with glmatrix use. 
			Test it; make sure it works; save this as your next numbered version.
		--Continue this process until your program no longer uses any cuon-matrix
			library features at all, and no part of glmatrix is commented out.
			Remove cuon-matrix from your library, and now use only glmatrix.

	------------------------------------------------------------------
	VBObox -- A MESSY SET OF CUSTOMIZED OBJECTS--NOT REALLY A 'CLASS'
	------------------------------------------------------------------
As each 'VBObox' object can contain:
  -- a DIFFERENT GLSL shader program, 
  -- a DIFFERENT set of attributes that define a vertex for that shader program, 
  -- a DIFFERENT number of vertices to used to fill the VBOs in GPU memory, and 
  -- a DIFFERENT set of uniforms transferred to GPU memory for shader use.  
  THUS:
		I don't see any easy way to use the exact same object constructors and 
		prototypes for all VBObox objects.  Every additional VBObox objects may vary 
		substantially, so I recommend that you copy and re-name an existing VBObox 
		prototype object, and modify as needed, as shown here. 
		(e.g. to make the VBObox3 object, copy the VBObox2 constructor and 
		all its prototype functions, then modify their contents for VBObox3 
		activities.)

*/

// Written for EECS 351-2,	Intermediate Computer Graphics,
//							Northwestern Univ. EECS Dept., Jack Tumblin
// 2016.05.26 J. Tumblin-- Created; tested on 'TwoVBOs.html' starter code.
// 2017.02.20 J. Tumblin-- updated for EECS 351-1 use for Project C.
// 2018.04.11 J. Tumblin-- minor corrections/renaming for particle systems.
//    --11e: global 'gl' replaced redundant 'myGL' fcn args; 
//    --12: added 'SwitchToMe()' fcn to simplify 'init()' function and to fix 
//      weird subtle errors that sometimes appear when we alternate 'adjust()'
//      and 'draw()' functions of different VBObox objects. CAUSE: found that
//      only the 'draw()' function (and not the 'adjust()' function) made a full
//      changeover from one VBObox to another; thus calls to 'adjust()' for one
//      VBObox could corrupt GPU contents for another.
//      --Created vboStride, vboOffset members to centralize VBO layout in the 
//      constructor function.
//    -- 13 (abandoned) tried to make a 'core' or 'resuable' VBObox object to
//      which we would add on new properties for shaders, uniforms, etc., but
//      I decided there was too little 'common' code that wasn't customized.
//=============================================================================


//=============================================================================
//=============================================================================
function VBObox0() {
  //=============================================================================
  //=============================================================================
  // CONSTRUCTOR for one re-usable 'VBObox0' object that holds all data and fcns
  // needed to render vertices from one Vertex Buffer Object (VBO) using one 
  // separate shader program (a vertex-shader & fragment-shader pair) and one
  // set of 'uniform' variables.
  
  // Constructor goal: 
  // Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
  // written into code) in all other VBObox functions. Keeping all these (initial)
  // values here, in this one coonstrutor function, ensures we can change them 
  // easily WITHOUT disrupting any other code, ever!
    
    this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
   `precision highp float;				// req'd in OpenGL ES if we use 'float'
    //
    uniform mat4 u_ModelMat0;
    attribute vec4 a_Pos0;
    attribute vec3 a_Colr0;
    varying vec3 v_Colr0;
    //
    void main() {
      gl_Position = u_ModelMat0 * a_Pos0;
       v_Colr0 = a_Colr0;
     }`;
  
    this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
   `precision mediump float;
    varying vec3 v_Colr0;
    void main() {
      gl_FragColor = vec4(v_Colr0, 1.0);
    }`;
    var xcount = 100;			// # of lines to draw in x,y to make the grid.
      var ycount = 100;		
      var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
       var xColr = new Float32Array([0.6, 0.6, 0.6]);	// bright yellow
       var yColr = new Float32Array([0.6, 0.6, 0.6]);	// bright green.
       
      
                
      var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
      var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))
      
    gndVerts = new Float32Array(7*2*(xcount+ycount)+42);
    // this.vboContents = //--------------------------------------------------------
  
      // First, step thru x values as we make vertical lines of constant-x:
      for(v=0, j=0; v<2*xcount; v++, j+= 7) {
        if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
          gndVerts[j  ] = -xymax + (v  )*xgap;	// x
          gndVerts[j+1] = -xymax;								// y
          gndVerts[j+2] = 0.0;									// z
          gndVerts[j+3] = 1.0;									// w.
        }
        else {				// put odd-numbered vertices at (xnow, +xymax, 0).
          gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
          gndVerts[j+1] = xymax;								// y
          gndVerts[j+2] = 0.0;									// z
          gndVerts[j+3] = 1.0;									// w.
        }
        gndVerts[j+4] = xColr[0];			// red
        gndVerts[j+5] = xColr[1];			// grn
        gndVerts[j+6] = xColr[2];			// blu
      }
      // Second, step thru y values as wqe make horizontal lines of constant-y:
      // (don't re-initialize j--we're adding more vertices to the array)
      for(v=0; v<2*ycount; v++, j+= 7) {
        if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
          gndVerts[j  ] = -xymax;								// x
          gndVerts[j+1] = -xymax + (v  )*ygap;	// y
          gndVerts[j+2] = 0.0;									// z
          gndVerts[j+3] = 1.0;									// w.
        }
        else {					// put odd-numbered vertices at (+xymax, ynow, 0).
          gndVerts[j  ] = xymax;								// x
          gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
          gndVerts[j+2] = 0.0;									// z
          gndVerts[j+3] = 1.0;									// w.
        }
        gndVerts[j+4] = yColr[0];			// red
        gndVerts[j+5] = yColr[1];			// grn
        gndVerts[j+6] = yColr[2];			// blu
      }
      
    
    axes = new Float32Array ([						// Array of vertex attribute values we will
                                  // transfer to GPU's vertex buffer object (VBO)
    // 1st triangle:
       0.0,	 0.0,	0.0, 1.0,		1.0, 1.0, 1.0, //1 vertex:pos x,y,z,w; color: r,g,b  X AXIS
       1.0,  0.0, 0.0, 1.0,		1.0, 0.0, 0.0,
       
       0.0,	 0.0,	0.0, 1.0,		1.0, 1.0, 1.0, // Y AXIS
       0.0,  1.0, 0.0, 1.0,		0.0, 1.0, 0.0,
       
       0.0,	 0.0,	0.0, 1.0,		1.0, 1.0, 1.0, // Z AXIS
       0.0,  0.0, 1.0, 1.0,		0.0, 0.2, 1.0,
       
      //  // 2 long lines of the ground grid:
      //  -100.0,   0.2,	0.0, 1.0,		1.0, 0.2, 0.0, // horiz line
      //   100.0,   0.2, 0.0, 1.0,		0.0, 0.2, 1.0,
      //   0.2,	-100.0,	0.0, 1.0,		0.0, 1.0, 0.0, // vert line
      //   0.2,   100.0, 0.0, 1.0,		1.0, 0.0, 1.0,
       ]);
    
    for(i=0;i<42;i++,j++) {
      gndVerts[j] = axes[i];
    }
  
    this.vboContents = gndVerts;
  
    this.vboVerts = 2*(xcount+ycount)+6;						// # of vertices held in 'vboContents' array
    this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
                                  // bytes req'd by 1 vboContents array element;
                                  // (why? used to compute stride and offset 
                                  // in bytes for vertexAttribPointer() calls)
    this.vboBytes = this.vboContents.length * this.FSIZE;               
                                  // total number of bytes stored in vboContents
                                  // (#  of floats in vboContents array) * 
                                  // (# of bytes/float).
    this.vboStride = this.vboBytes / this.vboVerts; 
                                  // (== # of bytes to store one complete vertex).
                                  // From any attrib in a given vertex in the VBO, 
                                  // move forward by 'vboStride' bytes to arrive 
                                  // at the same attrib for the next vertex. 
  
                //----------------------Attribute sizes
    this.vboFcount_a_Pos0 =  4;    // # of floats in the VBO needed to store the
                                  // attribute named a_Pos0. (4: x,y,z,w values)
    this.vboFcount_a_Colr0 = 3;   // # of floats for this attrib (r,g,b values) 
    console.assert((this.vboFcount_a_Pos0 +     // check the size of each and
                    this.vboFcount_a_Colr0) *   // every attribute in our VBO
                    this.FSIZE == this.vboStride, // for agreeement with'stride'
                    "Uh oh! VBObox0.vboStride disagrees with attribute-size values!");
  
                //----------------------Attribute offsets  
    this.vboOffset_a_Pos0 = 0;    // # of bytes from START of vbo to the START
                                  // of 1st a_Pos0 attrib value in vboContents[]
    this.vboOffset_a_Colr0 = this.vboFcount_a_Pos0 * this.FSIZE;    
                                  // (4 floats * bytes/float) 
                                  // # of bytes from START of vbo to the START
                                  // of 1st a_Colr0 attrib value in vboContents[]
                //-----------------------GPU memory locations:
    this.vboLoc;									// GPU Location for Vertex Buffer Object, 
                                  // returned by gl.createBuffer() function call
    this.shaderLoc;								// GPU Location for compiled Shader-program  
                                  // set by compile/link of VERT_SRC and FRAG_SRC.
                            //------Attribute locations in our shaders:
    this.a_PosLoc;								// GPU location for 'a_Pos0' attribute
    this.a_ColrLoc;								// GPU location for 'a_Colr0' attribute
  
                //---------------------- Uniform locations &values in our shaders
    this.ModelMat = new Matrix4();	// Transforms CVV axes to model axes.
    this.u_ModelMatLoc;							// GPU location for u_ModelMat uniform
  }
  
  VBObox0.prototype.init = function() {
  //=============================================================================
  // Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
  // kept in this VBObox. (This function usually called only once, within main()).
  // Specifically:
  // a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
  //  executable 'program' stored and ready to use inside the GPU.  
  // b) create a new VBO object in GPU memory and fill it by transferring in all
  //  the vertex data held in our Float32array member 'VBOcontents'. 
  // c) Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
  // -------------------
  // CAREFUL!  before you can draw pictures using this VBObox contents, 
  //  you must call this VBObox object's switchToMe() function too!
  //--------------------
  // a) Compile,link,upload shaders-----------------------------------------------
    this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
    if (!this.shaderLoc) {
      console.log(this.constructor.name + 
                  '.init() failed to create executable Shaders on the GPU. Bye!');
      return;
    }
  // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
  //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}
  
    gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())
  
  // b) Create VBO on GPU, fill it------------------------------------------------
    this.vboLoc = gl.createBuffer();	
    if (!this.vboLoc) {
      console.log(this.constructor.name + 
                  '.init() failed to create VBO in GPU. Bye!'); 
      return;
    }
    // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
    //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
    // (positions, colors, normals, etc), or 
    //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
    // that each select one vertex from a vertex array stored in another VBO.
    gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
                    this.vboLoc);				  // the ID# the GPU uses for this buffer.
  
    // Fill the GPU's newly-created VBO object with the vertex data we stored in
    //  our 'vboContents' member (JavaScript Float32Array object).
    //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
    //    use gl.bufferSubData() to modify VBO contents without changing VBO size)
    gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
                      this.vboContents, 		// JavaScript Float32Array
                     gl.STATIC_DRAW);			// Usage hint.
    //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
    //	(see OpenGL ES specification for more info).  Your choices are:
    //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
    //				contents rarely or never change.
    //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
    //				contents may change often as our program runs.
    //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
    // 			times and then discarded; for rapidly supplied & consumed VBOs.
  
    // c1) Find All Attributes:---------------------------------------------------
    //  Find & save the GPU location of all our shaders' attribute-variables and 
    //  uniform-variables (for switchToMe(), adjust(), draw(), reload(),etc.)
    this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, 'a_Pos0');
    if(this.a_PosLoc < 0) {
      console.log(this.constructor.name + 
                  '.init() Failed to get GPU location of attribute a_Pos0');
      return -1;	// error exit.
    }
     this.a_ColrLoc = gl.getAttribLocation(this.shaderLoc, 'a_Colr0');
    if(this.a_ColrLoc < 0) {
      console.log(this.constructor.name + 
                  '.init() failed to get the GPU location of attribute a_Colr0');
      return -1;	// error exit.
    }
    
    // c2) Find All Uniforms:-----------------------------------------------------
    //Get GPU storage location for each uniform var used in our shader programs: 
    this.u_ModelMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMat0');
    if (!this.u_ModelMatLoc) { 
      console.log(this.constructor.name + 
                  '.init() failed to get GPU location for u_ModelMat1 uniform');
      return;
    }  
  }
  
  VBObox0.prototype.switchToMe = function() {
  //==============================================================================
  // Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
  //
  // We only do this AFTER we called the init() function, which does the one-time-
  // only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
  // even then, you are STILL not ready to draw our VBObox's contents onscreen!
  // We must also first complete these steps:
  //  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
  //  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
  //  c) tell the GPU to connect the shader program's attributes to that VBO.
  
  // a) select our shader program:
    gl.useProgram(this.shaderLoc);	
  //		Each call to useProgram() selects a shader program from the GPU memory,
  // but that's all -- it does nothing else!  Any previously used shader program's 
  // connections to attributes and uniforms are now invalid, and thus we must now
  // establish new connections between our shader program's attributes and the VBO
  // we wish to use.  
    
  // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
  //  instead connect to our own already-created-&-filled VBO.  This new VBO can 
  //    supply values to use as attributes in our newly-selected shader program:
    gl.bindBuffer(gl.ARRAY_BUFFER,	        // GLenum 'target' for this GPU buffer 
                      this.vboLoc);			    // the ID# the GPU uses for our VBO.
  
  // c) connect our newly-bound VBO to supply attribute variable values for each
  // vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
  // this sets up data paths from VBO to our shader units:
    // 	Here's how to use the almost-identical OpenGL version of this function:
    //		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
    gl.vertexAttribPointer(
      this.a_PosLoc,//index == ID# for the attribute var in your GLSL shader pgm;
      this.vboFcount_a_Pos0,// # of floats used by this attribute: 1,2,3 or 4?
      gl.FLOAT,			// type == what data type did we use for those numbers?
      false,				// isNormalized == are these fixed-point values that we need
                    //									normalize before use? true or false
      this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
                    // stored attrib for this vertex to the same stored attrib
                    //  for the next vertex in our VBO.  This is usually the 
                    // number of bytes used to store one complete vertex.  If set 
                    // to zero, the GPU gets attribute values sequentially from 
                    // VBO, starting at 'Offset'.	
                    // (Our vertex size in bytes: 4 floats for pos + 3 for color)
      this.vboOffset_a_Pos0);						
                    // Offset == how many bytes from START of buffer to the first
                    // value we will actually use?  (We start with position).
    gl.vertexAttribPointer(this.a_ColrLoc, this.vboFcount_a_Colr0, 
                          gl.FLOAT, false, 
                          this.vboStride, this.vboOffset_a_Colr0);
                  
  // --Enable this assignment of each of these attributes to its' VBO source:
    gl.enableVertexAttribArray(this.a_PosLoc);
    gl.enableVertexAttribArray(this.a_ColrLoc);
  }
  
  VBObox0.prototype.isReady = function() {
  //==============================================================================
  // Returns 'true' if our WebGL rendering context ('gl') is ready to render using
  // this objects VBO and shader program; else return false.
  // see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter
  
  var isOK = true;
  
    if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
      console.log(this.constructor.name + 
                  '.isReady() false: shader program at this.shaderLoc not in use!');
      isOK = false;
    }
    if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
        console.log(this.constructor.name + 
                '.isReady() false: vbo at this.vboLoc not in use!');
      isOK = false;
    }
    return isOK;
  }
  
  VBObox0.prototype.adjust = function() {
  //==============================================================================
  // Update the GPU to newer, current values we now store for 'uniform' vars on 
  // the GPU; and (if needed) update each attribute's stride and offset in VBO.
  
    // check: was WebGL context set to use our VBO & shader program?
    if(this.isReady()==false) {
          console.log('ERROR! before' + this.constructor.name + 
                '.adjust() call you needed to call this.switchToMe()!!');
    }  
    // Adjust values for our uniforms,
  
      this.ModelMat.setIdentity();
  // THIS DOESN'T WORK!!  this.ModelMatrix = g_worldMat;
    this.ModelMat.set(g_worldMat);	// use our global, shared camera.
  // READY to draw in 'world' coord axes.
    
  //  this.ModelMat.rotate(g_angleNow0, 0, 0, 1);	  // rotate drawing axes,
  //  this.ModelMat.translate(0.35, 0, 0);							// then translate them.
    //  Transfer new uniforms' values to the GPU:-------------
    // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
    gl.uniformMatrix4fv(this.u_ModelMatLoc,	// GPU location of the uniform
                        false, 				// use matrix transpose instead?
                        this.ModelMat.elements);	// send data from Javascript.
    // Adjust the attributes' stride and offset (if necessary)
    // (use gl.vertexAttribPointer() calls and gl.enableVertexAttribArray() calls)
  }
  
  VBObox0.prototype.draw = function() {
  //=============================================================================
  // Render current VBObox contents.
  
    // check: was WebGL context set to use our VBO & shader program?
    if(this.isReady()==false) {
          console.log('ERROR! before' + this.constructor.name + 
                '.draw() call you needed to call this.switchToMe()!!');
    }  
    // ----------------------------Draw the contents of the currently-bound VBO:
    gl.drawArrays(gl.LINES, 	    // select the drawing primitive to draw,
                    // choices: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
                    //          gl.TRIANGLES, gl.TRIANGLE_STRIP, ...
                    0, 								// location of 1st vertex to draw;
                    this.vboVerts);		// number of vertices to draw on-screen.
  }
  
  VBObox0.prototype.reload = function() {
  //=============================================================================
  // Over-write current values in the GPU inside our already-created VBO: use 
  // gl.bufferSubData() call to re-transfer some or all of our Float32Array 
  // contents to our VBO without changing any GPU memory allocations.
  
   gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                    0,                  // byte offset to where data replacement
                                        // begins in the VBO.
                      this.vboContents);   // the JS source-data array used to fill VBO
  
  }
  /*
  VBObox0.prototype.empty = function() {
  //=============================================================================
  // Remove/release all GPU resources used by this VBObox object, including any 
  // shader programs, attributes, uniforms, textures, samplers or other claims on 
  // GPU memory.  However, make sure this step is reversible by a call to 
  // 'restoreMe()': be sure to retain all our Float32Array data, all values for 
  // uniforms, all stride and offset values, etc.
  //
  //
  // 		********   YOU WRITE THIS! ********
  //
  //
  //
  }
  
  VBObox0.prototype.restore = function() {
  //=============================================================================
  // Replace/restore all GPU resources used by this VBObox object, including any 
  // shader programs, attributes, uniforms, textures, samplers or other claims on 
  // GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
  // all stride and offset values, etc.
  //
  //
  // 		********   YOU WRITE THIS! ********
  //
  //
  //
  }
  */
  
  //=============================================================================
  //=============================================================================
  function VBObox1() {
  //=============================================================================
  //=============================================================================
  // CONSTRUCTOR for one re-usable 'VBObox1' object that holds all data and fcns
  // needed to render vertices from one Vertex Buffer Object (VBO) using one 
  // separate shader program (a vertex-shader & fragment-shader pair) and one
  // set of 'uniform' variables.
  
  // Constructor goal: 
  // Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
  // written into code) in all other VBObox functions. Keeping all these (initial)
  // values here, in this one coonstrutor function, ensures we can change them 
  // easily WITHOUT disrupting any other code, ever!
    
    this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
   `precision highp float;				// req'd in OpenGL ES if we use 'float'
    //
    uniform vec3 u_Kd;
    uniform vec3 u_Ka;
    uniform vec3 u_Ks;
    uniform vec3 u_Ia;
    uniform vec3 u_Id;
    uniform vec3 u_Is;
    uniform vec3 u_Ke;
    uniform vec3 u_V;
    uniform float u_shiny; 

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_MvpMatrix;
    uniform mat4 u_NormalMatrix;

    uniform vec3 u_lightPos;
    uniform float u_isBlinn;
  
    attribute vec4 a_Pos1;
    attribute vec3 a_Norm; // model space normal
  
    varying vec4 v_Position;  // world coords
    varying vec3 v_Norm1;
    varying vec4 v_Color;
    //
    void main() {
      gl_Position = u_MvpMatrix * a_Pos1;   // relative to the camera
      v_Norm1 = normalize(u_NormalMatrix * vec4(a_Norm, 0.0)).xyz;       // convert to world coords
      v_Position = u_ModelMatrix * a_Pos1;    // convert position to world coords
      vec3 lightDir = normalize(u_lightPos - v_Position.xyz);       // normalize the direction vector for light
      vec3 ambient = u_Ka * u_Ia;
      vec3 diffuse = u_Id * u_Kd * dot(lightDir, v_Norm1);
      vec3 R = reflect(-lightDir, v_Norm1); 
      vec3 view = normalize(u_V - v_Position.xyz);       // vector from camera to vertex posn
      float rDotV = dot(R, view);
      vec3 specular = u_Is * u_Ks * pow(max(0.0, rDotV), u_shiny);

      // for blinn-phong
      vec3 H = normalize(lightDir + view);
      float nDotH = max(dot(H, v_Norm1), 0.0);
      vec3 blinnSpecular = u_Is * u_Ks * pow(nDotH, u_shiny);
     
      
      if (u_isBlinn < 0.5)
        v_Color = vec4(u_Ke + ambient + diffuse + specular, 1.0);
      else
        v_Color = vec4(u_Ke + ambient + diffuse + blinnSpecular, 1.0);
      

     }`;
  
  // /*
   // c) SHADED, sphere-like dots:
    this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
     `precision mediump float;
    varying vec3 v_Norm1;
    varying vec4 v_Color;
    void main() {
         gl_FragColor = v_Color;
  
    }`;
  
    this.vboContents = //---------------------------------------------------------
    new Float32Array ([					
        0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
        0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
        0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
        0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
        0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
        0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
        -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
        -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
        -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
        -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
        -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
        -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
        0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
        0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
        0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
        0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
        1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
        0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
        0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
        -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
        -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
        -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
        -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
        0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
        0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
        0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
        0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
        -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
        -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
        -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
        -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
        -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
        -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
        0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
        0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
        0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
        0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
        0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
        -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
        -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
        -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
        -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
        -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
        -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
        -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
        -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
        -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
        0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
        0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
        0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
        0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
        0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
        0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
        0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
        0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
        0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
        0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
        0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
        0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
        -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
        -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
        -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
        0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
        -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
        -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
        0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
        -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
        0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
        -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
        -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
        -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
        -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
        -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
        -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
        -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
        -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
        -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
        0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
        -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
        0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
        -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
        -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
        0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
        -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
        -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
        -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
        0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
        0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
        0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
        0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
        0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
        0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
        0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
        0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
        0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
        0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
        0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
        0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
        0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
        0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
        0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
        0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
        0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
        -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
        -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
        -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
        0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
        -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
        -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
        -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
        -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
        -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
        -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
        -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
        -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
        -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
        -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
        -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
        -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
        -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
        -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
        -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
        -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
        -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
        0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
        0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
        -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
        0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
        0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
        0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
        0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
        0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
        0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
        0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
        0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
        -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
        0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
        -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
        0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
        0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
        0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
        0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
        0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
        -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
        -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
        -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
        -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
        -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
        -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
        -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
        -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
        -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
        -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
        -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
        -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
        -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
        -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
        -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
        -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
        0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
        0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
        0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
        0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
        0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
        -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
        0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
        -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
        0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
        0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
        0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
        0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
        1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
        0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
        0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
        0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
        0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
        -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
        0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
        0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
        0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
        0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
        -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
        -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
        0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
        -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
        -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
        -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
        -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
        -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
        -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
        -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
        -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
        -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
        -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
        -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
        -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
        -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
        -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
        -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
        -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
        -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
        -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
        0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
        0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
        0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
        0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
        0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
        0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
        0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
        0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
        0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
        -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
        0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
        0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
        -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
        -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
        0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
        0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
        0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
        0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
        0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
        0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
        0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
        0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
        0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
        0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
        0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
        0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
        0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
        0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
        -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
        0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
        -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
        0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
        -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
        -0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
        -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
        -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
        -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
        -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
        0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
        0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
        0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
        0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
        0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
        0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
        -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
        0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
        0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
        0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
        0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
        0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
        0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
        0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
        0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
        0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
        0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
        0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
        0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
        0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
        0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
        0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
        0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
        0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
        0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
        0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
        0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
        0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
        0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
        0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
        0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
        0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
        0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
        0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
        -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
        -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
        -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
        -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
        -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
        -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
        -0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
        -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
        -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
        -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
        -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
        -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
        -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
        -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
        -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
        -0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
        -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
        -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
        -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
        -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
        -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
        -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
        -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
        -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
        0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
        -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
        -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
        -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
        -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
        -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
        -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
        -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
        -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
        -0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
        -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
        -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
        -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
        -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
        -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
        -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
        -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
        -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
        -0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
        -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
        -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
        -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
        -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
        -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
        -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
        -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
        -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
        0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
        -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
        -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
        -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
        -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
        0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
        0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
        0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
        -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
        -0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
        -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
        -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
        0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
        0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
        0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
        0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
        0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
        0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
        0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
        0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
        0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
        0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
        0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
        0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
        -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
        0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
        -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
        0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
        -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
        0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
        0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
        0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
        0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
        0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
        0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
        0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
        0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
        0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
        0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
        0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
        1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
        0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
        0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
        1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
        0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
        0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
        0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
        0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
        0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
        0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
        0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
        0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
        0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
        0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
        0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
        0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
        0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
        -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
        0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
        -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
        0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
        -0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
        -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
        -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
        0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
        0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
        0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
        0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
        0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
        0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
        0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
        0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
        0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
        0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
        0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
        0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
        0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
        0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
        0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
        0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
        -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
        -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
        -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
        -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
        -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
        -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
        -0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
        -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
        -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
        -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
        -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
        -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
        -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
        -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        -0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
        -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
        -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
        -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
        -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
        -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
        -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
        -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
        -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
        -0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
        -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
        -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
        -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
        -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
        -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
        -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
        -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
        -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
        -0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
        -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
        -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
        -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
        -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
        -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
        -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
        -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        -0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
        -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
        -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
        -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
        -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
        -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
        -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
        -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
        -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
        -0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
        -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
        -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
        0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
        0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
        0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
        0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
        0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
        0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
        0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
        0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
        0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
        0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
        0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
        0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
        0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
        0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
        0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
        0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
        0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
        0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
        -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
        0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
        -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
        0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
        -0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
        -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
        -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
        0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
        0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
        0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
        0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
        0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
        0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
        0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
        0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
        0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
        0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
        0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
        0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
        0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
        0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
        0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
        0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
        0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
        0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
        0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
        0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
        0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
        0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
        0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
        0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
        0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
        0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
        0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
        -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
        -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
        -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
        0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
        0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
        0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
        0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
        -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
        -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
        -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
        -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
        -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
        -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
        -0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
        -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
        -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
        -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
        -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
        -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
        -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
        -0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
        -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
        -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
        -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
        -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
        -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
        -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
        -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
        -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
        -0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
        -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
        -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
        -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
        -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
        -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
        -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
        -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
        -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
        -0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
        -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
        -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
        -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
        -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
        -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
        -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
        -0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
        -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
        -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
        -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
        -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
        -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
        -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
        -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
        -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
        -0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
        -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
        -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
        -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
        0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
        -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
        0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
        -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
        0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
        0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
        0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
        0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
        0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
        -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
        -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
        -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
        -0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
        -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
        -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
        0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
        0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
        0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
        0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
        0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
        0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
        0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
        0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
        0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
        0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
        0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
        0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
        0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
        0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
        0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
        0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
        0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
        0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
        0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
        0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
        0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
        0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
        0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
        0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
        0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
        0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
        0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
        0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
        0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
        0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
        0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
        0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
        0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
        0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
        0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
        0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
        0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
        0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
        0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
        0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
        0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
        0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
        0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
        0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
        0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
        0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
        0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
        0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
        0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
        0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
        0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
        0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
        -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
        -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
        -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
        -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
        -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
        -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
        -0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
        -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
        -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
        -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
        -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
        -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
        0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
        0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
        -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
        0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
        -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
        0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
        0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
        -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
        0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
        -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
        0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
        -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
        0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
        0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
        0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
        -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
        -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
        -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
        -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
        -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
        -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
        -0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
        -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
        -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
        -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
        -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
        -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
        -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
        -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
        -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
        0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
        -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
        -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
        -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
        -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
        -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
        -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
        -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
        -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
        -0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
        -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
        -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
        -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
        -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
        0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
        0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
        0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
        -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
        0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
        0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
        0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
        0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
        -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
        0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
        -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
        -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
        -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
        0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
        0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
        -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
        -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
        -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
        -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
        -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
        -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
        -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
        -0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
        -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
        -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
        0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
        0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
        0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
        0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
        0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
        0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
        0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
        0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
        0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
        0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
        0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
        0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
        0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
        0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
        0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
        0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
        0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
        0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
        0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
        0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
        0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
        0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
        0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
        0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
        0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
        0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
        0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
        0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
        0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
        0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
        0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
        0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
        0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
        0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
        0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
        0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
        -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
        -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
        -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
        0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
        -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
        -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
        -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
        -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
        -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
        -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
        -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
        -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
        -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
        -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
        -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
        -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
        -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
        -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
        0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
        -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
        -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
        -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
        -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
        -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
        -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
        -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
        -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
        0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
        0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
        0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
        0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
        0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
        0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
        0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
        0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
        0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
        0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
        0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
        0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
        0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
        0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
        0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
        0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
        0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
        -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
        -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
        -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
        -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
        -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
        -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
        -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
        -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
        -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
        -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
        -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
        -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
        -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
        -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
        -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
        -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
        -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
        -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
        0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
        -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
        -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
        0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
        0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
        0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
        0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
        0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
        0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
        0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
        0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
        0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
        0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
        0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
        0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
        0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
        -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
        -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
        -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
        -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
        -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
        -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
        -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
        -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
        -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
        -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
        -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
        -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
        -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
        -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
        0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
        0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
        0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
        0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
        0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
        0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
        0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
        0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
        1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
        0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
        0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
        1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
        0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
        0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
        0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
        0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
        0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
        0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
        0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
        0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
        -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
        0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
        0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
        -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
        -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
        -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
        -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
        -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
        -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
        -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
        -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
        -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
        -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
        -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
        -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
        -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
        -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
        -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
        -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
        -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
        -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
        0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
        0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
        0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
        0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
        0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
        0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
        0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
        0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
        0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
        -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
        0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
        0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
        0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
        0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
        0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
        0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
        0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
        0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
        
    ]);	
    
    this.vboVerts = 960;							// # of vertices held in 'vboContents' array;
    this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;  
                                  // bytes req'd by 1 vboContents array element;
                                  // (why? used to compute stride and offset 
                                  // in bytes for vertexAttribPointer() calls)
    this.vboBytes = this.vboContents.length * this.FSIZE;               
                                  // (#  of floats in vboContents array) * 
                                  // (# of bytes/float).
    this.vboStride = this.vboBytes / this.vboVerts;     
                                  // (== # of bytes to store one complete vertex).
                                  // From any attrib in a given vertex in the VBO, 
                                  // move forward by 'vboStride' bytes to arrive 
                                  // at the same attrib for the next vertex.
                                   
                //----------------------Attribute sizes
    this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
                                  // attribute named a_Pos1. (4: x,y,z,w values)
    this.vboFcount_a_Norm = 3;   // # of floats for this attrib (r,g,b values)
    
    console.assert((this.vboFcount_a_Pos1 +     // check the size of each and
                    this.vboFcount_a_Norm) *   // every attribute in our VBO
                    this.FSIZE == this.vboStride, // for agreeement with'stride'
                    "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");
                    
                //----------------------Attribute offsets
    this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
                                  // of 1st a_Pos1 attrib value in vboContents[]
    this.vboOffset_a_Norm = (this.vboFcount_a_Pos1) * this.FSIZE;  
                                  // == 4 floats * bytes/float
                                  //# of bytes from START of vbo to the START
                                  // of 1st a_Norm attrib value in vboContents[]
    // this.vboOffset_a_PtSiz1 =(this.vboFcount_a_Pos1 +
    //                           this.vboFcount_a_Norm) * this.FSIZE; 
                                  // == 7 floats * bytes/float
                                  // # of bytes from START of vbo to the START
                                  // of 1st a_PtSize attrib value in vboContents[]
  
                //-----------------------GPU memory locations:                                
    this.vboLoc;									// GPU Location for Vertex Buffer Object, 
                                  // returned by gl.createBuffer() function call
    this.shaderLoc;								// GPU Location for compiled Shader-program  
                                  // set by compile/link of VERT_SRC and FRAG_SRC.
                            //------Attribute locations in our shaders:
    this.a_Pos1Loc;							  // GPU location: shader 'a_Pos1' attribute
    this.a_NormLoc;							// GPU location: shader 'a_Norm' attribute
    // this.a_PtSiz1Loc;							// GPU location: shader 'a_PtSiz1' attribute
    
                //---------------------- Uniform locations &values in our shaders
    this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
    this.NormalMatrix = new Matrix4();
    this.MvpMatrix = new Matrix4();
    
  
  
    this.u_ModelMatrixLoc;						// GPU location for u_ModelMat uniform
  };
  
  
  VBObox1.prototype.init = function() {
  //==============================================================================
  // Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
  // kept in this VBObox. (This function usually called only once, within main()).
  // Specifically:
  // a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
  //  executable 'program' stored and ready to use inside the GPU.  
  // b) create a new VBO object in GPU memory and fill it by transferring in all
  //  the vertex data held in our Float32array member 'VBOcontents'. 
  // c) Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
  // -------------------
  // CAREFUL!  before you can draw pictures using this VBObox contents, 
  //  you must call this VBObox object's switchToMe() function too!
  //--------------------
  // a) Compile,link,upload shaders-----------------------------------------------
    this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
    if (!this.shaderLoc) {
      console.log(this.constructor.name + 
                  '.init() failed to create executable Shaders on the GPU. Bye!');
      return;
    }
  // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
  //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}
  
    gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())
  
  // b) Create VBO on GPU, fill it------------------------------------------------
    this.vboLoc = gl.createBuffer();	
    if (!this.vboLoc) {
      console.log(this.constructor.name + 
                  '.init() failed to create VBO in GPU. Bye!'); 
      return;
    }
    
    // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
    //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
    // (positions, colors, normals, etc), or 
    //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
    // that each select one vertex from a vertex array stored in another VBO.
    gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
                    this.vboLoc);				  // the ID# the GPU uses for this buffer.
                          
    // Fill the GPU's newly-created VBO object with the vertex data we stored in
    //  our 'vboContents' member (JavaScript Float32Array object).
    //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
    //	 use gl.bufferSubData() to modify VBO contents without changing VBO size)
    gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
                      this.vboContents, 		// JavaScript Float32Array
                     gl.STATIC_DRAW);			// Usage hint.  
    //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
    //	(see OpenGL ES specification for more info).  Your choices are:
    //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
    //				contents rarely or never change.
    //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
    //				contents may change often as our program runs.
    //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
    // 			times and then discarded; for rapidly supplied & consumed VBOs.
  
  // c1) Find All Attributes:-----------------------------------------------------
  //  Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (for switchToMe(), adjust(), draw(), reload(), etc.)
    this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Pos1');
    if(this.a_Pos1Loc < 0) {
      console.log(this.constructor.name + 
                  '.init() Failed to get GPU location of attribute a_Pos1');
      return -1;	// error exit.
    }
     this.a_NormLoc = gl.getAttribLocation(this.shaderLoc, 'a_Norm');
    if(this.a_NormLoc < 0) {
      console.log(this.constructor.name + 
                  '.init() failed to get the GPU location of attribute a_Norm');
      return -1;	// error exit.
    }
    // this.a_PtSiz1Loc = gl.getAttribLocation(this.shaderLoc, 'a_PtSiz1');
    // if(this.a_PtSiz1Loc < 0) {
    //   console.log(this.constructor.name + 
    //     					'.init() failed to get the GPU location of attribute a_PtSiz1');
    //   return -1;	// error exit.
    // }
    // c2) Find All Uniforms:-----------------------------------------------------
    //Get GPU storage location for each uniform var used in our shader programs: 
    this.u_NormalMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_NormalMatrix');
    this.u_MvpMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');
    this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');

    /*uniform vec3 u_Kd;
    uniform vec3 u_Ka;
    uniform vec3 u_Ks;
    uniform vec3 u_Ia;
    uniform vec3 u_Id;
    uniform vec3 u_Is;
    uniform vec3 u_Ke;
    uniform vec3 u_V;
    uniform float u_shiny; */ 
    this.u_KdLoc = gl.getUniformLocation(this.shaderLoc, 'u_Kd');
    this.u_KaLoc = gl.getUniformLocation(this.shaderLoc, 'u_Ka');
    this.u_KsLoc = gl.getUniformLocation(this.shaderLoc, 'u_Ks');
    this.u_KeLoc = gl.getUniformLocation(this.shaderLoc, 'u_Ke');
    this.u_IaLoc = gl.getUniformLocation(this.shaderLoc, 'u_Ia');
    this.u_IsLoc = gl.getUniformLocation(this.shaderLoc, 'u_Is');
    this.u_IdLoc = gl.getUniformLocation(this.shaderLoc, 'u_Id');
    this.u_VLoc = gl.getUniformLocation(this.shaderLoc, 'u_V');
    this.u_shinyLoc = gl.getUniformLocation(this.shaderLoc, 'u_shiny');

    this.u_lightPosLoc = gl.getUniformLocation(this.shaderLoc, 'u_lightPos');
    this.u_isBlinnLoc = gl.getUniformLocation(this.shaderLoc, 'u_isBlinn');

    if (!this.u_isBlinnLoc) { 
      console.log(this.constructor.name + 
                  '.init() failed to get GPU location for u_isBlinn uniform');
      return;
    }

    if (!this.u_KdLoc || !this.u_IaLoc) { 
      console.log(this.constructor.name + 
                  '.init() failed to get GPU location for u_Kd and u_Ia uniforms');
      return;
    }

    if (!this.u_VLoc || !this.u_shinyLoc) { 
      console.log(this.constructor.name + 
                  '.init() failed to get GPU location for u_V and u_shiny uniforms');
      return;
    }

    if (!this.u_ModelMatrixLoc) { 
      console.log(this.constructor.name + 
                  '.init() failed to get GPU location for u_ModelMatrix uniform');
      return;
    }
    if (!this.u_NormalMatrixLoc) { 
      console.log(this.constructor.name + 
                  '.init() failed to get GPU location for u_NormalMatrix uniform');
      return;
    }
    if (!this.u_MvpMatrixLoc) { 
      console.log(this.constructor.name + 
                  '.init() failed to get GPU location for u_MvpMatrix uniform');
      return;
    }
 
  }
  
  VBObox1.prototype.switchToMe = function () {
  //==============================================================================
  // Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
  //
  // We only do this AFTER we called the init() function, which does the one-time-
  // only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
  // even then, you are STILL not ready to draw our VBObox's contents onscreen!
  // We must also first complete these steps:
  //  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
  //  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
  //  c) tell the GPU to connect the shader program's attributes to that VBO.
  
  // a) select our shader program:
    gl.useProgram(this.shaderLoc);	
  //		Each call to useProgram() selects a shader program from the GPU memory,
  // but that's all -- it does nothing else!  Any previously used shader program's 
  // connections to attributes and uniforms are now invalid, and thus we must now
  // establish new connections between our shader program's attributes and the VBO
  // we wish to use.  
    
  // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
  //  instead connect to our own already-created-&-filled VBO.  This new VBO can 
  //    supply values to use as attributes in our newly-selected shader program:
    gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
                      this.vboLoc);			// the ID# the GPU uses for our VBO.
  
  // c) connect our newly-bound VBO to supply attribute variable values for each
  // vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
  // this sets up data paths from VBO to our shader units:
    // 	Here's how to use the almost-identical OpenGL version of this function:
    //		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
    gl.vertexAttribPointer(
      this.a_Pos1Loc,//index == ID# for the attribute var in GLSL shader pgm;
      this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
      gl.FLOAT,		  // type == what data type did we use for those numbers?
      false,				// isNormalized == are these fixed-point values that we need
                    //									normalize before use? true or false
      this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
                    // stored attrib for this vertex to the same stored attrib
                    //  for the next vertex in our VBO.  This is usually the 
                    // number of bytes used to store one complete vertex.  If set 
                    // to zero, the GPU gets attribute values sequentially from 
                    // VBO, starting at 'Offset'.	
                    // (Our vertex size in bytes: 4 floats for pos + 3 for color)
      this.vboOffset_a_Pos1);						
                    // Offset == how many bytes from START of buffer to the first
                    // value we will actually use?  (we start with position).
    gl.vertexAttribPointer(this.a_NormLoc, this.vboFcount_a_Norm,
                           gl.FLOAT, false, 
                           this.vboStride,  this.vboOffset_a_Norm);
    // gl.vertexAttribPointer(this.a_PtSiz1Loc,this.vboFcount_a_PtSiz1, 
    //                        gl.FLOAT, false, 
    // 						           this.vboStride,	this.vboOffset_a_PtSiz1);	
    //-- Enable this assignment of the attribute to its' VBO source:
    gl.enableVertexAttribArray(this.a_Pos1Loc);
    gl.enableVertexAttribArray(this.a_NormLoc);
    // gl.enableVertexAttribArray(this.a_PtSiz1Loc);
  }
  
  VBObox1.prototype.isReady = function() {
  //==============================================================================
  // Returns 'true' if our WebGL rendering context ('gl') is ready to render using
  // this objects VBO and shader program; else return false.
  // see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter
  
  var isOK = true;
  
    if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
      console.log(this.constructor.name + 
                  '.isReady() false: shader program at this.shaderLoc not in use!');
      isOK = false;
    }
    if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
        console.log(this.constructor.name + 
                '.isReady() false: vbo at this.vboLoc not in use!');
      isOK = false;
    }
    return isOK;
  }
  
  VBObox1.prototype.adjust = function() {
  //==============================================================================
  // Update the GPU to newer, current values we now store for 'uniform' vars on 
  // the GPU; and (if needed) update each attribute's stride and offset in VBO.
  
    // check: was WebGL context set to use our VBO & shader program?
    if(this.isReady()==false) {
          console.log('ERROR! before' + this.constructor.name + 
                '.adjust() call you needed to call this.switchToMe()!!');
    }
    // Adjust values for our uniforms,
    this.ModelMatrix.setIdentity();
    // this.ModelMatrix.translate(1.0, -2.0, 0);
    this.ModelMatrix.rotate(g_angleNow0, 0, 0, 1);
    this.NormalMatrix.setIdentity();
    this.NormalMatrix.setInverseOf(this.ModelMatrix);
    this.NormalMatrix.transpose();
    this.MvpMatrix.set(g_worldMat);
    this.MvpMatrix.concat(this.ModelMatrix);
    
    // this.MvpMatrix.setIdentity();
  // THIS DOESN'T WORK!!  this.ModelMatrix = g_worldMat;
    // this.ModelMatrix.set(g_worldMat);
  
  //  this.ModelMatrix.rotate(g_angleNow1, 0, 0, 1);	// -spin drawing axes,
    // this.ModelMatrix.translate(1.0, -2.0, 0);						// then translate them.
    //  Transfer new uniforms' values to the GPU:-------------
    // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
    // gl.uniform4f(this.u_eyePosWorld, 6,0,0,1);
    
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                        false, 										// use matrix transpose instead?
                        this.ModelMatrix.elements);	// send data from Javascript.
  
    gl.uniformMatrix4fv(this.u_NormalMatrixLoc,	// GPU location of the uniform
                        false, 										// use matrix transpose instead?
                        this.NormalMatrix.elements);	// send data from Javascript.
  
    gl.uniformMatrix4fv(this.u_MvpMatrixLoc,	// GPU location of the uniform
                        false, 										// use matrix transpose instead?
                        this.MvpMatrix.elements);	// send data from Javascript.

    /*uniform vec3 u_Kd;
    uniform vec3 u_Ka;
    uniform vec3 u_Ks;
    uniform vec3 u_Ia;
    uniform vec3 u_Id;
    uniform vec3 u_Is;
    uniform vec3 u_Ke;
    uniform vec3 u_V;
    uniform float u_shiny; */ 

    gl.uniform3f(this.u_KdLoc, 0.4, 0.4, 0.4);
    gl.uniform3f(this.u_KaLoc, 0.2, 0.2, 0.2);
    gl.uniform3f(this.u_KsLoc, 0.9, 0.9, 0.9);
    gl.uniform3f(this.u_KeLoc, 0.0, 0.0, 0.0);
    gl.uniform3f(this.u_IdLoc, userIdR, userIdG, userIdB);
    gl.uniform3f(this.u_IaLoc, userIaR, userIaG, userIaB);
    gl.uniform3f(this.u_IsLoc, userIsR, userIsG, userIsB);
    gl.uniform3f(this.u_VLoc, g_EyeX, g_EyeY, g_EyeZ);
    gl.uniform1f(this.u_shinyLoc, 7);
    gl.uniform1f(this.u_isBlinnLoc, isBlinnButton);
    gl.uniform3f(this.u_lightPosLoc, userLightx, userLighty, userLightz);
  }
  
  VBObox1.prototype.draw = function() {
  //=============================================================================
  // Send commands to GPU to select and render current VBObox contents.
  
    // check: was WebGL context set to use our VBO & shader program?
    if(this.isReady()==false) {
          console.log('ERROR! before' + this.constructor.name + 
                '.draw() call you needed to call this.switchToMe()!!');
    }
    // this.ModelMatrix.rotate(g_angleNow0, 0, 1, 0);
    // ----------------------------Draw the contents of the currently-bound VBO:
    gl.drawArrays(gl.TRIANGLES,		    // select the drawing primitive to draw:
                    // choices: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
                    //          gl.TRIANGLES, gl.TRIANGLE_STRIP,
                  0, 								// location of 1st vertex to draw;
                  this.vboVerts);		// number of vertices to draw on-screen.
  }
  
  
  VBObox1.prototype.reload = function() {
  //=============================================================================
  // Over-write current values in the GPU for our already-created VBO: use 
  // gl.bufferSubData() call to re-transfer some or all of our Float32Array 
  // contents to our VBO without changing any GPU memory allocations.
  
   gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                    0,                  // byte offset to where data replacement
                                        // begins in the VBO.
                      this.vboContents);   // the JS source-data array used to fill VBO
  }
  
  /*
  VBObox1.prototype.empty = function() {
  //=============================================================================
  // Remove/release all GPU resources used by this VBObox object, including any 
  // shader programs, attributes, uniforms, textures, samplers or other claims on 
  // GPU memory.  However, make sure this step is reversible by a call to 
  // 'restoreMe()': be sure to retain all our Float32Array data, all values for 
  // uniforms, all stride and offset values, etc.
  //
  //
  // 		********   YOU WRITE THIS! ********
  //
  //
  //
  }
  
  VBObox1.prototype.restore = function() {
  //=============================================================================
  // Replace/restore all GPU resources used by this VBObox object, including any 
  // shader programs, attributes, uniforms, textures, samplers or other claims on 
  // GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
  // all stride and offset values, etc.
  //
  //
  // 		********   YOU WRITE THIS! ********
  //
  //
  //
  }
  */
  
  //=============================================================================
  //=============================================================================
  function VBObox2() {
  //=============================================================================
  //=============================================================================
  // CONSTRUCTOR for one re-usable 'VBObox2' object that holds all data and fcns
  // needed to render vertices from one Vertex Buffer Object (VBO) using one 
  // separate shader program (a vertex-shader & fragment-shader pair) and one
  // set of 'uniform' variables.
  
  // Constructor goal: 
  // Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
  // written into code) in all other VBObox functions. Keeping all these (initial)
  // values here, in this one coonstrutor function, ensures we can change them 
  // easily WITHOUT disrupting any other code, ever!
    
    this.VERT_SRC =	//--------------------- VERTEX SHADER source code // v position, v normal
   `precision highp float;				// req'd in OpenGL ES if we use 'float'
    //
    uniform vec3 u_Kd;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_MvpMatrix;
    uniform mat4 u_NormalMatrix;

    // uniform float u_isBlinn;

    attribute vec4 a_Pos1;
    attribute vec3 a_Norm; // model space normal

    varying vec4 v_Position;  // world coords
    varying vec3 v_Norm1;
    varying vec3 v_Kd;

    //
    void main() {
      gl_Position = u_MvpMatrix * a_Pos1;         // position relative to the camera
      v_Position = u_ModelMatrix * a_Pos1;        // convert position to world coords
      v_Norm1 = normalize(u_NormalMatrix * vec4(a_Norm, 0.0)).xyz;    // convert to world coords
      v_Kd = u_Kd;
     }`;
  
    this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
   `precision mediump float;
    
    uniform vec3 u_Ka;
    uniform vec3 u_Ks;
    uniform vec3 u_Ia;
    uniform vec3 u_Id;
    uniform vec3 u_Is;
    uniform vec3 u_Ke;
    uniform vec3 u_V;   // same as u_eyePosWorld
    uniform float u_shiny;

    uniform vec3 u_lightPos;
    uniform float u_isBlinn;

    varying vec4 v_Position;  // world coords
    varying vec3 v_Norm1;
    varying vec3 v_Kd;
    // varying vec4 v_Color;

    void main() {
      
      vec3 lightDir = normalize(u_lightPos - v_Position.xyz);       // normalize the direction vector for light
      vec3 ambient = u_Ka * u_Ia;
      vec3 diffuse = u_Id * v_Kd * dot(lightDir, v_Norm1);
      vec3 R = reflect(-lightDir, v_Norm1); 
      vec3 view = normalize(u_V - v_Position.xyz);       // vector from camera to vertex posn
      float rDotV = dot(R, view);
      vec3 specular = u_Is * u_Ks * pow(max(0.0, rDotV), u_shiny);

      // for blinn-phong
      vec3 H = normalize(lightDir + view);
      float nDotH = max(dot(H, v_Norm1), 0.0);
      vec3 blinnSpecular = u_Is * u_Ks * pow(nDotH, u_shiny); 
     
      
      if (u_isBlinn < 0.5)
        gl_FragColor = vec4(u_Ke + ambient + diffuse + specular, 1.0);
      else
        gl_FragColor = vec4(u_Ke + ambient + diffuse + blinnSpecular, 1.0);

      // gl_FragColor = v_Color;

      // gl_FragColor = vec4(u_Ke + ambient + diffuse + specular, 1.0);

    }`;
  
    this.vboContents = //---------------------------------------------------------
      new Float32Array ([					// Array of vertex attribute values we will
                                  // transfer to GPU's vertex buffer object (VBO)
        // 1 vertex per line: pos x,y,z,w;   color; r,g,b;   point-size; 
        0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
        0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
        0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
        0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
        0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
        0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
        -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
        -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
        -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
        -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
        -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
        -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
        0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
        0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
        0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
        0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
        1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
        0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
        0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
        -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
        -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
        -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
        -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
        0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
        0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
        0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
        0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
        -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
        -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
        -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
        -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
        -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
        -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
        0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
        0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
        0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
        0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
        0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
        -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
        -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
        -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
        -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
        -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
        -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
        -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
        -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
        -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
        0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
        0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
        0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
        0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
        0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
        0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
        0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
        0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
        0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
        0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
        0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
        0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
        -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
        -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
        -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
        0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
        -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
        -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
        0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
        -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
        0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
        -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
        -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
        -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
        -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
        -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
        -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
        -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
        -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
        -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
        0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
        -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
        0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
        -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
        -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
        0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
        -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
        -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
        -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
        0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
        0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
        0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
        0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
        0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
        0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
        0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
        0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
        0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
        0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
        0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
        0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
        0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
        0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
        0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
        0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
        0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
        -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
        -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
        -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
        0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
        -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
        -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
        -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
        -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
        -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
        -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
        -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
        -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
        -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
        -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
        -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
        -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
        -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
        -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
        -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
        -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
        -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
        0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
        0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
        -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
        0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
        0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
        0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
        0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
        0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
        0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
        0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
        0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
        -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
        0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
        -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
        0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
        0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
        0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
        0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
        0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
        -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
        -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
        -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
        -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
        -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
        -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
        -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
        -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
        -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
        -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
        -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
        -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
        -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
        -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
        -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
        -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
        0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
        0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
        0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
        0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
        0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
        -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
        0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
        -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
        0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
        0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
        0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
        0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
        1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
        0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
        0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
        0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
        0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
        -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
        0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
        0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
        0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
        0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
        -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
        -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
        0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
        -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
        -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
        -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
        -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
        -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
        -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
        -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
        -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
        -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
        -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
        -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
        -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
        -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
        -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
        -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
        -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
        -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
        -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
        0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
        0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
        0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
        0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
        0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
        0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
        0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
        0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
        0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
        -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
        0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
        0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
        -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
        -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
        0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
        0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
        0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
        0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
        0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
        0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
        0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
        0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
        0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
        0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
        0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
        0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
        0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
        0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
        -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
        0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
        -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
        0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
        -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
        -0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
        -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
        -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
        -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
        -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
        0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
        0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
        0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
        0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
        0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
        0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
        -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
        0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
        0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
        0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
        0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
        0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
        0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
        0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
        0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
        0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
        0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
        0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
        0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
        0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
        0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
        0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
        0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
        0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
        0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
        0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
        0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
        0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
        0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
        0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
        0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
        0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
        0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
        0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
        -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
        -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
        -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
        -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
        -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
        -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
        -0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
        -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
        -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
        -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
        -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
        -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
        -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
        -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
        -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
        -0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
        -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
        -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
        -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
        -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
        -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
        -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
        -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
        -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
        0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
        -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
        -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
        -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
        -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
        -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
        -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
        -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
        -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
        -0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
        -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
        -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
        -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
        -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
        -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
        -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
        -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
        -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
        -0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
        -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
        -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
        -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
        -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
        -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
        -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
        -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
        -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
        0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
        -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
        -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
        -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
        -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
        0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
        0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
        0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
        -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
        -0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
        -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
        -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
        0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
        0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
        0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
        0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
        0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
        0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
        0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
        0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
        0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
        0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
        0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
        0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
        -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
        0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
        -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
        0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
        -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
        0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
        0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
        0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
        0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
        0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
        0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
        0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
        0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
        0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
        0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
        0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
        1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
        0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
        0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
        1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
        0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
        0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
        0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
        0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
        0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
        0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
        0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
        0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
        0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
        0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
        0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
        0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
        0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
        -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
        0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
        -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
        0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
        -0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
        -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
        -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
        0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
        0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
        0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
        0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
        0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
        0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
        0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
        0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
        0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
        0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
        0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
        0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
        0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
        0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
        0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
        0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
        -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
        -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
        -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
        -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
        -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
        -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
        -0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
        -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
        -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
        -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
        -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
        -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
        -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
        -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        -0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
        -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
        -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
        -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
        -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
        -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
        -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
        -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
        -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
        -0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
        -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
        -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
        -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
        -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
        -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
        -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
        -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
        -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
        -0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
        -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
        -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
        -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
        -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
        -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
        -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
        -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        -0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
        -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
        -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
        -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
        -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
        -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
        -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
        -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
        -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
        -0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
        -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
        -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
        0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
        0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
        0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
        0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
        0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
        0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
        0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
        0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
        0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
        0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
        0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
        0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
        0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
        0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
        0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
        0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
        0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
        0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
        -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
        0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
        -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
        0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
        -0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
        -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
        -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
        0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
        0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
        0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
        0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
        0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
        0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
        0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
        0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
        0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
        0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
        0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
        0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
        0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
        0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
        0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
        0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
        0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
        0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
        0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
        0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
        0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
        0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
        0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
        0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
        0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
        0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
        0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
        -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
        -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
        -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
        0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
        0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
        0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
        0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
        -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
        -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
        -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
        -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
        -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
        -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
        -0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
        -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
        -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
        -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
        -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
        -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
        -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
        -0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
        -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
        -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
        -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
        -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
        -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
        -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
        -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
        -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
        -0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
        -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
        -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
        -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
        -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
        -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
        -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
        -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
        -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
        -0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
        -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
        -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
        -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
        -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
        -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
        -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
        -0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
        -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
        -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
        -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
        -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
        -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
        -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
        -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
        -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
        -0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
        -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
        -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
        -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
        0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
        -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
        0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
        -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
        0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
        0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
        0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
        0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
        0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
        -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
        -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
        -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
        -0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
        -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
        -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
        0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
        0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
        0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
        0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
        0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
        0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
        0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
        0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
        0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
        0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
        0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
        0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
        0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
        0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
        0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
        0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
        0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
        0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
        0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
        0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
        0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
        0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
        0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
        0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
        0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
        0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
        0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
        0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
        0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
        0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
        0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
        0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
        0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
        0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
        0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
        0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
        0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
        0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
        0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
        0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
        0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
        0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
        0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
        0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
        0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
        0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
        0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
        0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
        0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
        0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
        0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
        0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
        -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
        -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
        -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
        -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
        -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
        -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
        -0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
        -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
        -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
        -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
        -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
        -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
        0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
        0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
        -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
        0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
        -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
        0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
        0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
        -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
        0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
        -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
        0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
        -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
        0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
        0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
        0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
        -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
        -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
        -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
        -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
        -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
        -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
        -0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
        -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
        -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
        -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
        -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
        -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
        -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
        -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
        -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
        0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
        -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
        -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
        -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
        -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
        -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
        -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
        -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
        -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
        -0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
        -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
        -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
        -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
        -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
        0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
        0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
        0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
        -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
        0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
        0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
        0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
        0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
        -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
        0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
        -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
        -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
        -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
        0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
        0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
        -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
        -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
        -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
        -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
        -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
        -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
        -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
        -0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
        -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
        -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
        0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
        0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
        0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
        0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
        0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
        0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
        0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
        0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
        0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
        0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
        0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
        0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
        0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
        0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
        0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
        0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
        0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
        0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
        0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
        0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
        0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
        0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
        0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
        0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
        0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
        0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
        0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
        0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
        0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
        0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
        0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
        0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
        0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
        0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
        0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
        0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
        -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
        -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
        -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
        0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
        -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
        -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
        -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
        -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
        -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
        -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
        -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
        -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
        -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
        -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
        -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
        -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
        -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
        -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
        0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
        -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
        -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
        -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
        -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
        -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
        -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
        -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
        -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
        0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
        0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
        0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
        0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
        0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
        0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
        0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
        0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
        0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
        0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
        0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
        0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
        0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
        0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
        0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
        0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
        0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
        -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
        -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
        -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
        -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
        -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
        -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
        -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
        -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
        -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
        -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
        -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
        -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
        -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
        -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
        -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
        -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
        -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
        -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
        0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
        -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
        -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
        0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
        0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
        0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
        0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
        0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
        0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
        0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
        0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
        0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
        0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
        0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
        0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
        0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
        0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
        -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
        -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
        -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
        -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
        -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
        -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
        -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
        -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
        -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
        -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
        -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
        -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
        -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
        -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
        -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
        -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
        0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
        0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
        0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
        0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
        0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
        0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
        0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
        0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
        0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
        1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
        0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
        0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
        1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
        0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
        0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
        0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
        0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
        0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
        0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
        0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
        0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
        0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
        -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
        0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
        0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
        -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
        -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
        -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
        -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
        -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
        -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
        -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
        -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
        -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
        -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
        -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
        -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
        -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
        -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
        -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
        -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
        -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
        -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
        0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
        0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
        0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
        0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
        0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
        0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
        0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
        0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
        0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
        -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
        0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
        0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
        0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
        0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
        0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
        0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
        0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
        0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
        
    ]);
    
    this.vboVerts = 960;							// # of vertices held in 'vboContents' array;
    this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
                                  // bytes req'd by 1 vboContents array element;
                                  // (why? used to compute stride and offset 
                                  // in bytes for vertexAttribPointer() calls)
    this.vboBytes = this.vboContents.length * this.FSIZE;               
                                  // (#  of floats in vboContents array) * 
                                  // (# of bytes/float).
    this.vboStride = this.vboBytes / this.vboVerts;     
                                  // From any attrib in a given vertex, 
                                  // move forward by 'vboStride' bytes to arrive 
                                  // at the same attrib for the next vertex. 
                                  // (== # of bytes used to store one vertex) 
                                  
                //----------------------Attribute sizes
    this.vboFcount_a_Pos1 = 4;  // # of floats in the VBO needed to store the
                                  // attribute named a_Position (4: x,y,z,w values)
    this.vboFcount_a_Norm = 3;
    console.assert((this.vboFcount_a_Pos1 +     // check the size of each and
    this.vboFcount_a_Norm) *   // every attribute in our VBO
    this.FSIZE == this.vboStride, // for agreeement with'stride'
    "Uh oh! VBObox2.vboStride disagrees with attribute-size values!");
    
    //----------------------Attribute offsets
    this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
                      // of 1st a_Pos1 attrib value in vboContents[]
    this.vboOffset_a_Norm = (this.vboFcount_a_Pos1) * this.FSIZE;  
                      // == 4 floats * bytes/float
                      //# of bytes from START of vbo to the START
                      // of 1st a_Norm attrib value in vboContents[]
    // this.vboOffset_a_PtSiz1 =(this.vboFcount_a_Pos1 +
    //                           this.vboFcount_a_Norm) * this.FSIZE; 
                      // == 7 floats * bytes/float
                      // # of bytes from START of vbo to the START
                      // of 1st a_PtSize attrib value in vboContents[]

    //-----------------------GPU memory locations:                                
    this.vboLoc;									// GPU Location for Vertex Buffer Object, 
                      // returned by gl.createBuffer() function call
    this.shaderLoc;								// GPU Location for compiled Shader-program  
                      // set by compile/link of VERT_SRC and FRAG_SRC.
                //------Attribute locations in our shaders:
    this.a_Pos1Loc;							  // GPU location: shader 'a_Pos1' attribute
    this.a_NormLoc;							// GPU location: shader 'a_Norm' attribute
    // this.a_PtSiz1Loc;							// GPU location: shader 'a_PtSiz1' attribute

    //---------------------- Uniform locations &values in our shaders
    this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
    this.NormalMatrix = new Matrix4();
    this.MvpMatrix = new Matrix4();



    this.u_ModelMatrixLoc;	
  };
  
  
  VBObox2.prototype.init = function() {
  //=============================================================================
  // Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
  // kept in this VBObox. (This function usually called only once, within main()).
  // Specifically:
  // a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
  //  executable 'program' stored and ready to use inside the GPU.  
  // b) create a new VBO object in GPU memory and fill it by transferring in all
  //  the vertex data held in our Float32array member 'VBOcontents'. 
  // c) Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
  // 
  // CAREFUL!  before you can draw pictures using this VBObox contents, 
  //  you must call this VBObox object's switchToMe() function too!
  
    // a) Compile,link,upload shaders---------------------------------------------
    this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
    if (!this.shaderLoc) {
      console.log(this.constructor.name + 
                  '.init() failed to create executable Shaders on the GPU. Bye!');
      return;
    }
    // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
    //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}
  
    gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())
  
    // b) Create VBO on GPU, fill it----------------------------------------------
    this.vboLoc = gl.createBuffer();	
    if (!this.vboLoc) {
      console.log(this.constructor.name + 
                  '.init() failed to create VBO in GPU. Bye!'); 
      return;
    }
    // Specify the purpose of our newly-created VBO.  Your choices are:
    //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
    // (positions, colors, normals, etc), or 
    //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
    // that each select one vertex from a vertex array stored in another VBO.
    gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
                    this.vboLoc);				// the ID# the GPU uses for this buffer.
  
    // Fill the GPU's newly-created VBO object with the vertex data we stored in
    //  our 'vboContents' member (JavaScript Float32Array object).
    //  (Recall gl.bufferData() will evoke GPU's memory allocation & managemt: use 
    //		gl.bufferSubData() to modify VBO contents without changing VBO size)
    gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
                      this.vboContents, 		// JavaScript Float32Array
                     gl.STATIC_DRAW);			// Usage hint.
                     this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Pos1');
                     if(this.a_Pos1Loc < 0) {
                       console.log(this.constructor.name + 
                                   '.init() Failed to get GPU location of attribute a_Pos1');
                       return -1;	// error exit.
                     }
                      this.a_NormLoc = gl.getAttribLocation(this.shaderLoc, 'a_Norm');
                     if(this.a_NormLoc < 0) {
                       console.log(this.constructor.name + 
                                   '.init() failed to get the GPU location of attribute a_Norm');
                       return -1;	// error exit.
                     }
                     // this.a_PtSiz1Loc = gl.getAttribLocation(this.shaderLoc, 'a_PtSiz1');
                     // if(this.a_PtSiz1Loc < 0) {
                     //   console.log(this.constructor.name + 
                     //     					'.init() failed to get the GPU location of attribute a_PtSiz1');
                     //   return -1;	// error exit.
                     // }
                     // c2) Find All Uniforms:-----------------------------------------------------
                     //Get GPU storage location for each uniform var used in our shader programs: 
                     this.u_NormalMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_NormalMatrix');
                     this.u_MvpMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');
                     this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
                 
                     
                     this.u_KdLoc = gl.getUniformLocation(this.shaderLoc, 'u_Kd');
                     this.u_KaLoc = gl.getUniformLocation(this.shaderLoc, 'u_Ka');
                     this.u_KsLoc = gl.getUniformLocation(this.shaderLoc, 'u_Ks');
                     this.u_KeLoc = gl.getUniformLocation(this.shaderLoc, 'u_Ke');
                     this.u_IaLoc = gl.getUniformLocation(this.shaderLoc, 'u_Ia');
                     this.u_IsLoc = gl.getUniformLocation(this.shaderLoc, 'u_Is');
                     this.u_IdLoc = gl.getUniformLocation(this.shaderLoc, 'u_Id');
                     
                     this.u_VLoc = gl.getUniformLocation(this.shaderLoc, 'u_V');
                     this.u_shinyLoc = gl.getUniformLocation(this.shaderLoc, 'u_shiny');

                     this.u_lightPosLoc = gl.getUniformLocation(this.shaderLoc, 'u_lightPos');
                 
                     this.u_isBlinnLoc = gl.getUniformLocation(this.shaderLoc, 'u_isBlinn');
                 
                     if (!this.u_isBlinnLoc) { 
                       console.log(this.constructor.name + 
                                   '.init() failed to get GPU location for u_isBlinn uniform');
                       return;
                     }

                     if (!this.u_lightPosLoc) { 
                      console.log(this.constructor.name + 
                                  '.init() failed to get GPU location for u_lightPos uniform');
                      return;
                    }
                 
                     if (!this.u_KdLoc || !this.u_IaLoc) { 
                       console.log(this.constructor.name + 
                                   '.init() failed to get GPU location for u_Kd and u_Ia uniforms');
                       return;
                     }
                 
                     if (!this.u_VLoc || !this.u_shinyLoc) { 
                       console.log(this.constructor.name + 
                                   '.init() failed to get GPU location for u_V and u_shiny uniforms');
                       return;
                     }
                 
                     if (!this.u_ModelMatrixLoc) { 
                       console.log(this.constructor.name + 
                                   '.init() failed to get GPU location for u_ModelMatrix uniform');
                       return;
                     }
                     if (!this.u_NormalMatrixLoc) { 
                       console.log(this.constructor.name + 
                                   '.init() failed to get GPU location for u_NormalMatrix uniform');
                       return;
                     }
                     if (!this.u_MvpMatrixLoc) { 
                       console.log(this.constructor.name + 
                                   '.init() failed to get GPU location for u_MvpMatrix uniform');
                       return;
                     } 
  }
  
  VBObox2.prototype.switchToMe = function() {
  //==============================================================================
  // Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
  //
  // We only do this AFTER we called the init() function, which does the one-time-
  // only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
  // even then, you are STILL not ready to draw our VBObox's contents onscreen!
  // We must also first complete these steps:
  //  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
  //  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
  //  c) tell the GPU to connect the shader program's attributes to that VBO.
  
  // a) select our shader program:
    gl.useProgram(this.shaderLoc);
  //		Each call to useProgram() selects a shader program from the GPU memory,
  // but that's all -- it does nothing else!  Any previously used shader program's 
  // connections to attributes and uniforms are now invalid, and thus we must now
  // establish new connections between our shader program's attributes and the VBO
  // we wish to use.  
    
  // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
  //  instead connect to our own already-created-&-filled VBO.  This new VBO can 
  //    supply values to use as attributes in our newly-selected shader program:
    gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
                      this.vboLoc);			// the ID# the GPU uses for our VBO.
  
  // c) connect our newly-bound VBO to supply attribute variable values for each
  // vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
  // this sets up data paths from VBO to our shader units:
    // 	Here's how to use the almost-identical OpenGL version of this function:
    //		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
    gl.vertexAttribPointer(
      this.a_Pos1Loc,//index == ID# for the attribute var in GLSL shader pgm;
      this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
      gl.FLOAT,		  // type == what data type did we use for those numbers?
      false,				// isNormalized == are these fixed-point values that we need
                    //									normalize before use? true or false
      this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
                    // stored attrib for this vertex to the same stored attrib
                    //  for the next vertex in our VBO.  This is usually the 
                    // number of bytes used to store one complete vertex.  If set 
                    // to zero, the GPU gets attribute values sequentially from 
                    // VBO, starting at 'Offset'.	 (Our vertex size in bytes: 
                    // 4 floats for Position + 3 for Color + 1 for PtSize = 8).
      this.vboOffset_a_Pos1);	
                    // Offset == how many bytes from START of buffer to the first
                    // value we will actually use?  (We start with a_Position).
    gl.vertexAttribPointer(this.a_NormLoc, this.vboFcount_a_Norm, 
                gl.FLOAT, false, 
                this.vboStride, this.vboOffset_a_Norm);
    // gl.vertexAttribPointer(this.a_PtSizeLoc, this.vboFcount_a_PtSize, 
    //             gl.FLOAT, false, 
    //             this.vboStride, this.vboOffset_a_PtSize);
  // --Enable this assignment of each of these attributes to its' VBO source:
    gl.enableVertexAttribArray(this.a_Pos1Loc);
    gl.enableVertexAttribArray(this.a_NormLoc);
    // gl.enableVertexAttribArray(this.a_PtSizeLoc);
  }
  
  VBObox2.prototype.isReady = function() {
  //==============================================================================
  // Returns 'true' if our WebGL rendering context ('gl') is ready to render using
  // this objects VBO and shader program; else return false.
  // see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter
  
  var isOK = true;
    if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
      console.log(this.constructor.name + 
                  '.isReady() false: shader program at this.shaderLoc not in use!');
      isOK = false;
    }
    if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
        console.log(this.constructor.name + 
                '.isReady() false: vbo at this.vboLoc not in use!');
      isOK = false;
    }
    return isOK;
  }
  
  VBObox2.prototype.adjust = function() {
  //=============================================================================
  // Update the GPU to newer, current values we now store for 'uniform' vars on 
  // the GPU; and (if needed) update the VBO's contents, and (if needed) each 
  // attribute's stride and offset in VBO.
  
    // check: was WebGL context set to use our VBO & shader program?
    if(this.isReady()==false) {
          console.log('ERROR! before' + this.constructor.name + 
                '.adjust() call you needed to call this.switchToMe()!!');
    }
  
    // Adjust values for our uniforms;-------------------------------------------
    this.ModelMatrix.setIdentity();
    // this.ModelMatrix.translate(1.0, -2.0, 0);
    this.ModelMatrix.rotate(g_angleNow0, 0, 0, 1);
    this.NormalMatrix.setIdentity();
    this.NormalMatrix.setInverseOf(this.ModelMatrix);
    this.NormalMatrix.transpose();
    this.MvpMatrix.set(g_worldMat);
    this.MvpMatrix.concat(this.ModelMatrix);
    
    // this.MvpMatrix.setIdentity();
  // THIS DOESN'T WORK!!  this.ModelMatrix = g_worldMat;
    // this.ModelMatrix.set(g_worldMat);
  
  //  this.ModelMatrix.rotate(g_angleNow1, 0, 0, 1);	// -spin drawing axes,
    // this.ModelMatrix.translate(1.0, -2.0, 0);						// then translate them.
    //  Transfer new uniforms' values to the GPU:-------------
    // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
    // gl.uniform4f(this.u_eyePosWorld, 6,0,0,1);
    
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                        false, 										// use matrix transpose instead?
                        this.ModelMatrix.elements);	// send data from Javascript.
  
    gl.uniformMatrix4fv(this.u_NormalMatrixLoc,	// GPU location of the uniform
                        false, 										// use matrix transpose instead?
                        this.NormalMatrix.elements);	// send data from Javascript.
  
    gl.uniformMatrix4fv(this.u_MvpMatrixLoc,	// GPU location of the uniform
                        false, 										// use matrix transpose instead?
                        this.MvpMatrix.elements);	// send data from Javascript.

    /*uniform vec3 u_Kd;
    uniform vec3 u_Ka;
    uniform vec3 u_Ks;
    uniform vec3 u_Ia;
    uniform vec3 u_Id;
    uniform vec3 u_Is;
    uniform vec3 u_Ke;
    uniform vec3 u_V;
    uniform float u_shiny; */ 

    gl.uniform3f(this.u_KdLoc, 0.4, 0.4, 0.4);
    gl.uniform3f(this.u_KaLoc, 0.2, 0.2, 0.2);
    gl.uniform3f(this.u_KsLoc, 0.9, 0.9, 0.9);
    gl.uniform3f(this.u_KeLoc, 0.0, 0.0, 0.0);
    gl.uniform3f(this.u_IdLoc, userIdR, userIdG, userIdB);
    gl.uniform3f(this.u_IaLoc, userIaR, userIaG, userIaB);
    gl.uniform3f(this.u_IsLoc, userIsR, userIsG, userIsB);
    gl.uniform3f(this.u_VLoc, g_EyeX, g_EyeY, g_EyeZ);
    gl.uniform1f(this.u_shinyLoc, 7);
    gl.uniform1f(this.u_isBlinnLoc, isBlinnButton);
    gl.uniform3f(this.u_lightPosLoc, userLightx, userLighty, userLightz);
  }
  
  VBObox2.prototype.draw = function() {
  //=============================================================================
  // Render current VBObox contents.
    // check: was WebGL context set to use our VBO & shader program?
    if(this.isReady()==false) {
          console.log('ERROR! before' + this.constructor.name + 
                '.draw() call you needed to call this.switchToMe()!!');
    }
    
    // ----------------------------Draw the contents of the currently-bound VBO:
    gl.drawArrays(gl.TRIANGLES, 		    // select the drawing primitive to draw,
                    // choices: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
                    //          gl.TRIANGLES, gl.TRIANGLE_STRIP, ...
                  0, 								// location of 1st vertex to draw;
                  this.vboVerts);		// number of vertices to draw on-screen.
  
    // gl.drawElements(gl.TRIANGLES, this.vboVerts, gl.UNSIGNED_SHORT, 0);
  
  }
  
  VBObox2.prototype.reload = function() {
  //=============================================================================
  // Over-write current values in the GPU for our already-created VBO: use 
  // gl.bufferSubData() call to re-transfer some or all of our Float32Array 
  // 'vboContents' to our VBO, but without changing any GPU memory allocations.
                          
   gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                    0,                  // byte offset to where data replacement
                                        // begins in the VBO.
                      this.vboContents);   // the JS source-data array used to fill VBO
        
  }
  /*
  VBObox2.prototype.empty = function() {
  //=============================================================================
  // Remove/release all GPU resources used by this VBObox object, including any 
  // shader programs, attributes, uniforms, textures, samplers or other claims on 
  // GPU memory.  However, make sure this step is reversible by a call to 
  // 'restoreMe()': be sure to retain all our Float32Array data, all values for 
  // uniforms, all stride and offset values, etc.
  //
  //
  // 		********   YOU WRITE THIS! ********
  //
  //
  //
  }
  
  VBObox2.prototype.restore = function() {
  //=============================================================================
  // Replace/restore all GPU resources used by this VBObox object, including any 
  // shader programs, attributes, uniforms, textures, samplers or other claims on 
  // GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
  // all stride and offset values, etc.
  //
  //
  // 		********   YOU WRITE THIS! ********
  //
  //
  //
  }
  */
  
  //=============================================================================
  //=============================================================================
  //=============================================================================