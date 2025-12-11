/**
 * OpenAI 兼容 API 服务模块
 * 用于处理自定义 API 端点（如 OpenRouter、自建代理、Sonetto 等）
 * 这些服务使用 OpenAI 格式的 API 接口
 */

import { GenerationConfig } from "../types";
import { useAppStore } from "../store";

// 摄影大师 Prompt（与 geminiService 保持一致）
const PHOTOGRAPHY_MASTER_PROMPT = `
STYLE: High-end commercial photography, award-winning editorial style, luxury brand aesthetic.
EQUIPMENT: Shot on Hasselblad X2D 100C or Phase One IQ4, 80mm f/1.9 lens.
QUALITY: 8k resolution, hyper-realistic, exquisite texture details, perfect lighting.
LIGHTING: Professional cinematic lighting, soft diffused light, high dynamic range (HDR), masterful control of highlights and shadows.
COMPOSITION: Balanced and elegant composition, depth of field to separate subject from background (bokeh) where appropriate.
`;

// 智能检测 API 端点类型并选择合适的模型
const detectEndpointAndModel = (endpoint: string, purpose: "chat" | "vision" | "image"): string => {
  const lowerEndpoint = endpoint.toLowerCase();

  // OpenRouter
  if (lowerEndpoint.includes("openrouter")) {
    if (purpose === "image") return "openai/dall-e-3";
    if (purpose === "vision") return "openai/gpt-4o";
    return "openai/gpt-4o-mini";
  }

  // Sonetto / 其他中转服务（通常支持 Gemini 模型）
  if (lowerEndpoint.includes("sonetto") || lowerEndpoint.includes("gemini")) {
    if (purpose === "image") return "gemini-2.0-flash-exp-image-generation";
    if (purpose === "vision") return "gemini-2.0-flash-exp";
    return "gemini-2.0-flash-exp";
  }

  // Together AI
  if (lowerEndpoint.includes("together")) {
    if (purpose === "image") return "black-forest-labs/FLUX.1-schnell";
    if (purpose === "vision") return "meta-llama/Llama-Vision-Free";
    return "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo";
  }

  // Groq
  if (lowerEndpoint.includes("groq")) {
    if (purpose === "vision") return "llava-v1.5-7b-4096-preview";
    return "llama-3.1-70b-versatile";
  }

  // 默认使用 OpenAI 模型名称
  if (purpose === "image") return "dall-e-3";
  if (purpose === "vision") return "gpt-4o";
  return "gpt-4o-mini";
};

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface OpenAIResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  error?: {
    message: string;
    type: string;
    code?: string;
  };
}

/**
 * 构建包含图片的消息内容
 */
const buildMessageContent = (text: string, images: string[] = []): OpenAIMessage["content"] => {
  if (images.length === 0) {
    return text;
  }

  const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

  // 添加图片
  images.forEach((img) => {
    // 确保图片是完整的 data URL 格式
    const imageUrl = img.startsWith("data:") ? img : `data:image/png;base64,${img}`;
    content.push({
      type: "image_url",
      image_url: { url: imageUrl }
    });
  });

  // 添加文本
  content.push({ type: "text", text });

  return content;
};

/**
 * 调用 OpenAI 兼容 API
 */
const callOpenAICompatibleAPI = async (
  endpoint: string,
  apiKey: string,
  messages: OpenAIMessage[],
  model?: string,
  purpose: "chat" | "vision" | "image" = "chat"
): Promise<string> => {
  // 标准化 endpoint（移除末尾斜杠）
  const baseUrl = endpoint.replace(/\/+$/, "");
  const url = `${baseUrl}/chat/completions`;

  // 如果未指定模型，智能检测
  const actualModel = model || detectEndpointAndModel(endpoint, purpose);

  console.log("[OpenAI Compatible API] Calling:", url);
  console.log("[OpenAI Compatible API] Model:", actualModel);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      // OpenRouter 特定头（可选，其他服务会忽略）
      "HTTP-Referer": window.location.origin,
      "X-Title": "Luma Pro"
    },
    body: JSON.stringify({
      model: actualModel,
      messages,
      max_tokens: 4096,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[OpenAI Compatible API] Error:", response.status, errorText);
    throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
  }

  const data: OpenAIResponse = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.choices[0]?.message?.content || "";
};

