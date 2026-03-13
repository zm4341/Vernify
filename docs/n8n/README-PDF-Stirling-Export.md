# n8n：PDF 上传 → StirlingPDF → 导出图片

本目录下的 workflow 实现**第一步**：在 n8n 中上传 PDF，发送给 StirlingPDF，并将导出的图片保存到本机（或指定目录）。

## 文件

- **workflow-pdf-stirling-export-images.json** — 可直接在 n8n 中「Import from File」导入。

## 流程说明

1. **接收 PDF 上传**（Webhook）  
   - 使用 **POST**、路径 `/pdf-upload`（或你的 n8n 基础 URL + 该路径）。  
   - 请求体为 **multipart/form-data**，表单字段名请使用 **`data`**（或 `file`；若用 `file` 需在下一步节点中把「Input Data Field Name」改为 `file`）。

2. **StirlingPDF 转图片**（HTTP Request）  
   - 调用 StirlingPDF 接口：`POST /api/v1/convert/pdf/img`。  
   - 参数：`fileInput` = 上一步的 binary 数据，`imageFormat=png`，`singleOrMultiple=multiple`（每页一张图）。  
   - 若你的 StirlingPDF 启用了 API Key，请在该节点的 **Send Headers** 中添加：`X-API-KEY: 你的密钥`。  
   - URL 默认 `http://localhost:8080`，可改为环境变量或你的 Stirling 实例地址。

3. **保存到 Download**（Write Binary File）  
   - 将 StirlingPDF 返回的数据（多页时可能是 **zip**）写入文件。  
   - 默认路径示例：`~/Downloads/stirling_export_yyyy-MM-dd_HH-mm-ss.zip`。  
   - **请按你的本机修改路径**（例如 Windows：`C:\Users\你的用户名\Downloads\...`）。若 n8n 运行在 Docker 内，需挂载宿主机 Download 目录或改为容器内可写路径。

## 重要说明：StirlingPDF 与「按书签」导出

经查 **StirlingPDF 官方 API（Swagger 0.14.1）没有「按书签拆分」或「按书签导出图片」的端点**。当前能力包括：

- **split-pages**（`/api/v1/general/split-pages`）：按**页码**或页码范围拆分 PDF。  
- **convert/pdf/img**（`/api/v1/convert/pdf/img`）：将整份 PDF 或按页转为图片（本 workflow 使用此接口，`singleOrMultiple=multiple` 得到每页一张图）。

因此：

- **当前 workflow**：实现的是「整份 PDF → 全部页面导出为图片（并保存为 zip 或单文件）」。
- **若需要「按书签对应课文分文件夹导出」**，可考虑：
  1. **方案 A**：在 n8n 中增加 **Code 节点**，用能解析 PDF 大纲/书签的库（如 Node 的 `pdf-lib` 或调用外部工具）得到「书签标题 → 页码范围」，再循环调用 StirlingPDF 的 `split-pages` 得到每个课文的小 PDF，再对每个小 PDF 调 `convert/pdf/img`，最后按课文名写入不同文件夹。  
  2. **方案 B**：在本机用 StirlingPDF 的 **Web UI**（若其界面支持按书签导出）先按书签导出到本地文件夹，再通过 n8n 的「监听文件夹」或「读本地文件」节点处理这些图片。  
  3. **方案 C**：你提供每课文的**页码范围**（例如 1–5、6–12…），在 workflow 里用 `split-pages` + 循环 + `convert/pdf/img`，按课文写入不同目录。

本 workflow 验证通过后，可在此基础上增加「书签解析 + 按课文分文件夹」的节点（或你提供现有 workflow，再一起接 Gemini Vision 等后续步骤）。

## 如何测试

1. 在 n8n 中导入 **workflow-pdf-stirling-export-images.json**。  
2. 确保 StirlingPDF 已运行（默认 `http://localhost:8080`），且若启用安全则配置好 API Key。  
3. **激活**该 workflow（Webhook 需激活后才可访问）。  
4. 用 curl 或 Postman 发送 POST multipart 请求，例如：

   ```bash
   curl -X POST "https://你的n8n地址/webhook/pdf-upload" \
     -F "data=@/path/to/your.pdf"
   ```

   （若 n8n 使用 path prefix，请加上相应前缀；若表单字段名用 `file`，则 `-F "file=@/path/to/your.pdf"`，并修改 HTTP 节点中的 Input Data Field Name。）  
5. 检查配置的保存路径下是否生成了导出文件（zip 或图片）。

## 后续步骤（你确认后再做）

- 在现有 workflow 后增加：**按书签/页码拆分 → 每课文一个文件夹 → 图片写入对应文件夹**。  
- 再将**每个课文的图片**发送给 **Gemini API** 做 Vision 识别，把返回的课文内容保存到 Download（或指定目录），直到整份 PDF 的书签部分处理完毕。

以上为第一步「上传 PDF → StirlingPDF → 导出图片」的说明与限制；书签与 Gemini 部分待你验证本步后再继续。
