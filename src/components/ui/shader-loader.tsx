"use client";

import React from "react";
import dynamic from "next/dynamic";
import p5Types from "p5";

const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
    ssr: false,
});

const vertShader = `
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  varying vec2 vTexCoord;

  void main() {
    vTexCoord = aTexCoord;
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    gl_Position = positionVec4;
  }
`;

const fragShader = `
  precision mediump float;
  varying vec2 vTexCoord;
  uniform float u_time;
  uniform vec2 u_resolution;

  #define PI 3.14159265359

  void main() {
    vec2 uv = vTexCoord * 2.0 - 1.0;
    
    // Time-based transition
    // 0.0 to 3.0 seconds: Loading phase
    // 3.0+ seconds: Evolving phase
    float t = u_time;
    float transition = smoothstep(3.0, 5.0, t);
    
    // --- Phase 1: Simple Rotating Ring ---
    float dist = length(uv);
    float angle = atan(uv.y, uv.x);
    
    // Rotating gap
    float rotation = angle + t * 3.0;
    float ring = smoothstep(0.05, 0.0, abs(dist - 0.4));
    float gap = smoothstep(-0.5, 1.0, sin(rotation));
    float simpleLoader = ring * gap;
    
    // --- Phase 2: Complex Interference Pattern ---
    vec2 uv2 = uv;
    
    // Warp domain based on time
    for(float i = 1.0; i < 4.0; i++){
        uv2.x += 0.1 / i * sin(i * 3.0 * uv2.y + t * 0.5);
        uv2.y += 0.1 / i * cos(i * 3.0 * uv2.x + t * 0.5);
    }
    
    float pattern = sin(uv2.x * 10.0 + t) * sin(uv2.y * 10.0 + t);
    pattern = smoothstep(0.0, 0.1, abs(pattern)); // Make it sharp lines
    pattern = 1.0 - pattern; // Invert for black lines on white (or white on black)
    
    // Radial mask for the pattern to keep it contained initially
    float mask = smoothstep(0.8, 0.0, dist);
    
    // Combine
    float complexLoader = pattern * mask;
    
    // Dramatic expansion effect during transition
    float expansion = smoothstep(3.0, 4.0, t);
    complexLoader *= smoothstep(0.0, 1.0, expansion * 2.0);
    
    // Mix the two states
    // We want black shapes on transparent/white background, or white on black.
    // Let's go with black shapes (alpha = 1) on transparent (alpha = 0).
    
    float finalShape = mix(simpleLoader, complexLoader, transition);
    
    // Add a "glitch" or "data" effect during transition
    if(t > 3.0 && t < 3.5) {
        finalShape += sin(uv.y * 100.0 + t * 20.0) * 0.1;
    }
    
    // Threshold to make it crisp black and white
    float alpha = smoothstep(0.4, 0.6, finalShape);
    
    gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
  }
`;

export const ShaderLoader = () => {
    let theShader: p5Types.Shader;

    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(300, 300, p5.WEBGL).parent(canvasParentRef);
        theShader = p5.createShader(vertShader, fragShader);
    };

    const draw = (p5: p5Types) => {
        if (!theShader) return;

        p5.clear();
        p5.shader(theShader);

        theShader.setUniform("u_resolution", [p5.width, p5.height]);
        theShader.setUniform("u_time", p5.millis() / 1000.0);

        p5.rect(0, 0, p5.width, p5.height);
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <Sketch setup={setup} draw={draw} />
            <p className="mt-4 text-sm text-muted-foreground animate-pulse">
                Synthesizing visual data...
            </p>
        </div>
    );
};
