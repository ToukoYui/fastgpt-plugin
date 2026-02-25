import { z } from 'zod';
import * as echarts from 'echarts';
import { uploadFile } from '@tool/utils/uploadFile';

export const InputType = z.object({
  option: z.record(z.unknown()).optional()
});

export const OutputType = z.object({
  '图表 url': z.string().optional(), // 兼容旧版
  chartUrl: z.string().optional()
});

const generateChartByOption = async (rawOption: unknown): Promise<string> => {
  const option = rawOption && typeof rawOption === 'object' ? { ...(rawOption as object) } : {};

  const series = Array.isArray((option as any).series)
    ? (option as any).series
    : (option as any).series
      ? [(option as any).series]
      : [];
  const isPie = series.some((s: any) => s && s.type === 'pie');

  let xLen = 0;
  const rawXAxis = (option as any).xAxis;
  if (Array.isArray(rawXAxis)) {
    const first = rawXAxis[0];
    if (first && Array.isArray(first.data)) xLen = first.data.length;
  } else if (rawXAxis && Array.isArray(rawXAxis.data)) {
    xLen = rawXAxis.data.length;
  }
  const safeXAxisLength = Math.max(xLen, 1);
  const width = Math.min(1600, Math.max(600, safeXAxisLength * (isPie ? 60 : 80)));
  const height = isPie ? 480 : 540;

  const chart = echarts.init(undefined, undefined, {
    renderer: 'svg',
    ssr: true,
    width,
    height
  });

  const opt = option as Record<string, unknown>;
  if (!opt.backgroundColor) {
    opt.backgroundColor = '#f5f5f5';
  }

  chart.setOption(opt);
  const svgContent = chart.renderToSVGString();

  const base64 = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;

  const file = await uploadFile({
    base64,
    defaultFilename: 'chart.svg'
  });

  return file.accessUrl;
};

export async function tool({
  option
}: z.infer<typeof InputType>): Promise<z.infer<typeof OutputType>> {
  if (option == null || (typeof option === 'object' && Object.keys(option).length === 0)) {
    throw new Error('请填写 ECharts 配置（option 对象）');
  }
  const base64 = await generateChartByOption(option);
  return {
    '图表 url': base64, // 兼容旧版
    chartUrl: base64
  };
}
