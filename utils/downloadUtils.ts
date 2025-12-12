import JSZip from 'jszip';
import { CanvasLayer } from '../types';

/**
 * 下载单个图片
 * @param src 图片 URL
 * @param filename 文件名
 */
export const downloadSingleImage = (src: string, filename: string) => {
  const link = document.createElement('a');
  link.href = src;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 将图片 URL 转换为 Blob
 * @param src 图片 URL (支持 base64 或普通 URL)
 * @returns Promise<Blob>
 */
const urlToBlob = async (src: string): Promise<Blob> => {
  if (src.startsWith('data:')) {
    // Base64 图片
    const response = await fetch(src);
    return response.blob();
  } else {
    // 普通 URL
    const response = await fetch(src, { mode: 'cors' });
    if (!response.ok) throw new Error('图片加载失败');
    return response.blob();
  }
};

/**
 * 批量下载图片（打包为 ZIP）
 * @param layers 要下载的图层数组
 * @param zipFilename ZIP 文件名（默认：luma-export-时间戳.zip）
 */
export const downloadImagesAsZip = async (
  layers: CanvasLayer[],
  zipFilename?: string
): Promise<void> => {
  // 过滤出图片图层
  const imageLayers = layers.filter(
    (layer) => layer.type === 'image' && layer.src && layer.visible
  );

  if (imageLayers.length === 0) {
    throw new Error('没有可下载的图片图层');
  }

  const zip = new JSZip();
  const promises: Promise<void>[] = [];

  // 添加每个图片到 ZIP
  imageLayers.forEach((layer, index) => {
    const promise = (async () => {
      try {
        const blob = await urlToBlob(layer.src!);

        // 生成文件名：图层名称 + 索引
        const sanitizedName = layer.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_');
        const extension = blob.type.includes('png') ? 'png' : 'jpg';
        const filename = `${sanitizedName}_${index + 1}.${extension}`;

        zip.file(filename, blob);
      } catch (error) {
        console.error(`下载图层 ${layer.name} 失败:`, error);
        // 跳过失败的图片，继续处理其他图片
      }
    })();

    promises.push(promise);
  });

  // 等待所有图片添加完成
  await Promise.all(promises);

  // 生成 ZIP 文件
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // 下载 ZIP
  const defaultFilename = `luma-export-${Date.now()}.zip`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipBlob);
  link.download = zipFilename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 释放 URL 对象
  URL.revokeObjectURL(link.href);
};

/**
 * 批量下载图片（逐个下载，不打包）
 * @param layers 要下载的图层数组
 */
export const downloadImagesIndividually = (layers: CanvasLayer[]): void => {
  const imageLayers = layers.filter(
    (layer) => layer.type === 'image' && layer.src && layer.visible
  );

  if (imageLayers.length === 0) {
    throw new Error('没有可下载的图片图层');
  }

  imageLayers.forEach((layer, index) => {
    setTimeout(() => {
      const sanitizedName = layer.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_');
      const filename = `${sanitizedName}_${index + 1}.png`;
      downloadSingleImage(layer.src!, filename);
    }, index * 200); // 每个下载间隔 200ms，避免浏览器阻止多个下载
  });
};
