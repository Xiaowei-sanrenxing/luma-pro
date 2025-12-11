/**
 * OpenAI 兼容 API 服务模块
 * 通用设计，支持多种 API 端点：OpenRouter、Sonetto、Together AI、Groq 等
 */

import { GenerationConfig } from "../types";
import { useAppStore } from "../store";

// 摄影大师 Prompt
const PHOTOGRAPHY_MASTER_PROMPT = `
STYLE: High-end commercial photography, award-winning editorial style, luxury brand aesthetic.
EQUIPMENT: Shot on Hasselblad X2D 100C or Phase One IQ4, 80mm f/1.9 lens.
QUALITY: 8k resolution, hyper-realistic, exquisite texture details, perfect lighting.
LIGHTING: Professional cinematic lighting, soft diffused light, high dynamic range (HDR).
COMPOSITION: Balanced and elegant composition, depth of field with bokeh where appropriate.
`;

// ============ 端点配置 ============

interface EndpointConfig {
  imageModel: string;
  visionModel: string;
  chatModel: string;
  supportsModalities: boolean;  // 是否需要 modalities 参数
  responseFormat: "openrouter" | "gemini" | "openai";  // 响应格式类型
}

// 根据端点 URL 获取配置
const getEndpointConfig = (endpoint: string, customModel?: string | null): EndpointConfig => {
  const lower = endpoint.toLowerCase();

  // OpenRouter
  if (lower.includes("openrouter")) {
    return {
      imageModel: customModel || "google/gemini-3-pro-image-preview",
      visionModel: "google/gemini-2.0-flash-exp:free",
      chatModel: "google/gemini-2.0-flash-exp:free",
      supportsModalities: true,
      responseFormat: "openrouter"
    };
  }

  // Sonetto 或其他 Gemini 中转服务
  if (lower.includes("sonetto")) {
    return {
      imageModel: customModel || "gemini-2.0-flash-exp",
      visionModel: "gemini-2.0-flash-exp",
      chatModel: "gemini-2.0-flash-exp",
      supportsModalities: false,
      responseFormat: "gemini"
    };
  }

  // Together AI
  if (lower.includes("together")) {
    return {
      imageModel: customModel || "black-forest-labs/FLUX.1-schnell-Free",
      visionModel: "meta-llama/Llama-Vision-Free",
      chatModel: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      supportsModalities: false,
      responseFormat: "openai"
    };
  }

  // Groq
  if (lower.includes("groq")) {
    return {
      imageModel: customModel || "llama-3.2-90b-vision-preview",
      visionModel: "llava-v1.5-7b-4096-preview",
      chatModel: "llama-3.1-70b-versatile",
      supportsModalities: false,
      responseFormat: "openai"
    };
  }

  // 默认配置（通用 OpenAI 兼容）- 使用用户自定义模型或默认值
  return {
    imageModel: customModel || "gpt-4o",
    visionModel: "gpt-4o",
    chatModel: "gpt-4o-mini",
    supportsModalities: false,
    responseFormat: "openai"
  };
};

// ============ 类型定义 ============

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

// ============ 工具函数 ============

const buildMessageContent = (text: string, images: string[] = []): OpenAIMessage["content"] => {
  if (images.length === 0) return text;

  const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

  images.forEach((img) => {
    const imageUrl = img.startsWith("data:") ? img : `data:image/png;base64,${img}`;
    content.push({ type: "image_url", image_url: { url: imageUrl } });
  });

  content.push({ type: "text", text });
  return content;
};

// 从各种响应格式中提取图片
const extractImageFromResponse = (data: any, format: string): string | null => {
  const message = data.choices?.[0]?.message;
  if (!message) return null;

  // OpenRouter 格式：message.images 数组
  if (message.images?.length > 0) {
    const url = message.images[0]?.image_url?.url;
    if (url) {
      console.log("[API] Found image in message.images");
      return url;
    }
  }

  const content = message.content;
  if (!content) return null;

  // 数组格式（Gemini/OpenRouter 混合）
  if (Array.isArray(content)) {
    for (const part of content) {
      // Gemini inlineData 格式
      if (part.inlineData?.data) {
        console.log("[API] Found image in inlineData");
        return `data:image/png;base64,${part.inlineData.data}`;
      }
      // image 类型
      if (part.type === "image" && part.image?.data) {
        console.log("[API] Found image in part.image");
        return `data:image/png;base64,${part.image.data}`;
      }
      // image_url 类型
      if (part.type === "image_url" && part.image_url?.url) {
        console.log("[API] Found image in part.image_url");
        return part.image_url.url;
      }
    }
  }

  // 字符串格式
  if (typeof content === "string") {
    // 完整 data URL
    const dataUrlMatch = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
    if (dataUrlMatch) {
      console.log("[API] Found data URL in content string");
      return dataUrlMatch[0];
    }
    // 纯 base64 字符串（长度 > 1000 的连续字符）
    const base64Match = content.match(/[A-Za-z0-9+/=]{1000,}/);
    if (base64Match) {
      console.log("[API] Found base64 string in content");
      return `data:image/png;base64,${base64Match[0]}`;
    }
  }

  // 顶层 images 字段
  if (data.images?.[0]) {
    const img = data.images[0];
    if (img.b64_json) return `data:image/png;base64,${img.b64_json}`;
    if (img.url) return img.url;
  }

  return null;
};

