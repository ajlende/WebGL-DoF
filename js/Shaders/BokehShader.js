/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 */

THREE.BokehShader = {

	shapes: {

		"CIRCLE": 0,
		"TRIANGLE": 1,
		"PENTAGON": 2,
		"STAR": 3

	},

	uniforms: {

		"tColor":   { type: "t", value: null },
		"tDepth":   { type: "t", value: null },
		"focus":    { type: "f", value: 1.0 },
		"aspect":   { type: "f", value: 1.0 },
		"aperture": { type: "f", value: 0.025 },
		"maxblur":  { type: "f", value: 1.0 },
		"shape":    { type: "i", value: 0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"varying vec2 vUv;",

		"uniform sampler2D tColor;",
		"uniform sampler2D tDepth;",

		"uniform float maxblur;",  // max blur amount
		"uniform float aperture;", // aperture - bigger values for shallower depth of field

		"uniform float focus;",
		"uniform float aspect;",

		"uniform int shape;", // integer representing the shapes above

		"void main() {",

			"vec2 aspectcorrect = vec2( 1.0, aspect );",

			"vec4 depth1 = texture2D( tDepth, vUv );",

			"float factor = depth1.x - focus;",

			"vec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );",

			"vec2 dofblur9 = dofblur * 0.9;",
			"vec2 dofblur7 = dofblur * 0.7;",
			"vec2 dofblur4 = dofblur * 0.4;",

			"vec4 col = vec4( 0.0 );",

			// Start with the base image
			"col += texture2D( tColor, vUv.xy );",

			// Triangle
			"if ( shape == 1 ) {",

				// Corners 1 100%
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.5  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.43, -0.25 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.43, -0.25 ) * aspectcorrect ) * dofblur );",

				// Midpoints 4 100%
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.22,  0.13 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.25 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.22,  0.13 ) * aspectcorrect ) * dofblur );",

				// 3 100%
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.06,  0.31 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.32, -0.06 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.22, -0.25 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.22, -0.25 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.32, -0.06 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.11,  0.31 ) * aspectcorrect ) * dofblur );",

				// 4 90%
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.22,  0.13 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.25 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.22,  0.13 ) * aspectcorrect ) * dofblur9 );",

				// 3 90%
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.06,  0.31 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.32, -0.06 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.22, -0.25 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.22, -0.25 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.32, -0.06 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.11,  0.31 ) * aspectcorrect ) * dofblur9 );",

				// 2 90%
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.03,  0.41 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.38, -0.16 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.32, -0.25 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.32, -0.25 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.38, -0.16 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.05,  0.41 ) * aspectcorrect ) * dofblur9 );",

				// 4 70%
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.22,  0.13 ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.25 ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.22,  0.13 ) * aspectcorrect ) * dofblur7 );",

				// 3 70%
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.06,  0.31 ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.32, -0.06 ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.22, -0.25 ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.22, -0.25 ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.32, -0.06 ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.11,  0.31 ) * aspectcorrect ) * dofblur7 );",

				// 4 40%
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.22,  0.13 ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.25 ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.22,  0.13 ) * aspectcorrect ) * dofblur4 );",

				"gl_FragColor = col / 40.0;",

			"}",

			// Pentagon
			"else if ( shape == 2 ) {",

				"col += texture2D( tColor, vUv.xy + ( vec2(  0.48,  0.15  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.00,  0.50  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.48,  0.15  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.40  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.40  ) * aspectcorrect ) * dofblur );",

				"col += texture2D( tColor, vUv.xy + ( vec2(  0.48,  0.15  ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.00,  0.50  ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.48,  0.15  ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.40  ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.40  ) * aspectcorrect ) * dofblur9 );",

				"col += texture2D( tColor, vUv.xy + ( vec2(  0.48,  0.15  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.00,  0.50  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.48,  0.15  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.40  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.40  ) * aspectcorrect ) * dofblur7 );",

				"col += texture2D( tColor, vUv.xy + ( vec2(  0.48,  0.15  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.00,  0.50  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.48,  0.15  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.40  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.40  ) * aspectcorrect ) * dofblur4 );",

				"col += texture2D( tColor, vUv.xy + ( vec2(  0.24,  0.33  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.24,  0.33  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.38, -0.13  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.00, -0.40  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.38, -0.13  ) * aspectcorrect ) * dofblur );",

				"col += texture2D( tColor, vUv.xy + ( vec2(  0.24,  0.33  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.24,  0.33  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.38, -0.13  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.00, -0.40  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.38, -0.13  ) * aspectcorrect ) * dofblur7 );",

				"col += texture2D( tColor, vUv.xy + ( vec2(  0.36,  0.24  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.12,  0.41  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.12,  0.41  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.36,  0.24  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.43,  0.01  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.34, -0.26  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.40  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.40  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.34, -0.26  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.43,  0.01  ) * aspectcorrect ) * dofblur );",

				"gl_FragColor = col / 41.0;",

			"}",

			// Star
			"else if ( shape == 3 ) {",

				"col += texture2D( tColor, vUv.xy + ( vec2(  0.48,  0.15  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.00,  0.50  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.48,  0.15  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.40  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.40  ) * aspectcorrect ) * dofblur );",

				"col += texture2D( tColor, vUv.xy + ( vec2(  0.48,  0.15  ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.00,  0.50  ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.48,  0.15  ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.40  ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.40  ) * aspectcorrect ) * dofblur9 );",

				"col += texture2D( tColor, vUv.xy + ( vec2(  0.24,  0.33  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.24,  0.33  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.38, -0.13  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.00, -0.40  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.38, -0.13  ) * aspectcorrect ) * dofblur4 );",

				"col += texture2D( tColor, vUv.xy + ( vec2(  0.36,  0.24  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.12,  0.41  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.12,  0.41  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.36,  0.24  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.43,  0.01  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.34, -0.26  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.40  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.40  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.34, -0.26  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.43,  0.01  ) * aspectcorrect ) * dofblur7 );",

				"col += texture2D( tColor, vUv.xy + ( vec2(  0.36,  0.24  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.12,  0.41  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.12,  0.41  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.36,  0.24  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.43,  0.01  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.34, -0.26  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.40  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.40  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.34, -0.26  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.43,  0.01  ) * aspectcorrect ) * dofblur4 );",

				"gl_FragColor = col / 36.0;",

			"}",

			// Circle
			"else {",
				// Outer
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur );",

				// 90%
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur9 );",

				// 70%
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur7 );",

				// 40%
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );",
				"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur4 );",

				"gl_FragColor = col / 41.0;",

			"}",

			"gl_FragColor.a = 1.0;",

		"}"

	].join("\n")

};
