import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GenerationConfig, AnalysisResult } from "../types";
import { useAppStore } from "../store";
import { licenseService } from "./licenseService";
import { isSupabaseConfigured } from "./supabaseClient";
import {
  analyzeImageWithOpenAI,
  enhancePromptWithOpenAI,
  generateImageWithOpenAI,
} from "./openaiCompatibleService";

// --- MASTER PHOTOGRAPHY PROMPT ---
// Updated to be High-End Commercial & General Design focused, not just wedding.
const PHOTOGRAPHY_MASTER_PROMPT = `
STYLE: High-end commercial photography, award-winning editorial style, luxury brand aesthetic.
EQUIPMENT: Shot on Hasselblad X2D 100C or Phase One IQ4, 80mm f/1.9 lens.
QUALITY: 8k resolution, hyper-realistic, exquisite texture details, perfect lighting.
LIGHTING: Professional cinematic lighting, soft diffused light, high dynamic range (HDR), masterful control of highlights and shadows.
COMPOSITION: Balanced and elegant composition, depth of field to separate subject from background (bokeh) where appropriate.
`;

// --- WEDDING ACCESSORIES PRODUCT CONSISTENCY PROMPT ---
// Critical for e-commerce: Generated images must match physical products exactly to prevent customer complaints
const WEDDING_ACCESSORIES_CONSISTENCY_PROMPT = `
CRITICAL REQUIREMENTS FOR WEDDING ACCESSORIES (E-COMMERCE COMPLIANCE):
1. VEILS & SHEER FABRICS: Must maintain transparency levels exactly. Lace patterns must be sharp, clear, and identical to reference.
2. LACE & EMBROIDERY: Intricate patterns must be preserved with 100% accuracy. No simplification, blurring, or pattern alteration.
3. PEARLS/CRYSTALS/BEADS: Maintain natural shine, reflection, and exact positioning. Do not alter size, quantity, or placement.
4. GLOVES & FITTED ITEMS: Preserve exact fit and fabric texture. Maintain sheerness/opacity precisely as shown.
5. FABRIC TRANSPARENCY: Sheer materials must remain sheer at identical levels. Never make transparent fabrics appear solid.
6. COLOR ACCURACY: Exact color matching is mandatory, especially critical for white/ivory/cream variations.
7. DIMENSIONS: Product size and proportions must remain exactly identical.

ABSOLUTE PROHIBITIONS:
- Do NOT thicken, thin, or alter fabric density
- Do NOT alter lace pattern density or complexity
- Do NOT remove, add, or reposition decorative elements
- Do NOT change transparency or opacity levels
- Do NOT blur, soften, or lose edge definition
- Do NOT alter reflections on pearls/crystals/metallic elements

E-COMMERCE IMPACT: Any deviation from the physical product will result in customer returns and negative reviews.
`;

// --- E-COMMERCE NEGATIVE PROMPT ---
// Prevents common issues with product photography
const ECOMMERCE_NEGATIVE_PROMPT = `blur, blurry, out of focus, low quality, pixelated, deformed, distorted, disproportionate, wrong proportions, color shift, wrong color, faded color, oversaturated, missing details, missing lace pattern, missing decorations, opaque veil, solid veil, transparent fabric made solid, thick fabric, wrong texture, stiff material, artificial looking, plastic texture, unnatural sheen, harsh shadows, flat lighting`;

/**
 * 辅助函数：将 Base64 字符串转换为 Gemini 兼容的部分
 */
const base64ToPart = (base64: string, mimeType: string = "image/png") => {
  // 移除 data URL 前缀 (data:image/png;base64,...)
  // Handle cases where the string might not have the prefix or different mimetype
  const data = base64.includes(",") ? base64.split(",")[1] : base64;
  return {
    inlineData: {
      data,
      mimeType,
    },
  };
};

/**
 * 获取 API Key (优先从 Store 获取，其次 Env)
 * 优先级：globalApiKey (Gemini) > customApiKey (通用) > process.env.API_KEY
 */
const getApiKey = () => {
  const { globalApiKey, customApiKey } = useAppStore.getState();
  if (globalApiKey) return globalApiKey;
  if (customApiKey) return customApiKey;
  // Fallback to process.env for local/AI Studio, or Vercel env if properly bundled
  return process.env.API_KEY || "";
};