/**
 * 使用 OpenAI 兼容 API 分析图片
 */
export const analyzeImageWithOpenAI = async (
  endpoint: string,
  apiKey: string,
  base64Image: string
): Promise<{ description: string; tags: string[] }> => {
  const prompt = `
作为一名专业的电商视觉总监，请分析这张图片。
1. 描述图片中的核心商品的细节，包括材质、颜色、风格。
2. 描述模特的姿势、人种和表情（如果有）。
3. 描述背景环境和光影效果。

请以 JSON 格式返回，包含 'description' (详细描述) 和 'tags' (关键词列表)。
示例格式：{"description": "...", "tags": ["关键词1", "关键词2"]}
`;

  const messages: OpenAIMessage[] = [
    {
      role: "user",
      content: buildMessageContent(prompt, [base64Image])
    }
  ];

  // 使用 vision 模型进行图片分析
  const result = await callOpenAICompatibleAPI(endpoint, apiKey, messages, undefined, "vision");

  try {
    // 尝试解析 JSON 响应
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.warn("Failed to parse JSON response:", e);
  }

  // 如果解析失败，返回原始文本作为描述
  return { description: result, tags: [] };
};

/**
 * 使用 OpenAI 兼容 API 增强 Prompt
 */
export const enhancePromptWithOpenAI = async (
  endpoint: string,
  apiKey: string,
  input: string
): Promise<string> => {
  const systemPrompt = `
Role: Professional E-commerce Photographer & AI Prompt Engineer.
Task: Expand the user's basic input into a high-quality, professional image generation prompt.

Guidelines:
1. Lighting: Add professional lighting terms (e.g., "soft studio lighting", "cinematic rim light").
2. Atmosphere: Enhance the vibe (e.g., "luxury", "minimalist", "romantic").
3. Technical: Add quality keywords (e.g., "8k resolution", "photorealistic", "sharp focus").
4. Composition: Suggest composition if missing.

Output: Return ONLY the enhanced prompt string in English. Do not add conversational text.
`;

  const messages: OpenAIMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: input }
  ];

  // 使用 chat 模型进行 prompt 增强
  return await callOpenAICompatibleAPI(endpoint, apiKey, messages, undefined, "chat");
};

/**
 * 使用 OpenAI 兼容 API 生成图片
 * 支持多种端点类型：
 * - DALL-E 风格 (/images/generations)
 * - Gemini 代理服务 (通过 chat completions 生成图片)
 * - 其他视觉模型
 */