// ============ API 调用函数 ============

const callAPI = async (
  endpoint: string,
  apiKey: string,
  messages: OpenAIMessage[],
  model: string,
  options: { modalities?: string[] } = {}
): Promise<any> => {
  const baseUrl = endpoint.replace(/\/+$/, "");
  const url = `${baseUrl}/chat/completions`;

  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: 4096,
    temperature: 0.7
  };

  if (options.modalities) {
    body.modalities = options.modalities;
  }

  console.log("[API] Calling:", url);
  console.log("[API] Model:", model);
  if (options.modalities) {
    console.log("[API] Modalities:", options.modalities.join(", "));
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "Luma Pro"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[API] Error:", response.status, errorText);
    throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
  }

  return await response.json();
};

// ============ 导出函数 ============

/**
 * 分析图片
 */
export const analyzeImageWithOpenAI = async (
  endpoint: string,
  apiKey: string,
  base64Image: string
): Promise<{ description: string; tags: string[] }> => {
  const config = getEndpointConfig(endpoint);

  const prompt = `
作为一名专业的电商视觉总监，请分析这张图片。
1. 描述图片中的核心商品的细节，包括材质、颜色、风格。
2. 描述模特的姿势、人种和表情（如果有）。
3. 描述背景环境和光影效果。

请以 JSON 格式返回，包含 'description' (详细描述) 和 'tags' (关键词列表)。
`;

  const messages: OpenAIMessage[] = [
    { role: "user", content: buildMessageContent(prompt, [base64Image]) }
  ];

  const data = await callAPI(endpoint, apiKey, messages, config.visionModel);
  const result = data.choices?.[0]?.message?.content || "";

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.warn("Failed to parse JSON:", e);
  }

  return { description: result, tags: [] };
};

/**
 * 增强 Prompt
 */
export const enhancePromptWithOpenAI = async (
  endpoint: string,
  apiKey: string,
  input: string
): Promise<string> => {
  const config = getEndpointConfig(endpoint);

  const messages: OpenAIMessage[] = [
    {
      role: "system",
      content: `You are a professional image prompt engineer. Expand the user's input into a high-quality image generation prompt. Add lighting, atmosphere, and technical quality keywords. Return ONLY the enhanced prompt.`
    },
    { role: "user", content: input }
  ];

  const data = await callAPI(endpoint, apiKey, messages, config.chatModel);
  return data.choices?.[0]?.message?.content?.trim() || input;
};

/**
 * 生成图片 - 通用实现，自动适配各种 API
 */
export const generateImageWithOpenAI = async (
  endpoint: string,
  apiKey: string,
  generationConfig: GenerationConfig
): Promise<string> => {
  // 从 store 获取用户自定义模型
  const { customModel } = useAppStore.getState();
  const config = getEndpointConfig(endpoint, customModel);

  console.log("[API] Custom model from settings:", customModel || "(not set, using default)");
  console.log("[API] Final image model:", config.imageModel);

  // 构建 Prompt
  let finalPrompt = `${PHOTOGRAPHY_MASTER_PROMPT}\n${generationConfig.prompt}`;
  if (generationConfig.negativePrompt) {
    finalPrompt += `\nNegative prompt: ${generationConfig.negativePrompt}`;
  }

  // 收集参考图片
  const images: string[] = [];
  if (generationConfig.referenceImage) images.push(generationConfig.referenceImage);
  if (generationConfig.maskImage) images.push(generationConfig.maskImage);
  if (generationConfig.poseImage) images.push(generationConfig.poseImage);
  if (generationConfig.faceImage) images.push(generationConfig.faceImage);
  if (generationConfig.referenceImages) images.push(...generationConfig.referenceImages);

  // 构建消息
  const messageContent = buildMessageContent(
    `Please generate an image based on this description:\n\n${finalPrompt}\n\nGenerate the image directly.`,
    images
  );

  const messages: OpenAIMessage[] = [
    { role: "user", content: messageContent }
  ];

  // 调用 API
  const options: { modalities?: string[] } = {};
  if (config.supportsModalities) {
    options.modalities = ["image", "text"];
  }

  const data = await callAPI(endpoint, apiKey, messages, config.imageModel, options);

  console.log("[API] Response preview:", JSON.stringify(data).substring(0, 800));

  // 提取图片
  const imageUrl = extractImageFromResponse(data, config.responseFormat);

  if (imageUrl) {
    return imageUrl;
  }

  // 如果没有找到图片，抛出详细错误
  const responsePreview = JSON.stringify(data).substring(0, 500);
  throw new Error(
    `未能从 API 响应中提取图片。\n` +
    `端点: ${endpoint}\n` +
    `模型: ${config.imageModel}\n` +
    `响应预览: ${responsePreview}\n\n` +
    `请确保您的 API 服务支持图片生成功能。`
  );
};