/**
 * 获取 API 配置（包含 endpoint 和 key）
 * 如果配置了通用 API（endpoint + customApiKey），则使用通用配置
 * 否则使用 Gemini 配置
 */
const getApiConfig = () => {
  const { globalApiKey, customApiKey, apiEndpoint } = useAppStore.getState();

  // 如果配置了通用 API（有 endpoint 和 customApiKey）
  if (apiEndpoint && customApiKey) {
    return {
      apiKey: customApiKey,
      baseUrl: apiEndpoint,
      useCustomEndpoint: true,
    };
  }

  // 否则使用 Gemini 配置
  return {
    apiKey: globalApiKey || process.env.API_KEY || "",
    baseUrl: undefined,
    useCustomEndpoint: false,
  };
};

/**
 * 创建 GoogleGenAI 实例
 */
const createAiClient = (config: {
  apiKey: string;
  baseUrl?: string;
  useCustomEndpoint?: boolean;
}) => {
  const options: any = { apiKey: config.apiKey };

  // 如果有自定义 baseUrl，使用 httpOptions 设置
  if (config.baseUrl) {
    options.httpOptions = { baseUrl: config.baseUrl };
    console.log("[API Config] Using custom endpoint:", config.baseUrl);
  } else {
    console.log("[API Config] Using default Google endpoint");
  }

  return new GoogleGenAI(options);
};

/**
 * 分析上传的图片内容 (使用 gemini-2.5-flash，避免 pro 模型的权限问题)
 * 用于 "产品提取" 和 "辅助生成 Prompt"
 *
 * 路由逻辑：如果配置了通用 API，使用 OpenAI 兼容服务；否则使用 Gemini
 */
export const analyzeImage = async (
  base64Image: string
): Promise<AnalysisResult> => {
  // 每次请求前重新获取配置
  const config = getApiConfig();

  if (!config.apiKey) throw new Error("API Key missing");

  // 如果使用自定义端点，调用 OpenAI 兼容服务
  if (config.useCustomEndpoint && config.baseUrl) {
    console.log("[API Router] Using OpenAI Compatible API for image analysis");
    return await analyzeImageWithOpenAI(
      config.baseUrl,
      config.apiKey,
      base64Image
    );
  }

  // 否则使用 Gemini API
  console.log("[API Router] Using Gemini API for image analysis");
  const ai = createAiClient(config);

  try {
    const imagePart = base64ToPart(base64Image);
    const prompt = `
    作为一名专业的电商视觉总监，请分析这张图片。
    1. 描述图片中的核心商品（婚纱/配饰）的细节，包括材质、颜色、风格。
    2. 描述模特的姿势、人种和表情。
    3. 描述背景环境和光影效果。
    
    请以 JSON 格式返回，包含 'description' (详细描述) 和 'tags' (关键词列表)。
    不要使用 Markdown 代码块。直接返回 JSON 字符串。
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Downgraded from gemini-3-pro-preview to reduce 403 chance on basic analysis
      contents: {
        parts: [imagePart, { text: prompt }],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error; // 让 UI 层处理错误 (如 403)
  }
};

/**
 * 智能优化 Prompt (使用 gemini-2.5-flash)
 * 用于 "创意生图" 和 "换背景" 的文案润色
 *
 * 路由逻辑：如果配置了通用 API，使用 OpenAI 兼容服务；否则使用 Gemini
 */
export const enhancePrompt = async (input: string): Promise<string> => {
  const config = getApiConfig();

  if (!config.apiKey) throw new Error("API Key missing");

  // 如果使用自定义端点，调用 OpenAI 兼容服务
  if (config.useCustomEndpoint && config.baseUrl) {
    console.log(
      "[API Router] Using OpenAI Compatible API for prompt enhancement"
    );
    return await enhancePromptWithOpenAI(config.baseUrl, config.apiKey, input);
  }

  // 否则使用 Gemini API
  console.log("[API Router] Using Gemini API for prompt enhancement");
  const ai = createAiClient(config);

  try {
    const systemPrompt = `
    Role: Professional E-commerce Photographer & AI Prompt Engineer.
    Task: Expand the user's basic input into a high-quality, professional image generation prompt suitable for Amazon/Shein product photography.
    
    Guidelines:
    1. Lighting: Add professional lighting terms (e.g., "soft studio lighting", "cinematic rim light", "natural window light").
    2. Atmosphere: Enhance the vibe (e.g., "luxury", "minimalist", "romantic wedding atmosphere").
    3. Technical: Add quality keywords (e.g., "8k resolution", "photorealistic", "sharp focus", "highly detailed", "bokeh").
    4. Composition: Suggest composition if missing (e.g., "eye-level shot", "symmetrical", "rule of thirds").
    
    Input: "${input}"
    
    Output: Return ONLY the enhanced prompt string in English. Do not add conversational text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
    });

    return response.text?.trim() || input;
  } catch (error) {
    console.error("Prompt Enhancement Error:", error);
    // 失败时返回原文本，不中断流程
    return input;
  }
};

