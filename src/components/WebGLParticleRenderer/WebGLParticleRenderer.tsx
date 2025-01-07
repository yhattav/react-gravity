import React, { useEffect, useRef } from "react";
import { Particle } from "../../types/particle";
import { GravityPoint } from "../../utils/types/physics";

interface ExtendedWebGL2RenderingContext extends WebGL2RenderingContext {
  vaoRefs?: {
    update: WebGLVertexArrayObject;
    render: WebGLVertexArrayObject;
  };
}

// Vertex shader for updating particle physics
const updateVertexShaderSource = `#version 300 es
  in vec2 position;
  in vec2 velocity;
  in float mass;
  
  uniform vec2 gravityPoints[16]; // Support up to 16 gravity points
  uniform float gravityMasses[16];
  uniform int numGravityPoints;
  uniform float deltaTime;
  uniform float friction;
  uniform vec2 screenSize;
  uniform bool solidBoundaries;
  
  out vec2 newPosition;
  out vec2 newVelocity;
  
  const float G = 0.1;
  const float MIN_DISTANCE = 10.0;
  
  vec2 calculateGravitationalForce(vec2 pos, vec2 gravityPos, float gravityMass) {
    vec2 direction = gravityPos - pos;
    float distance = length(direction);
    if (distance < 0.1) return vec2(0.0);
    
    float forceMagnitude = (G * gravityMass) / max(distance * distance, MIN_DISTANCE * MIN_DISTANCE);
    return normalize(direction) * forceMagnitude;
  }
  
  void main() {
    vec2 totalForce = vec2(0.0);
    
    // Calculate gravitational forces from all gravity points
    for (int i = 0; i < numGravityPoints; i++) {
      if (i >= 16) break; // Safety check
      totalForce += calculateGravitationalForce(position, gravityPoints[i], gravityMasses[i]);
    }
    
    // Calculate acceleration (F = ma)
    vec2 acceleration = totalForce / mass;
    
    // Update velocity with friction
    newVelocity = velocity * friction + acceleration * deltaTime;
    
    // Update position
    newPosition = position + newVelocity * deltaTime;
    
    // Handle boundary collisions if enabled
    if (solidBoundaries) {
      vec2 normalizedPos = newPosition / screenSize;
      if (abs(normalizedPos.x) > 1.0) {
        newVelocity.x = -newVelocity.x * 0.8; // Add some energy loss
        newPosition.x = sign(normalizedPos.x) * screenSize.x;
      }
      if (abs(normalizedPos.y) > 1.0) {
        newVelocity.y = -newVelocity.y * 0.8;
        newPosition.y = sign(normalizedPos.y) * screenSize.y;
      }
    }
  }
`;

// Vertex shader for rendering
const renderVertexShaderSource = `#version 300 es
  in vec2 position;
  in vec3 color;
  in float size;
  
  uniform vec2 screenSize;
  
  out vec3 vColor;
  out float vSize;
  
  void main() {
    vec2 normalizedPos = position / screenSize * 2.0 - 1.0;
    gl_Position = vec4(normalizedPos.x, -normalizedPos.y, 0.0, 1.0);
    gl_PointSize = size;
    vColor = color;
    vSize = size;
  }
`;

// Fragment shader for rendering
const fragmentShaderSource = `#version 300 es
  precision mediump float;
  in vec3 vColor;
  in float vSize;
  out vec4 fragColor;
  
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float r = length(coord) * 2.0;
    float alpha = 1.0 - smoothstep(0.8, 1.0, r);
    fragColor = vec4(vColor, alpha);
  }
`;

// Add after the shader declarations
const updateFragmentShaderSource = `#version 300 es
  precision mediump float;
  out vec4 fragColor;
  void main() {
    // Dummy fragment shader - not used for transform feedback
    fragColor = vec4(0.0);
  }
`;

interface WebGLParticleRendererProps {
  particlesRef: React.RefObject<Particle[]>;
  gravityPoints: GravityPoint[];
  isPausedRef: React.RefObject<boolean>;
  width: number;
  height: number;
  physicsConfig: {
    DELTA_TIME: number;
    FRICTION: number;
    SOLID_BOUNDARIES: boolean;
  };
}

