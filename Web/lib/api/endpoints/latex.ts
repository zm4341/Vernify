import type { ApiClient } from '../base';

export type LatexFileEntry = { relativePath: string; content: string };

/** LaTeX 同步接口暂无统一响应 schema，返回类型保留 unknown */
export function createLatex(client: ApiClient) {
  return {
    /** 使用 content 路径扫描（本地 backend） */
    scan: (contentRoot?: string) =>
      client.get<unknown>(
        contentRoot
          ? `/api/v1/latex/scan?content_root=${encodeURIComponent(contentRoot)}`
          : '/api/v1/latex/scan'
      ),
    /** 上传文件内容并扫描（Docker 或本机均可用） */
    scanFromFiles: (files: LatexFileEntry[]) =>
      client.post<unknown>('/api/v1/latex/scan-from-files', { files }),
    sync: (body: {
      course_slug?: string;
      course_title?: string;
      course_description?: string;
    }) => client.post<unknown>('/api/v1/latex/sync', body),
    /** 使用已扫描数据同步（避免重复解析） */
    syncFromScan: (
      scanData: Record<string, unknown>,
      body: {
        course_slug?: string;
        course_title?: string;
        course_description?: string;
      }
    ) =>
      client.post<unknown>('/api/v1/latex/sync-from-scan', { scan_data: scanData, ...body }),
  };
}
