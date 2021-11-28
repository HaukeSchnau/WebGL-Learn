import Transform from "../core/Transform";
import Material from "./Material";
import { currentRenderingEngine } from "./RenderingEngine";
import Shader from "./Shader";
import { Texture } from "./Texture";

export default class ForwardAmbient extends Shader {
  private static _instance: ForwardAmbient;

  private constructor() {
    super(
      "forward-ambient",
      ["position", "texCoord", "normal"],
      ["MVP", "ambientIntensity"]
    );
  }

  updateUniforms(transform: Transform, material: Material) {
    const worldMatrix = transform.getTransformation();
    const projectedMatrix = currentRenderingEngine.mainCamera
      .getViewProjection()
      .mul(worldMatrix);

    const texture = material.attributes.get("diffuse");
    if (texture instanceof Texture) texture.bind();
    else currentRenderingEngine.unbindTextures();

    this.setUniform("MVP", projectedMatrix);
    this.setUniform("ambientIntensity", currentRenderingEngine.ambientLight);
  }

  static get instance() {
    if (!ForwardAmbient._instance) {
      ForwardAmbient._instance = new ForwardAmbient();
    }

    return ForwardAmbient._instance;
  }
}
