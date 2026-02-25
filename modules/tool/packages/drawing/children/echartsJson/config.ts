import { defineTool } from '@tool/type';
import {
  FlowNodeInputTypeEnum,
  WorkflowIOValueTypeEnum
} from '@tool/type/fastgpt';

export default defineTool({
  name: {
    'zh-CN': 'ECharts 配置图表',
    en: 'ECharts JSON Chart'
  },
  description: {
    'zh-CN': '根据 ECharts option JSON 配置生成图表图片，填写完整 option 对象即可',
    en: 'Generate chart image from ECharts option JSON, fill in the full option object'
  },
  versionList: [
    {
      value: '0.1.0',
      description: 'Default version',
      inputs: [
        {
          renderTypeList: [FlowNodeInputTypeEnum.JSONEditor, FlowNodeInputTypeEnum.reference],
          selectedTypeIndex: 0,
          valueType: WorkflowIOValueTypeEnum.object,
          key: 'option',
          label: 'ECharts 配置',
          description: '完整的 ECharts option JSON 对象',
          required: true,
          toolDescription: '完整的 ECharts option JSON 对象',
          defaultValue: {
            title: { text: 'Example chart', left: 'center' },
            xAxis: { type: 'category', data: ['A', 'B', 'C'] },
            yAxis: { type: 'value' },
            series: [{ type: 'bar', data: [120, 200, 150] }]
          }
        }
      ],
      outputs: [
        {
          valueType: WorkflowIOValueTypeEnum.string,
          description: '可用使用 markdown 格式展示图片，如：![图片](url)',
          defaultValue: '',
          label: '图表 url',
          key: 'chartUrl'
        }
      ]
    }
  ]
});
