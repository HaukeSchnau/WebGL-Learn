import Transform from "../engine/core/Transform";
import Matrix4 from "../engine/math/Matrix4";
import Vector3 from "../engine/math/Vector3";
import Attenuation from "../engine/rendering/Attenuation";
import BaseLight from "../engine/rendering/BaseLight";
import DirectionalLight from "../engine/rendering/DirectionalLight";
import { unbindTextures } from "../engine/rendering/GraphicsUtil";
import Material from "../engine/rendering/Material";
import PointLight from "../engine/rendering/PointLight";
import Shader from "../engine/rendering/Shader";
import SpotLight from "../engine/rendering/SpotLight";

export default class PhongShader extends Shader {
  private static _instance: PhongShader;

  private static readonly MAX_POINT_LIGHTS = 4;
  private static readonly MAX_SPOT_LIGHTS = 4;

  ambientLight = new Vector3(0, 0, 0);
  directionalLight = new DirectionalLight(
    new BaseLight(new Vector3(1, 1, 1), 0),
    new Vector3(0, 0, 0)
  );
  pointLights: PointLight[] = [];
  spotLights: SpotLight[] = [];

  private constructor() {
    super(
      "phongShader",
      ["position", "texCoord", "normal"],
      [
        "transform",
        "transformProjected",
        "baseColor",
        "ambientLight",

        "directionalLight.base.color",
        "directionalLight.base.intensity",
        "directionalLight.direction",

        "specularIntensity",
        "specularPower",
        "eyePos",
      ]
    );

    for(let i = 0; i < PhongShader.MAX_POINT_LIGHTS; i++) {
      this.addUniform("pointLights[" + i + "].base.color")
      this.addUniform("pointLights[" + i + "].base.intensity")
      this.addUniform("pointLights[" + i + "].atten.constant")
      this.addUniform("pointLights[" + i + "].atten.linear")
      this.addUniform("pointLights[" + i + "].atten.exponent")
      this.addUniform("pointLights[" + i + "].position")
      this.addUniform("pointLights[" + i + "].range")
    }

    for(let i = 0; i < PhongShader.MAX_SPOT_LIGHTS; i++) {
      this.addUniform("spotLights[" + i + "].pointLight.base.color")
      this.addUniform("spotLights[" + i + "].pointLight.base.intensity")
      this.addUniform("spotLights[" + i + "].pointLight.atten.constant")
      this.addUniform("spotLights[" + i + "].pointLight.atten.linear")
      this.addUniform("spotLights[" + i + "].pointLight.atten.exponent")
      this.addUniform("spotLights[" + i + "].pointLight.position")
      this.addUniform("spotLights[" + i + "].pointLight.range")

      this.addUniform("spotLights[" + i + "].direction")
      this.addUniform("spotLights[" + i + "].cutoff")

    }
  }

  updateUniforms(
    worldMatrix: Matrix4,
    projectedMatrix: Matrix4,
    material: Material
  ) {
    if (material.texture) material.texture.bind();
    else unbindTextures();

    this.setUniform("transform", worldMatrix);
    this.setUniform("transformProjected", projectedMatrix);
    this.setUniform("baseColor", material.color);

    this.setUniform("ambientLight", this.ambientLight);
    this.setUniformDirLight("directionalLight", this.directionalLight);
    for(let i = 0; i < this.pointLights.length; i++) {
      this.setUniformPointLight("pointLights[" + i + "]", this.pointLights[i]);
    }
    for(let i = 0; i < this.spotLights.length; i++) {
      this.setUniformSpotLight("spotLights[" + i + "]", this.spotLights[i]);
    }

    this.setUniformf("specularIntensity", material.specularIntensity);
    this.setUniformf("specularPower", material.specularPower);

    this.setUniform("eyePos", Transform.camera.pos);

  }

  setUniformBaseLight(uniformName: string, baseLight: BaseLight) {
    this.setUniform(uniformName + ".color", baseLight.color);
    this.setUniformf(uniformName + ".intensity", baseLight.intensity);
  }

  setUniformDirLight(uniformName: string, directionalLight: DirectionalLight) {
    this.setUniformBaseLight(uniformName + ".base", directionalLight.base);
    this.setUniform(uniformName + ".direction", directionalLight.direction);
  }

  setUniformPointLight(uniformName: string, pointLight: PointLight) {
    this.setUniformBaseLight(uniformName + ".base", pointLight.baseLight);
    this.setUniformAttenuation(uniformName + ".atten", pointLight.atten);
    this.setUniform(uniformName + ".position", pointLight.position);
    this.setUniformf(uniformName + ".range", pointLight.range);
  }

  setUniformSpotLight(uniformName: string, spotLight: SpotLight) {
    this.setUniformPointLight(uniformName + ".pointLight", spotLight.pointLight);
    this.setUniform(uniformName + ".direction", spotLight.direction);
    this.setUniformf(uniformName + ".cutoff", spotLight.cutoff);
  }

  setUniformAttenuation(uniformName: string, atten: Attenuation) {
    this.setUniformf(uniformName + ".constant", atten.constant);
    this.setUniformf(uniformName + ".linear", atten.linear);
    this.setUniformf(uniformName + ".exponent", atten.exponent);
  }

  static get instance() {
    if (!PhongShader._instance) {
      PhongShader._instance = new PhongShader();
    }

    return PhongShader._instance;
  }
}