export const generateImageWithOpenAI = async (
  endpoint: string,
  apiKey: string,
  config: GenerationConfig
): Promise<string> => {
  // 构建 Prompt
  let finalPrompt = `${PHOTOGRAPHY_MASTER_PROMPT}\n${config.prompt}`;

  if (config.negativePrompt) {
    finalPrompt += `\nNegative prompt: ${config.negativePrompt}`;
  }

  // 收集参考图片
  const images: string[] = [];

  if (config.referenceImage) {
    images.push(config.referenceImage);
  }
  if (config.maskImage) {
    images.push(config.maskImage);
  }
  if (config.poseImage) {
    images.push(config.poseImage);
  }
  if (config.faceImage) {
    images.push(config.faceImage);
  }
  if (config.referenceImages) {
    images.push(...config.referenceImages);
  }

  // 标准化 endpoint
  const baseUrl = endpoint.replace(/\/+$/, "");
  const lowerEndpoint = endpoint.toLowerCase();

  // 检测是否为 Sonetto/Gemini 代理服务
  const isSonettoOrGemini = lowerEndpoint.includes("sonetto") || lowerEndpoint.includes("gemini");

  // 对于 Sonetto/Gemini 代理，直接使用 chat completions 端点
  if (isSonettoOrGemini) {
    console.log("[OpenAI Compatible API] Using Gemini proxy for image generation");

    const imageModel = detectEndpointAndModel(endpoint, "image");
    const chatUrl = `${baseUrl}/chat/completions`;

    // 构建消息内容
    const messageContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

    // 添加参考图片（如果有）
    images.forEach((img) => {
      const imageUrl = img.startsWith("data:") ? img : `data:image/png;base64,${img}`;
      messageContent.push({
        type: "image_url",
        image_url: { url: imageUrl }
      });
    });

    // 添加生成指令
    messageContent.push({
      type: "text",
      text: `Please generate an image based on this description:\n\n${finalPrompt}\n\nGenerate the image directly without describing it.`
    });

    const requestBody = {
      model: imageModel,
      messages: [
        {
          role: "user",
          content: messageContent.length === 1 ? messageContent[0].text : messageContent
        }
      ],
      max_tokens: 4096,
      temperature: 0.8
    };

    console.log("[OpenAI Compatible API] Calling:", chatUrl);
    console.log("[OpenAI Compatible API] Model:", imageModel);

    const response = await fetch(chatUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Luma Pro"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OpenAI Compatible API] Error:", response.status, errorText);
      throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log("[OpenAI Compatible API] Response:", JSON.stringify(data).substring(0, 500));

    // 尝试从响应中提取图片
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      // 检查是否是数组格式（Gemini 风格）
      if (Array.isArray(content)) {
        for (const part of content) {
          if (part.type === "image" && part.image?.data) {
            return `data:image/png;base64,${part.image.data}`;
          }
          if (part.inlineData?.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }

      // 检查字符串中是否包含 base64 图片
      if (typeof content === "string") {
        const base64Match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
        if (base64Match) {
          return base64Match[0];
        }

        // 检查是否是纯 base64 字符串
        if (/^[A-Za-z0-9+/=]{100,}$/.test(content.trim())) {
          return `data:image/png;base64,${content.trim()}`;
        }
      }
    }

    // 检查响应中的其他图片字段
    if (data.images?.[0]) {
      const img = data.images[0];
      if (img.b64_json) return `data:image/png;base64,${img.b64_json}`;
      if (img.url) return img.url;
    }

    throw new Error("该 API 端点未返回图片数据。请确保使用支持图片生成的模型。");
  }

  // 首先尝试使用 images/generations 端点（DALL-E 风格）
  try {
    const imageGenUrl = `${baseUrl}/images/generations`;
    console.log("[OpenAI Compatible API] Trying image generation endpoint:", imageGenUrl);

    const response = await fetch(imageGenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Luma Pro"
      },
      body: JSON.stringify({
        model: detectEndpointAndModel(endpoint, "image"),
        prompt: finalPrompt,
        n: 1,
        size: config.aspectRatio === "1:1" ? "1024x1024" :
              config.aspectRatio === "16:9" ? "1792x1024" : "1024x1792",
        response_format: "b64_json"
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data?.[0]?.b64_json) {
        return `data:image/png;base64,${data.data[0].b64_json}`;
      }
      if (data.data?.[0]?.url) {
        // 如果返回的是 URL，需要获取图片并转换为 base64
        const imgResponse = await fetch(data.data[0].url);
        const blob = await imgResponse.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    }
  } catch (e) {
    console.log("[OpenAI Compatible API] Image generation endpoint not available, trying chat completion with vision model");
  }

  // 如果图片生成端点不可用，尝试使用支持图片的聊天模型
  const messages: OpenAIMessage[] = [
    {
      role: "system",
      content: `You are an AI image generation assistant. Generate an image based on the prompt provided. Output the image directly.`
    },
    {
      role: "user",
      content: images.length > 0
        ? buildMessageContent(`Generate an image based on this prompt:\n${finalPrompt}`, images)
        : `Generate an image based on this prompt:\n${finalPrompt}`
    }
  ];

  const result = await callOpenAICompatibleAPI(endpoint, apiKey, messages, undefined, "image");

  // 检查响应中是否包含 base64 图片数据
  const base64Match = result.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
  if (base64Match) {
    return base64Match[0];
  }

  // 如果没有图片数据，抛出错误
  throw new Error("该 API 端点不支持图片生成功能。请使用支持图片生成的服务（如 DALL-E、Midjourney API、Gemini 等），或切换到 Gemini API。");
};
