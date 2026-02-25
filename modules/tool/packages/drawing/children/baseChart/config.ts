import { defineTool } from '@tool/type';
import {
  FlowNodeInputTypeEnum,
  WorkflowIOValueTypeEnum
} from '@tool/type/fastgpt';

export default defineTool({
  name: {
    'zh-CN': '基础图表',
    en: 'baseChart'
  },
  description: {
    'zh-CN': '根据数据生成图表，可根据chartType生成柱状图，折线图，饼图',
    en: 'Generate charts based on data, and generate charts such as bar charts, line charts, pie charts based on chartType'
  },
  versionList: [
    {
      value: '0.2.0',
      description: 'Default version',
      inputs: [
        {
          renderTypeList: [FlowNodeInputTypeEnum.select, FlowNodeInputTypeEnum.reference],
          selectedTypeIndex: 0,
          valueType: WorkflowIOValueTypeEnum.string,
          key: 'mode',
          label: '配置方式',
          description: '选择使用数据表单配置或直接输入 ECharts JSON 配置',
          list: [
            {
              label: '数据表单',
              value: 'data'
            },
            {
              label: 'ECharts JSON',
              value: 'json'
            }
          ],
          toolDescription: '选择使用数据表单配置或直接输入 ECharts JSON 配置'
        },
        {
          renderTypeList: [FlowNodeInputTypeEnum.input, FlowNodeInputTypeEnum.reference],
          valueType: WorkflowIOValueTypeEnum.string,
          key: 'title',
          label: 'title',
          description: 'BI图表的标题（当配置方式为 数据表单 时生效）',
          toolDescription: 'BI图表的标题（当配置方式为 数据表单 时生效）'
        },
        {
          renderTypeList: [FlowNodeInputTypeEnum.input, FlowNodeInputTypeEnum.reference],
          selectedTypeIndex: 0,
          valueType: WorkflowIOValueTypeEnum.arrayString,
          key: 'xAxis',
          label: 'xAxis',
          description: 'x轴数据，例如：["A", "B", "C"]（当配置方式为 数据表单 时生效）',
          toolDescription: 'x轴数据，例如：["A", "B", "C"]（当配置方式为 数据表单 时生效）'
        },
        {
          renderTypeList: [FlowNodeInputTypeEnum.input, FlowNodeInputTypeEnum.reference],
          selectedTypeIndex: 0,
          valueType: WorkflowIOValueTypeEnum.arrayString,
          key: 'yAxis',
          label: 'yAxis',
          description: 'y轴数据，例如：[1,2,3]（当配置方式为 数据表单 时生效）',
          toolDescription: 'y轴数据，例如：[1,2,3]（当配置方式为 数据表单 时生效）'
        },
        {
          renderTypeList: [FlowNodeInputTypeEnum.select, FlowNodeInputTypeEnum.reference],
          selectedTypeIndex: 0,
          valueType: WorkflowIOValueTypeEnum.string,
          key: 'chartType',
          label: 'chartType',
          description: '图表类型：柱状图，折线图，饼图（当配置方式为 数据表单 时生效）',
          list: [
            {
              label: '折线图',
              value: '折线图'
            },
            {
              label: '柱状图',
              value: '柱状图'
            },
            {
              label: '饼图',
              value: '饼图'
            }
          ],
          toolDescription: '图表类型：柱状图，折线图，饼图（当配置方式为 数据表单 时生效）'
        },
        {
          renderTypeList: [FlowNodeInputTypeEnum.JSONEditor, FlowNodeInputTypeEnum.reference],
          selectedTypeIndex: 0,
          valueType: WorkflowIOValueTypeEnum.object,
          key: 'optionJson',
          label: 'ECharts 配置(JSON)',
          description: '完整的 ECharts option JSON 对象（当配置方式为 ECharts JSON 时生效）',
          toolDescription: '完整的 ECharts option JSON 对象（当配置方式为 ECharts JSON 时生效）',
          defaultValue: {
            "title": {
              "left": "center",
              "text": "图表配置示例"
            },
            "tooltip": {
              "trigger": "axis",
              "axisPointer": {
                "type": "cross"
              }
            },
            "grid": {
              "bottom": "80px",
              "left": "50px",
              "right": "50px",
              "top": "60px",
              "containLabel": true
            },
            "legend": {
              "show": true,
              "top": "10%"
            },
            "xAxis": {
              "type": "category",
              "data": [
                "2026-01-01",
                "2026-01-02",
                "2026-01-03"
              ],
              "axisLabel": {
                "rotate": 30,
                "interval": 0
              }
            },
            "yAxis": {
              "type": "value"
            },
            "color": [
              "#5470c6"
            ],
            "series": [
              {
                "data": [
                  3,
                  1,
                  12,
                ],
                "type": "bar",
                "smooth": true,
                "name": "图表配置示例",
                "symbol": "circle",
                "symbolSize": 6,
                "lineStyle": {
                  "width": 3
                }
              }
            ]
          }
        }
      ],
      outputs: [
        {
          valueType: WorkflowIOValueTypeEnum.string,
          description: '可用使用markdown格式展示图片，如：![图片](url)',
          defaultValue: '',
          label: '图表 url',
          key: 'chartUrl'
        }
      ]
    }
  ]
});
