import { createCanvas } from 'canvas';

export interface ImageGenerationOptions {
  text: string;
  width?: number;
  height?: number;
  fontSize?: number;
  backgroundColor?: string;
  textColor?: string;
}

export async function generateTextImage({
  text,
  width = 800,
  height = 400,
  fontSize = 32,
  backgroundColor = 'white',
  textColor = 'black',
}: ImageGenerationOptions): Promise<Buffer> {
  // 创建画布
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 设置背景
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // 设置文本样式
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 文本换行处理
  const words = text.split(' ');
  let line = '';
  const lines: string[] = [];
  const maxWidth = width - 40; // 左右各留20px边距

  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      lines.push(line);
      line = word + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  // 绘制文本
  const lineHeight = fontSize * 1.2;
  const totalHeight = lines.length * lineHeight;
  const startY = (height - totalHeight) / 2;

  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, startY + i * lineHeight);
  });

  // 返回图片buffer
  return canvas.toBuffer('image/png');
}