/**
 * 授权检查中间件
 * 在调用 AI 生成功能前检查用户授权状态
 */
const checkLicenseBeforeGenerate = async (): Promise<void> => {
  // 如果 Supabase 未配置，跳过授权检查（开发模式）
  if (!isSupabaseConfigured()) {
    console.log("[License] Supabase not configured, skipping license check");
    return;
  }

  const { user, userLicense, setUserLicense, setShowLicenseModal } =
    useAppStore.getState();

  if (!user) {
    throw new Error("请先登录");
  }

  // 快速路径：本地缓存有效且未过期
  if (userLicense?.hasValidLicense) {
    if (userLicense.isPermanent || !userLicense.expiresAt) {
      return; // 永久授权
    }
    if (new Date(userLicense.expiresAt) > new Date()) {
      return; // 未过期
    }
  }

  // 服务端验证
  const license = await licenseService.checkLicense(user.id);
  setUserLicense(license);

  if (!license.hasValidLicense) {
    setShowLicenseModal(true);
    throw new Error("LICENSE_REQUIRED");
  }
};

/**
 * 生成图片 (智能选择模型)
 * 优先使用 gemini-2.5-flash-image 以提高成功率
 * 仅在需要高分辨率(2K/4K)时尝试 gemini-3-pro-image-preview，并支持自动回退
 *
 * 路由逻辑：如果配置了通用 API，使用 OpenAI 兼容服务；否则使用 Gemini
 */
