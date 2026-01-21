import { defineTool } from '@tool/type';
import { FlowNodeInputTypeEnum, WorkflowIOValueTypeEnum } from '@tool/type/fastgpt';
import { ToolTagEnum } from '@tool/type/tags';

export default defineTool({
  name: {
    'zh-CN': '表格数据提取',
    en: 'Spreadsheet extractor'
  },
  tags: [ToolTagEnum.enum.tools],
  author: 'ToukoYui',
  description: {
    'zh-CN': '上传 csv/xls/xlsx 表格，按行输出字段对象，可选列名映射。',
    en: 'Upload csv/xls/xlsx and output row objects with optional column mapping.'
  },
  toolDescription:
    'Extract spreadsheet rows as JSON objects; optionally map column headers to custom field names.',
  versionList: [
    {
      value: '0.1.0',
      description: '提取表格行数据',
      inputs: [
        {
          key: 'file',
          label: '表格文件',
          renderTypeList: [FlowNodeInputTypeEnum.fileSelect, FlowNodeInputTypeEnum.reference],
          valueType: WorkflowIOValueTypeEnum.string,
          required: true,
          description: '支持 csv / xls / xlsx 格式',
          canSelectFile: true,
          toolDescription: 'Supports csv/xls/xlsx formats'
        },
        {
          key: 'table_fields',
          label: '列名-输出字段映射(JSON)',
          renderTypeList: [FlowNodeInputTypeEnum.JSONEditor, FlowNodeInputTypeEnum.reference],
          valueType: WorkflowIOValueTypeEnum.object,
          required: false,
          description: '输入JSON Object，key为原列名，value为目的转换字段名，留空则按原表头名输出全部列',
          toolDescription: 'Input JSON Object, with key as the original column name and value as the destination conversion field name. ' +
            'Leave blank to output all columns according to the original header name'
        }
      ],
      outputs: [
        {
          valueType: WorkflowIOValueTypeEnum.arrayObject,
          key: 'result',
          label: '提取结果',
          description: '按行输出的字段对象数组'
        }
      ]
    }
  ]
});
