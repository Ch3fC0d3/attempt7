// Copyright 2018 The Immersive Web Community Group
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import {Material} from './material.js';
import {Node} from './node.js';
import {Primitive, PrimitiveAttribute} from './primitive.js';

export class Mesh extends Node {
  constructor(gl, options = {}) {
    super();

    this.gl = gl;
    this.primitives = [];
    this.material = options.material || new Material();

    if (options.vertices) {
      // Create a single primitive with the vertices and indices provided
      let primitiveOptions = {
        attributes: [
          new PrimitiveAttribute('POSITION', options.vertices, 3)
        ]
      };

      if (options.normals) {
        primitiveOptions.attributes.push(
          new PrimitiveAttribute('NORMAL', options.normals, 3)
        );
      }

      if (options.texcoords) {
        primitiveOptions.attributes.push(
          new PrimitiveAttribute('TEXCOORD_0', options.texcoords, 2)
        );
      }

      if (options.indices) {
        primitiveOptions.indices = options.indices;
      }

      this.primitives.push(new Primitive(gl, primitiveOptions));
    }
  }

  draw(renderPrimitive) {
    if (!this.visible) return;

    for (let primitive of this.primitives) {
      renderPrimitive.draw(primitive, this.material);
    }
  }
}