export const generateImage = async (
  generationConfig: GenerationConfig
): Promise<string> => {
  // 授权检查
  try {
    await checkLicenseBeforeGenerate();
  } catch (e: any) {
    if (e.message === "LICENSE_REQUIRED") {
      throw new Error("请先激活授权码以使用 AI 功能");
    }
    throw e;
  }

  // 每次请求前重新获取配置
  const config = getApiConfig();

  if (!config.apiKey) throw new Error("API Key missing");

  // 如果使用自定义端点，调用 OpenAI 兼容服务
  if (config.useCustomEndpoint && config.baseUrl) {
    console.log(
      "[API Router] Using OpenAI Compatible API for image generation"
    );
    return await generateImageWithOpenAI(
      config.baseUrl,
      config.apiKey,
      generationConfig
    );
  }

  // 否则使用 Gemini API
  console.log("[API Router] Using Gemini API for image generation");
  const ai = createAiClient(config);

  // 1. 构建 Prompt (保持原逻辑)
  let parts: any[] = [];

  // 强制电商优化逻辑 + 大师级摄影 Prompt
  let finalPrompt = `
  ${PHOTOGRAPHY_MASTER_PROMPT}
  ${WEDDING_ACCESSORIES_CONSISTENCY_PROMPT}
  ${generationConfig.prompt}
  `;

  // 默认负面提示词 + 用户自定义负面提示词
  const combinedNegativePrompt = generationConfig.negativePrompt
    ? `${ECOMMERCE_NEGATIVE_PROMPT}, ${generationConfig.negativePrompt}`
    : ECOMMERCE_NEGATIVE_PROMPT;

  finalPrompt += `\nNegative prompt: ${combinedNegativePrompt}`;

  // --- Special Handling for MASKING (Eraser / Local Enhancement) ---
  if (generationConfig.maskImage) {
    // Order: Original Image, Mask Image, Prompt
    if (generationConfig.referenceImage) {
      parts.push(base64ToPart(generationConfig.referenceImage));
      parts.push(base64ToPart(generationConfig.maskImage));

      const maskInstruction = `
          [INSTRUCTION]: WEDDING ACCESSORIES INPAINTING - Precision Local Enhancement.
          ${WEDDING_ACCESSORIES_CONSISTENCY_PROMPT}

          MASK GUIDELINES:
          The second image is a MASK. WHITE areas = EDIT region. BLACK areas = PRESERVE completely.

          WEDDING ACCESSORIES CRITICAL RULES:
          1. LACE EDGE PRECISION: If editing near lace, maintain sharp, defined edges. No blurring of lace patterns.
          2. TRANSPARENCY PROTECTION: Never alter transparency of sheer fabrics in unmasked areas.
          3. DECORATIVE ELEMENTS: Pearls, crystals, beads at mask edges must remain perfectly intact.
          4. SEAMLESS INTEGRATION: Edited areas must blend perfectly without visible transitions.
          5. FABRIC CONTINUITY: Ensure fabric texture and behavior remain consistent across mask boundaries.

          Apply changes ONLY to white masked regions while protecting all adjacent wedding accessory details.
          `;
      finalPrompt = maskInstruction + finalPrompt;
    }
  }
  // --- Special Handling for Fusion (Multiple Images) ---
  else if (generationConfig.workflow === "fusion") {
    if (
      generationConfig.referenceImages &&
      generationConfig.referenceImages.length > 0
    ) {
      generationConfig.referenceImages.forEach((img) =>
        parts.push(base64ToPart(img))
      );

      let fusionInstruction = `[Instruction]: WEDDING ACCESSORIES FUSION - Multiple Reference Analysis. `;
      fusionInstruction += `${WEDDING_ACCESSORIES_CONSISTENCY_PROMPT} `;
      fusionInstruction += `MULTI-ANGLE CONSISTENCY REQUIREMENTS: `;
      fusionInstruction += `1. LACE PATTERN CONTINUITY: Ensure lace patterns remain consistent across all angles. Maintain identical density and complexity. `;
      fusionInstruction += `2. TRANSPARENCY UNIFORMITY: Sheer fabrics must maintain identical transparency levels from all perspectives. `;
      fusionInstruction += `3. DECORATIVE ALIGNMENT: Pearls, crystals, beads must maintain consistent positioning and reflections. `;
      fusionInstruction += `4. FABRIC BEHAVIOR: Understand how drapes, folds, and layers behave from different angles. `;
      fusionInstruction += `5. COLOR CONSISTENCY: Exact color matching across all references, especially for white/ivory variations. `;
      fusionInstruction += `ANALYZE: Study all images comprehensively to understand the complete product structure, fabric behavior, and decorative details. `;
      fusionInstruction += `SYNTHESIZE: Create a unified representation that honors all reference angles while maintaining product integrity. \n`;

      finalPrompt = fusionInstruction + finalPrompt;
    } else if (generationConfig.referenceImage) {
      parts.push(base64ToPart(generationConfig.referenceImage));
    }
  }
  // --- Special Handling for Background Swap ---
  else if (generationConfig.workflow === "bg_swap") {
    if (generationConfig.referenceImage) {
      parts.push(base64ToPart(generationConfig.referenceImage));

      let bgInstruction = `[Instruction]: You are a world-class photo retoucher and compositor specializing in luxury e-commerce photography. `;
      bgInstruction += `TASK: Background Replacement for wedding accessories. `;
      bgInstruction += `${WEDDING_ACCESSORIES_CONSISTENCY_PROMPT} `;
      bgInstruction += `CRITICAL PRESERVATION RULES: `;
      bgInstruction += `1. VEILS & SHEER FABRICS: Transparency levels must remain EXACTLY identical. Lace patterns must stay sharp and clear. `;
      bgInstruction += `2. DECORATIVE ELEMENTS: Pearls, crystals, beads, embroidery must maintain exact position and natural reflections. `;
      bgInstruction += `3. FABRIC APPEARANCE: Do NOT thicken or thin any fabric. Sheer materials must stay sheer. `;
      bgInstruction += `4. SHADOWS: Use soft, minimal shadows for sheer fabrics. Avoid heavy shadows that obscure transparency. `;
      bgInstruction += `5. COLOR INTEGRITY: White/ivory/cream variations must remain precisely as in original. `;
      bgInstruction += `CHANGE: Replace ONLY the background. Create a masterpiece that enhances but never alters the product. `;

      if (generationConfig.bgSwapConfig?.lighting) {
        const lightingMap: Record<string, string> = {
          soft: "Soft, diffused softbox lighting, flattering for wedding portraits, minimal shadows.",
          natural:
            "Natural daylight, golden hour sun-kissed look, warm and organic tones.",
          studio:
            "High-contrast professional studio strobe lighting, sharp shadows, commercial look.",
          cinematic:
            "Dramatic cinematic lighting, rim light to separate subject from background, moody atmosphere.",
        };
        bgInstruction += `LIGHTING: ${
          lightingMap[generationConfig.bgSwapConfig.lighting]
        } Ensure the subject's lighting blends realistically with the new background. `;
      }

      if (generationConfig.bgSwapConfig?.sceneType) {
        if (generationConfig.bgSwapConfig.sceneType === "vintage") {
          bgInstruction += `ATMOSPHERE: Nostalgic, warm tones, film grain texture, rich details, elegant and timeless. `;
        } else if (generationConfig.bgSwapConfig.sceneType === "natural") {
          bgInstruction += `ATMOSPHERE: Fresh air, organic textures, wide dynamic range, airy and romantic. `;
        } else if (generationConfig.bgSwapConfig.sceneType === "classical") {
          bgInstruction += `ATMOSPHERE: Grand, aristocratic, luxury textures (stone, marble, velvet), serious and holy. `;
        } else if (generationConfig.bgSwapConfig.sceneType === "modern") {
          bgInstruction += `ATMOSPHERE: Clean lines, neutral colors, minimalist, high-fashion magazine style. `;
        }
      }

      if (
        generationConfig.bgSwapConfig?.blur &&
        generationConfig.bgSwapConfig.blur > 0
      ) {
        const blurDesc =
          generationConfig.bgSwapConfig.blur > 60
            ? "Strong bokeh, creamy background blur, f/1.2 aperture"
            : generationConfig.bgSwapConfig.blur > 30
            ? "Moderate depth of field, pleasing bokeh, f/2.8 aperture"
            : "Slight depth of field separation, f/5.6 aperture";
        bgInstruction += `DEPTH OF FIELD: ${blurDesc}. Focus strictly on the product. `;
      }

      finalPrompt = bgInstruction + finalPrompt;
    }
  }
  // --- Special Handling for Face Swap ---
  else if (generationConfig.workflow === "face_swap") {
    if (generationConfig.referenceImage) {
      parts.push(base64ToPart(generationConfig.referenceImage));

      let swapInstruction = `[Instruction]: This first image is the WEDDING ACCESSORIES PRODUCT/BODY REFERENCE. `;
      swapInstruction += `${WEDDING_ACCESSORIES_CONSISTENCY_PROMPT} `;

      if (generationConfig.faceSwapConfig?.mode === "model_swap") {
        swapInstruction += `WEDDING ATTIRE PRESERVATION: Keep ALL wedding accessories exactly as is - veils, headpieces, gloves, sashes, jewelry. `;
        swapInstruction += `FABRIC INTEGRITY: Maintain lace patterns, transparency levels, and decorative elements. `;
        swapInstruction += `GENERATE A NEW MODEL (face, hair, skin tone) wearing the exact same wedding attire. `;
      } else if (generationConfig.faceSwapConfig?.mode === "head_swap") {
        swapInstruction += `ACCESSORIES PRESERVATION: Keep ALL wedding accessories exactly - veils must maintain position and transparency, headpieces intact. `;
        swapInstruction += `FIT INTEGRITY: Preserve how accessories fit and interact with hair/head. `;
        swapInstruction += `SWAP THE HEAD AND HAIR only, ensuring seamless integration with existing accessories. `;
      } else {
        swapInstruction += `MINIMAL CHANGE APPROACH: Keep EVERYTHING else exactly the same - veils, hair, headpieces, earrings, necklaces. `;
        swapInstruction += `SWAP ONLY THE CORE FACIAL FEATURES (eyes, nose, mouth) while preserving makeup and accessory interactions. `;
      }

      swapInstruction += `CRITICAL: Do NOT alter fit, positioning, or appearance of any wedding accessories. Preserve natural interactions between accessories and model. `;
      finalPrompt = swapInstruction + finalPrompt;
    }

    if (generationConfig.faceImage) {
      parts.push(base64ToPart(generationConfig.faceImage));
      let similarity = generationConfig.faceSwapConfig?.similarity || 80;
      finalPrompt =
        `[Instruction]: This second image is the FACE REFERENCE. Target Similarity: ${similarity}%. ` +
        finalPrompt;
    }
  }
  // --- Standard Workflows (Creative, Fission, etc) ---
  else {
    if (generationConfig.poseImage) {
      parts.push(base64ToPart(generationConfig.poseImage));
      finalPrompt = `[Instruction]: WEDDING ACCESSORIES POSE REFERENCE. Use this first image as a POSE REFERENCE (skeleton/structure). ${WEDDING_ACCESSORIES_CONSISTENCY_PROMPT} The generated model must follow this exact pose while preserving all wedding accessory integrity.\n\n${finalPrompt}`;
    }
    // New: Handle Multiple References for Standard Workflows
    if (
      generationConfig.referenceImages &&
      generationConfig.referenceImages.length > 0
    ) {
      generationConfig.referenceImages.forEach((img) =>
        parts.push(base64ToPart(img))
      );

      let multiRefPrompt = `[Instruction]: WEDDING ACCESSORIES MULTI-ANGLE REFERENCE. `;
      multiRefPrompt += `${WEDDING_ACCESSORIES_CONSISTENCY_PROMPT} `;
      multiRefPrompt += `TASK: Analyze ALL provided reference images to understand the complete product structure, fabric details, and design from different angles. `;
      multiRefPrompt += `MERGE these details into a consistent, high-quality generated image. `;
      multiRefPrompt += `Ensure ALL accessory details (lace, pearls, transparency) are preserved exactly as shown across the references.\n\n`;

      finalPrompt = multiRefPrompt + finalPrompt;
    } else if (generationConfig.referenceImage && !generationConfig.maskImage) {
      parts.push(base64ToPart(generationConfig.referenceImage));
      finalPrompt = `[Instruction]: WEDDING ACCESSORIES CONTENT REFERENCE. ${WEDDING_ACCESSORIES_CONSISTENCY_PROMPT} Use this image as the CONTENT REFERENCE (Subject/Product). Maintain ALL wedding accessories exactly - veils, lace patterns, transparency levels, decorative elements, and product details from this image.\n\n${finalPrompt}`;
    }
  }

  parts.push({ text: finalPrompt });

  // 2. 执行生成 (支持模型回退)

  // 辅助函数：执行请求
  const executeRequest = async (model: string) => {
    const imageConfig: any = {
      aspectRatio: generationConfig.aspectRatio,
    };

    // 注意：gemini-2.5-flash-image 不支持 imageSize
    if (model === "gemini-3-pro-image-preview") {
      imageConfig.imageSize = generationConfig.imageSize;
    }

    return await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: { imageConfig },
    });
  };

  try {
    // 策略：默认使用 flash-image (1K)，如果是 2K/4K 则升级到 pro。
    // 如果 pro 失败 (403)，则降级到 flash-image 自动重试。
    let targetModel = "gemini-2.5-flash-image";

    if (
      generationConfig.imageSize === "2K" ||
      generationConfig.imageSize === "4K"
    ) {
      targetModel = "gemini-3-pro-image-preview";
    }

    let response: GenerateContentResponse;

    try {
      response = await executeRequest(targetModel);
    } catch (error: any) {
      // 捕获 403 权限错误或 404 模型未找到错误
      const isAuthError =
        error.status === 403 ||
        error.message?.includes("403") ||
        error.message?.includes("PERMISSION_DENIED");
      const isNotFoundError =
        error.status === 404 || error.message?.includes("404");

      if (
        (isAuthError || isNotFoundError) &&
        targetModel === "gemini-3-pro-image-preview"
      ) {
        console.warn(
          "Gemini Pro Image Model failed (Auth/NotFound). Falling back to Flash Image."
        );
        // 降级重试 (注意：Flash 模型不支持 imageSize，在 executeRequest 中已处理)
        response = await executeRequest("gemini-2.5-flash-image");
      } else {
        throw error; // 其他错误抛出
      }
    }

    // 解析返回的图片数据
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }

    throw new Error("未生成任何图片数据 (No image data returned)");
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