export const WebGLParticleRenderer: React.FC<WebGLParticleRendererProps> = ({
  particlesRef,
  gravityPoints,
  isPausedRef,
  width,
  height,
  physicsConfig,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<ExtendedWebGL2RenderingContext | null>(null);
  const programRefs = useRef<{
    update: WebGLProgram | null;
    render: WebGLProgram | null;
  }>({ update: null, render: null });

  // Transform feedback objects
  const transformFeedbackRef = useRef<WebGLTransformFeedback | null>(null);
  const particleBuffersRef = useRef<{
    position: [WebGLBuffer | null, WebGLBuffer | null];
    velocity: [WebGLBuffer | null, WebGLBuffer | null];
    color: WebGLBuffer | null;
    size: WebGLBuffer | null;
    mass: WebGLBuffer | null;
  }>({
    position: [null, null],
    velocity: [null, null],
    color: null,
    size: null,
    mass: null,
  });

  // Track which buffer is current (ping-pong buffers)
  const currentBufferRef = useRef(0);

  // Initialize WebGL context and shaders
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2");
    if (!gl) {
      console.error("WebGL 2 not supported");
      return;
    }
    glRef.current = gl;

    // Create shader programs
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    // Create update program
    const updateVS = createShader(gl.VERTEX_SHADER, updateVertexShaderSource);
    const updateFS = createShader(
      gl.FRAGMENT_SHADER,
      updateFragmentShaderSource
    );
    if (!updateVS || !updateFS) return;

    const updateProgram = gl.createProgram()!;
    gl.attachShader(updateProgram, updateVS);
    gl.attachShader(updateProgram, updateFS);

    // Set up transform feedback varyings BEFORE linking
    gl.transformFeedbackVaryings(
      updateProgram,
      ["newPosition", "newVelocity"],
      gl.SEPARATE_ATTRIBS
    );

    gl.linkProgram(updateProgram);
    if (!gl.getProgramParameter(updateProgram, gl.LINK_STATUS)) {
      console.error(
        "Update program link error:",
        gl.getProgramInfoLog(updateProgram)
      );
      return;
    }

    // Create render program
    const renderVS = createShader(gl.VERTEX_SHADER, renderVertexShaderSource);
    const renderFS = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!renderVS || !renderFS) return;

    const renderProgram = gl.createProgram()!;
    gl.attachShader(renderProgram, renderVS);
    gl.attachShader(renderProgram, renderFS);
    gl.linkProgram(renderProgram);

    if (!gl.getProgramParameter(renderProgram, gl.LINK_STATUS)) {
      console.error(
        "Render program link error:",
        gl.getProgramInfoLog(renderProgram)
      );
      return;
    }

    programRefs.current = { update: updateProgram, render: renderProgram };

    // Create transform feedback object
    const transformFeedback = gl.createTransformFeedback();
    if (!transformFeedback) {
      console.error("Failed to create transform feedback object");
      return;
    }
    transformFeedbackRef.current = transformFeedback;

    // Create and initialize buffers
    const createDoubleBuffer = () => {
      const buffer1 = gl.createBuffer();
      const buffer2 = gl.createBuffer();
      if (!buffer1 || !buffer2) {
        console.error("Failed to create buffer");
        return [null, null] as [WebGLBuffer | null, WebGLBuffer | null];
      }
      return [buffer1, buffer2] as [WebGLBuffer, WebGLBuffer];
    };

    const positionBuffers = createDoubleBuffer();
    const velocityBuffers = createDoubleBuffer();
    const colorBuffer = gl.createBuffer();
    const sizeBuffer = gl.createBuffer();
    const massBuffer = gl.createBuffer();

    if (
      !positionBuffers[0] ||
      !positionBuffers[1] ||
      !velocityBuffers[0] ||
      !velocityBuffers[1] ||
      !colorBuffer ||
      !sizeBuffer ||
      !massBuffer
    ) {
      console.error("Failed to create buffers");
      return;
    }

    particleBuffersRef.current = {
      position: positionBuffers,
      velocity: velocityBuffers,
      color: colorBuffer,
      size: sizeBuffer,
      mass: massBuffer,
    };

    // Initialize buffer data
    const initBuffer = (buffer: WebGLBuffer, data: Float32Array) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    };

    // Initialize with empty data for now
    const emptyData = new Float32Array(1000); // Pre-allocate space for up to 500 particles
    initBuffer(positionBuffers[0], emptyData);
    initBuffer(positionBuffers[1], emptyData);
    initBuffer(velocityBuffers[0], emptyData);
    initBuffer(velocityBuffers[1], emptyData);
    initBuffer(colorBuffer, emptyData);
    initBuffer(sizeBuffer, emptyData);
    initBuffer(massBuffer, emptyData);

    // Set up vertex array objects (VAOs)
    const updateVAO = gl.createVertexArray();
    const renderVAO = gl.createVertexArray();
    if (!updateVAO || !renderVAO) {
      console.error("Failed to create VAOs");
      return;
    }

    // Set up update VAO
    gl.bindVertexArray(updateVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffers[0]);
    const positionLoc = gl.getAttribLocation(updateProgram, "position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, velocityBuffers[0]);
    const velocityLoc = gl.getAttribLocation(updateProgram, "velocity");
    gl.enableVertexAttribArray(velocityLoc);
    gl.vertexAttribPointer(velocityLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, massBuffer);
    const massLoc = gl.getAttribLocation(updateProgram, "mass");
    gl.enableVertexAttribArray(massLoc);
    gl.vertexAttribPointer(massLoc, 1, gl.FLOAT, false, 0, 0);

    // Set up render VAO
    gl.bindVertexArray(renderVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffers[0]);
    const renderPosLoc = gl.getAttribLocation(renderProgram, "position");
    gl.enableVertexAttribArray(renderPosLoc);
    gl.vertexAttribPointer(renderPosLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    const colorLoc = gl.getAttribLocation(renderProgram, "color");
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    const sizeLoc = gl.getAttribLocation(renderProgram, "size");
    gl.enableVertexAttribArray(sizeLoc);
    gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);

    // Store VAOs for later use
    const vaos = { update: updateVAO, render: renderVAO };
    (gl as ExtendedWebGL2RenderingContext).vaoRefs = vaos;

    // Enable blending for particle transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return () => {
      gl.deleteVertexArray(updateVAO);
      gl.deleteVertexArray(renderVAO);
      gl.deleteProgram(updateProgram);
      gl.deleteProgram(renderProgram);
      gl.deleteShader(updateVS);
      gl.deleteShader(renderVS);
      gl.deleteShader(renderFS);

      Object.values(particleBuffersRef.current)
        .flat()
        .forEach((buffer) => {
          if (buffer) gl.deleteBuffer(buffer);
        });

      if (transformFeedbackRef.current) {
        gl.deleteTransformFeedback(transformFeedbackRef.current);
      }
    };
  }, []);

  // Update and render particles
  useEffect(() => {
    const gl = glRef.current;
    const programs = programRefs.current;
    if (!gl || !programs.update || !programs.render || !gl.vaoRefs) return;

    let animationFrameId: number;

    const render = () => {
      const particles = particlesRef.current;
      if (!particles || isPausedRef.current) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Update particle data
      const updateBufferData = () => {
        const positions = new Float32Array(
          particles.flatMap((p) => [p.position.x, p.position.y])
        );
        const velocities = new Float32Array(
          particles.flatMap((p) => [p.velocity.x, p.velocity.y])
        );
        const colors = new Float32Array(
          particles.flatMap((p) => {
            const color = p.color || "#BADA55";
            return [
              parseInt(color.slice(1, 3), 16) / 255,
              parseInt(color.slice(3, 5), 16) / 255,
              parseInt(color.slice(5, 7), 16) / 255,
            ];
          })
        );
        const sizes = new Float32Array(particles.map((p) => p.size || 10));
        const masses = new Float32Array(particles.map((p) => p.mass));

        gl.bindBuffer(
          gl.ARRAY_BUFFER,
          particleBuffersRef.current.position[currentBufferRef.current]!
        );
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
        gl.bindBuffer(
          gl.ARRAY_BUFFER,
          particleBuffersRef.current.velocity[currentBufferRef.current]!
        );
        gl.bufferData(gl.ARRAY_BUFFER, velocities, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffersRef.current.color!);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffersRef.current.size!);
        gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffersRef.current.mass!);
        gl.bufferData(gl.ARRAY_BUFFER, masses, gl.DYNAMIC_DRAW);
      };

      updateBufferData();

      // Physics update phase
      if (!programs.update || !gl.vaoRefs) return;
      gl.useProgram(programs.update);
      gl.bindVertexArray(gl.vaoRefs.update);

      // Set uniforms
      const deltaTimeLoc = gl.getUniformLocation(programs.update, "deltaTime");
      const frictionLoc = gl.getUniformLocation(programs.update, "friction");
      const screenSizeLoc = gl.getUniformLocation(
        programs.update,
        "screenSize"
      );
      const solidBoundariesLoc = gl.getUniformLocation(
        programs.update,
        "solidBoundaries"
      );
      const gravityPointsLoc = gl.getUniformLocation(
        programs.update,
        "gravityPoints"
      );
      const gravityMassesLoc = gl.getUniformLocation(
        programs.update,
        "gravityMasses"
      );
      const numGravityPointsLoc = gl.getUniformLocation(
        programs.update,
        "numGravityPoints"
      );

      if (
        !deltaTimeLoc ||
        !frictionLoc ||
        !screenSizeLoc ||
        !solidBoundariesLoc ||
        !gravityPointsLoc ||
        !gravityMassesLoc ||
        !numGravityPointsLoc
      ) {
        console.error("Failed to get uniform locations");
        return;
      }

      gl.uniform1f(deltaTimeLoc, physicsConfig.DELTA_TIME);
      gl.uniform1f(frictionLoc, physicsConfig.FRICTION);
      gl.uniform2f(screenSizeLoc, width, height);
      gl.uniform1i(solidBoundariesLoc, physicsConfig.SOLID_BOUNDARIES ? 1 : 0);

      const gravityPositions = new Float32Array(
        gravityPoints.flatMap((p) => [p.position.x, p.position.y])
      );
      const gravityMasses = new Float32Array(gravityPoints.map((p) => p.mass));
      gl.uniform2fv(gravityPointsLoc, gravityPositions);
      gl.uniform1fv(gravityMassesLoc, gravityMasses);
      gl.uniform1i(numGravityPointsLoc, gravityPoints.length);

      // Transform feedback
      gl.bindTransformFeedback(
        gl.TRANSFORM_FEEDBACK,
        transformFeedbackRef.current
      );
      gl.bindBufferBase(
        gl.TRANSFORM_FEEDBACK_BUFFER,
        0,
        particleBuffersRef.current.position[1 - currentBufferRef.current]!
      );
      gl.bindBufferBase(
        gl.TRANSFORM_FEEDBACK_BUFFER,
        1,
        particleBuffersRef.current.velocity[1 - currentBufferRef.current]!
      );

      gl.enable(gl.RASTERIZER_DISCARD);
      gl.beginTransformFeedback(gl.POINTS);
      gl.drawArrays(gl.POINTS, 0, particles.length);
      gl.endTransformFeedback();
      gl.disable(gl.RASTERIZER_DISCARD);

      gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);

      // Render phase
      if (!programs.render || !gl.vaoRefs) return;
      gl.useProgram(programs.render);
      gl.bindVertexArray(gl.vaoRefs.render);
      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const renderScreenSizeLoc = gl.getUniformLocation(
        programs.render,
        "screenSize"
      );
      if (!renderScreenSizeLoc) {
        console.error("Failed to get render uniform locations");
        return;
      }
      gl.uniform2f(renderScreenSizeLoc, width, height);
      gl.drawArrays(gl.POINTS, 0, particles.length);

      // Swap buffers
      currentBufferRef.current = 1 - currentBufferRef.current;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [width, height, physicsConfig, gravityPoints]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0 }}
    />
  );
};

export default WebGLParticleRenderer;
