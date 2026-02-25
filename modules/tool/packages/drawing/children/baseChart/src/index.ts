import { z } from 'zod';
import * as echarts from 'echarts';
import { uploadFile } from '@tool/utils/uploadFile';
import json5 from 'json5';

export const InputType = z
  .object({
    mode: z.enum(['data', 'json']).optional(),
    title: z.string().optional(),
    xAxis: z
      .union([z.string(), z.array(z.union([z.string(), z.number()]))])
      .optional(),
    yAxis: z
      .union([z.string(), z.array(z.union([z.string(), z.number()]))])
      .optional(),
    chartType: z.string().optional(),
    optionJson: z.string().optional()
  })
  .transform((data) => {
    const mode = data.mode ?? 'data';

    if (mode === 'json') {
      const option = data.optionJson ? json5.parse(data.optionJson) : {};
      return {
        ...data,
        mode,
        option
      };
    }

    if (!data.xAxis || !data.yAxis || !data.chartType) {
      throw new Error('数据模式下，xAxis、yAxis 和 chartType 为必填');
    }

    return {
      ...data,
      mode,
      xAxis: (Array.isArray(data.xAxis) ? data.xAxis : (json5.parse(data.xAxis) as string[])).map(
        (item) => String(item)
      ),
      yAxis: (Array.isArray(data.yAxis) ? data.yAxis : (json5.parse(data.yAxis) as string[])).map(
        (item) => String(item)
      )
    };
  });

type SeriesData = {
  name: string;
  type: 'bar' | 'line' | 'pie'; // 只允许这三种类型
  data: number[] | { value: number; name: string }[]; // 根据图表类型的数据结构
};

type Option = {
  backgroundColor: string;
  title: { text: string };
  tooltip: object;
  xAxis: { data: string[] };
  yAxis: object;
  series: SeriesData[]; // 使用定义的类型
};
export const OutputType = z.object({
  '图表 url': z.string().optional(), // 兼容旧版
  chartUrl: z.string().optional()
});

const generateChart = async (title = '', xAxis: string[], yAxis: string[], chartType: string) => {
  const chart = echarts.init(undefined, undefined, {
    renderer: 'svg', // 必须使用 SVG 模式
    ssr: true, // 开启 SSR
    width: 400, // 需要指明高和宽
    height: 300
  });

  const option: Option = {
    backgroundColor: '#f5f5f5',
    title: { text: title },
    tooltip: {},
    xAxis: { data: xAxis },
    yAxis: {},
    series: [] // 初始化为空数组
  };

  // 根据 chartType 生成不同的图表
  switch (chartType) {
    case '柱状图':
      option.series.push({ name: 'Sample', type: 'bar', data: yAxis.map(Number) });
      break;
    case '折线图':
      option.series.push({ name: 'Sample', type: 'line', data: yAxis.map(Number) });
      break;
    case '饼图':
      option.series.push({
        name: 'Sample',
        type: 'pie',
        data: yAxis.map((value, index) => ({
          value: Number(value),
          name: xAxis[index] // 使用 xAxis 作为饼图的名称
        }))
      });
      break;
    default:
      console.error('不支持的图表类型:', chartType);
      return '';
  }

  chart.setOption(option);
  const svgContent = chart.renderToSVGString();

  const base64 = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;

  const file = await uploadFile({
    base64,
    defaultFilename: `chart.svg`
  });

  return file.accessUrl;
};

const generateChartByOption = async (rawOption: any, title = '') => {
  const option = { ...(rawOption || {}) };

  const series = Array.isArray(option.series) ? option.series : option.series ? [option.series] : [];
  const isPie = series.some((s: any) => s && s.type === 'pie');

  let xLen = 0;
  const rawXAxis = option.xAxis;
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

  if (!option.backgroundColor) {
    option.backgroundColor = '#ffffff';
  }
  if (title && (!option.title || !option.title.text)) {
    option.title = {
      ...(typeof option.title === 'object' ? option.title : {}),
      text: title
    };
  }

  chart.setOption(option);
  const svgContent = chart.renderToSVGString();

  const base64 = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;

  const file = await uploadFile({
    base64,
    defaultFilename: `chart.svg`
  });

  return file.accessUrl;
};

export async function tool(
  input: z.infer<typeof InputType>
): Promise<z.infer<typeof OutputType>> {
  const { mode, title } = input as any;

  const base64 =
    mode === 'json'
      ? await generateChartByOption((input as any).option, title)
      : await generateChart(
          (input as any).title,
          (input as any).xAxis,
          (input as any).yAxis,
          (input as any).chartType
        );

  return {
    '图表 url': base64, // 兼容旧版
    chartUrl: base64
  };
}
